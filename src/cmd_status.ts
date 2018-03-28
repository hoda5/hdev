import { utils } from "./utils"

export function cmd_status(name: string) {
    let ok = false;
    utils.forEachPackage((pkg, folder) => {
        utils.shell(
            'git', [
                'status'
            ],
            {
                cwd: folder,
            }
        );
        ok = true;
    });
    if (!ok)
        utils.throw('repositório vazio');
}
