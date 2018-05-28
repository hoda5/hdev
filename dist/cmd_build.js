"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var buildTypeScript_1 = require("./build/buildTypeScript");
function cmd_build(name) {
    var afn = utils_1.utils.adaptFolderName(name);
    if (name)
        buildTypeScript_1.buildTypeScript(name);
    else
        utils_1.utils.forEachPackage(buildTypeScript_1.buildTypeScript);
}
exports.cmd_build = cmd_build;
//# sourceMappingURL=cmd_build.js.map