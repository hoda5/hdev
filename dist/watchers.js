"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var utils_1 = require("./utils");
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
function onBuilding(watcher) {
    onReload.cancel();
    if (utils_1.utils.verbose) {
        utils_1.utils.debug('emit building', watcher);
    }
    exports.watchEmitter.emit('building', watcher);
}
function onTesting(watcher) {
    if (utils_1.utils.verbose) {
        utils_1.utils.debug('emit testing', watcher);
    }
    exports.watchEmitter.emit('testing', watcher);
    onReload();
}
function onFinished(watcher) {
    if (utils_1.utils.verbose) {
        utils_1.utils.debug('emit finished', watcher);
    }
    exports.watchEmitter.emit('finished', watcher);
}
var onReload = utils_1.utils.limiteSync({
    ms: 1000,
    bounce: true,
    fn: function () {
        if (utils_1.utils.verbose) {
            utils_1.utils.debug('emit reload');
        }
        exports.watchEmitter.emit('reload');
    },
});
function addWatcher(watcher) {
    exports.watchers.push(watcher);
    return { onBuilding: onBuilding, onTesting: onTesting, onFinished: onFinished, onReload: onReload };
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