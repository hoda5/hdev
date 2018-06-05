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
var utils_1 = require("../../utils");
var watchers_1 = require("../../watchers");
function watchTypeScript(packageName) {
    return __awaiter(this, void 0, void 0, function () {
        function runTests() {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            coverage = undefined;
                            return [4 /*yield*/, abortTesting()];
                        case 1:
                            _a.sent();
                            testing = true;
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 6, 7, 8]);
                            return [4 /*yield*/, utils_1.utils.pipe('npm', ['test'], {
                                    title: procName + '_tst',
                                    cwd: utils_1.utils.path(packageName),
                                    verbose: false,
                                    throwErrors: true,
                                })];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, processTestResult()];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, processCoverageResult()];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 6:
                            e_1 = _a.sent();
                            errors.push({ msg: e_1.message });
                            return [3 /*break*/, 8];
                        case 7:
                            testing = false;
                            if (events) {
                                events.onFinished(watcher);
                            }
                            console.log('finished');
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        function abortTesting() {
            return __awaiter(this, void 0, void 0, function () {
                var old;
                return __generator(this, function (_a) {
                    old = procTest;
                    procTest = undefined;
                    testing = false;
                    if (old)
                        return [2 /*return*/, old.stop()];
                    return [2 /*return*/];
                });
            });
        }
        function processTestResult() {
            return __awaiter(this, void 0, void 0, function () {
                var summary;
                return __generator(this, function (_a) {
                    summary = utils_1.utils.readTestResult(packageName);
                    if (summary) {
                        errors.push.apply(errors, summary.errors);
                        warnings.push.apply(warnings, summary.warnings);
                    }
                    else {
                        coverage = undefined;
                        errors.push({
                            msg: 'Teste não gerou relatório',
                        });
                    }
                    return [2 /*return*/];
                });
            });
        }
        function processCoverageResult() {
            return __awaiter(this, void 0, void 0, function () {
                var summary;
                return __generator(this, function (_a) {
                    summary = utils_1.utils.readCoverageSummary(packageName);
                    if (summary) {
                        coverage = Math.round((summary.lines.pct + summary.statements.pct +
                            summary.functions.pct + summary.branches.pct) / 4);
                        if (coverage < 10) {
                            errors.push({
                                msg: ['Cobertura do código por testes está abaixo de ', coverage, '%'].join(''),
                            });
                        }
                    }
                    else {
                        coverage = undefined;
                        errors.push({
                            msg: 'Teste não gerou relatório de cobertura de código',
                        });
                    }
                    return [2 /*return*/];
                });
            });
        }
        var events, warnings, errors, building, testing, coverage, procTest, procName, procBuild, watcher;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (packageName === '@hoda5/hdev')
                        return [2 /*return*/];
                    if (utils_1.utils.verbose)
                        utils_1.utils.debug('watchTypeScript', packageName);
                    if (!utils_1.utils.exists(packageName, 'tsconfig.json'))
                        return [2 /*return*/];
                    warnings = [];
                    errors = [];
                    building = false;
                    testing = false;
                    procName = 'ts_' + utils_1.utils.displayFolderName(packageName);
                    return [4 /*yield*/, utils_1.utils.spawn('npm', ['run', 'watch'], {
                            name: procName,
                            cwd: utils_1.utils.path(packageName),
                        })];
                case 1:
                    procBuild = _a.sent();
                    procBuild.on('line', function (line) {
                        if (/Starting .*compilation/g.test(line)) {
                            warnings = [];
                            errors = [];
                            building = true;
                            abortTesting();
                            if (events) {
                                events.onBuilding(watcher);
                            }
                        }
                        else if (/Compilation complete/g.test(line)) {
                            building = false;
                            if (events) {
                                events.onTesting(watcher);
                            }
                            runTests();
                        }
                        else {
                            var m = /^([^\(]+)\((\d+),(\d+)\)\:\s*(\w*)\s+([^:]+):\s*(.*)/g.exec(line);
                            if (m) {
                                var type = m[4];
                                if (/(TS6192|TS6133)/.test(m[5])) {
                                    type = 'warning';
                                }
                                var msg = {
                                    stack: [{
                                            file: m[1],
                                            row: parseInt(m[2]),
                                            col: parseInt(m[3]),
                                        }],
                                    msg: m[6] + m[5],
                                };
                                if (type === 'warning')
                                    warnings.push(msg);
                                else
                                    errors.push(msg);
                            }
                            // else {
                            //     line = line.replace(/\x1bc/g, '')
                            //     if (line)
                            //         console.log(line);
                            // }
                        }
                    });
                    watcher = {
                        get packageName() {
                            return packageName;
                        },
                        get building() {
                            return building;
                        },
                        get testing() {
                            return testing;
                        },
                        get warnings() {
                            return warnings;
                        },
                        get coverage() {
                            return coverage;
                        },
                        get errors() {
                            return errors;
                        },
                        restart: function () {
                            return procBuild.restart();
                        },
                        stop: function () {
                            warnings = [];
                            errors = [{ msg: 'stopped' }];
                            return procBuild.stop();
                        },
                    };
                    events = watchers_1.addWatcher(watcher);
                    return [2 /*return*/, watcher];
            }
        });
    });
}
exports.watchTypeScript = watchTypeScript;
//# sourceMappingURL=watch.js.map