#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander = require("commander");
var cmd_add_1 = require("./cmd_add");
var ok = false;
commander.version('1.0.0');
commander.command('add <name> <url>')
    .description('Adiciona um repositorio')
    .action(cmd(cmd_add_1.cmd_add));
commander.command('remove <name>')
    .description('Remove um repositorio')
    .action(todo);
commander.command('publish [name]')
    .description('incrementa versao e publica pacotes')
    .action(todo);
commander.command('pull [name]')
    .action(todo);
commander.command('push [name]')
    .action(todo);
commander.command('build [name]')
    .action(todo);
commander.command('watch [name]')
    .action(todo);
commander.command('upgrade')
    .action(todo);
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
    console.log('TODO: ');
    console.dir(arguments);
}
//# sourceMappingURL=multinpm.js.map