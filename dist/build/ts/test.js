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
// import * as NYC from 'nyc';
// import * as Mocha from 'mocha';
var utils_1 = require("../../utils");
var fs_1 = require("fs");
var sourcemap_1 = require("../sourcemap");
var ErrorStackParser = require("error-stack-parser");
function testTypeScript(packageName, failOnWarnings) {
    return __awaiter(this, void 0, void 0, function () {
        function parseTestResult(testOut) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var i, j, s, json, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            i = testOut.substr(0, 2) == '{\n' ? 0 : testOut.indexOf('\n{\n') + 1;
                            j = testOut.length;
                            if (!(i === -1)) return [3 /*break*/, 1];
                            errors.push({
                                msg: 'npm test deve gerar relatório mocha json',
                            });
                            return [3 /*break*/, 5];
                        case 1:
                            s = testOut.substr(0, j).substr(i);
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            json = JSON.parse(s);
                            return [4 /*yield*/, Promise.all((json.failures || []).map(function (f) { return __awaiter(_this, void 0, void 0, function () {
                                    var err;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, mapFailure(packageName, f)];
                                            case 1:
                                                err = _a.sent();
                                                // console.dir(err);
                                                errors.push(err);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }))];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _a.sent();
                            errors.push({
                                msg: 'npm test gerou um relatório mocha json inválido: ' +
                                    '\n' + (e_1.stack ? e_1.stack.toString() : e_1.message)
                                    + '\n',
                            });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        function mapFailure(packageName, f) {
            return __awaiter(this, void 0, void 0, function () {
                function tryGetMappedPosition(s) {
                    return __awaiter(this, void 0, void 0, function () {
                        var fileName, row, col, sourceMap, org;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    fileName = s.getFileName().replace(pkgPath + '/', '');
                                    row = s.getLineNumber();
                                    col = s.getColumnNumber();
                                    if (!(fileName.indexOf('node_modules') === -1)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, getCachedSourceMapConsumer(fileName)];
                                case 1:
                                    sourceMap = _a.sent();
                                    org = sourceMap.originalPositionFor({ line: row, column: col });
                                    // console.dir({ src: { fileName, row, col }, org })
                                    if (org && org.source && org.line) {
                                        return [2 /*return*/, {
                                                file: org.source,
                                                row: org.line,
                                                col: org.column || 0,
                                            }];
                                    }
                                    _a.label = 2;
                                case 2: 
                                // sourceMap.eachMapping((m) => {
                                //   console.dir(m);
                                // })
                                return [2 /*return*/, {
                                        file: fileName,
                                        row: row,
                                        col: col,
                                    }];
                            }
                        });
                    });
                }
                function getCachedSourceMapConsumer(fileName) {
                    return __awaiter(this, void 0, void 0, function () {
                        var r, _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    r = mapCache[fileName];
                                    if (!!r) return [3 /*break*/, 2];
                                    _a = mapCache;
                                    _b = fileName;
                                    return [4 /*yield*/, sourcemap_1.getSourceMapConsumer(utils_1.utils.path(packageName, fileName))];
                                case 1:
                                    r = _a[_b] =
                                        _c.sent();
                                    _c.label = 2;
                                case 2: return [2 /*return*/, r];
                            }
                        });
                    });
                }
                var err, stack, mstack;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            err = f.err;
                            stack = ErrorStackParser.parse(err);
                            return [4 /*yield*/, Promise.all(stack.map(tryGetMappedPosition))];
                        case 1:
                            mstack = _a.sent();
                            return [2 /*return*/, {
                                    msg: err.message,
                                    stack: mstack,
                                }];
                    }
                });
            });
        }
        var pkgPath, mocha, mapCache, warnings, errors, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pkgPath = utils_1.utils.path(packageName);
                    return [4 /*yield*/, utils_1.utils.pipe('node', [
                            pkgPath + '/node_modules/@hoda5/hdev/node_modules/nyc/bin/nyc.js',
                            '--reporter=html', '--reporter=json-summary',
                            pkgPath + '/node_modules/@hoda5/hdev/node_modules/mocha/bin/mocha',
                            // s + '/mocha/bin/mocha',
                            '--reporter=json',
                            '--timeout=5000',
                            pkgPath + '/dist/**/*.test.js',
                        ], {
                            cwd: utils_1.utils.path(packageName),
                            title: '',
                        })];
                case 1:
                    mocha = _a.sent();
                    mapCache = {};
                    warnings = [];
                    errors = [];
                    return [4 /*yield*/, parseTestResult(mocha.out)];
                case 2:
                    _a.sent();
                    result = {
                        packageName: packageName,
                        warnings: warnings,
                        errors: errors,
                    };
                    return [4 /*yield*/, utils_1.utils.nodify(fs_1.writeFile, pkgPath + '/coverage/h5-test-report.json', JSON.stringify(result), {
                            encoding: 'utf8',
                        })];
                case 3:
                    _a.sent();
                    if (errors.length) {
                        utils_1.utils.debug(packageName, errors.map(function (err) {
                            var loc = utils_1.utils.loc(err);
                            return (loc ? loc.file + '(' + loc.row + ',' + loc.col + '): ' : '') +
                                err.msg;
                        }));
                        return [2 /*return*/, 1];
                    }
                    if (failOnWarnings && warnings.length)
                        return [2 /*return*/, 2];
                    return [2 /*return*/, 0];
            }
        });
    });
}
exports.testTypeScript = testTypeScript;
//# sourceMappingURL=test.js.map