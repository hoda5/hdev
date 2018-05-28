export declare type PackageJSON = {
    name: string;
    main: string;
    dependencies?: string[];
    devDependencies?: string[];
    peerDependencies?: string[];
};
export declare type WorkspaceFile = {
    "folders": {
        path: string;
    }[];
    settings: Object;
};
export declare const utils: {
    verbose: boolean;
    readonly root: string;
    readonly workspaceFile: string;
    adaptFolderName(packageName: string): string;
    listPackages(): string[];
    forEachPackage(fn: (packageName: string, folder: string) => Promise<void>): Promise<boolean>;
    getPackageJsonFor(packagName: string): PackageJSON;
    path(packageName: string, ...names: string[]): string;
    exists(packageName: string, filename: string): boolean;
    readText(packageName: string, filename: string): string;
    readJSON<T>(packageName: string, filename: string): T;
    throw(msg: string): void;
    exec(cmd: string, args: string[], opts: {
        cwd: string;
    }): void;
};
