// import * as NYC from 'nyc';
// import * as Mocha from 'mocha';
import { utils, SrcMessage, TestResults } from '../../utils';
import { writeFile } from 'fs';
import { ErrorFailure, getSourceMapConsumer } from '../sourcemap';
import * as ErrorStackParser from 'error-stack-parser';
import { BasicSourceMapConsumer } from 'source-map/source-map';

export async function testTypeScript(packageName: string, failOnWarnings: boolean): Promise<number> {
  const pkgPath = utils.path(packageName);
  const mocha = await utils.pipe('node',
    [
      pkgPath + '/node_modules/@hoda5/hdev/node_modules/nyc/bin/nyc.js',
      '--reporter=html', '--reporter=json-summary',
      pkgPath + '/node_modules/@hoda5/hdev/node_modules/mocha/bin/mocha',
      // s + '/mocha/bin/mocha',
      '--reporter=json',
      '--timeout=5000',
      pkgPath + '/dist/**/*.test.js',
    ],
    {
      cwd: utils.path(packageName),
      title: '',
    },
  );
  let mapCache: { [name: string]: BasicSourceMapConsumer } = {};
  const warnings: SrcMessage[] = [];
  const errors: SrcMessage[] = [];
  await parseTestResult(mocha.out);

  const result: TestResults = {
    packageName,
    warnings,
    errors,
  };

  await utils.nodify(
    writeFile,
    pkgPath + '/coverage/h5-test-report.json',
    JSON.stringify(result), {
      encoding: 'utf8',
    });

  if (errors.length) {
    utils.debug(packageName,
      errors.map((err) => {
        const loc = utils.loc(err);
        return (loc ? loc.file + '(' + loc.row + ',' + loc.col + '): ' : '') +
          err.msg;
      })
    );
    return 1;
  }
  if (failOnWarnings && warnings.length) return 2;
  return 0;

  async function parseTestResult(testOut: string) {
    const i = testOut.substr(0, 2) == '{\n' ? 0 : testOut.indexOf('\n{\n') + 1;
    const j = testOut.length;// indexOf('@@testEnd@@');    
    if (i === -1) {
      errors.push({
        msg: 'npm test deve gerar relatório mocha json',
      });
    } else {
      const s = testOut.substr(0, j).substr(i);
      try {
        const json = JSON.parse(s) as {
          failures?: ErrorFailure[],
        };
        await Promise.all((json.failures || []).map(async (f) => {
          const err = await mapFailure(packageName, f);
          // console.dir(err);
          errors.push(err);
        }));
      } catch (e) {
        errors.push({
          msg: 'npm test gerou um relatório mocha json inválido: ' +
            '\n' + (e.stack ? e.stack.toString() : e.message)
            + '\n',
        });
      }
    }
  }

  async function mapFailure(packageName: string, f: ErrorFailure): Promise<SrcMessage> {
    const err = f.err;
    const stack = ErrorStackParser.parse(err as any);
    const mstack = await Promise.all(stack.map(tryGetMappedPosition));
    return {
      msg: err.message,
      stack: mstack,
    }

    async function tryGetMappedPosition(s: ErrorStackParser.StackFrame) {
      const fileName = s.getFileName().replace(pkgPath + '/', '');
      const row = s.getLineNumber();
      const col = s.getColumnNumber();

      if (fileName.indexOf('node_modules') === -1) {
        // console.dir({ src: { fileName, row, col } })
        const sourceMap = await getCachedSourceMapConsumer(fileName);
        const org = sourceMap.originalPositionFor({ line: row, column: col });
        // console.dir({ src: { fileName, row, col }, org })
        if (org && org.source && org.line) {
          return {
            file: org.source,
            row: org.line,
            col: org.column || 0,
          };
        }
      }
      // sourceMap.eachMapping((m) => {
      //   console.dir(m);
      // })
      return {
        file: fileName,
        row,
        col,
      };
    }

    async function getCachedSourceMapConsumer(fileName: string) {
      // console.dir({ getCachedSourceMapConsumer: fileName })
      let r = mapCache[fileName];
      if (!r) {
        r = mapCache[fileName] =
          await getSourceMapConsumer(utils.path(packageName, fileName));
      }
      return r;
    }
  }
}