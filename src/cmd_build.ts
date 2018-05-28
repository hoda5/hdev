import { utils, WorkspaceFile, PackageJSON } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { buildTypeScript } from "./build/buildTypeScript"

export async function cmd_build(args: any): Promise<boolean> {
    const name: string = args.name;
    let ok = false;
    if (name) {
        await buildTypeScript(name);
        ok = true;
    }
    else {
        await utils.forEachPackage(async (pkg) => {
            await buildTypeScript(pkg);
            ok = true;
        });
    }
    return ok;
}