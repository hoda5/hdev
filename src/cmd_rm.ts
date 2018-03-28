import { utils } from "./utils"


export function cmd_rm(name: string) {
    utils.shell(
        'git', [
            'submodule',
            'rm',
            utils.adaptFolderName(name),
        ],
        {
            cwd: utils.root() + '/packages'
        }
    );
}
