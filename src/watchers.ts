import { EventEmitter } from 'events';
export interface Watcher {
    readonly packageName: string;
    readonly building: boolean;
    readonly warnings: SrcMessage[];
    readonly errors: SrcMessage[];
    restart(): Promise<void>;
    kill(): Promise<void>;
}
export interface SrcMessage {
    file: string;
    row: number;
    col: number;
    msg: string;
}

export const watchers: Watcher[] = [];
export const watchEmitter = new EventEmitter();

export function listenWatchEvent(event: 'startBuild' | 'finishBuild', listenner: (watcher: Watcher) => void): void;
export function listenWatchEvent(event: 'reload', listenner: () => void): void;
export function listenWatchEvent(event: string, listenner: (...args: any[]) => void): void {
    watchEmitter.on(event, listenner);
}

export function unlistenWatchEvent(event: 'startBuild' | 'finishBuild', listenner: (watcher: Watcher) => void): void;
export function unlistenWatchEvent(event: 'reload', listenner: () => void): void;
export function unlistenWatchEvent(event: string, listenner: (...args: any[]) => void): void {
    watchEmitter.removeListener(event, listenner);
}

let tm_reload: NodeJS.Timer;

export interface WatcherEvents {
    onStartBuild(watcher: Watcher): void
    onFinishBuild(watcher: Watcher): void
}

function onStartBuild(watcher: Watcher) {
    if (tm_reload) clearTimeout(tm_reload);
    watchEmitter.emit('startBuild', watcher);
}

function onFinishBuild(watcher: Watcher) {
    if (tm_reload) clearTimeout(tm_reload);
    watchEmitter.emit('finishBuild', watcher);
    tm_reload = setTimeout(() => {
        watchEmitter.emit('reload');
    }, 500);
}

export function addWatcher(watcher: Watcher): WatcherEvents {
    watchers.push(watcher);
    return { onStartBuild, onFinishBuild }
}

export function hasWarnings(): boolean {
    return watchers
        .some(
            (w) => w.warnings.length > 0
        );
}

export function hasErrors(): boolean {
    return watchers
        .some(
            (w) => w.errors.length > 0
        );
}
