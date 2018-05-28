#!/usr/bin/env node
import * as prog from 'caporal';

import { cmd_init } from './cmd_init';
import { cmd_login } from './cmd_login';
import { cmd_status } from './cmd_status';
import { cmd_add } from './cmd_add';
import { cmd_rm } from './cmd_rm';
import { cmd_link } from './cmd_link';
import { cmd_build } from './cmd_build';
import { utils } from './utils';

let ok = false;

prog.version('1.0.0')

prog.command('status', 'Status dos repositorios')
    .argument('[name]', 'Nome do pacote')
    .action(cmd(cmd_status));
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
    .action(cmd(cmd_build));
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
if (!ok) prog.help('hdev');

function cmd(fn: ActionCallback, showrep = true) {
    return function (...args: any[]) {
        if (showrep)
            console.log('repositorio: ' + utils.root);
        fn.apply(null, args);
        ok = true;
    }
}

function todo() {
    console.log('TODO')
}
