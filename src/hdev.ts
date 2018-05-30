#!/usr/bin/node

import * as prog from 'caporal';

import { cmd_init } from './cmd_init';
import { cmd_login } from './cmd_login';
import { cmd_status } from './cmd_status';
import { cmd_clone } from './cmd_clone';
import { cmd_rm } from './cmd_rm';
import { cmd_link } from './cmd_link';
import { cmd_build } from './cmd_build';
import { cmd_start } from './cmd_start';
import { utils } from './utils';
import { wrap } from 'bash-color';
import { cmd_run } from './cmd_run';

prog.version('1.0.0')

prog.command('status', 'Status dos repositorios')
    .argument('[name]', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_status));

prog.command('clone', 'Adiciona um repositorio')
    .argument('<url>', 'repositório git')
    .argument('[name]', 'Nome do pacote')
    .action(cmd(cmd_clone));

prog.command('remove', 'Remove um repositorio')
    .argument('<name>', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_rm));

prog.command('build', 'build')
    .argument('[name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_build));

prog.command('start', 'inicia o servidor de desenvolvimento')
    .option('--verbose', 'Modo deputação')
    .option('--log-mode', 'log mode')
    .option('--no-service', 'não inicia como serviço')
    .option('--follow', 'acompanha o log do serviço iniciado')
    .action(cmd(cmd_start));

prog.command('stop', 'para o servidor de desenvolvimento')
    .action(cmd(async () => {
        utils.exit(0);
        return Promise.resolve(true);
    }, false));

prog.command('login', 'configura login do git/github')
    .argument('<name>', 'Nome de usuario no servidor')
    .argument('<email>', 'email')
    .action(cmd(cmd_login, false));

// prog.command('publish [name]')
//     .description('incrementa versao e publica pacotes')
//     .action(cmd(todo));
// prog.command('pull [name]')
//     .action(cmd(todo));
// prog.command('push [name]')
//     .action(cmd(todo));
// prog.command('watch [name]')
//     .action(cmd(todo));
// prog.command('upgrade')
//     .action(cmd(todo));
// prog.command('link')
//     .action(cmd(cmd_link));

prog.command('init', 'Inicializa na pasta atual como area de trabalho')
    .option('--subws', 'usado apenas para teste')
    .action(cmd(cmd_init, false, false));

prog.command('run', 'executa um comando na pasta do pacote')
    .argument('<name>', 'nome do pacote')
    .argument('<cmd...>', 'comando')
    .action(cmd_run);

prog.command('setupcompletation', 'Configura para completar com tab')
    //.argument('<shell>', 'bash/zsh/fish', ['bash', 'zsh', 'fish'])
    .action(cmd_setup_completation);

prog.parse(process.argv);

type ActionCallback = (args: any, options: any) => Promise<boolean>;
function cmd(fn: ActionCallback, showrep = true, validrep = true) {
    return function (args: any, options: any) {
        if (validrep && utils.root == '')
            utils.throw('no code-workspace file found!');
        const l: any = prog.logger();
        const ts = l && l.transports;
        const cap = ts && ts.caporal;
        const lv = cap && cap.level
        // console.dir({ l, ts, cap, lv })
        utils.verbose = lv === 'debug';
        if (showrep)
            console.log(
                wrap('repositorio: ', "GREEN", "background") +
                wrap(utils.root, "GREEN", "background")
            );
        fn(args, options).then((ok: boolean) => {
            if (!ok) prog.help('hdev');
        }, console.log);
    }
}

function todo() {
    console.log('TODO')
}

async function completeWithPackageName() {
    console.log('aksfhglaksfhglahflsk')
    return Promise.resolve(utils.listPackages());
}

function cmd_setup_completation(args: any) {
    const shell = 'bash'; // args.shell
    utils.exec(process.argv[0], [process.argv[1], 'completion', shell], {
        cwd: process.cwd(),
        title: '',
    });
}