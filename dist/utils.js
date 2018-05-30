"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bash_color_1 = require("bash-color");
var child_process_1 = require("child_process");
var events_1 = require("events");
var fs_1 = require("fs");
var path_1 = require("path");
exports.utils = {
    verbose: false,
    get root() {
        return root;
    },
    get workspaceFile() {
        var ws = path_1.join(root, path_1.basename(root) + '.code-workspace');
        if (exports.utils.verbose)
            exports.utils.debug('workspaceFile', ws);
        return ws;
    },
    displayFolderName: function (packageName) {
        var m = /(?:@([^\/]+))?\/(.*)$/g.exec(packageName);
        return m ? (m[1] ? (m[2] + '@' + m[1]) : m[2]) : packageName;
    },
    listPackages: function () {
        var dir = root + '/packages';
        if (!fs_1.existsSync(dir)) {
            return [];
        }
        var l1 = fs_1.readdirSync(dir);
        var r = [];
        l1.forEach(function (f1) {
            if (f1[0] === '@') {
                fs_1.readdirSync(dir + '/' + f1).forEach(function (f2) {
                    r.push(f1 + '/' + f2);
                });
            }
            else {
                r.push(f1);
            }
        });
        if (exports.utils.verbose) {
            exports.utils.debug('listPackages', r.join());
        }
        return r;
    },
    forEachPackage: function (fn) {
        var packages = exports.utils.listPackages();
        return Promise.all(packages.map(function (p) {
            return fn(p, [root, 'packages', p].join('/'));
        })).then(function () { return true; });
    },
    getPackageJsonFor: function (packagName) {
        var json = exports.utils.readJSON(packagName, 'package.json');
        if (json.name !== packagName) {
            exports.utils.throw('Package name (' + packagName +
                ') é diferente do que está em name do package.json (' +
                json.name + ')');
        }
        return json;
    },
    path: function (packageName) {
        var names = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            names[_i - 1] = arguments[_i];
        }
        return path_1.join.apply(void 0, [root, 'packages', packageName].concat(names));
    },
    exists: function (packageName) {
        var names = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            names[_i - 1] = arguments[_i];
        }
        return fs_1.existsSync(exports.utils.path.apply(exports.utils, [packageName].concat(names)));
    },
    readText: function (packageName, filename) {
        return fs_1.readFileSync(exports.utils.path(packageName, filename), { encoding: 'utf-8' });
    },
    readJSON: function (packageName, filename) {
        return JSON.parse(exports.utils.readText(packageName, filename));
    },
    readCoverageSummary: function (packageName) {
        var cov = 'coverage/coverage-summary.json';
        if (exports.utils.exists(packageName, cov)) {
            var summary = exports.utils.readJSON(packageName, cov);
            return summary.total;
        }
    },
    throw: function (msg) {
        // tslint:disable-next-line
        console.log(msg);
        process.exit(1);
    },
    exec: function (cmd, args, opts) {
        if (opts.title) {
            // tslint:disable-next-line
            console.log(bash_color_1.wrap(opts.title, 'RED', 'background'));
        }
        else {
            // tslint:disable-next-line
            console.log(bash_color_1.wrap(opts.cwd + '$ ', 'BLUE', 'background') +
                bash_color_1.wrap(cmd + ' ' + args.join(' '), 'RED', 'background'));
        }
        var r = child_process_1.spawnSync(cmd, args, {
            cwd: opts.cwd,
            stdio: ['inherit', 'inherit', 'inherit'],
        });
        if (r.status !== 0) {
            process.exit(1);
        }
    },
    spawn: function (cmd, args, opts) {
        return __awaiter(this, void 0, void 0, function () {
            function start() {
                return __awaiter(this, void 0, void 0, function () {
                    function parseLines(data) {
                        var s1 = data.toString();
                        var lines;
                        if (exports.utils.verbose) {
                            s1.split('\n').forEach(function (lo) {
                                var ss2 = // lo.indexOf('\x1b[2K')>=0 ? '' :
                                 
                                // lo.replace(/\u001b/g, '<ESC>');
                                lo.replace(/\u001bc/g, '')
                                    .replace(/\u001b\[\d{0,2}m/g, '');
                                if (ss2.trim()) {
                                    // tslint:disable-next-line
                                    console.log(bash_color_1.wrap(opts.name, 'PURPLE', 'background'), ss2);
                                }
                            });
                        }
                        var s2 = s1
                            .replace(/\u001bc/g, '')
                            .replace(/\u001b\[\d{0,2}m/g, '');
                        lines = s2.split('\n');
                        lines.forEach(function (l) { return emitter.emit('line', l); });
                    }
                    var spawnOpts;
                    return __generator(this, function (_a) {
                        spawnOpts = {
                            cwd: opts.cwd,
                            detached: false,
                        };
                        if (exports.utils.verbose) {
                            // tslint:disable-next-line
                            console.log(bash_color_1.wrap(opts.name, 'PURPLE', 'background'), bash_color_1.wrap(opts.cwd + '$ ', 'BLUE', 'background') +
                                bash_color_1.wrap(' ' + cmd + ' ' + args.join(' '), 'RED', 'background'));
                        }
                        proc = child_process_1.spawn(cmd, args, spawnOpts);
                        proc.stdout.on('data', parseLines);
                        proc.stderr.on('data', parseLines);
                        proc.on('exit', function (code) {
                            if (exports.utils.verbose) {
                                // tslint:disable-next-line
                                console.log(bash_color_1.wrap(opts.name, 'PURPLE', 'background'), bash_color_1.wrap(' exit ' + code, code === 0 ? 'GREEN' : 'RED', 'background'));
                            }
                            emitter.emit('exit', code);
                        });
                        return [2 /*return*/, new Promise(function (resolve) {
                                resolve(proc);
                            })];
                    });
                });
            }
            var proc, emitter, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, start()];
                    case 1:
                        _a.sent();
                        emitter = new events_1.EventEmitter();
                        r = {
                            get name() {
                                return opts.name;
                            },
                            on: function (event, handler) {
                                emitter.on(event, handler);
                            },
                            restart: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                proc.kill();
                                                return [4 /*yield*/, start()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            stop: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        if (exports.utils.verbose) {
                                            // tslint:disable-next-line
                                            console.log(bash_color_1.wrap(opts.name, 'PURPLE', 'background'), bash_color_1.wrap(' kill', 'RED', 'background'));
                                        }
                                        proc.kill();
                                        return [2 /*return*/];
                                    });
                                });
                            },
                        };
                        return [2 /*return*/, Promise.resolve(r)];
                }
            });
        });
    },
    exit: function (code) {
        // pm2.stop('hdev', (err, proc) => {
        //     //
        // });
        setTimeout(function () { return process.exit(code); }, 200);
    },
    defer: function () {
        var fnResolve;
        var fnReject;
        var promise = new Promise(function (resolve, reject) {
            fnResolve = resolve;
            fnReject = reject;
        });
        var d = {
            promise: promise,
            resolve: function (res) {
                if (res instanceof Promise)
                    res.then(d.resolve, d.reject);
                else if (fnResolve)
                    fnResolve(res);
                else {
                    setTimeout(function () { return d.resolve(res); }, 10);
                }
            },
            reject: function (reason) {
                if (reason instanceof Promise)
                    reason.then(d.reject, d.reject);
                else if (fnReject)
                    fnReject(reason);
                else {
                    setTimeout(function () { return d.reject(reason); }, 10);
                }
            },
        };
        return d;
    },
    limiteSync: function (opts) {
        var tm;
        var ts = 0;
        var ms = opts.ms, bounce = opts.bounce, fn = opts.fn;
        var limiter = Object.assign(function () {
            limiter.pending = true;
            if (tm) {
                clearTimeout(tm);
            }
            var timeout = bounce ? ms : new Date().getTime() - ts;
            if (timeout > ms) {
                timeout = ms;
            }
            if (timeout < 1) {
                timeout = 1;
            }
            tm = setTimeout(function () {
                tm = undefined;
                limiter.pending = false;
                fn();
            }, timeout);
        }, {
            pending: false,
            cancel: function () {
                if (tm) {
                    clearTimeout(tm);
                }
                tm = undefined;
            },
        });
        return limiter;
    },
    limiteAsync: function (opts) {
        var tm;
        var ts = 0;
        var ms = opts.ms, bounce = opts.bounce, fn = opts.fn;
        var defers = [];
        var limiter = Object.assign(function () {
            limiter.pending = true;
            if (tm) {
                clearTimeout(tm);
            }
            var timeout = bounce ? ms : new Date().getTime() - ts;
            if (timeout > ms) {
                timeout = ms;
            }
            if (timeout < 1) {
                timeout = 1;
            }
            var defer = exports.utils.defer();
            defers.push(defer);
            tm = setTimeout(function () {
                tm = undefined;
                limiter.pending = false;
                try {
                    var r_1 = fn();
                    defers.forEach(function (d) { return d.resolve(r_1); });
                }
                catch (e) {
                    defers.forEach(function (d) { return d.reject(e); });
                }
                defers = [];
            }, timeout);
        }, {
            pending: false,
            cancel: function () {
                if (tm) {
                    clearTimeout(tm);
                }
                tm = undefined;
                defers.forEach(function (d) { return d.reject('cancel'); });
                defers = [];
            },
        });
        return limiter;
    },
    debug: function (title) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // tslint:disable-next-line
        console.log([
            bash_color_1.wrap(title + ': ', 'PURPLE', 'background')
        ].concat(args.map(function (a) { return bash_color_1.wrap(JSON.stringify(a), 'BLUE', 'background'); })).join(' '));
    },
};
var root = findRoot(process.cwd());
function findRoot(folder) {
    var _loop_1 = function () {
        var files = fs_1.readdirSync(folder);
        var w = path_1.basename(folder) + '.code-workspace';
        if (files.some(function (f) { return f === w; })) {
            return { value: folder };
        }
        folder = path_1.dirname(folder);
    };
    while (folder && folder !== '/') {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
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
//# sourceMappingURL=utils.js.map