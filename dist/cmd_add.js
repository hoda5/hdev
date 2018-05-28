"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var fs_1 = require("fs");
function cmd_add(url, name) {
    if (!/^(http?|git).*\/.*\.git$/g.test(url))
        utils_1.utils.throw('invalid url');
    if (!name) {
        var m = /([^/]*)\/([^/]*)\.git$/g.exec(url);
        if (m) {
            if (m[1] === 'hoda5')
                name = '@hoda5/' + m[2];
            else
                name = m[1];
        }
        else
            utils_1.utils.throw('invalid name');
    }
    var afn = utils_1.utils.adaptFolderName(name);
    utils_1.utils.exec('git', [
        'submodule',
        'add',
        '--force',
        url,
        afn,
    ], {
        cwd: utils_1.utils.root + '/packages',
    });
    utils_1.utils.getPackageJsonFor(name);
    var w = utils_1.utils.workspaceFile;
    var wf = fs_1.existsSync(w) ? JSON.parse(fs_1.readFileSync(w, 'utf-8')) : {
        "folders": [],
        "settings": {}
    };
    wf.folders.push({ path: 'packages/' + afn });
    fs_1.writeFileSync(w, JSON.stringify(wf, null, 2), 'utf-8');
    utils_1.utils.exec('npm', [
        'install',
    ], {
        cwd: utils_1.utils.root + '/packages/' + afn,
    });
}
exports.cmd_add = cmd_add;
//# sourceMappingURL=cmd_add.js.map