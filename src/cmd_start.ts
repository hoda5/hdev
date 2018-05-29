import { utils, WorkspaceFile, PackageJSON } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { watchTypeScript } from "./build/buildTypeScript"
import { initUi } from "./ui";
import { start, stop, launchBus, restart } from "pm2";
import { watch } from 'chokidar';

export async function cmd_start(args: any, opts: any): Promise<boolean> {
    console.dir({ start: process.argv })
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
    await start_service();
    if (follow)
        follow_service();
    else
        setTimeout(() => process.exit(0), 2000);
    return true;
}

function start_service() {
    console.log('starting')
    return new Promise<void>((resolve, reject) =>
        start({
            name: 'hdev',
            script: process.argv[1],
            args: ['start', '--no-service', '--log-mode'],
            restartDelay: 100,
            watch: false
        }, (err) => {
            console.log('started')
            if (err) reject(err);
            else resolve();
        })
    )
}
function stop_service() {
    console.log('stoppingx')
    return new Promise<void>(
        (resolve, reject) =>
            stop('hdev', (err) => {
                console.log('stopped')
                if (err) reject(err);
                else resolve();
            })
    )
}

function follow_service() {
    const restart_service = utils.limiter(1500, async () => {
        if (restart_service.pending) return;
        await stop_service();
        if (restart_service.pending) return;
        await start_service();
    });
    launchBus((err, bus) => {
        bus.on('log:out', (d: any) => {
            process.stdout.write(d.data);
        })
        bus.on('log:err', (d: any) => {
            process.stdout.write(d.data);
            setTimeout(() => process.exit(0), 2000);
        })
    })

    var watcher = watch(__dirname);

    watcher.on('ready', function () {
        watcher.on('all', restart_service);
    })

    process.on('SIGINT', function () {
        stop_service();
        setTimeout(() => process.exit(0), 2000);
    });
}