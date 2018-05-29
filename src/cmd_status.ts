import { utils } from "./utils"

export async function cmd_status(args: any): Promise<boolean> {
    const name: string = args.name;
    let ok = false;
    if (name) {
        utils.exec(
            'git', [
                'status'
            ],
            {
                cwd: utils.path(name),
                title: name
            }
        );
        ok = true;
    }
    else
        await utils.forEachPackage(async (pkg, folder) => {
            utils.exec(
                'git', [
                    'status',
                    '-b',
                    '--porcelain'
                ],
                {
                    cwd: folder,
                    title: pkg
                }
            );
            ok = true;
        });
    if (!ok)
        utils.throw('repositório vazio');
    return ok;
}
