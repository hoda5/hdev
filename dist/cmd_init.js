"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_1 = require("fs");
function cmd_init() {
    var d = path_1.resolve(process.cwd());
    var w = d + '/' + path_1.basename(d) + '.code-workspace';
    if (!fs_1.existsSync(w)) {
        var empty = {
            "folders": [],
            "settings": {}
        };
        fs_1.writeFileSync(w, JSON.stringify(empty, null, 2), 'utf-8');
    }
    console.log('inicializado: ' + w);
    var p = d + '/packages';
    if (!fs_1.existsSync(p))
        fs_1.mkdirSync(p);
}
exports.cmd_init = cmd_init;
//# sourceMappingURL=cmd_init.js.map