import { utils } from "../utils"
import { addWatcher, Watcher, WatcherEvents, SrcMessage } from "../watchers"
import { watch } from "fs";

export async function buildTypeScript(name: string) {
    if (!utils.exists(name, 'tsconfig.json')) return;
    utils.exec('npm', ['run', 'build'], { cwd: utils.path(name), title: 'building: '+name });
}

export async function watchTypeScript(name: string): Promise<Watcher | undefined> {
    if (!utils.exists(name, 'tsconfig.json')) return;
    let events: WatcherEvents;
    let warnings: SrcMessage[] = [];
    let errors: SrcMessage[] = [];
    let building = false;
    const procName = 'ts_' + utils.displayFolderName(name);
    try {
        await utils.stopProcess(procName);
    }
    catch (e) { }
    const p = await utils.spawn('npm', ['run', 'watch'], {
        name: procName,
        cwd: utils.path(name),
        // watch: [utils.path(name, 'src')],
        onLine(line: string) {
            if (/Starting .*compilation/g.test(line)) {
                warnings = [];
                errors = [];
                building = true;
                if (events) events.onStartBuild(watcher);
            }
            else if (/Compilation complete/g.test(line)) {
                building = false;
                if (events) events.onFinishBuild(watcher);
            } else {
                const m = /^([^\(]+)\((\d+),(\d+)\)\:\s*(\w*)\s+([^:]+):\s*(.*)/g.exec(line);
                if (m) {
                    const type = m[4];
                    const msg: SrcMessage = {
                        file: m[1],
                        row: parseInt(m[2]),
                        col: parseInt(m[3]),
                        msg: m[6] + m[5]
                    }
                    if (type === 'warning') warnings.push(msg)
                    else errors.push(msg)
                }
                // else {
                //     line = line.replace(/\x1bc/g, '')
                //     if (line)
                //         console.log(line);
                // }
            }
        }
    });
    const watcher: Watcher = {
        get packageName() {
            return name;
        },
        get building() {
            return building;
        },
        get warnings() {
            return warnings;
        },
        get errors() {
            return errors;
        },
        restart() {
            return p.restart();
        },
        kill() {
            warnings = [];
            errors = [{ file: '', row: 0, col: 0, msg: 'stopped' }];
            return p.kill();
        }
    }
    events = addWatcher(watcher);
    return watcher;
}

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