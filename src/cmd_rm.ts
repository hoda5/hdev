import { utils, WorkspaceFile } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"

export function cmd_rm(name: string) {
    const afn = utils.adaptFolderName(name);
    utils.exec(
        'git', [
            'rm',
            '-f',
            afn,
        ],
        {
            cwd: utils.root + '/packages'
        } 
    );
    const w = utils.workspaceFile;
    if (existsSync(w)) {
        const wf: WorkspaceFile = JSON.parse(readFileSync(w, 'utf-8'));
        const path = 'packages/' + afn;
        wf.folders = wf.folders.filter(f => f.path != path);
        writeFileSync(w, JSON.stringify(wf, null, 2), 'utf-8');
    }
}
