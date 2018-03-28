import { config } from "./config"

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
