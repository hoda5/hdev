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
var child_process_1 = require("child_process");
var pm2 = require("pm2");
var bash_color_1 = require("bash-color");
pm2.connect(function (err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }
});
exports.utils = {
    get root() {
        return root;
    },
    get workspaceFile() {
        return path_1.join(root, +path_1.basename(root) + '.code-workspace');
    },
    adaptFolderName: function (packageName) {
        if (packageName.indexOf('-') != -1)
            exports.utils.throw('Invalid package name ' + packageName);
        return packageName.replace('/', '-');
    },
    listPackages: function () {
        var dir = root + '/packages';
        if (!fs_1.existsSync(dir))
            return [];
        return fs_1.readdirSync(dir);
    },
    forEachPackage: function (fn) {
        exports.utils.listPackages().forEach(function (p) {
            fn(p.replace('-', '/'), [root, 'packages', p].join('/'));
        });
    },
    getPackageJsonFor: function (packagName) {
        var json = exports.utils.readJSON(packagName, 'package.json');
        if (json.name !== packagName)
            exports.utils.throw('Package name (' + packagName +
                ') é diferente do que está em name do package.json (' +
                json.name + ')');
        return json;
    },
    path: function (packageName, filename) {
        if (filename === void 0) { filename = ''; }
        return path_1.join(root, 'packages', exports.utils.adaptFolderName(packageName), filename);
    },
    exists: function (packageName, filename) {
        return fs_1.existsSync(exports.utils.path(packageName, filename));
    },
    readText: function (packageName, filename) {
        return fs_1.readFileSync(exports.utils.path(packageName, filename), { encoding: 'utf-8' });
    },
    readJSON: function (packageName, filename) {
        return JSON.parse(exports.utils.readText(packageName, filename));
    },
    throw: function (msg) {
        console.log(msg);
        process.exit(1);
    },
    exec: function (cmd, args, opts) {
        console.log(bash_color_1.red(opts.cwd + '$ ') +
            bash_color_1.blue(cmd + ' ' + args.join(' '), true));
        var r = child_process_1.spawnSync(cmd, args, __assign({}, opts, { stdio: ['inherit', 'inherit', 'inherit'] }));
        if (r.status != 0)
            process.exit(1);
    }
};
var root = findRoot(process.cwd());
function findRoot(folder) {
    var _loop_1 = function () {
        var files = fs_1.readdirSync(folder);
        var w = path_1.basename(folder) + '.code-workspace';
        if (files.some(function (f) { return f == w; })) {
            return { value: folder };
        }
        folder = path_1.dirname(folder);
    };
    while (folder && folder != '/') {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
    }
    exports.utils.throw('no code-workspace file found');
    return '';
}
//# sourceMappingURL=utils.js.map