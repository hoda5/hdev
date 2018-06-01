/// <reference types="node" />
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
export declare const watchers: Watcher[];
export declare const watchEmitter: EventEmitter;
export declare function listenWatchEvent(event: 'building' | 'testing' | 'finished', listenner: (watcher: Watcher) => void): void;
export declare function listenWatchEvent(event: 'reload', listenner: () => void): void;
export declare function unlistenWatchEvent(event: 'building' | 'testing' | 'finished', listenner: (watcher: Watcher) => void): void;
export declare function unlistenWatchEvent(event: 'reload', listenner: () => void): void;
export interface WatcherEvents {
    onBuilding(watcher: Watcher): void;
    onTesting(watcher: Watcher): void;
    onFinished(watcher: Watcher): void;
    onReload(): void;
}
export declare function addWatcher(watcher: Watcher): WatcherEvents;
export declare function hasWarnings(): boolean;
export declare function hasErrors(): boolean;
