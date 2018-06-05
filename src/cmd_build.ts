
import { projectUsesTypeScript } from './build/ts/setup';
import { buildTypeScript } from './build/ts/build';
import { utils } from './utils';

export async function cmd_build(args: any): Promise<boolean> {
  const name: string = args.packageName;
  let ok = false;
  if (name) {
    if (projectUsesTypeScript(name)) {
      await buildTypeScript(name);
      ok = true;
    }
  } else {
    await utils.forEachPackage(async (pkg) => {
      await buildTypeScript(pkg);
      ok = true;
    });
  }
  return ok;
}
