"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
function cmd_rm(name) {
    config_1.config.shell('git', [
        'submodule',
        'rm',
        config_1.config.adaptFolderName(name),
    ], {
        cwd: config_1.config.root() + '/packages'
    });
}
exports.cmd_rm = cmd_rm;
//# sourceMappingURL=cmd_rm.js.map