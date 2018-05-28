declare module "bash-color" {
    function black(s: string, hi?: boolean): string;
    function red(s: string, hi?: boolean): string;
    function green(s: string, hi?: boolean): string;
    function yellow(s: string, hi?: boolean): string;
    function blue(s: string, hi?: boolean): string;
    function purple(s: string, hi?: boolean): string;
    function cyan(s: string, hi?: boolean): string;
    function white(s: string, hi?: boolean): string;
}

declare module "rollup-plugin-typescript" {
    var x: any;
    export = x;
}