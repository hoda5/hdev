import { utils } from "./utils"

export function cmd_status(args: any) {
    const name: string = args.name;
    let ok = false;
    if (name) {
        utils.exec(
            'git', [
                'status'
            ],
            {
                cwd: utils.path(name),
            }
        );
        ok = true;
    }
    else
        utils.forEachPackage((pkg, folder) => {
            utils.exec(
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
