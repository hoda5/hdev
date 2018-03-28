#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander = require("commander");
var cmd_status_1 = require("./cmd_status");
var cmd_add_1 = require("./cmd_add");
var cmd_rm_1 = require("./cmd_rm");
var ok = false;
commander.version('1.0.0');
commander.option('-v, --verbose');
commander.command('status [name]')
    .description('Status dos repositorios')
    .action(cmd(cmd_status_1.cmd_status));
commander.command('add <name> <url>')
    .description('Adiciona um repositorio')
    .action(cmd(cmd_add_1.cmd_add));
commander.command('remove <name>')
    .description('Remove um repositorio')
    .action(cmd(cmd_rm_1.cmd_rm));
commander.command('publish [name]')
    .description('incrementa versao e publica pacotes')
    .action(cmd(todo));
commander.command('pull [name]')
    .action(cmd(todo));
commander.command('push [name]')
    .action(cmd(todo));
commander.command('build [name]')
    .action(cmd(todo));
commander.command('watch [name]')
    .action(cmd(todo));
commander.command('upgrade')
    .action(cmd(todo));
commander.command('link')
    .action(cmd(todo));
commander.command('login')
    .action(cmd(todo));
commander.parse(process.argv);
if (!ok)
    commander.help();
function cmd(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        fn.apply(null, args);
        ok = true;
    };
}
function todo() {
    console.log('TODO');
}
//# sourceMappingURL=multinpm.js.map