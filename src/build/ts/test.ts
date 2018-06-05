import * as Mocha from 'mocha';
import { utils } from '../../utils';

export async function testTypeScript(packageName: string) {
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
  mocha.addFile(utils.path(packageName) + '/dist/h5global.test.js');
  mocha.addFile(utils.path(packageName) + '/dist/tracker.test.js');
  mocha.run((failures) => {
    
    console.log('\n@@testEnd@@\n');
    process.exit(failures > 0 ? 1 : 0);
  });
}
