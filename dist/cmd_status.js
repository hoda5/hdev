"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function cmd_status(args) {
    var name = args.name;
    var ok = false;
    if (name) {
        utils_1.utils.exec('git', [
            'status'
        ], {
            cwd: utils_1.utils.path(name),
        });
        ok = true;
    }
    else
        utils_1.utils.forEachPackage(function (pkg, folder) {
            utils_1.utils.exec('git', [
                'status'
            ], {
                cwd: folder,
            });
            ok = true;
        });
    if (!ok)
        utils_1.utils.throw('repositório vazio');
}
exports.cmd_status = cmd_status;
//# sourceMappingURL=cmd_status.js.map