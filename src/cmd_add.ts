import { spawnSync } from "child_process"
import { config } from "./config"


export function cmd_add(name: string, url: string) {
    console.log(config.root() + '/packages')
    const r = spawnSync(
        'git', [
            'submodule',
            'add',
            url,
            name,
        ],
        {
            cwd: config.root() + '/packages',
            stdio: ['inherit', 'inherit', 'inherit']
        }
    );
}
