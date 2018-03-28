"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function cmd_add(name, url) {
    utils_1.config.shell('git', [
        'submodule',
        'add',
        url,
        utils_1.config.adaptFolderName(name),
    ], {
        cwd: utils_1.config.root() + '/packages',
    });
    utils_1.config.getPackageJsonFor(name);
}
exports.cmd_add = cmd_add;
//# sourceMappingURL=cmd_add.js.map