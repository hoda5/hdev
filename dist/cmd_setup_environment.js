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
var fs_1 = require("fs");
function check_environment() {
    var npmOk = process.env.NPM_PACKAGES === process.env.HOME + '/.npm-packages';
    return npmOk;
}
exports.check_environment = check_environment;
function cmd_setup_environment() {
    return __awaiter(this, void 0, void 0, function () {
        function env() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, Promise.resolve([
                            'alias hdev="' + process.argv[1] + '"',
                            'export NPM_PACKAGES="' + HOME + '/.npm-packages"',
                            'export PATH="$NPM_PACKAGES/bin:$PATH"',
                            'unset MANPATH',
                            'export MANPATH="$NPM_PACKAGES/share/man:$(manpath)"',
                        ])];
                });
            });
        }
        function completion() {
            return __awaiter(this, void 0, void 0, function () {
                var r, lines;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, utils_1.utils.pipe(process.argv[0], [process.argv[1], 'completion', shell], {
                                cwd: process.cwd(),
                                title: '',
                            })];
                        case 1:
                            r = _a.sent();
                            lines = r.out.replace(/hdev\.js/g, 'hdev').split('\n');
                            return [2 /*return*/, lines.filter(function (l) { return l && !/###/g.test(l); })];
                    }
                });
            });
        }
        function save_bashrc() {
            return __awaiter(this, void 0, void 0, function () {
                var lines, ignore;
                return __generator(this, function (_a) {
                    lines = fs_1.readFileSync(HOME + '/.bashrc', 'utf-8').split('\n');
                    ignore = false;
                    lines = lines.filter(function (line) {
                        var isBegin = line === BEGIN_HDEV_CONFIG;
                        var isEnd = line === END_HDEV_CONFIG;
                        if (isBegin)
                            ignore = true;
                        var r = !ignore;
                        if (isEnd)
                            ignore = false;
                        return r;
                    });
                    while (lines.length && (!lines[lines.length - 1].trim()))
                        lines.pop();
                    lines.push.apply(lines, [''].concat(bashcfg));
                    fs_1.writeFileSync(HOME + '/.bashrc', lines.join('\n'), 'utf-8');
                    return [2 /*return*/];
                });
            });
        }
        function save_npmrc() {
            return __awaiter(this, void 0, void 0, function () {
                var lines;
                return __generator(this, function (_a) {
                    lines = [
                        'prefix=' + HOME + '/.npm-packages',
                    ];
                    fs_1.writeFileSync(HOME + '/.npmrc', lines.join('\n'), 'utf-8');
                    return [2 /*return*/];
                });
            });
        }
        var shell, BEGIN_HDEV_CONFIG, END_HDEV_CONFIG, HOME, bashcfg, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    shell = 'bash';
                    BEGIN_HDEV_CONFIG = '### begin hdev config ###';
                    END_HDEV_CONFIG = '### end hdev config ###';
                    HOME = process.env.HOME;
                    _b = (_a = [
                        BEGIN_HDEV_CONFIG
                    ]).concat;
                    return [4 /*yield*/, env()];
                case 1:
                    _c = [_d.sent()];
                    return [4 /*yield*/, completion()];
                case 2:
                    bashcfg = _b.apply(_a, _c.concat([_d.sent(), [
                            END_HDEV_CONFIG,
                        ]]));
                    return [4 /*yield*/, save_bashrc()];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, save_npmrc()];
                case 4:
                    _d.sent();
                    // tslint:disable-next-line:no-console
                    console.log('ambiente configurado. Reinicie o terminal');
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.cmd_setup_environment = cmd_setup_environment;
//# sourceMappingURL=cmd_setup_environment.js.map