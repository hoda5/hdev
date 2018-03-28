import { config } from "./config"
import { readFileSync } from "fs"

export function cmd_link(name: string, url: string) {
    const allpackages: string[] = [];
    config.forEachPackage(enable_link);
    config.forEachPackage(link_packages);

    function enable_link(packagName: string, folder: string) {
        allpackages.push(packagName);
        config.shell(
            'git', [
                'link'
            ],
            {
                cwd: folder
            }
        );
    }

    function link_packages(packageName: string, folder: string) {
        const json = config.getPackageJsonFor(packageName);
        [
            ...json.dependencies ? Object.keys(json.dependencies) : [],
            ...json.peerDependencies ? Object.keys(json.peerDependencies) : [],
            ...json.devDependencies ? Object.keys(json.devDependencies) : [],
        ].map((dep) => {
            if (allpackages.indexOf(dep) >= 0)
                config.shell(
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