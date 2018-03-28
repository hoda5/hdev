"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
function cmd_link(name, url) {
    var allpackages = [];
    config_1.config.forEachPackage(enable_link);
    config_1.config.forEachPackage(link_packages);
    function enable_link(packagName, folder) {
        allpackages.push(packagName);
        config_1.config.shell('git', [
            'link'
        ], {
            cwd: folder
        });
    }
    function link_packages(packageName, folder) {
        var json = config_1.config.getPackageJsonFor(packageName);
        (json.dependencies ? Object.keys(json.dependencies) : []).concat(json.peerDependencies ? Object.keys(json.peerDependencies) : [], json.devDependencies ? Object.keys(json.devDependencies) : []).map(function (dep) {
            if (allpackages.indexOf(dep) >= 0)
                config_1.config.shell('git', [
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