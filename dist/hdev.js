#!/usr/bin/node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var prog = require("caporal");
var bash_color_1 = require("bash-color");
var cmd_build_1 = require("./cmd_build");
var cmd_clone_1 = require("./cmd_clone");
var cmd_init_1 = require("./cmd_init");
var cmd_login_1 = require("./cmd_login");
var cmd_rm_1 = require("./cmd_rm");
var cmd_run_1 = require("./cmd_run");
var cmd_setup_1 = require("./cmd_setup");
var cmd_start_1 = require("./cmd_start");
var cmd_status_1 = require("./cmd_status");
var cmd_setup_environment_1 = require("./cmd_setup_environment");
var utils_1 = require("./utils");
var cmd_select_1 = require("./cmd_select");
var cmd_test_1 = require("./cmd_test");
prog.version('1.0.0');
prog.command('select', 'seleciona uma área de trabalho')
    .action(cmd(cmd_select_1.cmd_select));
prog.command('status', 'Status dos repositorios')
    .argument('[package name]', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_status_1.cmd_status));
prog.command('clone', 'Adiciona um repositorio')
    .argument('<url>', 'repositório git')
    .argument('[package name]', 'Nome do pacote')
    .action(cmd(cmd_clone_1.cmd_clone));
prog.command('remove', 'Remove um repositorio')
    .argument('[package name]', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_rm_1.cmd_rm));
prog.command('build', 'build')
    .argument('[package name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_build_1.cmd_build));
prog.command('test', 'test')
    .argument('[package name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .option('-w, --fail-on-warnings', 'O teste falha se for retornado algum alerta')
    .complete(completeWithPackageName)
    .action(cmd(cmd_test_1.cmd_test, false, false));
prog.command('setup', 'setup')
    .argument('<tipo>', 'tipo', ['typescript', 'react'])
    .argument('[package name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_setup_1.cmd_setup));
prog.command('start', 'inicia o servidor de desenvolvimento')
    .option('--verbose', 'Modo deputação')
    .option('--log-mode', 'log mode')
    .option('--no-service', 'não inicia como serviço')
    .option('--follow', 'acompanha o log do serviço iniciado')
    .action(cmd(cmd_start_1.cmd_start));
prog.command('stop', 'para o servidor de desenvolvimento')
    .action(cmd(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        utils_1.utils.exit(0);
        return [2 /*return*/, Promise.resolve(true)];
    });
}); }, false));
prog.command('login', 'configura login do git/github')
    .argument('[package name]', 'Nome de usuario no servidor')
    .argument('<email>', 'email')
    .action(cmd(cmd_login_1.cmd_login, false));
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
    .action(cmd(cmd_init_1.cmd_init, false, false));
prog.command('run', 'executa um comando na pasta do pacote')
    .argument('[package name]', 'nome do pacote')
    .argument('<cmd...>', 'comando')
    .action(cmd_run_1.cmd_run);
prog.command('setup-environment', 'Configura o hdev no computador')
    .action(cmd_setup_environment_1.cmd_setup_environment);
prog.parse(process.argv);
function cmd(fn, showrep, validrep) {
    if (showrep === void 0) { showrep = true; }
    if (validrep === void 0) { validrep = true; }
    return function (args, options) {
        if (!cmd_setup_environment_1.check_environment()) {
            // tslint:disable-next-line:no-console
            utils_1.utils.throw('O ambiente não está configurado.\n' +
                '  1) execute ' + bash_color_1.wrap('hdev setup_environment', 'BLUE', 'hi_bold') + '\n' +
                '  2) reinicie o terminal');
        }
        if (validrep && utils_1.utils.root === '') {
            utils_1.utils.throw('no code-workspace file found!');
        }
        var l = prog.logger();
        var ts = l && l.transports;
        var cap = ts && ts.caporal;
        var lv = cap && cap.level;
        // console.dir({ l, ts, cap, lv })
        utils_1.utils.verbose = lv === 'debug';
        if (showrep) {
            // tslint:disable-next-line
            console.log(bash_color_1.wrap('repositorio: ', 'GREEN', 'background') +
                bash_color_1.wrap(utils_1.utils.root, 'GREEN', 'background'));
        }
        args.packageName = completPackageName(args.packageName);
        fn(args, options).then(function (ok) {
            if (!ok)
                prog.help('hdev');
        }, console.log);
    };
}
function completeWithPackageName() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // tslint:disable-next-line
            // console.log("completeWithPackageName");
            return [2 /*return*/, Promise.resolve(utils_1.utils.listPackages())];
        });
    });
}
function completPackageName(s) {
    if (!s) {
        s = process.cwd().substr((utils_1.utils.root + '/packages/').length);
    }
    if (utils_1.utils.listPackages().indexOf(s) > -1)
        return s;
    if (utils_1.utils.listPackages().indexOf('@hoda5/' + s) > -1)
        return '@hoda5/' + s;
    utils_1.utils.throw('invalid packageName: ' + s);
}
//# sourceMappingURL=hdev.js.map