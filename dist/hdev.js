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
var cmd_init_1 = require("./cmd_init");
var cmd_login_1 = require("./cmd_login");
var cmd_status_1 = require("./cmd_status");
var cmd_clone_1 = require("./cmd_clone");
var cmd_rm_1 = require("./cmd_rm");
var cmd_build_1 = require("./cmd_build");
var cmd_start_1 = require("./cmd_start");
var utils_1 = require("./utils");
var bash_color_1 = require("bash-color");
prog.version('1.0.0');
prog.option('-v, --verbose', 'Modo deputação');
prog.command('status', 'Status dos repositorios')
    .argument('[name]', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_status_1.cmd_status));
prog.command('clone', 'Adiciona um repositorio')
    .argument('<url>', 'repositório git')
    .argument('[name]', 'Nome do pacote')
    .action(cmd(cmd_clone_1.cmd_clone));
prog.command('remove', 'Remove um repositorio')
    .argument('<name>', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_rm_1.cmd_rm));
prog.command('build', 'build')
    .argument('[name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_build_1.cmd_build));
prog.command('start', 'inicia o servidor de desenvolvimento')
    .option('--log-mode', 'log mode')
    .option('--no-service', 'não inicia como serviço')
    .option('--follow', 'acompanha o log do serviço iniciado')
    .action(cmd(cmd_start_1.cmd_start, false));
prog.command('stop', 'para o servidor de desenvolvimento')
    .action(cmd(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        utils_1.utils.exit(0);
        return [2 /*return*/, Promise.resolve(true)];
    });
}); }, false));
prog.command('login', 'configura login do git/github')
    .argument('<name>', 'Nome de usuario no servidor')
    .argument('<email>', 'email')
    .action(cmd(cmd_login_1.cmd_login, false));
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
    .action(cmd(cmd_init_1.cmd_init));
prog.command('setup-completation', 'Configura para completar com tab')
    //.argument('<shell>', 'bash/zsh/fish', ['bash', 'zsh', 'fish'])
    .action(cmd_setup_completation);
prog.parse(process.argv);
function cmd(fn, showrep) {
    if (showrep === void 0) { showrep = true; }
    return function (args, options) {
        utils_1.utils.verbose = options.verbose;
        if (showrep)
            console.log(bash_color_1.wrap('repositorio: ', "GREEN", "background") +
                bash_color_1.wrap(utils_1.utils.root, "GREEN", "background"));
        fn(args, options).then(function (ok) {
            if (!ok)
                prog.help('hdev');
        }, console.log);
    };
}
function todo() {
    console.log('TODO');
}
function completeWithPackageName() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('aksfhglaksfhglahflsk');
            return [2 /*return*/, Promise.resolve(utils_1.utils.listPackages())];
        });
    });
}
function cmd_setup_completation(args) {
    var shell = 'bash'; // args.shell
    utils_1.utils.exec(process.argv[0], [process.argv[1], 'completion', shell], {
        cwd: process.cwd(),
        title: '',
    });
}
//# sourceMappingURL=hdev.js.map