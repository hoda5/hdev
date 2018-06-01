"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var fs_1 = require("fs");
function check_environment() {
    var npmOk = process.env.NPM_PACKAGES === process.env.HOME + '/.npm-packages';
    return npmOk;
}
exports.check_environment = check_environment;
function cmd_setup_environment() {
    var shell = 'bash'; // args.shell
    var BEGIN_HDEV_CONFIG = '### begin hdev config ###';
    var END_HDEV_CONFIG = '### end hdev config ###';
    var HOME = process.env.HOME;
    var bashcfg = [
        BEGIN_HDEV_CONFIG
    ].concat(env(), completion(), [
        END_HDEV_CONFIG,
    ]);
    save_bashrc();
    save_npmrc();
    // tslint:disable-next-line:no-console
    console.log('ambiente configurado. Reinicie o terminal');
    return true;
    function env() {
        return [
            'alias hdev="' + process.argv[1] + '"',
            'export NPM_PACKAGES="' + HOME + '/.npm-packages"',
            'export PATH="$NPM_PACKAGES/bin:$PATH"',
            'unset MANPATH',
            'export MANPATH="$NPM_PACKAGES/share/man:$(manpath)"',
        ];
    }
    function completion() {
        var lines = utils_1.utils.pipe(process.argv[0], [process.argv[1], 'completion', shell], {
            cwd: process.cwd(),
            title: '',
        }).out.replace(/hdev\.js/g, 'hdev').split('\n');
        return lines.filter(function (l) { return l && !/###/g.test(l); });
    }
    function save_bashrc() {
        var lines = fs_1.readFileSync(HOME + '/.bashrc', 'utf-8').split('\n');
        var ignore = false;
        lines = lines.filter(function (line) {
            var isBegin = line === BEGIN_HDEV_CONFIG;
            var isEnd = line === END_HDEV_CONFIG;
            if (isBegin)
                ignore = true;
            var r = !ignore;
            if (isEnd)
                ignore = false;
            return r;
        });
        while (lines.length && (!lines[lines.length - 1].trim()))
            lines.pop();
        lines.push.apply(lines, [''].concat(bashcfg));
        fs_1.writeFileSync(HOME + '/.bashrc', lines.join('\n'), 'utf-8');
    }
    function save_npmrc() {
        var lines = [
            'prefix=' + HOME + '/.npm-packages',
        ];
        fs_1.writeFileSync(HOME + '/.npmrc', lines.join('\n'), 'utf-8');
    }
}
exports.cmd_setup_environment = cmd_setup_environment;
//# sourceMappingURL=cmd_setup_environment.js.map