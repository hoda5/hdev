import { utils } from "./utils"

export function cmd_add(name: string, url: string) {
    utils.shell(
        'git', [
            'submodule',
            'add',
            url,
            utils.adaptFolderName(name),
        ],
        {
            cwd: utils.root() + '/packages',
        }
    );
    utils.getPackageJsonFor(name);
}
