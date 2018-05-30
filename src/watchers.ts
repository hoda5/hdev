import { EventEmitter } from 'events';
import { utils } from './utils';
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

export function listenWatchEvent(
  event: 'building' | 'testing' | 'finished', listenner: (watcher: Watcher) => void): void;
export function listenWatchEvent(event: 'reload', listenner: () => void): void;
export function listenWatchEvent(event: string, listenner: (...args: any[]) => void): void {
  watchEmitter.on(event, listenner);
}

export function unlistenWatchEvent(
  event: 'building' | 'testing' | 'finished', listenner: (watcher: Watcher) => void): void;
export function unlistenWatchEvent(event: 'reload', listenner: () => void): void;
export function unlistenWatchEvent(event: string, listenner: (...args: any[]) => void): void {
  watchEmitter.removeListener(event, listenner);
}
export interface WatcherEvents {
  onBuilding(watcher: Watcher): void;
  onTesting(watcher: Watcher): void;
  onFinished(watcher: Watcher): void;
  onReload(): void;
}

function onBuilding(watcher: Watcher) {
  onReload.cancel();
  watchEmitter.emit('building', watcher);
}

function onTesting(watcher: Watcher) {
  watchEmitter.emit('testing', watcher);
  onReload();
}

function onFinished(watcher: Watcher) {
  watchEmitter.emit('finished', watcher);
}

const onReload = utils.limiteSync({
  ms: 1000,
  bounce: true,
  fn() {
    watchEmitter.emit('reload');
  },
});

export function addWatcher(watcher: Watcher): WatcherEvents {
  watchers.push(watcher);
  return { onBuilding, onTesting, onFinished, onReload };
}

export function hasWarnings(): boolean {
  return watchers
    .some(
      (w) => w.warnings.length > 0,
  );
}

export function hasErrors(): boolean {
  return watchers
    .some(
      (w) => w.errors.length > 0,
  );
}
