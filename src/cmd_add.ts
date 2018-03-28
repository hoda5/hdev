import { config } from "./utils"

export function cmd_add(name: string, url: string) {
    config.shell(
        'git', [
            'submodule',
            'add',
            url,
            config.adaptFolderName(name),
        ],
        {
            cwd: config.root() + '/packages',
        }
    );
    config.getPackageJsonFor(name);
}
