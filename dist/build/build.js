"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var typescript_1 = require("typescript");
function build_package(name) {
    var afn = utils_1.utils.adaptFolderName(name);
    var pkg = utils_1.utils.getPackageJsonFor(name);
    doTypeScript(name, pkg);
    utils_1.utils.exec('npm', [
        'install',
    ], {
        cwd: utils_1.utils.root + '/packages/' + afn,
    });
}
exports.build_package = build_package;
function doTypeScript(name, pkg) {
    if (!utils_1.utils.exists(name, 'tsconfig.json'))
        return;
    utils_1.utils.forEachPackage(function (pkg, folder) {
        typescript_1.createProgram([folder], {
            project: folder + '/tsconfig.json'
        });
    });
}
//# sourceMappingURL=build.js.map