import { utils, WorkspaceFile, PackageJSON } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { buildTypeScript } from "./build/buildTypeScript"

export function cmd_build(name: string) {
    const afn = utils.adaptFolderName(name);

    if (name)
        buildTypeScript(name);
    else
        utils.forEachPackage(buildTypeScript);
}