import { utils } from "./utils"
import { readFileSync } from "fs"

export function cmd_link(name: string, url: string) {
    const allpackages: string[] = [];
    utils.forEachPackage(enable_link);
    utils.forEachPackage(link_packages);

    function enable_link(packagName: string, folder: string) {
        allpackages.push(packagName);
        utils.shell(
            'git', [
                'link'
            ],
            {
                cwd: folder
            }
        );
    }

    function link_packages(packageName: string, folder: string) {
        const json = utils.getPackageJsonFor(packageName);
        [
            ...json.dependencies ? Object.keys(json.dependencies) : [],
            ...json.peerDependencies ? Object.keys(json.peerDependencies) : [],
            ...json.devDependencies ? Object.keys(json.devDependencies) : [],
        ].map((dep) => {
            if (allpackages.indexOf(dep) >= 0)
                utils.shell(
                    'git', [
                        'link',
                        dep
                    ],
                    {
                        cwd: folder
                    }
                );
        })
    }
}