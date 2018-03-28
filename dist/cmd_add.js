"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function cmd_add(name, url) {
    utils_1.utils.shell('git', [
        'submodule',
        'add',
        url,
        utils_1.utils.adaptFolderName(name),
    ], {
        cwd: utils_1.utils.root() + '/packages',
    });
    utils_1.utils.getPackageJsonFor(name);
}
exports.cmd_add = cmd_add;
//# sourceMappingURL=cmd_add.js.map