import * as blessed from 'blessed';
import * as express from 'express';
import * as http from 'http';
import { resolve } from 'path';
import * as socketIO from 'socket.io';
import { utils } from './utils';
import { listenWatchEvent, Watcher, watchers } from './watchers';

export function initUi(logMode: boolean) {
  interface ContentWeb {
    building?: string[];
    testing?: string[];
    errors?: Watcher[];
    warnings?: Watcher[];
  }
  let screen: blessed.Widgets.Screen;
  let box: blessed.Widgets.TextboxElement;
  const web = initWEB();

  if (!logMode) { initBox(); }

  const refresh = utils.limiteSync({ ms: 200, fn: no_limited_refresh });

  listenWatchEvent('building', refresh);
  listenWatchEvent('testing', refresh);
  listenWatchEvent('finished', refresh);
  listenWatchEvent('reload', reload);

  function no_limited_refresh() {
    const building: string[] = [];
    const testing: string[] = [];
    const warnings: Watcher[] = [];
    const errors: Watcher[] = [];
    watchers.forEach((w) => {
      if (w.building) { building.push(w.packageName); }
      if (w.testing) testing.push(w.packageName);
      else if (w.errors.length) errors.push(w);
      else if (w.warnings.length) warnings.push(w);
    });
    const content_screen: string[] = [];
    const content_web: ContentWeb = {};
    if (building.length) {
      content_screen.push('Building: ' + building.join());
      content_web.building = building;
    }
    if (testing.length) {
      content_screen.push('Testing: ' + testing.join());
      content_web.testing = testing;
    }
    if (errors.length) {
      content_web.errors = errors;
      content_screen.push('Error(s): ');
      errors.forEach((w) => {
        w.errors.forEach((m) => {
          content_screen.push([
            m.file,
            '(',
            m.row,
            ',',
            m.col,
            ') ',
            w.packageName,
            '\n  ',
            m.msg,
          ].join(''));
        });
      });
    }
    if (warnings.length) {
      content_web.warnings = warnings;
      content_screen.push('Warning(s):');
      if (errors.length === 0) {
        warnings.forEach((w) => {
          w.warnings.forEach((m) => {
            content_screen.push([
              m.file,
              '(',
              m.row,
              ',',
              m.col,
              ') ',
              w.packageName,
              '\n  ',
              m.msg,
            ].join(''));
          });
        });
      }
    }
    web.refresh(content_web);
    if (content_screen.length === 0) { content_screen.push('watching'); }
    if (logMode) {
      // tslint:disable-next-line
      console.log(content_screen.join("\n"));
    } else {
      box.content = ['hdev on port ' + web.port, '', ...content_screen].join('\n');
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

    screen.key(['escape', 'q', 'C-c'], () => {
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
        // hover: {
        //     bg: 'green'
        // }
      },
    });

    screen.append(box);
  }
  function initWEB() {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 7777;

    const app = express();
    const httpServer = new http.Server(app);
    const assetsDir = resolve(__dirname, '../hdev-assets');

    const sio = socketIO(httpServer);

    httpServer.listen(port, () => {
      // tslint:disable-next-line
      console.log("Listening on *:" + port);
    });

    app.use(express.static(assetsDir));

    // app.use(function (req, res, next) {
    //     console.dir({ dn: __dirname, dir: assets_dir, url: req.url });
    //     next();
    // });

    sio.on('connection', (socket) => {
      socket.join('hdev-v1');
      refresh();
    });

    return {
      port,
      reload() {
        send('hdev-reload');
      },
      refresh(content: ContentWeb) {
        send('hdev-refresh', content);
      },
    };
    function send(event: string, ...args: any[]) {
      sio.to('hdev-v1').emit(event, ...args);
    }
  }
}
