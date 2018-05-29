import { EventEmitter } from 'events';
export interface Watcher {
    readonly packageName: string;
    readonly building: boolean;
    readonly testing: boolean;
    readonly warnings: SrcMessage[];
    readonly errors: SrcMessage[];
    readonly coverage: number | undefined;
    restart(): Promise<void>;
    stop(): Promise<void>;
}
export interface SrcMessage {
    file: string;
    row: number;
    col: number;
    msg: string;
}

export const watchers: Watcher[] = [];
export const watchEmitter = new EventEmitter();

export function listenWatchEvent(event: 'building' | 'testing' | 'finished', listenner: (watcher: Watcher) => void): void;
export function listenWatchEvent(event: 'reload', listenner: () => void): void;
export function listenWatchEvent(event: string, listenner: (...args: any[]) => void): void {
    watchEmitter.on(event, listenner);
}

export function unlistenWatchEvent(event: 'building' | 'testing' | 'finished', listenner: (watcher: Watcher) => void): void;
export function unlistenWatchEvent(event: 'reload', listenner: () => void): void;
export function unlistenWatchEvent(event: string, listenner: (...args: any[]) => void): void {
    watchEmitter.removeListener(event, listenner);
}

let tm_reload: NodeJS.Timer;

export interface WatcherEvents {
    onBuilding(watcher: Watcher): void
    onTesting(watcher: Watcher): void
    onFinished(watcher: Watcher): void
}

function onBuilding(watcher: Watcher) {
    if (tm_reload) clearTimeout(tm_reload);
    watchEmitter.emit('building', watcher);
}

function onTesting(watcher: Watcher) {
    if (tm_reload) clearTimeout(tm_reload);
    watchEmitter.emit('testing', watcher);
    tm_reload = setTimeout(() => {
        watchEmitter.emit('reload');
    }, 500);
}

function onFinished(watcher: Watcher) {
    watchEmitter.emit('finished', watcher);
}

export function addWatcher(watcher: Watcher): WatcherEvents {
    watchers.push(watcher);
    return { onBuilding, onTesting, onFinished }
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
