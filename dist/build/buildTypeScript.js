"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var typescript_1 = require("typescript");
function buildTypeScript(name) {
    if (!utils_1.utils.exists(name, 'tsconfig.json'))
        return;
    utils_1.utils.forEachPackage(function (pkg, folder) {
        typescript_1.createProgram([folder], {
            project: folder + '/tsconfig.json'
        });
    });
}
exports.buildTypeScript = buildTypeScript;
//# sourceMappingURL=buildTypeScript.js.map