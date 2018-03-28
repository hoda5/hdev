import { readdirSync, readFileSync, existsSync } from "fs"
import { dirname } from "path"
import { spawnSync } from "child_process"

const root = findRoot(process.cwd())
export type PackageJSON = {
    name: string;
    dependencies?: string[],
    devDependencies?: string[],
    peerDependencies?: string[],
}

export const config = {
    root() {
        return root;
    },
    adaptFolderName(packageName: string) {
        if (packageName.indexOf(' ') != -1)
            config.throw('Invalid package name ' + packageName)
        return packageName.replace('/', ' ');
    },
    listPackages() {
        const dir = root + '/packages';
        if (!existsSync(dir)) return [];
        return readdirSync(dir);
    },
    forEachPackage(fn: (packagName: string, folder: string) => void) {
        config.listPackages().forEach((p) => {
            fn(p, [root, 'packages', p].join('/'));
        })
    },
    getPackageJsonFor(packagName: string) {
        const json: PackageJSON = JSON.parse(
            readFileSync(
                root + '/' + config.adaptFolderName(packagName) + '/package.json',
                { encoding: 'utf-8' }));
        if (json.name !== packagName)
            config.throw(
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
        if (files.some((f) => /\.code-workspace$/g.test(f)))
            return folder;
        folder = dirname(folder);
    }
    config.throw('no *.code-workspace file found')
}
