import { utils } from "../utils"
import { createProgram } from "typescript"

export function buildTypeScript(name: string) {
    if (!utils.exists(name, 'tsconfig.json')) return;
    utils.forEachPackage((pkg, folder) => {
        createProgram([folder], {
            project: folder + '/tsconfig.json'
        });
    })
}