import { readdirSync, readFileSync, existsSync, watch } from "fs"
import { dirname, basename, join } from "path"
import { spawnSync } from "child_process"
import * as pm2 from 'pm2';
import { wrap } from "bash-color";
import * as stringify from "json-stringify-safe";

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
    on(event: 'line', handler: (s: string, ts: number) => void): void;
    on(event: 'exit', handler: () => void): void;
    restart(): Promise<void>
    stop(): Promise<void>
    delete(): Promise<void>
}

// pm2.connect(function (err) {
//     if (err) {
//         console.error(err);
//         process.exit(2);
//     }
// });

const pm2_bus_ctrl = {
    refs: 0,
    p: null as any as Promise<any>,
    get() {
        if (!pm2_bus_ctrl.p)
            pm2_bus_ctrl.p = new Promise<any>((resolve, reject) => {
                pm2.launchBus((err, bus) => {
                    if (err) return reject(err);
                    resolve(bus);
                });
            });
        return pm2_bus_ctrl.p;
    },
    on(event: string, fn: (...args: any[]) => void) {
        let t: any;
        let closed = false;
        pm2_bus_ctrl.get().then(
            (b) => {
                t = b.on(event, fn);
                if (closed) t.close();
            }
        );
        return {
            close() {
                if (t) {
                    t.close();
                    t = null;
                }
                closed = true;
            }
        }
    }
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
            cwd: string,
            once: boolean,
            watch?: boolean | string[],
        }): Promise<SpawnedProcess> {

        let eventHandlers: Array<{ close(): void }> = [];
        let r: SpawnedProcess = {
            get name() {
                return opts.name;
            },
            on(event: string, handler: (...args: any[]) => void) {
                let t: any;
                if (event === 'line')
                    t = pm2_bus_ctrl.on('log:out', function (d: any) {
                        if (d.process.name == opts.name) {
                            handler(d.data, d.at);
                        }
                    });
                else if (event === 'exit')
                    t = pm2_bus_ctrl.on('process:event', function (d: any) {
                        if (d.event === 'exit' && d.process.name == opts.name) {
                            handler();
                        }
                    });
                eventHandlers.push(t);
            },
            async restart() {
                return new Promise<void>((resolve, reject) => {
                    pm2.restart(opts.name, (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            },
            async stop() {
                return new Promise<void>((resolve, reject) => {
                    eventHandlers.forEach((t) => t.close());
                    eventHandlers = [];
                    pm2.stop(opts.name, (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            },
            async delete() {
                return new Promise<void>((resolve, reject) => {
                    eventHandlers.forEach((t) => t.close());
                    eventHandlers = [];
                    pm2.delete(opts.name, (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }
        };
        return new Promise<SpawnedProcess>((resolve, reject) => {
            const pm2_opts = {
                name: opts.name,
                script: cmd,
                args,
                cwd: opts.cwd,
                autorestart: !opts.once,
                watch: opts.watch,
                source_map_support: true,
            };
            pm2.start(pm2_opts, (err, proc) => {
                if (err) return reject(err);
                resolve(r);
            });
        });
    },
    async stopProcess(name: string) {
        return new Promise<pm2.Proc>((resolve, reject) => {
            pm2.stop(name, (err, proc) => {
                if (err) reject(err);
                resolve(proc);
            });
        });
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