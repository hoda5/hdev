import { utils, WorkspaceFile, PackageJSON } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { watchTypeScript } from "./build/buildTypeScript"
import { initUi } from "./term";
import { start } from "pm2";

export async function cmd_start(args: any, opts: any): Promise<boolean> {
    let ok = false;
    if (opts.noService) {
        await utils.forEachPackage(async (pkg) => {
            if (await watchTypeScript(pkg))
                ok = true;
        });
        initUi(opts.logMode);
    } else {
        start({
            name: 'hdev',
            script: process.argv[0],
            args: ['start', '--no-service', '--log-mode'],
            watch: true
        }, () => { });
        setTimeout(() => process.exit(0), 2000);
    }
    return ok;
}