
import { buildTypeScript } from './build/buildTypeScript';
import { utils } from './utils';

export async function cmd_build(args: any): Promise<boolean> {
  const name: string = args.name;
  let ok = false;
  if (name) {
    await buildTypeScript(name);
    ok = true;
  } else {
    await utils.forEachPackage(async (pkg) => {
      await buildTypeScript(pkg);
      ok = true;
    });
  }
  return ok;
}
