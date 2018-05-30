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
var fs_1 = require("fs");
var utils_1 = require("../utils");
var watchers_1 = require("../watchers");
var path_1 = require("path");
function buildTypeScript(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!utils_1.utils.exists(name, "tsconfig.json")) {
                return [2 /*return*/];
            }
            utils_1.utils.exec("npm", ["run", "build"], { cwd: utils_1.utils.path(name), title: "building: " + name });
            return [2 /*return*/];
        });
    });
}
exports.buildTypeScript = buildTypeScript;
function watchTypeScript(packageName) {
    return __awaiter(this, void 0, void 0, function () {
        function runTests() {
            return __awaiter(this, void 0, void 0, function () {
                var pt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            coverage = undefined;
                            return [4 /*yield*/, abortTesting()];
                        case 1:
                            _a.sent();
                            testing = true;
                            return [4 /*yield*/, utils_1.utils.spawn("npm", ["test"], {
                                    name: procName + "test",
                                    cwd: utils_1.utils.path(packageName),
                                })];
                        case 2:
                            pt = _a.sent();
                            // pt.on('line', (s)=>console.log(s));
                            pt.on("exit", function () {
                                var summary = utils_1.utils.readCoverageSummary(packageName);
                                testing = false;
                                if (summary) {
                                    coverage = Math.min(summary.lines.pct, summary.statements.pct, summary.functions.pct, summary.branches.pct);
                                    if (coverage < 80) {
                                        errors.push({
                                            file: "?",
                                            row: 0, col: 0,
                                            msg: ["Cobertura do código por testes está abaixo de ", coverage, "%"].join(""),
                                        });
                                    }
                                }
                                else {
                                    coverage = undefined;
                                    errors.push({
                                        file: "?",
                                        row: 0, col: 0,
                                        msg: "Teste não gerou relatório de cobertura de código",
                                    });
                                }
                                if (events) {
                                    events.onFinished(watcher);
                                }
                            });
                            return [2 /*return*/];
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
                    if (old) {
                        return [2 /*return*/, old.stop()];
                    }
                    return [2 /*return*/];
                });
            });
        }
        var events, warnings, errors, building, testing, coverage, procTest, procName, procBuild, watcher;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (packageName === "@hoda5/hdev") {
                        return [2 /*return*/];
                    }
                    if (utils_1.utils.verbose) {
                        utils_1.utils.debug("watchTypeScript", packageName);
                    }
                    if (!utils_1.utils.exists(packageName, "tsconfig.json")) {
                        return [2 /*return*/];
                    }
                    warnings = [];
                    errors = [];
                    building = false;
                    testing = false;
                    procName = "ts_" + utils_1.utils.displayFolderName(packageName);
                    return [4 /*yield*/, utils_1.utils.spawn("npm", ["run", "watch"], {
                            name: procName,
                            cwd: utils_1.utils.path(packageName),
                        })];
                case 1:
                    procBuild = _a.sent();
                    procBuild.on("line", function (line) {
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
                                if (/(TS6192)|(TS6133)/.test(m[6])) {
                                    type = "warning";
                                }
                                var msg = {
                                    file: m[1],
                                    row: parseInt(m[2]),
                                    col: parseInt(m[3]),
                                    msg: m[6] + m[5],
                                };
                                if (type === "warning")
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
                            errors = [{ file: "", row: 0, col: 0, msg: "stopped" }];
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
function setupTypeScript(name, withReact) {
    return __awaiter(this, void 0, void 0, function () {
        function ajust_packagejson() {
            var packageJSON = utils_1.utils.getPackageJsonFor(name);
            if (!packageJSON.scripts) {
                packageJSON.scripts = {};
            }
            packageJSON.scripts.build = "tsc";
            packageJSON.scripts.watch = "tsc -w";
            packageJSON.scripts.lint = "tslint --project .";
            packageJSON.scripts.lintfix = "tslint --project . --fix";
            if (packageJSON.dependencies && packageJSON.dependencies.react)
                withReact = true;
            fs_1.writeFileSync(utils_1.utils.path(name, "package.json"), JSON.stringify(packageJSON, null, 2), "utf-8");
        }
        function save_tsconfig() {
            var tsconfig = JSON.parse(fs_1.readFileSync(path_1.resolve(path_1.join(__dirname, "../tsconfig.json")), 'utf-8'));
            if (withReact)
                tsconfig.compilerOptions.lib.push("dom");
            fs_1.writeFileSync(utils_1.utils.path(name, "tsconfig.json"), JSON.stringify(tsconfig, null, 2), "utf-8");
        }
        function save_tslint() {
            var tslint = JSON.parse(fs_1.readFileSync(path_1.resolve(path_1.join(__dirname, "../tslint.json")), 'utf-8'));
            fs_1.writeFileSync(utils_1.utils.path(name, "tslint.json"), JSON.stringify(tslint, null, 2), "utf-8");
        }
        function install_pkgs() {
            var argsDeps = [
                "@hoda5/h5global@latest",
            ];
            var argsDevs = [
                "typescript@latest",
                "tslint@latest",
                "tslint-config-standard@latest",
            ];
            if (withReact) {
                argsDeps.push("react@lastest");
                argsDevs.push("@types/react@lastest");
            }
            if (argsDeps.length)
                utils_1.utils.exec("npm", ["install", "--save"].concat(argsDeps), { cwd: utils_1.utils.path(name), title: "" });
            if (argsDevs.length)
                utils_1.utils.exec("npm", ["install", "--save-dev"].concat(argsDevs), { cwd: utils_1.utils.path(name), title: "" });
        }
        return __generator(this, function (_a) {
            ajust_packagejson();
            save_tsconfig();
            save_tslint();
            install_pkgs();
            return [2 /*return*/];
        });
    });
}
exports.setupTypeScript = setupTypeScript;
// export async function buildTypeScript(name: string) {
//     if (!utils.exists(name, 'tsconfig.json')) return;
//     let allDiagnostics: Diagnostic[] = [];
//     await utils.forEachPackage(async (pkg, folder) => {
//         allDiagnostics = allDiagnostics.concat(
//             await compile([], {
//                 project: utils.path(name),
//             }));
//     });
//     allDiagnostics.forEach(diagnostic => {
//         if (diagnostic.file) {
//             let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
//             let message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
//             console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
//         }
//         else {
//             console.log(`${flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
//         }
//     });
//     return allDiagnostics;
// }
// async function compile(fileNames: string[], options: CompilerOptions): Promise<Diagnostic[]> {
//     let program = createProgram(fileNames, options);
//     let emitResult = program.emit();
//     return getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
//     // let exitCode = emitResult.emitSkipped ? 1 : 0;
//     // console.log(`Process exiting with code '${exitCode}'.`);
//     // process.exit(exitCode);
// }
//# sourceMappingURL=buildTypeScript.js.map