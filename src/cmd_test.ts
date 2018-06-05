import { utils } from './utils';
import { projectUsesTypeScript } from './build/ts/setup';
import { testTypeScript } from './build/ts/test';

export async function cmd_test(args: any): Promise<boolean> {
  const name: string = args.packageName;
  const failOnWarning: boolean = args.failOnWarning;
  let ok = false;
  let code = 0;
  if (name) {
    if (projectUsesTypeScript(name)) {
      code += await testTypeScript(name, failOnWarning);
      ok = true;
    }
  } else {
    await utils.forEachPackage(async (pkg) => {
      code += await testTypeScript(pkg, failOnWarning);
      ok = true;
    });
  }
  if (code) process.exit(code);
  return ok;
}
