import { listenWatchEvent, watchers, Watcher } from "./watchers";
import * as blessed from "blessed";
import { utils } from "./utils";
import { NOTINITIALIZED } from "dns";

let term: {
    refreshTerm(): void
};

export function refreshTerm() {
    if (!term) utils.throw('UI not initialized');
    term.refreshTerm();
}

export function initUi(logMode: boolean) {

    let screen: blessed.Widgets.Screen;
    let box: blessed.Widgets.TextboxElement;
    if (!logMode) initBox();
    const building: string[] = [];

    listenWatchEvent('building', refreshTerm);
    listenWatchEvent('testing', refreshTerm);
    listenWatchEvent('finished', refreshTerm);

    let tm_refreshTerm: NodeJS.Timer;

    term = {
        refreshTerm() {
            if (tm_refreshTerm) clearTimeout(tm_refreshTerm);
            tm_refreshTerm = setTimeout(() => {
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
                if (logMode)
                    console.log(content.join('\n'))
                else {
                    box.content = content.join('\n');
                    box.focus();
                    screen.render();
                }
            }, 1);
        }
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
}