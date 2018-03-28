"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function cmd_link(name, url) {
    var allpackages = [];
    utils_1.utils.forEachPackage(enable_link);
    utils_1.utils.forEachPackage(link_packages);
    function enable_link(packagName, folder) {
        allpackages.push(packagName);
        utils_1.utils.shell('git', [
            'link'
        ], {
            cwd: folder
        });
    }
    function link_packages(packageName, folder) {
        var json = utils_1.utils.getPackageJsonFor(packageName);
        (json.dependencies ? Object.keys(json.dependencies) : []).concat(json.peerDependencies ? Object.keys(json.peerDependencies) : [], json.devDependencies ? Object.keys(json.devDependencies) : []).map(function (dep) {
            if (allpackages.indexOf(dep) >= 0)
                utils_1.utils.shell('git', [
                    'link',
                    dep
                ], {
                    cwd: folder
                });
        });
    }
}
exports.cmd_link = cmd_link;
//# sourceMappingURL=cmd_link.js.map