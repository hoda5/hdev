#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prog = require("caporal");
var cmd_status_1 = require("./cmd_status");
var cmd_build_1 = require("./cmd_build");
var utils_1 = require("./utils");
var ok = false;
prog.version('1.0.0');
prog.command('status', 'Status dos repositorios')
    .argument('[name]', 'Nome do pacote')
    .action(cmd(cmd_status_1.cmd_status));
// prog.command('add <url> [name]')
//     .description('Adiciona um repositorio')
//     .action(cmd(cmd_add));
// prog.command('remove <name>')
//     .description('Remove um repositorio')
//     .action(cmd(cmd_rm));
// prog.command('publish [name]')
//     .description('incrementa versao e publica pacotes')
//     .action(cmd(todo));
// prog.command('pull [name]')
//     .action(cmd(todo));
// prog.command('push [name]')
//     .action(cmd(todo));
prog.command('build', 'build do pacote')
    .argument('[name]', 'Nome do pacote')
    .action(cmd(cmd_build_1.cmd_build));
// prog.command('watch [name]')
//     .action(cmd(todo));
// prog.command('upgrade')
//     .action(cmd(todo));
// prog.command('link')
//     .action(cmd(cmd_link));
// prog.command('init')
//     .description('Inicializa na pasta atual')
//     .action(cmd(cmd_init, false));
// prog.command('login <name> <email>')
//     .description('autenticações')
//     .action(cmd(cmd_login, false));
prog.parse(process.argv);
if (!ok)
    prog.help('hdev');
function cmd(fn, showrep) {
    if (showrep === void 0) { showrep = true; }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (showrep)
            console.log('repositorio: ' + utils_1.utils.root);
        fn.apply(null, args);
        ok = true;
    };
}
function todo() {
    console.log('TODO');
}
//# sourceMappingURL=hdev.js.map