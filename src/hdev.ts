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

prog.version('1.0.0')
prog.option('-v, --verbose', 'Modo deputação')

prog.command('status', 'Status dos repositorios')
    .argument('[name]', 'Nome do pacote')
    .complete(completeWithPackageName)
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
    .complete(completeWithPackageName)
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

type ActionCallback = (args: { [k: string]: any },
    options: { [k: string]: any },
    logger: Logger) => Promise<boolean>;
function cmd(fn: ActionCallback, showrep = true) {
    return function (args: any, options: any) {
        utils.verbose = options.verbose;
        if (showrep)
            console.log('repositorio: ' + utils.root);
        fn.apply(null, args).then((ok: boolean) => {
            if (!ok) prog.help('hdev');
        }, console.log);
    }
}

function todo() {
    console.log('TODO')
}

async function completeWithPackageName() {
    return Promise.resolve(utils.listPackages());
}