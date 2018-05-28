import { utils } from "../utils"
import { rollup, InputOptions, OutputOptions, RollupDirOptions, RollupFileOptions } from 'rollup';
import * as plugin_typescript from 'rollup-plugin-typescript';

export async function buildTypeScript(name: string) {
    if (!utils.exists(name, 'tsconfig.json')) return;
    const packageJSON = utils.getPackageJsonFor(name);
    const main = packageJSON.main ? packageJSON.main.replace('dist', 'src').replace('.js', '.ts') : 'src/main.ts';
    return await utils.forEachPackage(async (pkg, folder) => {
        const opts: RollupFileOptions = {
            input: utils.path(name, main),
            plugins: [
                plugin_typescript()
            ]
        };
        const outputOptions: OutputOptions = {
            dir: utils.path(name, 'dist2'),
        };
        const bundle = await rollup(opts);

        console.log(bundle.imports); // an array of external dependencies
        console.log(bundle.exports); // an array of names exported by the entry point
        console.log(bundle.modules); // an array of module objects

        // generate code and a sourcemap
        const { code, map } = await bundle.generate(outputOptions);

        // or write the bundle to disk
        await bundle.write(outputOptions);
    });
}
