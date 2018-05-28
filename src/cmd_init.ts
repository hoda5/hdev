import { dirname, resolve, basename } from "path"
import { existsSync, writeFileSync, mkdirSync } from "fs"
import { utils, WorkspaceFile } from "./utils"

export function cmd_init() { 
    const d = resolve(process.cwd());
    const w = d + '/' + basename(d) + '.code-workspace';
    if (!existsSync(w)) {
        const empty: WorkspaceFile = {
            "folders": [],
            "settings": {}
        }
        writeFileSync(w, JSON.stringify(
            empty, null, 2), 'utf-8');
    }
    console.log('inicializado: '+w);
    const p = d + '/packages';
    if (!existsSync(p))
        mkdirSync(p);
}
