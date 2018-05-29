import { utils, WorkspaceFile } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"

export async function cmd_rm(args: any): Promise<boolean> {
    const name: string = args.name;
    const afn = utils.adaptFolderName(name);
    utils.exec(
        'git', [
            'rm',
            '-f',
            afn,
        ],
        {
            cwd: utils.root + '/packages',
            title: ''
        }
    );
    const w = utils.workspaceFile;
    if (existsSync(w)) {
        const wf: WorkspaceFile = JSON.parse(readFileSync(w, 'utf-8'));
        const path = 'packages/' + afn;
        wf.folders = wf.folders.filter(f => f.path != path);
        writeFileSync(w, JSON.stringify(wf, null, 2), 'utf-8');
    }
    return true;
}
