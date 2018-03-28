#!/usr/bin/env node
import * as commander from 'commander';

import { cmd_status } from './cmd_status';
import { cmd_add } from './cmd_add';
import { cmd_rm } from './cmd_rm';
import { cmd_link } from './cmd_link';

let ok = false;

commander.version('1.0.0')

commander.option('-v, --verbose')

commander.command('status [name]')
    .description('Status dos repositorios')
    .action(cmd(cmd_status));
commander.command('add <name> <url>')
    .description('Adiciona um repositorio')
    .action(cmd(cmd_add));
commander.command('remove <name>')
    .description('Remove um repositorio')
    .action(cmd(cmd_rm));
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
if (!ok) commander.help();

function cmd(fn: Function) {
    return function (...args: any[]) {
        fn.apply(null, args);
        ok = true;
    }
}

function todo() {
    console.log('TODO')
}
