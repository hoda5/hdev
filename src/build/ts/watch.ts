import { SpawnedProcess, utils } from '../../utils';
import { addWatcher, SrcMessage, Watcher, WatcherEvents } from '../../watchers';

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
    const pt = await utils.spawn('npm', ['test'], {
      name: procName + 'test',
      cwd: utils.path(packageName),
    });
    let last: {
      parsing?: string;
      msg: string;
      expected: string[];
      received: string[];
      stack: string[];
      file: string;
      row: number;
      col: number;
    } | undefined;
    pt.on('line', (s) => {
      s = s.replace(/#\s+/g, '').trim();
      const mTestName = /not ok \d+\s*(.*)/g.exec(s);
      if (mTestName) {
        flushTest();
        last = {
          msg: mTestName[1].replace('●', '').trim(),
          expected: [], received: [], stack: [], file: '', row: 0, col: 0, parsing: '',
        };
      } else if (last) {
        if (last.parsing === '') {
          if (/Expected:$/.test(s)) {
            last.parsing = 'expected';
            // } else {
            //   if (s) last.msg = last.msg + s;
          }
        } else if (last.parsing === 'expected') {
          if (/Received:$/.test(s)) {
            last.parsing = 'received';
          } else {
            last.expected.push(s);
          }
        } else if (last.parsing === 'received') {
          if (/Stack:$/.test(s)) {
            last.parsing = 'stack';
          } else {
            last.received.push(s);
          }
        } else if (last.parsing === 'stack') {
          const ms = /at\s+(.*)$/.exec(s);
          if (ms) {
            const sp = ms[1];
            last.stack.push(sp);
            if (!last.file) {
              const mf = sp.split(':');
              last.file = mf[0];
              last.row = parseInt(mf[1]);
              last.col = parseInt(mf[2]);
            }
          }
        }
      }
      // console.log(s)
    });
    pt.on('exit', () => {
      flushTest();
      const summary = utils.readCoverageSummary(packageName);
      testing = false;
      if (summary) {
        coverage = Math.round((summary.lines.pct + summary.statements.pct +
          summary.functions.pct + summary.branches.pct) / 4);
        if (coverage < 10) {
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
    function flushTest() {
      if (utils.verbose) utils.debug('flushTest', last);
      if (last) {
        delete last.parsing;
        if (/\.tsx?$/g.test(last.file)) {
          errors.push(last);
        }
      }
      last = undefined;
    }
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