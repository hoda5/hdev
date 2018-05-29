import { utils, WorkspaceFile } from "./utils"
import { existsSync, readFileSync, writeFileSync } from "fs"

export async function cmd_clone(args: any): Promise<boolean> {
    let url: string = args.url;
    let packageName: string = args.name;
    if (url[0] == '@') url = 'https://github.com/' + url.substr(1) + '.git';
    if (!/^(http?|git).*\/.*\.git$/g.test(url))
        utils.throw('invalid url');
    if (!packageName) {
        const m = /([^/]*)\/([^/]*)\.git$/g.exec(url);
        if (m) {
            if (m[1] === 'hoda5')
                packageName = '@hoda5/' + m[2];
            else
                packageName = m[2];
        }
        else
            utils.throw('invalid name');
    }
    utils.exec(
        'git', [
            'submodule',
            'add',
            '--force',
            url,
            packageName,
        ],
        {
            cwd: utils.root + '/packages',
            title: ''
        }
    );
    utils.getPackageJsonFor(packageName);

    const w = utils.workspaceFile;
    const wf: WorkspaceFile = existsSync(w) ? JSON.parse(readFileSync(w, 'utf-8')) : {
        "folders": [],
        "settings": {}
    };
    wf.folders.push({ path: 'packages/' + packageName })
    writeFileSync(w, JSON.stringify(wf, null, 2), 'utf-8');
    utils.exec(
        'npm', [
            'install',
        ],
        {
            cwd: utils.root + '/packages/' + packageName,
            title: ''
        }
    );
    return true;
}
