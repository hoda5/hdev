import { utils, WorkspaceFile, PackageJSON } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { watchTypeScript } from "./build/buildTypeScript"
import { initUi } from "./ui";
import { start, stop, launchBus, restart } from "pm2";
import { watch } from 'chokidar';
import { resolve, join } from "path";

export async function cmd_start(args: any, opts: any): Promise<boolean> {
    if (utils.verbose)
        console.dir({ start_with_args: process.argv })
    if (opts.noService) return start_no_service(opts.logMode);
    else return start_as_service(opts.follow);
}
async function start_no_service(logMode: boolean): Promise<boolean> {
    let ok = false;
    await utils.forEachPackage(async (pkg) => {
        if (await watchTypeScript(pkg))
            ok = true;
    });
    if (ok)
        initUi(logMode);
    return ok;
}

async function start_as_service(follow: boolean): Promise<boolean> {

    const tmp_ws = __dirname == resolve(join(utils.root, '../dist'));
    const hdev_no_ws = utils.listPackages().indexOf('@hoda5-hdev') >= 0;

    if (hdev_no_ws) console.log('usando hdev do workspace');
    
    const restart_service = utils.limiteAsync({
        ms: 1500,
        async fn() {
            if (restart_service.pending) return;
            await stop_service();
            if (restart_service.pending) return;
            await start_service();
        }
    });

    if (follow) {
        await follow_service();
        await start_service();
    }
    else {
        await start_service();
        setTimeout(() => process.exit(0), 2000);
    }

    return true;

    function start_service() {
        if (utils.verbose)
            console.log('starting hdev')
        return new Promise<void>((fn_resolve, fn_reject) => {
            const args = ['start', '--no-service', '--log-mode'];
            if (utils.verbose) args.push('--verbose');
            let script = process.argv[1];
            if (hdev_no_ws)
                script = utils.path('@hoda5-hdev', 'dist/hdev.js');
            else if (tmp_ws)
                script = resolve(join(utils.root, '../dist/hdev.js'));
            start({
                name: 'hdev',
                script,
                args,
                restartDelay: 100,
                watch: false
            }, (err) => {
                if (err) fn_reject(err);
                else {
                    setTimeout(() => {
                        fn_resolve();
                        if (utils.verbose) console.log('hdev started!');
                    }, 1);
                }
            })
        })
    }
    function stop_service() {
        if (utils.verbose) console.log('stopping hdev')
        return new Promise<void>(
            (resolve, reject) =>
                stop('hdev', (err) => {
                    if (utils.verbose) console.log('hdev stopped')
                    resolve();
                })
        )
    }

    async function follow_service() {
        if (utils.verbose)
            console.dir({ follow_service: { hdev_no_ws, tmp_ws } })
        if (!(hdev_no_ws || tmp_ws))
            utils.throw('hdev precisa estar no workspace para poder ser reconstruido');
        if (!hdev_no_ws)
            await watch_hdev_for_rebuild();
        await watch_dist();
        follow_logs();
        monitor_SIGINT();
    }

    async function watch_hdev_for_rebuild() {
        const p = await utils.spawn('npm', ['run', 'watch'], {
            cwd: resolve(join(__dirname, '..')),
            name: 'rebuild-hdev'
        });
        return new Promise((resolve: any) => {
            p.on('line', (line) => {
                if (/Compilation complete/g.test(line)) {
                    console.log('hdev rebuilded');
                    if (resolve) resolve();
                    resolve = false;
                }
            })
        })
    }
    async function watch_dist() {
        return new Promise((resolve) => {
            var watcher_dist = watch(__dirname);
            watcher_dist.on('ready', function () {
                watcher_dist.on('all', restart_service);
                resolve();
            })
        })
    }

    function follow_logs() {
        launchBus((err, bus) => {
            bus.on('log:out', (d: any) => {
                process.stdout.write(d.data);
            })
            bus.on('log:err', (d: any) => {
                process.stdout.write(d.data);
                setTimeout(() => process.exit(0), 2000);
            })
        })
    }

    function monitor_SIGINT() {
        process.on('SIGINT', function () {
            console.log('   SIGINT');
            stop_service();
            setTimeout(() => process.exit(0), 2000);
        });
    }
}