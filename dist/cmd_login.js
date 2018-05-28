"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function cmd_login(name, email) {
    utils_1.utils.exec('git', [
        'config',
        '--global',
        'user.name',
        name
    ], {
        cwd: utils_1.utils.root,
    });
    utils_1.utils.exec('git', [
        'config',
        '--global',
        'user.email',
        email
    ], {
        cwd: utils_1.utils.root,
    });
    utils_1.utils.exec('git', [
        'credential-cache',
        'exit'
    ], {
        cwd: utils_1.utils.root,
    });
    utils_1.utils.exec('git', [
        "config",
        "credential.helper",
        "'cache --timeout=300'"
    ], {
        cwd: utils_1.utils.root,
    });
    utils_1.utils.exec('git', [
        'credential',
        'fill'
    ], {
        cwd: utils_1.utils.root,
    });
}
exports.cmd_login = cmd_login;
//# sourceMappingURL=cmd_login.js.map