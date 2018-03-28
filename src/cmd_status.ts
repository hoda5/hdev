import { config } from "./config"

export function cmd_status(name: string) {
    let ok = false;
    config.forEachPackage((pkg, folder) => {
        config.shell(
            'git', [
                'status'
            ],
            {
                cwd: folder,
            }
        );
        ok = true;
    });
    if (!ok)
        config.throw('repositório vazio');
}
