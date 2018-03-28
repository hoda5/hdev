import { utils, WorkspaceFile } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"

export function cmd_add(name: string, url: string) {
    const afn = utils.adaptFolderName(name);
    utils.shell(
        'git', [
            'submodule',
            'add',
            url,
            afn,
        ],
        {
            cwd: utils.root + '/packages',
        }
    );
    utils.getPackageJsonFor(name);

    const w = utils.workspaceFile;
    const wf: WorkspaceFile = existsSync(w) ? JSON.parse(readFileSync(w, 'utf-8')) : {
        "folders": [],
        "settings": {}
    };
    wf.folders.push({ path: 'packages/' + afn })
    writeFileSync(w, JSON.stringify(wf, null, 2), 'utf-8');
}
