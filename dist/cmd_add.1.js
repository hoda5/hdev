"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
function cmd_add(name, url) {
    config_1.config.shell('git', [
        'submodule',
        'add',
        url,
        config_1.config.adaptFolderName(name),
    ], {
        cwd: config_1.config.root() + '/packages',
    });
    config_1.config.getPackageJsonFor(name);
}
exports.cmd_add = cmd_add;
//# sourceMappingURL=cmd_add.1.js.map