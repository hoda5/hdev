import { SpawnedProcess, utils, SrcMessage } from '../../utils';
import { addWatcher, Watcher, WatcherEvents } from '../../watchers';


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
          stack: [{
            file: m[1],
            row: parseInt(m[2]),
            col: parseInt(m[3]),
          }],
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
      errors = [{msg: 'stopped' }];
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
      await utils.pipe('npm', ['test'], {
        title: procName + '_tst',
        cwd: utils.path(packageName),
        verbose: false,
        throwErrors: true,
      });

      await processTestResult();
      await processCoverageResult();
    } catch (e) {
      errors.push(
        { msg: e.message }
      );
    } finally {
      testing = false;
      if (events) { events.onFinished(watcher); }
      console.log('finished')
    }
  }
  async function abortTesting() {
    const old = procTest;
    procTest = undefined;
    testing = false;
    if (old) return old.stop();
  }
  async function processTestResult() {
    const summary = utils.readTestResult(packageName);
    if (summary) {
      errors.push(...summary.errors);
      warnings.push(...summary.warnings);
    } else {
      coverage = undefined;
      errors.push({
        msg: 'Teste não gerou relatório',
      });
    }
  }
  async function processCoverageResult() {
    const summary = utils.readCoverageSummary(packageName);
    if (summary) {
      coverage = Math.round((summary.lines.pct + summary.statements.pct +
        summary.functions.pct + summary.branches.pct) / 4);
      if (coverage < 10) {
        errors.push({
          msg: ['Cobertura do código por testes está abaixo de ', coverage, '%'].join(''),
        });
      }
    } else {
      coverage = undefined;
      errors.push({
        msg: 'Teste não gerou relatório de cobertura de código',
      });
    }
  }
}
