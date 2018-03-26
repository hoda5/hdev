#!/usr/bin/env node
import * as commander from 'commander';
import { cmd_add } from './cmd_add';
import { debug } from 'util';

let ok = false;

commander.version('1.0.0')

commander.command('add <name> <url>')
    .description('Adiciona um repositorio')
    .action(cmd(cmd_add));
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
if (!ok) commander.help();

function cmd(fn: Function) {
    return function (...args: any[]) {
        fn.apply(null, args);
        ok = true;
    }
}

function todo() {
    console.log('TODO: ')
    console.dir(arguments)
}
