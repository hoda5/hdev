#!/usr/bin/node

import * as prog from 'caporal';

import { wrap } from 'bash-color';
import { cmd_build } from './cmd_build';
import { cmd_clone } from './cmd_clone';
import { cmd_init } from './cmd_init';
import { cmd_login } from './cmd_login';
import { cmd_rm } from './cmd_rm';
import { cmd_run } from './cmd_run';
import { cmd_setup } from './cmd_setup';
import { cmd_start } from './cmd_start';
import { cmd_status } from './cmd_status';
import { cmd_setup_environment, check_environment } from './cmd_setup_environment';
import { utils } from './utils';
import { cmd_select } from './cmd_select';
import { cmd_test } from './cmd_test';

prog.version('1.0.0');

prog.command('select', 'seleciona uma área de trabalho')
    .action(cmd(cmd_select));

prog.command('status', 'Status dos repositorios')
    .argument('[package name]', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_status));

prog.command('clone', 'Adiciona um repositorio')
    .argument('<url>', 'repositório git')
    .argument('[package name]', 'Nome do pacote')
    .action(cmd(cmd_clone));

prog.command('remove', 'Remove um repositorio')
    .argument('[package name]', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_rm));

prog.command('build', 'build')
    .argument('[package name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_build));

prog.command('test', 'test')
    .argument('[package name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_test));

prog.command('setup', 'setup')
    .argument('<tipo>', 'tipo', ['typescript', 'react'])
    .argument('[package name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_setup));

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
    .argument('[package name]', 'Nome de usuario no servidor')
    .argument('<email>', 'email')
    .action(cmd(cmd_login, false));

// prog.command('publish [package name]')
//     .description('incrementa versao e publica pacotes')
//     .action(cmd(todo));
// prog.command('pull [package name]')
//     .action(cmd(todo));
// prog.command('push [package name]')
//     .action(cmd(todo));
// prog.command('watch [package name]')
//     .action(cmd(todo));
// prog.command('upgrade')
//     .action(cmd(todo));
// prog.command('link')
//     .action(cmd(cmd_link));

prog.command('init', 'Inicializa na pasta atual como area de trabalho')
    .option('--subws', 'usado apenas para teste')
    .action(cmd(cmd_init, false, false));

prog.command('run', 'executa um comando na pasta do pacote')
    .argument('[package name]', 'nome do pacote')
    .argument('<cmd...>', 'comando')
    .action(cmd_run);

prog.command('setup-environment', 'Configura o hdev no computador')
    .action(cmd_setup_environment);

prog.parse(process.argv);

type ActionCallback = (args: any, options: any) => Promise<boolean>;
function cmd(fn: ActionCallback, showrep = true, validrep = true) {
    return (args: any, options: any) => {

        if (!check_environment()) {
            // tslint:disable-next-line:no-console
            utils.throw(
                'O ambiente não está configurado.\n' +
                '  1) execute ' + wrap('hdev setup_environment', 'BLUE', 'hi_bold') + '\n' +
                '  2) reinicie o terminal',
            );
        }
        if (validrep && utils.root === '') {
            utils.throw('no code-workspace file found!');
        }

        const l: any = prog.logger();
        const ts = l && l.transports;
        const cap = ts && ts.caporal;
        const lv = cap && cap.level;
        // console.dir({ l, ts, cap, lv })
        utils.verbose = lv === 'debug';
        if (showrep) {
            // tslint:disable-next-line
            console.log(
                wrap('repositorio: ', 'GREEN', 'background') +
                wrap(utils.root, 'GREEN', 'background'),
            );
        }
        args.packageName = completPackageName(args.packageName);
        fn(args, options).then((ok: boolean) => {
            if (!ok) prog.help('hdev');
        }, console.log);
    };
}

async function completeWithPackageName() {
    // tslint:disable-next-line
    // console.log("completeWithPackageName");
    return Promise.resolve(utils.listPackages());
}

function completPackageName(s: string) {
    if (!s) {
        s = process.cwd().substr((utils.root + '/packages/').length);
    }
    if (utils.listPackages().indexOf(s) > -1) return s;
    if (utils.listPackages().indexOf('@hoda5/' + s) > -1) return '@hoda5/' + s;
    utils.throw('invalid packageName: ' + s);
}
