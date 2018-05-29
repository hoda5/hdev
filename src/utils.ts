import { readdirSync, readFileSync, existsSync, watch } from "fs"
import { dirname, basename, join } from "path"
import { spawnSync, spawn, ChildProcess, SpawnOptions } from "child_process"
import { wrap } from "bash-color";
import * as stringify from "json-stringify-safe";
import { EventEmitter } from "events";

export type PackageJSON = {
    name: string;
    main: string;
    dependencies?: string[],
    devDependencies?: string[],
    peerDependencies?: string[],
}
export type WorkspaceFile = {
    "folders": { path: string }[],
    settings: Object
}
export interface SpawnedProcess {
    readonly name: string;
    on(event: 'line', handler: (s: string) => void): void;
    on(event: 'exit', handler: (code: number) => void): void;
    restart(): Promise<void>
    stop(): Promise<void>
}

export const utils = {
    verbose: false,
    get root() {
        return root;
    },
    get workspaceFile() {
        return join(root, + basename(root) + '.code-workspace');
    },
    adaptFolderName(packageName: string) {
        if (packageName.indexOf('-') != -1)
            utils.throw('Invalid package name ' + packageName)
        return packageName.replace('/', '-');
    },
    displayFolderName(packageName: string) {
        const m = /(?:@([^-]+))?-(.*)$/g.exec(utils.adaptFolderName(packageName));
        return m ? (
            m[1] ? (m[2] + '@' + m[1]) : m[2]
        ) : packageName;
    },
    listPackages() {
        const dir = root + '/packages';
        if (!existsSync(dir)) return [];
        return readdirSync(dir);
    },
    forEachPackage(fn: (packageName: string, folder: string) => Promise<void>) {
        const packages = utils.listPackages();
        if (utils.verbose) debug('forEachPackage', packages.join());
        return Promise.all(packages.map((p) => {
            if (utils.verbose) debug('forEachPackage');
            return fn(p.replace('-', '/'), [root, 'packages', p].join('/'));
        })).then(() => true);
    },
    getPackageJsonFor(packagName: string) {
        const json = utils.readJSON<PackageJSON>(packagName, 'package.json');
        if (json.name !== packagName)
            utils.throw(
                'Package name (' + packagName +
                ') é diferente do que está em name do package.json (' +
                json.name + ')');
        return json;
    },
    path(packageName: string, ...names: string[]) {
        return join(root, 'packages', utils.adaptFolderName(packageName), ...names);
    },
    exists(packageName: string, ...names: string[]): boolean {
        return existsSync(utils.path(packageName, ...names));
    },
    readText(packageName: string, filename: string): string {
        return readFileSync(
            utils.path(packageName, filename),
            { encoding: 'utf-8' }
        );
    },
    readJSON<T>(packageName: string, filename: string): T {
        return JSON.parse(utils.readText(packageName, filename)) as T;
    },
    readCoverageSummary(packageName: string): CoverageResult | undefined {
        const cov = 'coverage/coverage-summary.json';
        let error = true;
        if (utils.exists(packageName, cov)) {
            const summary = utils.readJSON<CoverageResults>(packageName, cov);
            return summary.total;
        }
    },
    throw(msg: string) {
        console.log(msg)
        process.exit(1)
    },
    exec(cmd: string, args: string[], opts: { cwd: string, title: string }) {
        if (opts.title)
            console.log(
                wrap(opts.title, "RED", 'background')
            );
        else
            console.log(
                wrap(opts.cwd + '$ ', "BLUE", 'background') +
                wrap(cmd + ' ' + args.join(' '), "RED", 'background')
            );
        const r = spawnSync(
            cmd, args,
            {
                cwd: opts.cwd,
                stdio: ['inherit', 'inherit', 'inherit']
            }
        );
        if (r.status != 0)
            process.exit(1);
    },
    async spawn(cmd: string, args: string[],
        opts: {
            name: string,
            cwd: string
        }): Promise<SpawnedProcess> {

        let proc = start();
        const emitter = new EventEmitter();

        function start() {
            const spawnOpts: SpawnOptions = {
                cwd: opts.cwd,
                detached: false,
            }
            const proc = spawn(cmd, args, spawnOpts);
            proc.stdout.on('data', parseLines);
            proc.stderr.on('data', parseLines);
            proc.on('exit', function (code) {
                emitter.emit('exit', code);
            });
            return proc;

            function parseLines(data: any) {
                const s: string = data
                    .toString()
                    .replace(/\u001bc/g, '')
                    .replace(/\u001b\[\d{0,2}m/g, '');
                const lines = s.split('\n');
                lines.forEach((l) => emitter.emit('line', l));
            }
        }

        let r: SpawnedProcess = {
            get name() {
                return opts.name;
            },
            on(event: string, handler: (...args: any[]) => void) {
                emitter.on(event, handler);
            },
            async restart() {
                proc.kill();
                return new Promise<void>((resolve, reject) => {
                    proc = start();
                });
            },
            async stop() {
                proc.kill();
            },
        };
        return Promise.resolve(r);
    },
    exit(code: number) {
        // pm2.stop('hdev', (err, proc) => {
        //     //
        // });
        setTimeout(() => process.exit(code), 200);
    }
}
const root = findRoot(process.cwd())

function findRoot(folder: string) {
    while (folder && folder != '/') {
        const files = readdirSync(folder);
        const w = basename(folder) + '.code-workspace';
        if (files.some((f) => f == w)) {
            return folder;
        }
        folder = dirname(folder);
    }
    utils.throw('no code-workspace file found')
    return ''
}

function debug(title: string, ...args: any[]) {
    console.log(
        wrap(title + ': ', "PURPLE", 'background') +
        wrap(args.join(' '), "BLUE", 'background')
    );
}


// function parseLines(data) {
//     buffer = [buffer, data.toString()].join('');
//     let buffer_start = buffer_end - 1;
//     let changed = false;
//     while (buffer_end < buffer.length) {
//         const c1 = buffer.charAt(buffer_end - 1);
//         const c2 = buffer.charAt(buffer_end);
//         if (c1 === '\r') {
//             const line = buffer.substring(buffer_start, buffer_end - 1);
//             emitter.emit('line', line);
//             if (c2 === '\n') buffer_end++;
//             buffer_start = buffer_end;
//             changed = true;
//         }
//         else if (c1 === '\n') {
//             const line = buffer.substring(buffer_start, buffer_end - 1);
//             emitter.emit('line', line);
//             if (c2 === '\r') buffer_end++;
//             buffer_start = buffer_end;
//             changed = true;
//         }
//     }
//     if (changed)
//         buffer = buffer.substr(buffer_start);
// }