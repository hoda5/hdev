import { writeFileSync, readFileSync } from 'fs';
import { SpawnedProcess, utils } from '../utils';
import { addWatcher, SrcMessage, Watcher, WatcherEvents } from '../watchers';
import { resolve, join } from 'path';

export async function buildTypeScript(name: string) {
  if (!utils.exists(name, 'tsconfig.json')) return;
  utils.exec('npm', ['run', 'build'], { cwd: utils.path(name), title: 'building: ' + name });
}

export async function watchTypeScript(packageName: string): Promise<Watcher | undefined> {
  if (packageName === '@hoda5/hdev') return;
  if (utils.verbose) utils.debug('watchTypeScript', packageName);
  if (!utils.exists(packageName, 'tsconfig.json')) return;
  let events: WatcherEvents;
  let warnings: SrcMessage[] = [];
  let errors: SrcMessage[] = [];
  let building = false;
  let testing = false;
  let coverage: number | undefined;
  let procTest: SpawnedProcess | undefined;
  const procName = 'ts_' + utils.displayFolderName(packageName);
  const procBuild = await utils.spawn('npm', ['run', 'watch'], {
    name: procName,
    cwd: utils.path(packageName),
    // watch: [utils.path(name, 'src')],
  });
  procBuild.on('line', (line: string) => {
    if (/Starting .*compilation/g.test(line)) {
      warnings = [];
      errors = [];
      building = true;
      abortTesting();
      if (events) {
        events.onBuilding(watcher);
      }
    } else if (/Compilation complete/g.test(line)) {
      building = false;
      if (events) { events.onTesting(watcher); }
      runTests();
    } else {
      const m = /^([^\(]+)\((\d+),(\d+)\)\:\s*(\w*)\s+([^:]+):\s*(.*)/g.exec(line);
      if (m) {
        let type = m[4];
        if (/(TS6192)|(TS6133)/.test(m[6])) {
          type = 'warning';
        }
        const msg: SrcMessage = {
          file: m[1],
          row: parseInt(m[2]),
          col: parseInt(m[3]),
          msg: m[6] + m[5],
        };
        if (type === 'warning') warnings.push(msg);
        else errors.push(msg);
      }
      // else {
      //     line = line.replace(/\x1bc/g, '')
      //     if (line)
      //         console.log(line);
      // }
    }
  });
  const watcher: Watcher = {
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
    restart() {
      return procBuild.restart();
    },
    stop() {
      warnings = [];
      errors = [{ file: '', row: 0, col: 0, msg: 'stopped' }];
      return procBuild.stop();
    },
  };
  events = addWatcher(watcher);
  return watcher;
  async function runTests() {
    coverage = undefined;
    await abortTesting();
    testing = true;
    const pt = await utils.spawn('npm', ['test'], {
      name: procName + 'test',
      cwd: utils.path(packageName),
    });
    // pt.on('line', (s)=>console.log(s));
    pt.on('exit', () => {
      const summary = utils.readCoverageSummary(packageName);
      testing = false;
      if (summary) {
        coverage = Math.min(summary.lines.pct, summary.statements.pct, summary.functions.pct, summary.branches.pct);
        if (coverage < 80) {
          errors.push({
            file: '?',
            row: 0, col: 0,
            msg: ['Cobertura do código por testes está abaixo de ', coverage, '%'].join(''),
          });
        }
      } else {
        coverage = undefined;
        errors.push({
          file: '?',
          row: 0, col: 0,
          msg: 'Teste não gerou relatório de cobertura de código',
        });
      }
      if (events) { events.onFinished(watcher); }
    });
  }
  async function abortTesting() {
    const old = procTest;
    procTest = undefined;
    testing = false;
    if (old) {
      return old.stop();
    }
  }
}

export async function setupTypeScript(name: string, withReact: boolean) {
  ajust_packagejson();
  save_tsconfig();
  save_tslint();
  install_pkgs();
  function ajust_packagejson() {
    const packageJSON = utils.getPackageJsonFor(name);
    if (!packageJSON.scripts) {
      packageJSON.scripts = {};
    }
    packageJSON.scripts.build = 'tsc';
    packageJSON.scripts.watch = 'tsc -w';
    packageJSON.scripts.lint = 'tslint --project .';
    packageJSON.scripts.lintfix = 'tslint --project . --fix';
    if (packageJSON.dependencies && packageJSON.dependencies.react) withReact = true;
    packageJSON.jest = {
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
      moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
      ],
      collectCoverage: true,
      coverageReporters: [
        'json-summary',
        'lcov',
        'text',
      ],
    };
    writeFileSync(utils.path(name, 'package.json'),
      JSON.stringify(packageJSON, null, 2), 'utf-8');
  }
  function save_tsconfig() {
    const tsconfig = JSON.parse(readFileSync(resolve(join(__dirname, '../../tsconfig.json')), 'utf-8'));
    if (withReact) tsconfig.compilerOptions.lib.push('dom');
    writeFileSync(utils.path(name, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2), 'utf-8');
  }
  function save_tslint() {
    const tslint = JSON.parse(readFileSync(resolve(join(__dirname, '../../tslint.json')), 'utf-8'));
    writeFileSync(utils.path(name, 'tslint.json'),
      JSON.stringify(tslint, null, 2), 'utf-8');
  }
  function install_pkgs() {
    const argsDeps = [
    ];
    if (!/^@hoda5\/(hdev|h5global)$/g.test(name)) {
      argsDeps.push('@hoda5/h5global@latest');
    }
    const argsDevs = [
      'typescript@latest',
      'tslint@latest',
      'jest@latest',
      'ts-jest@latest',
      '@types/jest@latest',
    ];
    if (withReact) {
      argsDeps.push('react@latest');
      argsDevs.push('@types/react@latest');
    }
    if (argsDeps.length) {
      utils.exec('npm', ['install', '--save', ...argsDeps], { cwd: utils.path(name), title: '' });
    }
    if (argsDevs.length) {
      utils.exec('npm', ['install', '--save-dev', ...argsDevs], { cwd: utils.path(name), title: '' });
    }
  }
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
