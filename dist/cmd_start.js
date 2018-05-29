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
var utils_1 = require("./utils");
var buildTypeScript_1 = require("./build/buildTypeScript");
var ui_1 = require("./ui");
var pm2_1 = require("pm2");
var chokidar_1 = require("chokidar");
function cmd_start(args, opts) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.dir({ start: process.argv });
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
                                    case 0: return [4 /*yield*/, buildTypeScript_1.watchTypeScript(pkg)];
                                    case 1:
                                        if (_a.sent())
                                            ok = true;
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    if (ok)
                        ui_1.initUi(logMode);
                    return [2 /*return*/, ok];
            }
        });
    });
}
function start_as_service(follow) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, start_service()];
                case 1:
                    _a.sent();
                    if (follow)
                        follow_service();
                    else
                        setTimeout(function () { return process.exit(0); }, 2000);
                    return [2 /*return*/, true];
            }
        });
    });
}
function start_service() {
    console.log('starting');
    return new Promise(function (resolve, reject) {
        return pm2_1.start({
            name: 'hdev',
            script: process.argv[1],
            args: ['start', '--no-service', '--log-mode'],
            restartDelay: 100,
            watch: false
        }, function (err) {
            console.log('started');
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
function stop_service() {
    console.log('stoppingx');
    return new Promise(function (resolve, reject) {
        return pm2_1.stop('hdev', function (err) {
            console.log('stopped');
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
function follow_service() {
    var _this = this;
    var restart_service = utils_1.utils.limiter(1500, function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (restart_service.pending)
                        return [2 /*return*/];
                    return [4 /*yield*/, stop_service()];
                case 1:
                    _a.sent();
                    if (restart_service.pending)
                        return [2 /*return*/];
                    return [4 /*yield*/, start_service()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    pm2_1.launchBus(function (err, bus) {
        bus.on('log:out', function (d) {
            process.stdout.write(d.data);
        });
        bus.on('log:err', function (d) {
            process.stdout.write(d.data);
            setTimeout(function () { return process.exit(0); }, 2000);
        });
    });
    var watcher = chokidar_1.watch(__dirname);
    watcher.on('ready', function () {
        watcher.on('all', restart_service);
    });
    process.on('SIGINT', function () {
        stop_service();
        setTimeout(function () { return process.exit(0); }, 2000);
    });
}
//# sourceMappingURL=cmd_start.js.map