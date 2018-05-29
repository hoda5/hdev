import { listenWatchEvent, watchers, Watcher } from "./watchers";
import * as blessed from "blessed";
import { utils } from "./utils";
import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import { resolve } from "path";

let ui: {
    refresh(): void
};


export function initUi(logMode: boolean) {

    let screen: blessed.Widgets.Screen;
    let box: blessed.Widgets.TextboxElement;
    let web = initWEB();

    if (!logMode) initBox();

    const building: string[] = [];
    const refresh = utils.limiter(200, no_limited_refresh);

    listenWatchEvent('building', refresh);
    listenWatchEvent('testing', refresh);
    listenWatchEvent('finished', refresh);
    listenWatchEvent('reload', reload);

    ui = { refresh };
    web.reload();
    ui.refresh();

    function no_limited_refresh() {
        const building: string[] = [];
        const testing: string[] = [];
        const warnings: Watcher[] = [];
        const errors: Watcher[] = [];
        watchers.forEach((w) => {
            if (w.building) building.push(w.packageName);
            if (w.testing) testing.push(w.packageName);
            else if (w.errors.length) errors.push(w);
            else if (w.warnings.length) warnings.push(w);
        });
        const content: string[] = [];
        if (building.length) content.push('Building: ' + building.join());
        if (testing.length) content.push('Testing: ' + testing.join());
        if (errors.length) {
            content.push('Error(s): ');
            errors.forEach((w) => {
                w.errors.forEach((m) => {
                    content.push([
                        m.file, ' ', w.packageName,
                        '(',
                        m.row,
                        ',',
                        m.col,
                        '): ',
                        '\n  ',
                        m.msg
                    ].join(''));
                })
            })
        }
        if (warnings.length) {
            content.push('Warning(s):');
            if (errors.length == 0)
                warnings.forEach((w) => {
                    w.warnings.forEach((m) => {
                        content.push([
                            m.file, ' ', w.packageName,
                            '(',
                            m.row,
                            ',',
                            m.col,
                            ') ',
                            '\n  ',
                            m.msg
                        ].join(''));
                    })
                })
        }
        if (content.length == 0) content.push('watching');
        web.refresh(content);
        if (logMode)
            console.log(content.join('\n'))
        else {
            box.content = ['hdev on port ' + web.port, '', ...content].join('\n');
            box.focus();
            screen.render();
        }
    }
    function reload() {
        web.reload();
    }
    function initBox() {
        screen = blessed.screen({
            smartCSR: true
        });

        screen.title = 'hdev';

        screen.key(['escape', 'q', 'C-c'], function (ch, key) {
            return utils.exit(0);
        });

        box = blessed.textbox({
            top: 'center',
            left: 'center',
            width: '100%',
            height: '100%',
            content: 'HDEV',
            tags: true,
            border: {
                type: 'line'
            },
            keys: true,
            vi: true,
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: '#f0f0f0'
                },
                // hover: {
                //     bg: 'green'
                // }
            }
        });

        screen.append(box);
    }
    function initWEB() {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 7777;

        var app = express();
        const httpServer = new http.Server(app);
        const assets_dir = resolve(__dirname, '../hdev-assets');

        const sio = socketIO(httpServer);

        httpServer.listen(port, function () {
            console.log('Listening on *:' + port);
        });

        app.use(express.static(assets_dir));

        // app.use(function (req, res, next) {
        //     console.dir({ dn: __dirname, dir: assets_dir, url: req.url });
        //     next();
        // });

        sio.on('connection', function (socket) {
            socket.join('hdev-v1');
            refresh();
        });

        return {
            port,
            reload() {
                send('hdev-reload')
            },
            refresh(content: string[]) {
                send('hdev-refresh', content);
            }
        }
        function send(event: string, ...args: any[]) {
            sio.to('hdev-v1').emit(event, ...args);
        }
    }
}