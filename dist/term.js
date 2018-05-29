"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var watchers_1 = require("./watchers");
var blessed = require("blessed");
var term;
function refreshTerm() {
    if (!term)
        init();
    term.refreshTerm();
}
exports.refreshTerm = refreshTerm;
function init() {
    var screen = blessed.screen({
        smartCSR: true
    });
    screen.title = 'hdev';
    screen.key(['escape', 'q', 'C-c'], function (ch, key) {
        return process.exit(0);
    });
    var box = blessed.textbox({
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
        }
    });
    screen.append(box);
    var building = [];
    watchers_1.listenWatchEvent('building', refreshTerm);
    watchers_1.listenWatchEvent('testing', refreshTerm);
    watchers_1.listenWatchEvent('finished', refreshTerm);
    var tm_refreshTerm;
    term = {
        refreshTerm: function () {
            if (tm_refreshTerm)
                clearTimeout(tm_refreshTerm);
            tm_refreshTerm = setTimeout(function () {
                var building = [];
                var testing = [];
                var warnings = [];
                var errors = [];
                watchers_1.watchers.forEach(function (w) {
                    if (w.building)
                        building.push(w.packageName);
                    if (w.testing)
                        testing.push(w.packageName);
                    else if (w.errors.length)
                        errors.push(w);
                    else if (w.warnings.length)
                        warnings.push(w);
                });
                var content = [];
                if (building.length)
                    content.push('Building: ' + building.join());
                if (testing.length)
                    content.push('Testing: ' + testing.join());
                if (errors.length) {
                    content.push('Error(s): ');
                    errors.forEach(function (w) {
                        w.errors.forEach(function (m) {
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
                        });
                    });
                }
                if (warnings.length) {
                    content.push('Warning(s):');
                    if (errors.length == 0)
                        warnings.forEach(function (w) {
                            w.warnings.forEach(function (m) {
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
                            });
                        });
                }
                if (content.length == 0)
                    content.push('watching');
                box.content = content.join('\n');
                box.focus();
                screen.render();
            }, 1);
        }
    };
}
//# sourceMappingURL=term.js.map