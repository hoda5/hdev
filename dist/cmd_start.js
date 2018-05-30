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
var chokidar_1 = require("chokidar");
var path_1 = require("path");
var pm2_1 = require("pm2");
var buildTypeScript_1 = require("./build/buildTypeScript");
var ui_1 = require("./ui");
var utils_1 = require("./utils");
function cmd_start(args, opts) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (utils_1.utils.verbose) {
                utils_1.utils.debug("start_with_args", process.argv || args);
            }
            if (opts.noService)
                return [2 /*return*/, start_no_service(opts.logMode)];
            else
                return [2 /*return*/, start_as_service(opts.follow)];
            return [2 /*return*/];
        });
    });
}
exports.cmd_start = cmd_start;
function start_no_service(logMode) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ok = false;
                    return [4 /*yield*/, utils_1.utils.forEachPackage(function (pkg) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(pkg !== "@hoda5-hdev")) return [3 /*break*/, 2];
                                        return [4 /*yield*/, buildTypeScript_1.watchTypeScript(pkg)];
                                    case 1:
                                        if (_a.sent()) {
                                            ok = true;
                                        }
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    if (ok) {
                        ui_1.initUi(logMode);
                    }
                    return [2 /*return*/, ok];
            }
        });
    });
}
function start_as_service(follow) {
    return __awaiter(this, void 0, void 0, function () {
        function start_service() {
            if (utils_1.utils.verbose) {
                // tslint:disable-next-line
                console.log("starting hdev");
            }
            return new Promise(function (fnResolve, fnReject) {
                var args = ["start", "--no-service", "--log-mode"];
                if (utils_1.utils.verbose) {
                    args.push("--verbose");
                }
                var script = process.argv[1];
                if (wsHasHDEV) {
                    script = utils_1.utils.path("@hoda5-hdev", "dist/hdev.js");
                }
                else if (isTempWS) {
                    script = path_1.resolve(path_1.join(utils_1.utils.root, "../dist/hdev.js"));
                }
                var pm2Opts = {
                    name: "hdev",
                    script: script,
                    cwd: process.cwd(),
                    args: args,
                    restartDelay: 100,
                    watch: false,
                };
                if (utils_1.utils.verbose)
                    utils_1.utils.debug("pm2", pm2Opts);
                pm2_1.start(pm2Opts, function (err) {
                    if (err)
                        fnReject(err);
                    else {
                        setTimeout(function () {
                            fnResolve();
                            if (utils_1.utils.verbose)
                                utils_1.utils.debug("hdev started!");
                        }, 1);
                    }
                });
            });
        }
        function stop_service() {
            if (utils_1.utils.verbose) {
                utils_1.utils.debug("stopping hdev");
            }
            return new Promise(function (resolveStop) {
                return pm2_1.stop("hdev", function () {
                    if (utils_1.utils.verbose)
                        utils_1.utils.debug("hdev stopped");
                    resolveStop();
                });
            });
        }
        function follow_service() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (utils_1.utils.verbose) {
                                // tslint:disable-next-line
                                console.dir({ follow_service: { wsHasHDEV: wsHasHDEV, isTempWS: isTempWS } });
                            }
                            if (!(wsHasHDEV || isTempWS)) {
                                utils_1.utils.throw("hdev precisa estar no workspace para poder ser reconstruido");
                            }
                            return [4 /*yield*/, watch_hdev_for_rebuild()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, watch_dist()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, followLogs()];
                        case 3:
                            _a.sent();
                            monitor_SIGINT();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function watch_hdev_for_rebuild() {
            return __awaiter(this, void 0, void 0, function () {
                var p;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, utils_1.utils.spawn("npm", ["run", "watch"], {
                                cwd: path_1.resolve(path_1.join(__dirname, "..")),
                                name: "rebuild-hdev",
                            })];
                        case 1:
                            p = _a.sent();
                            return [2 /*return*/, new Promise(function (resolveB) {
                                    p.on("line", function (line) {
                                        if (/Compilation complete/g.test(line)) {
                                            // tslint:disable-next-line
                                            console.log("hdev rebuilded");
                                            if (resolveB) {
                                                resolveB();
                                            }
                                            resolveB = false;
                                        }
                                    });
                                })];
                    }
                });
            });
        }
        function watch_dist() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolveWatch) {
                            var watcherDist = chokidar_1.watch(__dirname);
                            watcherDist.on("ready", function () {
                                watcherDist.on("all", restartService);
                                resolveWatch();
                            });
                        })];
                });
            });
        }
        function followLogs() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolveF, rejectF) {
                            pm2_1.launchBus(function (err, bus) {
                                if (err)
                                    return rejectF(err);
                                bus.on("log:out", function (d) {
                                    process.stdout.write(d.data);
                                });
                                bus.on("log:err", function (d) {
                                    process.stdout.write(d.data);
                                    setTimeout(function () { return process.exit(0); }, 2000);
                                });
                                resolveF();
                            });
                        })];
                });
            });
        }
        function monitor_SIGINT() {
            process.on("SIGINT", function () {
                // tslint:disable-next-line
                console.log("   SIGINT");
                stop_service();
                setTimeout(function () { return process.exit(0); }, 2000);
            });
        }
        var isTempWS, wsHasHDEV, restartService;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isTempWS = __dirname === path_1.resolve(path_1.join(utils_1.utils.root, "../dist"));
                    wsHasHDEV = utils_1.utils.listPackages().indexOf("@hoda5-hdev") >= 0;
                    if (wsHasHDEV) {
                        // tslint:disable-next-line
                        console.log("usando hdev do workspace");
                    }
                    restartService = utils_1.utils.limiteAsync({
                        ms: 1500,
                        fn: function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (restartService.pending) {
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, stop_service()];
                                        case 1:
                                            _a.sent();
                                            if (restartService.pending) {
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, start_service()];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        },
                    });
                    if (!follow) return [3 /*break*/, 3];
                    return [4 /*yield*/, follow_service()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, start_service()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, start_service()];
                case 4:
                    _a.sent();
                    setTimeout(function () { return process.exit(0); }, 2000);
                    _a.label = 5;
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
//# sourceMappingURL=cmd_start.js.map