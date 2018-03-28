import { config } from "./config"


export function cmd_rm(name: string) {
    config.shell(
        'git', [
            'submodule',
            'rm',
            config.adaptFolderName(name),
        ],
        {
            cwd: config.root() + '/packages'
        }
    );
}
