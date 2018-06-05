import { SpawnedProcess, utils } from '../../utils';
import { addWatcher, SrcMessage, Watcher, WatcherEvents } from '../../watchers';
import * as ErrorStackParser from 'error-stack-parser';
import { getSourceMapConsumer } from '../sourcemap';

interface ErrorFailure {
  title: string;
  fullTitle: string;
  duration: number;
  currentRetry: number;
  err: {
    stack: string,
    message: string,
  };
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
        if (/(TS6192|TS6133)/.test(m[5])) {
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
    try {
      const npmTest = await utils.pipe('npm', ['test'], {
        title: procName + '_tst',
        cwd: utils.path(packageName),
        verbose: false,
      });
      await parseTestResult(npmTest.out + npmTest.err);
      // await parseCoverageResult();
    } finally {
      testing = false;
      if (events) { events.onFinished(watcher); }
      console.log('finished')
    }

    async function parseTestResult(testOut: string) {
      const i = testOut.indexOf('\n{\n');
      const j = testOut.indexOf('@@testEnd@@');
      if (i === -1) {
        errors.push({
          file: '?',
          row: 0, col: 0,
          msg: 'npm test deve gerar relatório mocha json',
        });
      } else {
        const s = testOut.substr(0, j).substr(i + 1);
        try {
          const json = JSON.parse(s) as {
            failures?: ErrorFailure[],
          };
          await Promise.all((json.failures || []).map(async (f) => {
            const err = await mapFailure(packageName, f);
            errors.push(err);
          }));
        } catch (e) {
          errors.push({
            file: '?',
            row: 0, col: 0,
            msg: 'npm test gerou um relatório mocha json inválido: ' +
              s + '\n' + (e.stack ? e.stack.toString() : e.message),
          });
        }
      }
    }
    // async function parseCoverageResult() {
    //   const summary = utils.readCoverageSummary(packageName);
    //   if (summary) {
    //     coverage = Math.round((summary.lines.pct + summary.statements.pct +
    //       summary.functions.pct + summary.branches.pct) / 4);
    //     if (coverage < 10) {
    //       errors.push({
    //         file: '?',
    //         row: 0, col: 0,
    //         msg: ['Cobertura do código por testes está abaixo de ', coverage, '%'].join(''),
    //       });
    //     }
    //   } else {
    //     coverage = undefined;
    //     errors.push({
    //       file: '?',
    //       row: 0, col: 0,
    //       msg: 'Teste não gerou relatório de cobertura de código',
    //     });
    //   }
    // }
  }
  async function abortTesting() {
    const old = procTest;
    procTest = undefined;
    testing = false;
    if (old) return old.stop();
  }
}

async function mapFailure(packageName: string, f: ErrorFailure) {
  return new Promise<SrcMessage>(async (pmResolve, pmReject) => {
    try {
      const err = f.err;
      const stack = ErrorStackParser.parse(err as any);
      const stackWithoutNodeModules = stack.filter((st) =>
        st.getFileName() && st.getFileName().indexOf('node_modules') === -1);
      const s = stackWithoutNodeModules.length ? stackWithoutNodeModules[0] : stack[0];

      const fileName = s.getFileName();
      const row = s.getLineNumber();
      const col = s.getColumnNumber();

      const sourceMap = await getSourceMapConsumer(utils.path(packageName, fileName));
      const org = sourceMap.originalPositionFor({ line: row, column: col });
      console.dir({
        src: { line: row, column: col },
        org})
      if (org && org.source && org.line) {
        pmResolve({
          msg: err.message,
          file: org.source,
          row: org.line,
          col: org.column || 0,
        });
      } else {
        pmResolve({
          msg: err.message,
          file: fileName,
          row,
          col,
        });
      }
    } catch (e) {
      pmReject(e);
    }
  });
}
