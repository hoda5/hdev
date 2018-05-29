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

declare interface CoverageResult {
        lines: { total: number, covered: number, skipped: number, pct: number },
        statements: { total: number, covered: number, skipped: number, pct: number },
        functions: { total: number, covered: number, skipped: number, pct: number },
        branches: { total: number, covered: number, skipped: number, pct: number },    
}

declare interface CoverageResults {
    [name: string]: CoverageResult    
}
