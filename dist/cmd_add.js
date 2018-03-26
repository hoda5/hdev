"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var config_1 = require("./config");
function cmd_add(name, url) {
    console.log(config_1.config.root() + '/packages');
    var r = child_process_1.spawnSync('git', [
        'submodule',
        'add',
        url,
        name,
    ], {
        cwd: config_1.config.root() + '/packages',
        stdio: ['inherit', 'inherit', 'inherit']
    });
}
exports.cmd_add = cmd_add;
//# sourceMappingURL=cmd_add.js.map