import { utils, WorkspaceFile, PackageJSON } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { watchTypeScript } from "./build/buildTypeScript"
import { refreshTerm } from "./term";

export async function cmd_start(args: any): Promise<boolean> {
    const name: string = args.name;
    let ok = false;
    if (name) {
        if (await watchTypeScript(name))
            ok = true;
    }
    else {
        await utils.forEachPackage(async (pkg) => {
            if (await watchTypeScript(pkg))
                ok = true;
        });
    }
    refreshTerm();
    return ok;
}