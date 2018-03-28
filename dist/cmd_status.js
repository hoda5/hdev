"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
function cmd_status(name) {
    var ok = false;
    config_1.config.forEachPackage(function (pkg, folder) {
        config_1.config.shell('git', [
            'status'
        ], {
            cwd: folder,
        });
        ok = true;
    });
    if (!ok)
        config_1.config.throw('repositório vazio');
}
exports.cmd_status = cmd_status;
//# sourceMappingURL=cmd_status.js.map