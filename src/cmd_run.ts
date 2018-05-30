import { utils, WorkspaceFile } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"

export async function cmd_run(args: any): Promise<boolean> {
    console.dir(args)
    const packageName: string = args.name;
    const cmd: string[] = args.cmd;
    const dir = utils.path(packageName);
    if (cmd[0] == '--') cmd.splice(0, 1);

    utils.exec(
        cmd[0], cmd.slice(1),
        {
            cwd: dir,
            title: ''
        }
    );
    const w = utils.workspaceFile;
    if (existsSync(w)) {
        const wf: WorkspaceFile = JSON.parse(readFileSync(w, 'utf-8'));
        const path = 'packages/' + packageName;
        wf.folders = wf.folders.filter(f => f.path != path);
        writeFileSync(w, JSON.stringify(wf, null, 2), 'utf-8');
    }
    return true;
}
