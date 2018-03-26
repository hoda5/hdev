"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var root = findRoot(process.cwd());
console.log('xx');
exports.config = __assign({}, loadConfig(), { root: function () {
        return root;
    } });
function findRoot(folder) {
    while (folder && folder != '/') {
        if (fs_1.existsSync(folder + '/multinpm.json'))
            return folder;
        folder = path_1.dirname(folder);
    }
    console.log('no multinpm.json configuration found');
    process.exit(1);
}
function loadConfig() {
    return JSON.parse(fs_1.readFileSync(root + '/multinpm.json', { encoding: 'utf-8' }));
}
//# sourceMappingURL=config.js.map