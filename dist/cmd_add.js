"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var fs_1 = require("fs");
function cmd_add(name, url) {
    var afn = utils_1.utils.adaptFolderName(name);
    utils_1.utils.shell('git', [
        'submodule',
        'add',
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
}
exports.cmd_add = cmd_add;
//# sourceMappingURL=cmd_add.js.map