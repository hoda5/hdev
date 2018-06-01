import { utils } from '../../utils';
import * as Mocha from 'mocha';

export async function testTypeScript(packageName: string) {
  const dir = utils.path(packageName);
  const mochaOpts = {
    ui: 'tdd',
    reporter: 'json',
    // grep?: RegExp;
    // reporter?: string | ReporterConstructor;
    timeout: 3000,
    // require: ['source-map-support/register']
    // reporterOptions?: any;
    // slow?: number;
    // bail?: boolean;
  };
  const mocha = new Mocha(mochaOpts);
  mocha.addFile('dist/h5global.test.js');
  mocha.addFile('dist/tracker.test.js');
  mocha.run((failures) => {
    console.log('failures: '+ failures);
  })
}
