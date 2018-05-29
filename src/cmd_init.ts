import { dirname, resolve, basename } from "path"
import { existsSync, writeFileSync, mkdirSync, readdirSync } from "fs"
import { utils, WorkspaceFile } from "./utils"

export async function cmd_init(): Promise<boolean> {
    const d = resolve(process.cwd());
    if (readdirSync(d).length)
        utils.throw("diretório não está vazio: "+d);
    const w = d + '/' + basename(d) + '.code-workspace';
    if (!existsSync(w)) {
        const empty: WorkspaceFile = {
            "folders": [],
            "settings": {}
        }
        writeFileSync(w, JSON.stringify(
            empty, null, 2), 'utf-8');
    }
    console.log('inicializado: ' + w);
    const p = d + '/packages';
    if (!existsSync(p))
        mkdirSync(p);
    utils.exec('git', ['init'], { cwd: process.cwd(), title: '' })
    return true;
}
