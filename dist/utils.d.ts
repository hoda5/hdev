export interface PackageJSON {
    name: string;
    main: string;
    scripts?: {
        [name: string]: string;
    };
    dependencies?: {
        [name: string]: string;
    };
    devDependencies?: {
        [name: string]: string;
    };
    peerDependencies?: {
        [name: string]: string;
    };
    jest: any;
}
export interface WorkspaceFile {
    'folders': Array<{
        path: string;
    }>;
    settings: any;
}
export interface Defer<T> {
    promise: Promise<T>;
    resolve(res: T | Promise<T>): void;
    reject(reason: any): void;
}
export interface SpawnedProcess {
    readonly name: string;
    on(event: 'line' | 'error', handler: (s: string) => void): void;
    on(event: 'exit', handler: (code: number) => void): void;
    restart(): Promise<void>;
    stop(): Promise<void>;
}
export interface SrcMessage {
    msg: string;
    stack?: Array<SrcMessageLoc>;
}
export interface SrcMessageLoc {
    file: string;
    row: number;
    col: number;
}
export interface TestResults {
    packageName: string;
    errors: SrcMessage[];
    warnings: SrcMessage[];
}
export declare const utils: {
    verbose: boolean;
    readonly root: string;
    readonly workspaceFile: string;
    displayFolderName(packageName: string): string;
    listPackages(): string[];
    forEachPackage(fn: (packageName: string, folder: string) => Promise<void>): Promise<boolean>;
    getPackageJsonFor(packagName: string): PackageJSON;
    path(packageName: string, ...names: string[]): string;
    add_to_git_ignore(packageName: string, ...ignore: string[]): void;
    exists(packageName: string, ...names: string[]): boolean;
    readText(packageName: string, filename: string): string;
    readJSON<T>(packageName: string, filename: string): T;
    readTestResult(packageName: string): TestResults | undefined;
    readCoverageSummary(packageName: string): CoverageResult | undefined;
    throw(msg: string): void;
    exec(cmd: string, args: string[], opts: {
        cwd: string;
        title: string;
    }): void;
    pipe(cmd: string, args: string[], opts: {
        cwd: string;
        title: string;
        verbose?: boolean | undefined;
        throwErrors?: boolean | undefined;
    }): Promise<{
        out: string;
        err: string;
    }>;
    spawn(cmd: string, args: string[], opts: {
        name: string;
        cwd: string;
    }): Promise<SpawnedProcess>;
    exit(code: number): void;
    defer<T>(): {
        promise: Promise<T>;
        resolve(res: T | Promise<T>): void;
        reject(reason: any): void;
    };
    limiteSync<T>(opts: {
        ms: number;
        bounce?: boolean | undefined;
        fn: () => T;
    }): (() => void) & {
        pending: boolean;
        cancel(): void;
    };
    limiteAsync<T>(opts: {
        ms: number;
        bounce?: boolean | undefined;
        fn: () => Promise<T>;
    }): (() => void) & {
        pending: boolean;
        cancel(): void;
    };
    removeFiles(filenames: string[]): Promise<void>;
    loc(m: SrcMessage): SrcMessageLoc | undefined;
    debug(title: string, ...args: any[]): void;
};
