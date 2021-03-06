import * as blessed from 'blessed';
import * as express from 'express';
import * as http from 'http';
import { resolve } from 'path';
import * as socketIO from 'socket.io';
import { utils } from './utils';
import { listenWatchEvent, Watcher, watchers } from './watchers';

export function initUi(logMode: boolean) {
  interface ContentWeb {
    root: string;
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
    const contentScreen: string[] = [];
    const contentWEB: ContentWeb = {
      root: utils.root,
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
      errors.forEach((w) => {
        w.errors.forEach((m) => {
          const loc = utils.loc(m);
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
        warnings.forEach((w) => {
          w.warnings.forEach((m) => {
            const loc = utils.loc(m);
            contentScreen.push([
              loc ? (
                loc.file +
                '(' +
                loc.row +
                ',' +
                loc.col +
                ') '
              ) : '',
              w.packageName,
              '\n  ',
              m.msg,
            ].join(''));
          });
        });
      }
    }
    web.refresh(contentWEB);
    if (contentScreen.length === 0) { contentScreen.push('watching'); }
    if (logMode) {
      // tslint:disable-next-line
      console.log(contentScreen.join("\n"));
    } else {
      box.content = ['hdev on port ' + web.port, '', ...contentScreen].join('\n');
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

    httpServer.on('error', (err) => {
      utils.exec('/bin/ss', ['-lptn', 'sport = :7777'], { cwd: process.cwd(), title: '' });
      utils.throw(err.message);
    });
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
