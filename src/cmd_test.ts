import { utils } from './utils';
import { projectUsesTypeScript } from './build/ts/setup';
import { testTypeScript } from './build/ts/test';

export async function cmd_test(args: any): Promise<boolean> {
  const name: string = args.packageName;
  let ok = false;
  if (name) {
    if (projectUsesTypeScript(name)) {
      await testTypeScript(name);
      ok = true;
    }
  } else {
    await utils.forEachPackage(async (pkg) => {
      await testTypeScript(pkg);
      ok = true;
    });
  }
  return ok;
}
