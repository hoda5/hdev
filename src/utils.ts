import { readdirSync, readFileSync, existsSync, watch } from "fs"
import { dirname, basename, join } from "path"
import { spawnSync, spawn, ChildProcess, SpawnOptions } from "child_process"
import { wrap } from "bash-color";
import * as stringify from "json-stringify-safe";
import { EventEmitter } from "events";
import { resolve } from "url";

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
export interface Defer<T> {
    promise: Promise<T>;
    resolve(res: T | Promise<T>): void;
    reject(reason: any): void;
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
        const ws = join(root, basename(root) + '.code-workspace');
        if (utils.verbose) utils.debug('workspaceFile', ws);
        return ws;
    },
    displayFolderName(packageName: string) {
        const m = /(?:@([^\/]+))?\/(.*)$/g.exec(packageName);
        return m ? (
            m[1] ? (m[2] + '@' + m[1]) : m[2]
        ) : packageName;
    },
    listPackages() {
        const dir = root + '/packages';
        if (!existsSync(dir)) return [];
        const l1 = readdirSync(dir);
        const r: string[] = [];
        l1.forEach((f1) => {
            if (f1[0] == '@') {
                readdirSync(dir + '/' + f1).forEach((f2) => {
                    r.push(f1 + '/' + f2);
                })
            }
            else r.push(f1);
        });
        return r;
    },
    forEachPackage(fn: (packageName: string, folder: string) => Promise<void>) {
        const packages = utils.listPackages();
        if (utils.verbose) utils.debug('forEachPackage', packages.join());
        return Promise.all(packages.map((p) => {
            return fn(p, [root, 'packages', p].join('/'));
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
        return join(root, 'packages', packageName, ...names);
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
            if (utils.verbose)
                console.log(
                    wrap(opts.name, "PURPLE", 'background'),
                    wrap(opts.cwd + '$ ', "BLUE", 'background') +
                    wrap(' ' + cmd + ' ' + args.join(' '), "RED", 'background')
                );
            const proc = spawn(cmd, args, spawnOpts);
            proc.stdout.on('data', parseLines);
            proc.stderr.on('data', parseLines);
            proc.on('exit', function (code) {
                if (utils.verbose)
                    console.log(
                        wrap(opts.name, "PURPLE", 'background'),
                        wrap(' exit ' + code, code == 0 ? "GREEN" : "RED", 'background')
                    );
                emitter.emit('exit', code);
            });
            return proc;

            function parseLines(data: any) {
                const s1: string = data.toString();
                let lines: string[]
                if (utils.verbose) {
                    s1.split('\n').forEach((lo) => {
                        const s2 = //lo.indexOf('\x1b[2K')>=0 ? '' :
                            // lo.replace(/\u001b/g, '<ESC>');
                            lo.replace(/\u001bc/g, '')
                                .replace(/\u001b\[\d{0,2}m/g, '');
                        if (s2.trim()) {
                            console.log(
                                wrap(opts.name, "PURPLE", 'background'),
                                s2
                            )
                        }
                    });
                }
                const s2 = s1
                    .replace(/\u001bc/g, '')
                    .replace(/\u001b\[\d{0,2}m/g, '');
                lines = s2.split('\n');
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
                if (utils.verbose)
                    console.log(
                        wrap(opts.name, "PURPLE", 'background'),
                        wrap(' kill', "RED", 'background')
                    );
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
    },
    defer<T>() {
        let fn_resolve: (res: T) => void;
        let fn_reject: (reason: any) => void;
        let promise = new Promise<T>((resolve, reject) => {
            fn_resolve = resolve;
            fn_reject = reject;
        })
        const d = {
            promise,
            resolve(res: T | Promise<T>) {
                if (res instanceof Promise)
                    res.then(d.resolve, d.reject)
                else if (fn_resolve) fn_resolve(res);
                else setTimeout(() => d.resolve(res), 10);
            },
            reject(reason: any) {
                if (reason instanceof Promise)
                    reason.then(d.reject, d.reject)
                else if (fn_reject) fn_reject(reason);
                else setTimeout(() => d.reject(reason), 10);
            },
        }
        return d;
    },
    limiteSync<T>(opts: { ms: number, bounce?: boolean, fn: () => T }) {
        let tm: NodeJS.Timer | undefined;
        let ts = 0;
        let { ms, bounce, fn } = opts;
        const limiter = Object.assign(function () {
            limiter.pending = true;
            if (tm) clearTimeout(tm);
            let timeout = bounce ? ms : new Date().getTime() - ts;
            if (timeout > ms) timeout = ms;
            if (timeout < 1) timeout = 1;
            tm = setTimeout(() => {
                tm = undefined;
                limiter.pending = false;
                fn();
            }, timeout);
        }, {
                pending: false,
                cancel() {
                    if (tm) clearTimeout(tm);
                    tm = undefined;
                }
            });
        return limiter;
    },
    limiteAsync<T>(opts: { ms: number, bounce?: boolean, fn: () => Promise<T> }) {
        let tm: NodeJS.Timer | undefined;
        let ts = 0;
        let { ms, bounce, fn } = opts;
        let defers: Array<Defer<T>> = [];
        const limiter = Object.assign(function () {
            limiter.pending = true;
            if (tm) clearTimeout(tm);
            let timeout = bounce ? ms : new Date().getTime() - ts;
            if (timeout > ms) timeout = ms;
            if (timeout < 1) timeout = 1;
            const defer = utils.defer<T>();
            defers.push(defer);
            tm = setTimeout(() => {
                tm = undefined;
                limiter.pending = false;
                try {
                    const r = fn();
                    defers.forEach((d) => d.resolve(r));
                }
                catch (e) {
                    defers.forEach((d) => d.reject(e));
                }
                defers = [];
            }, timeout);
        }, {
                pending: false,
                cancel() {
                    if (tm) clearTimeout(tm);
                    tm = undefined;
                    defers.forEach((d) => d.reject('cancel'));
                    defers = [];
                }
            });
        return limiter;
    },
    debug(title: string, ...args: any[]) {
        console.log(
            wrap(title + ': ', "PURPLE", 'background') +
            wrap(args.join(' '), "BLUE", 'background')
        );
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