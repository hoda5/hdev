"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var fs_1 = require("fs");
var path_1 = require("path");
var child_process_1 = require("child_process");
var pm2 = require("pm2");
var bash_color_1 = require("bash-color");
// pm2.connect(function (err) {
//     if (err) {
//         console.error(err);
//         process.exit(2);
//     }
// });
var pm2_bus_ctrl = {
    refs: 0,
    p: null,
    get: function () {
        if (pm2_bus_ctrl.p)
            pm2_bus_ctrl.p = new Promise(function (resolve, reject) {
                pm2.launchBus(function (err, bus) {
                    if (err)
                        return reject(err);
                    resolve(bus);
                });
            });
        return pm2_bus_ctrl.p;
    },
    on: function (event, fn) {
        var t;
        var closed = false;
        pm2_bus_ctrl.get().then(function (b) {
            t = b.on(event, fn);
            if (closed)
                t.close();
        });
        return {
            close: function () {
                if (t) {
                    t.close();
                    t = null;
                }
                closed = true;
            }
        };
    }
};
exports.utils = {
    verbose: false,
    get root() {
        return root;
    },
    get workspaceFile() {
        return path_1.join(root, +path_1.basename(root) + '.code-workspace');
    },
    adaptFolderName: function (packageName) {
        if (packageName.indexOf('-') != -1)
            exports.utils.throw('Invalid package name ' + packageName);
        return packageName.replace('/', '-');
    },
    displayFolderName: function (packageName) {
        var m = /(?:@([^-]+))?-(.*)$/g.exec(exports.utils.adaptFolderName(packageName));
        return m ? (m[1] ? (m[2] + '@' + m[1]) : m[2]) : packageName;
    },
    listPackages: function () {
        var dir = root + '/packages';
        if (!fs_1.existsSync(dir))
            return [];
        return fs_1.readdirSync(dir);
    },
    forEachPackage: function (fn) {
        var packages = exports.utils.listPackages();
        if (exports.utils.verbose)
            debug('forEachPackage', packages.join());
        return Promise.all(packages.map(function (p) {
            if (exports.utils.verbose)
                debug('forEachPackage');
            return fn(p.replace('-', '/'), [root, 'packages', p].join('/'));
        })).then(function () { return true; });
    },
    getPackageJsonFor: function (packagName) {
        var json = exports.utils.readJSON(packagName, 'package.json');
        if (json.name !== packagName)
            exports.utils.throw('Package name (' + packagName +
                ') é diferente do que está em name do package.json (' +
                json.name + ')');
        return json;
    },
    path: function (packageName) {
        var names = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            names[_i - 1] = arguments[_i];
        }
        return path_1.join.apply(void 0, [root, 'packages', exports.utils.adaptFolderName(packageName)].concat(names));
    },
    exists: function (packageName, filename) {
        return fs_1.existsSync(exports.utils.path(packageName, filename));
    },
    readText: function (packageName, filename) {
        return fs_1.readFileSync(exports.utils.path(packageName, filename), { encoding: 'utf-8' });
    },
    readJSON: function (packageName, filename) {
        return JSON.parse(exports.utils.readText(packageName, filename));
    },
    throw: function (msg) {
        console.log(msg);
        process.exit(1);
    },
    exec: function (cmd, args, opts) {
        console.log(bash_color_1.wrap(opts.cwd + '$ ', "BLUE", 'hi_background') +
            bash_color_1.wrap(cmd + ' ' + args.join(' '), "RED", 'hi_background'));
        var r = child_process_1.spawnSync(cmd, args, __assign({}, opts, { stdio: ['inherit', 'inherit', 'inherit'] }));
        if (r.status != 0)
            process.exit(1);
    },
    spawn: function (cmd, args, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var t, r;
            return __generator(this, function (_a) {
                if (opts.onLine)
                    t = pm2_bus_ctrl.on('log:out', function (d) {
                        if (opts.onLine && d.process.name == opts.name) {
                            opts.onLine(d.data, d.at);
                        }
                    });
                r = {
                    get name() {
                        return opts.name;
                    },
                    restart: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, new Promise(function (resolve, reject) {
                                        pm2.restart(opts.name, function (err) {
                                            if (err)
                                                return reject(err);
                                            resolve();
                                        });
                                    })];
                            });
                        });
                    },
                    kill: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, new Promise(function (resolve, reject) {
                                        if (t)
                                            t.close();
                                        pm2.delete(opts.name, function (err) {
                                            if (err)
                                                return reject(err);
                                            resolve();
                                        });
                                    })];
                            });
                        });
                    }
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        pm2.start({
                            name: opts.name,
                            script: cmd,
                            args: args,
                            cwd: opts.cwd,
                            watch: opts.watch,
                        }, function (err, proc) {
                            if (err)
                                return reject(err);
                            resolve(r);
                        });
                    })];
            });
        });
    },
    stopProcess: function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        pm2.stop(name, function (err, proc) {
                            if (err)
                                reject(err);
                            resolve(proc);
                        });
                    })];
            });
        });
    }
};
var root = findRoot(process.cwd());
function findRoot(folder) {
    var _loop_1 = function () {
        var files = fs_1.readdirSync(folder);
        var w = path_1.basename(folder) + '.code-workspace';
        if (files.some(function (f) { return f == w; })) {
            return { value: folder };
        }
        folder = path_1.dirname(folder);
    };
    while (folder && folder != '/') {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
    }
    exports.utils.throw('no code-workspace file found');
    return '';
}
function debug(title) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    console.log(bash_color_1.wrap(title + ': ', "PURPLE", 'background') +
        bash_color_1.wrap(args.join(' '), "BLUE", 'background'));
}
//# sourceMappingURL=utils.js.map