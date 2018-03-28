"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function cmd_rm(name) {
    utils_1.config.shell('git', [
        'submodule',
        'rm',
        utils_1.config.adaptFolderName(name),
    ], {
        cwd: utils_1.config.root() + '/packages'
    });
}
exports.cmd_rm = cmd_rm;
//# sourceMappingURL=cmd_rm.js.map