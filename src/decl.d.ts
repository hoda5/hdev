declare module "bash-color" {
    type Color = 'BLACK' | 'RED' | 'GREEN' | 'YELLOW' | 'BLUE' | 'PURPLE' | 'CYAN' | 'WHITE';
    type Style = 'bold' | 'underline' | 'background' | 'hi_text' | 'hi_bold' | 'hi_background';

    function black(s: string, hi?: boolean): string;
    function red(s: string, hi?: boolean): string;
    function green(s: string, hi?: boolean): string;
    function yellow(s: string, hi?: boolean): string;
    function blue(s: string, hi?: boolean): string;
    function purple(s: string, hi?: boolean): string;
    function cyan(s: string, hi?: boolean): string;
    function white(s: string, hi?: boolean): string;
    function wrap(s: string, color: Color, style: Style): string
}

declare module "source-map-resolve" {
    function resolve(
        code: string,
        url: string,
        getfile: (filename: string, cb: (err: Error, content: string) => void) => void,
        cb: (err: Error, content: {
            map: any,
            url: string,
            sourcesRelativeTo: string;
            sourceMappingURL: string;
            sourcesResolved: string[],
            sourcesContent: string[]
        }
        ) => void,
    ): void;
}

declare interface CoverageResult {
    lines: { total: number, covered: number, skipped: number, pct: number },
    statements: { total: number, covered: number, skipped: number, pct: number },
    functions: { total: number, covered: number, skipped: number, pct: number },
    branches: { total: number, covered: number, skipped: number, pct: number },
}

declare interface CoverageResults {
    [name: string]: CoverageResult
}

declare module "nyc" {
    interface ConfigNYC {
        tempDirectory?: string;
        subprocessBin?: string;
        instrumenter?: string;
        sourceMap?: boolean;
        showProcessTree?: boolean;
        eager?: boolean;
        reportDir?: string;
        reporter?: string;
        cacheDir?: string;
        include?: string;
        exclude?: string;
        require?: string;
        extension?: string;
        hookRequire?: any;
        hookRunInContext?: any;
        hookRunInThisContext?: any;
        _processInfo?: any;
    }
    class NYC {
        constructor(config: ConfigNYC)

        // instrumenter();
        // addFile(filename: string);
        // addAllFiles();
        // instrumentAllFiles(input, output, cb);
        // walkAllFiles(dir, visitor)
        // cleanup()
        // clearCache();
        createTempDirectory(): void;
        // reset();
        // wrap(bin);
        // generateUniqueID();
        // writeCoverageFile();
        // coverageFinder();
        // getCoverageMapFromAllCoverageFiles(baseDirectory);
        report(): void;
        // showProcessTree();
        // checkCoverage(thresholds, perFile)

        // eachReport(filenames, iterator, baseDirectory)
        // loadReports(filenames)
        // tempDirectory()
        // reportDirectory()
        // processInfoDirectory()
    }

    export = NYC;
}