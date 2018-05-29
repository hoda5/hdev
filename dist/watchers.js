"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
exports.watchers = [];
exports.watchEmitter = new events_1.EventEmitter();
function listenWatchEvent(event, listenner) {
    exports.watchEmitter.on(event, listenner);
}
exports.listenWatchEvent = listenWatchEvent;
function unlistenWatchEvent(event, listenner) {
    exports.watchEmitter.removeListener(event, listenner);
}
exports.unlistenWatchEvent = unlistenWatchEvent;
var tm_reload;
function onBuilding(watcher) {
    if (tm_reload)
        clearTimeout(tm_reload);
    exports.watchEmitter.emit('building', watcher);
}
function onTesting(watcher) {
    if (tm_reload)
        clearTimeout(tm_reload);
    exports.watchEmitter.emit('testing', watcher);
    tm_reload = setTimeout(function () {
        exports.watchEmitter.emit('reload');
    }, 500);
}
function onFinished(watcher) {
    exports.watchEmitter.emit('finished', watcher);
}
function addWatcher(watcher) {
    exports.watchers.push(watcher);
    return { onBuilding: onBuilding, onTesting: onTesting, onFinished: onFinished };
}
exports.addWatcher = addWatcher;
function hasWarnings() {
    return exports.watchers
        .some(function (w) { return w.warnings.length > 0; });
}
exports.hasWarnings = hasWarnings;
function hasErrors() {
    return exports.watchers
        .some(function (w) { return w.errors.length > 0; });
}
exports.hasErrors = hasErrors;
//# sourceMappingURL=watchers.js.map