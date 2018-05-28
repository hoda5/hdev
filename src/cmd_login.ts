import { utils, WorkspaceFile } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"



export function cmd_login(name: string, email: string) {

    utils.exec(
        'git', [
            'config',
            '--global',
            'user.name',
            name
        ],
        {
            cwd: utils.root,
        }
    );
    utils.exec(
        'git', [
            'config',
            '--global',
            'user.email',
            email
        ],
        {
            cwd: utils.root,
        }
    );
    utils.exec(
        'git', [
            'credential-cache',
            'exit'
        ],
        {
            cwd: utils.root,
        }
    );
    utils.exec(
        'git', [
            "config",
            "credential.helper",
            "'cache --timeout=300'"
        ],
        {
            cwd: utils.root,
        }
    );
    utils.exec(
        'git', [
            'credential',
            'fill'
        ],
        {
            cwd: utils.root,
        }
    );
}
 