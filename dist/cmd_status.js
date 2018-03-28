"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function cmd_status(name) {
    var ok = false;
    utils_1.config.forEachPackage(function (pkg, folder) {
        utils_1.config.shell('git', [
            'status'
        ], {
            cwd: folder,
        });
        ok = true;
    });
    if (!ok)
        utils_1.config.throw('repositório vazio');
}
exports.cmd_status = cmd_status;
//# sourceMappingURL=cmd_status.js.map