import { existsSync, readFileSync } from "fs"
import { dirname } from "path"

const root = findRoot(process.cwd())
console.log('xx')

export const config = {
    ...loadConfig(),
    root() {
        return root;
    },
    forEachPackage( fn: (packagName: string, folder: string) => void) {
        throw new Error('TODO')
    } 
}

function findRoot(folder: string) {
    while (folder && folder != '/') {
        if (existsSync(folder + '/multinpm.json')) return folder
        folder = dirname(folder);
    }
    console.log('no multinpm.json configuration found')
    process.exit(1)
}

function loadConfig() {
    return JSON.parse(
        readFileSync(root + '/multinpm.json', { encoding: 'utf-8' })
    );
}