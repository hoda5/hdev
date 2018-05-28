"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var fs_1 = require("fs");
function cmd_rm(name) {
    var afn = utils_1.utils.adaptFolderName(name);
    utils_1.utils.exec('git', [
        'rm',
        '-f',
        afn,
    ], {
        cwd: utils_1.utils.root + '/packages'
    });
    var w = utils_1.utils.workspaceFile;
    if (fs_1.existsSync(w)) {
        var wf = JSON.parse(fs_1.readFileSync(w, 'utf-8'));
        var path_1 = 'packages/' + afn;
        wf.folders = wf.folders.filter(function (f) { return f.path != path_1; });
        fs_1.writeFileSync(w, JSON.stringify(wf, null, 2), 'utf-8');
    }
}
exports.cmd_rm = cmd_rm;
//# sourceMappingURL=cmd_rm.js.map