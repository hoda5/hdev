"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var blessed = require("blessed");
var express = require("express");
var http = require("http");
var path_1 = require("path");
var socketIO = require("socket.io");
var utils_1 = require("./utils");
var watchers_1 = require("./watchers");
function initUi(logMode) {
    var screen;
    var box;
    var web = initWEB();
    if (!logMode) {
        initBox();
    }
    var refresh = utils_1.utils.limiteSync({ ms: 200, fn: no_limited_refresh });
    watchers_1.listenWatchEvent('building', refresh);
    watchers_1.listenWatchEvent('testing', refresh);
    watchers_1.listenWatchEvent('finished', refresh);
    watchers_1.listenWatchEvent('reload', reload);
    function no_limited_refresh() {
        var building = [];
        var testing = [];
        var warnings = [];
        var errors = [];
        watchers_1.watchers.forEach(function (w) {
            if (w.building) {
                building.push(w.packageName);
            }
            if (w.testing)
                testing.push(w.packageName);
            else if (w.errors.length)
                errors.push(w);
            else if (w.warnings.length)
                warnings.push(w);
        });
        var contentScreen = [];
        var contentWEB = {
            root: utils_1.utils.root,
        };
        if (building.length) {
            contentScreen.push('Building: ' + building.join());
            contentWEB.building = building;
        }
        if (testing.length) {
            contentScreen.push('Testing: ' + testing.join());
            contentWEB.testing = testing;
        }
        if (errors.length) {
            contentWEB.errors = errors;
            contentScreen.push('Error(s): ');
            errors.forEach(function (w) {
                w.errors.forEach(function (m) {
                    var loc = utils_1.utils.loc(m);
                    contentScreen.push([
                        (loc ?
                            loc.file +
                                '(' +
                                loc.row +
                                ',' +
                                loc.col +
                                ') '
                            : ''),
                        w.packageName,
                        '\n  ',
                        m.msg,
                    ].join(''));
                });
            });
        }
        if (warnings.length) {
            contentWEB.warnings = warnings;
            contentScreen.push('Warning(s):');
            if (errors.length === 0) {
                warnings.forEach(function (w) {
                    w.warnings.forEach(function (m) {
                        var loc = utils_1.utils.loc(m);
                        contentScreen.push([
                            loc ? (loc.file +
                                '(' +
                                loc.row +
                                ',' +
                                loc.col +
                                ') ') : '',
                            w.packageName,
                            '\n  ',
                            m.msg,
                        ].join(''));
                    });
                });
            }
        }
        web.refresh(contentWEB);
        if (contentScreen.length === 0) {
            contentScreen.push('watching');
        }
        if (logMode) {
            // tslint:disable-next-line
            console.log(contentScreen.join("\n"));
        }
        else {
            box.content = ['hdev on port ' + web.port, ''].concat(contentScreen).join('\n');
            box.focus();
            screen.render();
        }
    }
    function reload() {
        web.reload();
    }
    function initBox() {
        screen = blessed.screen({
            smartCSR: true,
        });
        screen.title = 'hdev';
        screen.key(['escape', 'q', 'C-c'], function () {
            return utils_1.utils.exit(0);
        });
        box = blessed.textbox({
            top: 'center',
            left: 'center',
            width: '100%',
            height: '100%',
            content: 'HDEV',
            tags: true,
            border: {
                type: 'line',
            },
            keys: true,
            vi: true,
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: '#f0f0f0',
                },
            },
        });
        screen.append(box);
    }
    function initWEB() {
        var port = process.env.PORT ? parseInt(process.env.PORT) : 7777;
        var app = express();
        var httpServer = new http.Server(app);
        var assetsDir = path_1.resolve(__dirname, '../hdev-assets');
        var sio = socketIO(httpServer);
        httpServer.on('error', function (err) {
            utils_1.utils.exec('/bin/ss', ['-lptn', 'sport = :7777'], { cwd: process.cwd(), title: '' });
            utils_1.utils.throw(err.message);
        });
        httpServer.listen(port, function () {
            // tslint:disable-next-line
            console.log("Listening on *:" + port);
        });
        app.use(express.static(assetsDir));
        // app.use(function (req, res, next) {
        //     console.dir({ dn: __dirname, dir: assets_dir, url: req.url });
        //     next();
        // });
        sio.on('connection', function (socket) {
            socket.join('hdev-v1');
            refresh();
        });
        return {
            port: port,
            reload: function () {
                send('hdev-reload');
            },
            refresh: function (content) {
                send('hdev-refresh', content);
            },
        };
        function send(event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            (_a = sio.to('hdev-v1')).emit.apply(_a, [event].concat(args));
            var _a;
        }
    }
}
exports.initUi = initUi;
//# sourceMappingURL=ui.js.map