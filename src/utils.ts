import { wrap } from 'bash-color';
import { spawn, SpawnOptions, spawnSync, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { existsSync, readdirSync, readFileSync, writeFileSync, unlink } from 'fs';
import { basename, dirname, join } from 'path';

export interface PackageJSON {
  name: string;
  main: string;
  scripts?: {
    [name: string]: string;
  };
  dependencies?: {
    [name: string]: string;
  };
  devDependencies?: {
    [name: string]: string;
  };
  peerDependencies?: {
    [name: string]: string;
  };
  jest: any;
}
export interface WorkspaceFile {
  'folders': Array<{ path: string }>;
  settings: any;
}
export interface Defer<T> {
  promise: Promise<T>;
  resolve(res: T | Promise<T>): void;
  reject(reason: any): void;
}
export interface SpawnedProcess {
  readonly name: string;
  on(event: 'line' | 'error', handler: (s: string) => void): void;
  on(event: 'exit', handler: (code: number) => void): void;
  restart(): Promise<void>;
  stop(): Promise<void>;
}
export interface SrcMessage {
  msg: string;
  stack?: Array<SrcMessageLoc>
}

export interface SrcMessageLoc {
  file: string;
  row: number;
  col: number;
}

export interface TestResults {
  packageName: string;
  errors: SrcMessage[],
  warnings: SrcMessage[],
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
    if (!existsSync(dir)) { return []; }
    const l1 = readdirSync(dir);
    const r: string[] = [];
    l1.forEach((f1) => {
      if (f1[0] === '@') {
        readdirSync(dir + '/' + f1).forEach((f2) => {
          r.push(f1 + '/' + f2);
        });
      } else { r.push(f1); }
    });
    if (utils.verbose) { utils.debug('listPackages', r.join()); }
    return r;
  },
  forEachPackage(fn: (packageName: string, folder: string) => Promise<void>) {
    const packages = utils.listPackages();
    return Promise.all(packages.map((p) => {
      return fn(p, [root, 'packages', p].join('/'));
    })).then(() => true);
  },
  getPackageJsonFor(packagName: string) {
    const json = utils.readJSON<PackageJSON>(packagName, 'package.json');
    if (json.name !== packagName) {
      utils.throw(
        'Package name (' + packagName +
        ') é diferente do que está em name do package.json (' +
        json.name + ')');
    }
    return json;
  },
  path(packageName: string, ...names: string[]) {
    return join(root, 'packages', packageName, ...names);
  },
  add_to_git_ignore(packageName: string, ...ignore: string[]) {
    const lines = utils.exists('.gitignore') ?
      readFileSync(utils.path(packageName, '.gitignore'), 'utf-8').split('\n') : [];
    ignore.forEach((l) => {
      const i = lines.indexOf(l);
      if (i === -1) lines.push(l);
    });
    writeFileSync(utils.path(packageName, '.gitignore'), lines.join('\n'), 'utf-8');
  },
  exists(packageName: string, ...names: string[]): boolean {
    return existsSync(utils.path(packageName, ...names));
  },
  readText(packageName: string, filename: string): string {
    return readFileSync(
      utils.path(packageName, filename),
      { encoding: 'utf-8' },
    );
  },
  readJSON<T>(packageName: string, filename: string): T {
    return JSON.parse(utils.readText(packageName, filename)) as T;
  },
  readTestResult(packageName: string): TestResults | undefined {
    const cov = 'coverage/h5-test-report.json';
    if (utils.exists(packageName, cov)) {
      return utils.readJSON<TestResults>(packageName, cov);
    }
  },
  readCoverageSummary(packageName: string): CoverageResult | undefined {
    const cov = 'coverage/coverage-summary.json';
    if (utils.exists(packageName, cov)) {
      const summary = utils.readJSON<CoverageResults>(packageName, cov);
      return summary.total;
    }
  },
  throw(msg: string) {
    // tslint:disable-next-line
    console.log(msg);
    process.exit(1);
  },
  exec(cmd: string, args: string[], opts: { cwd: string, title: string }) {
    if (opts.title) {
      // tslint:disable-next-line
      console.log(
        wrap(opts.title, 'RED', 'background'),
      );
    } else {
      // tslint:disable-next-line
      console.log(
        wrap(opts.cwd + '$ ', 'BLUE', 'background') +
        wrap(cmd + ' ' + args.join(' '), 'RED', 'background'),
      );
    }
    const r = spawnSync(
      cmd, args,
      {
        cwd: opts.cwd,
        encoding: 'utf-8',
        stdio: ['inherit', 'inherit', 'inherit'],
      },
    );
    if (r.status !== 0) {
      process.exit(1);
    }
  },
  pipe(
    cmd: string,
    args: string[],
    opts: { cwd: string, title: string, verbose?: boolean, throwErrors?: boolean }) {
    return new Promise<{ out: string, err: string }>((pmResolve, pmReject) => {
      if (opts.verbose) {
        if (opts.title) {
          // tslint:disable-next-line
          console.log(
            wrap(opts.title, 'RED', 'background'),
          );
        } else {
          // tslint:disable-next-line
          console.log(
            wrap(opts.cwd + '$ ', 'BLUE', 'background') +
            wrap(cmd + ' ' + args.join(' '), 'RED', 'background'),
          );
        }
      }
      const spawnOpts = {
        cwd: opts.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        // encoding: 'utf8',
      };
      const child = spawn(cmd, args, spawnOpts);
      const out: string[] = [];
      const err: string[] = [];
      child.stdout.on('data', (s) => {
        out.push(s.toString());
      });
      child.stderr.on('data', (s) => {
        err.push(s.toString());
      });
      child.on('close', (code) => {
        if (opts.throwErrors && code) {
          err.push('code=' + code);
          pmReject(err.join(''));
        } else {
          pmResolve(
            {
              err: err.join(''),
              out: out.join(''),
            },
          );
        }
      });
    });
  },
  async spawn(
    cmd: string,
    args: string[],
    opts: {
      name: string,
      cwd: string,
    }): Promise<SpawnedProcess> {

    let proc: ChildProcess;
    await start();
    const emitter = new EventEmitter();

    const r: SpawnedProcess = {
      get name() {
        return opts.name;
      },
      on(event: string, handler: (...args: any[]) => void) {
        emitter.on(event, handler);
      },
      async restart() {
        proc.kill();
        await start();
      },
      async stop() {
        if (utils.verbose) {
          // tslint:disable-next-line
          console.log(
            wrap(opts.name, 'PURPLE', 'background'),
            wrap(' kill', 'RED', 'background'),
          );
        }
        proc.kill();
      },
    };
    return Promise.resolve(r);

    async function start() {
      const spawnOpts: SpawnOptions = {
        cwd: opts.cwd,
        detached: false,
      };
      if (utils.verbose) {
        // tslint:disable-next-line
        console.log(
          wrap(opts.name, 'PURPLE', 'background'),
          wrap(opts.cwd + '$ ', 'BLUE', 'background') +
          wrap(' ' + cmd + ' ' + args.join(' '), 'RED', 'background'),
        );
      }
      proc = spawn(cmd, args, spawnOpts);
      proc.stdout.on('data', parseLines);
      proc.stderr.on('data', (data) => {
        emitter.emit('error', data.toString());
      });
      proc.on('exit', (code) => {
        if (utils.verbose) {
          // tslint:disable-next-line
          console.log(
            wrap(opts.name, 'PURPLE', 'background'),
            wrap(' exit ' + code, code === 0 ? 'GREEN' : 'RED', 'background'),
          );
        }
        emitter.emit('exit', code);
      });
      return new Promise<ChildProcess>((resolve) => {
        resolve(proc);
      });

      function parseLines(data: any) {
        const s1: string = data.toString();
        let lines: string[];
        if (utils.verbose) {
          s1.split('\n').forEach((lo) => {
            const ss2 = // lo.indexOf('\x1b[2K')>=0 ? '' :
              // lo.replace(/\u001b/g, '<ESC>');
              lo.replace(/\u001bc/g, '')
                .replace(/\u001b\[\d{0,2}m/g, '');
            if (ss2.trim()) {
              // tslint:disable-next-line
              console.log(
                wrap(opts.name, 'PURPLE', 'background'),
                ss2,
              );
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
  },
  exit(code: number) {
    // pm2.stop('hdev', (err, proc) => {
    //     //
    // });
    setTimeout(() => process.exit(code), 200);
  },
  defer<T>() {
    let fnResolve: (res: T) => void;
    let fnReject: (reason: any) => void;
    const promise = new Promise<T>((resolve, reject) => {
      fnResolve = resolve;
      fnReject = reject;
    });
    const d = {
      promise,
      resolve(res: T | Promise<T>) {
        if (res instanceof Promise) res.then(d.resolve, d.reject);
        else if (fnResolve) fnResolve(res);
        else { setTimeout(() => d.resolve(res), 10); }
      },
      reject(reason: any) {
        if (reason instanceof Promise) reason.then(d.reject, d.reject);
        else if (fnReject) fnReject(reason);
        else { setTimeout(() => d.reject(reason), 10); }
      },
    };
    return d;
  },
  limiteSync<T>(opts: { ms: number, bounce?: boolean, fn: () => T }) {
    let tm: NodeJS.Timer | undefined;
    const ts = 0;
    const { ms, bounce, fn } = opts;
    const limiter = Object.assign(() => {
      limiter.pending = true;
      if (tm) { clearTimeout(tm); }
      let timeout = bounce ? ms : new Date().getTime() - ts;
      if (timeout > ms) { timeout = ms; }
      if (timeout < 1) { timeout = 1; }
      tm = setTimeout(() => {
        tm = undefined;
        limiter.pending = false;
        fn();
      }, timeout);
    }, {
        pending: false,
        cancel() {
          if (tm) { clearTimeout(tm); }
          tm = undefined;
        },
      });
    return limiter;
  },
  limiteAsync<T>(opts: { ms: number, bounce?: boolean, fn: () => Promise<T> }) {
    let tm: NodeJS.Timer | undefined;
    const ts = 0;
    const { ms, bounce, fn } = opts;
    let defers: Array<Defer<T>> = [];
    const limiter = Object.assign(() => {
      limiter.pending = true;
      if (tm) { clearTimeout(tm); }
      let timeout = bounce ? ms : new Date().getTime() - ts;
      if (timeout > ms) { timeout = ms; }
      if (timeout < 1) { timeout = 1; }
      const defer = utils.defer<T>();
      defers.push(defer);
      tm = setTimeout(() => {
        tm = undefined;
        limiter.pending = false;
        try {
          const r = fn();
          defers.forEach((d) => d.resolve(r));
        } catch (e) {
          defers.forEach((d) => d.reject(e));
        }
        defers = [];
      }, timeout);
    }, {
        pending: false,
        cancel() {
          if (tm) { clearTimeout(tm); }
          tm = undefined;
          defers.forEach((d) => d.reject('cancel'));
          defers = [];
        },
      });
    return limiter;
  },
  async removeFiles(filenames: string[]) {
    await Promise.all(filenames.map(async (fn) => {
      return new Promise((pmResolve, pmReject) => {
        unlink(fn, (err) => {
          if (err) pmReject(err);
          else pmResolve();
        });
      });
    }));
  },
  loc(m: SrcMessage) {
    if (m.stack) {
      const test = m.stack.filter((s) => /\.test\.ts$/g.test(s.file));
      if (test.length) return test[0];
      const ts = m.stack.filter((s) => /\.ts$/g.test(s.file));
      if (ts.length) return ts[0];
      return m.stack[0];
    }
  },
  debug(title: string, ...args: any[]) {
    // tslint:disable-next-line
    console.log(
      [
        wrap(title + ': ', 'PURPLE', 'background'),
        ...args.map((a) => wrap(JSON.stringify(a), 'BLUE', 'background')),
      ].join(' '),
    );
  },
};

const root = findRoot(process.cwd());

function findRoot(folder: string) {
  while (folder && folder !== '/') {
    const files = readdirSync(folder);
    const w = basename(folder) + '.code-workspace';
    if (files.some((f) => f === w)) {
      return folder;
    }
    folder = dirname(folder);
  }
  return '';
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
