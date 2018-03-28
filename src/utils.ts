import { readdirSync, readFileSync, existsSync } from "fs"
import { dirname, basename } from "path"
import { spawnSync } from "child_process"
import { settings } from "cluster";

const root = findRoot(process.cwd())
export type PackageJSON = {
    name: string;
    dependencies?: string[],
    devDependencies?: string[],
    peerDependencies?: string[],
}
export type WorkspaceFile = {
    "folders": { path: string }[],
    settings: Object
}

export const utils = {
    get root() {
        return root;
    },
    get workspaceFile() {
        return root + '/' + basename(root) + '.code-workspace';
    },
    adaptFolderName(packageName: string) {
        if (packageName.indexOf('-') != -1)
            utils.throw('Invalid package name ' + packageName)
        return packageName.replace('/', '-');
    },
    listPackages() {
        const dir = root + '/packages';
        if (!existsSync(dir)) return [];
        return readdirSync(dir);
    },
    forEachPackage(fn: (packagName: string, folder: string) => void) {
        utils.listPackages().forEach((p) => {
            fn(p.replace('-', '/'), [root, 'packages', p].join('/'));
        })
    },
    getPackageJsonFor(packagName: string) {
        const json: PackageJSON = JSON.parse(
            readFileSync(
                root + '/packages/' + utils.adaptFolderName(packagName) + '/package.json',
                { encoding: 'utf-8' }));
        if (json.name !== packagName)
            utils.throw(
                'Package name (' + packagName +
                ') é diferente do que está em name do package.json (' +
                json.name + ')');
        return json;
    },
    throw(msg: string) {
        console.log(msg)
        process.exit(1)
    },
    shell(cmd: string, args: string[], opts: { cwd: string }) {
        console.log([opts.cwd, '$ ', cmd, ' ', args.join(' ')].join(''))
        const r = spawnSync(
            cmd, args,
            {
                ...opts,
                stdio: ['inherit', 'inherit', 'inherit']
            }
        );
        if (r.status != 0)
            process.exit(1);
    }
}

function findRoot(folder: string) {
    while (folder && folder != '/') {
        const files = readdirSync(folder);
        const w = basename(folder) + '.code-workspace';
        if (files.some((f) => f == w)) {
            return folder;
        }
        folder = dirname(folder);
    }
    utils.throw('no code-workspace file found')
    return ''
}
