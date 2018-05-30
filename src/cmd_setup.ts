import { setupTypeScript } from "./build/buildTypeScript";
import { utils } from "./utils";

export async function cmd_setup(args: any): Promise<boolean> {
  const tipo: string = args.tipo;
  const name: string = args.name;
  utils.getPackageJsonFor(name);
  if (tipo) {
    setupTypeScript(name);
    return true;
  }
  return false;
}
