import { utils } from "./utils";

export function cmd_link() {
  const allpackages: string[] = [];
  utils.forEachPackage(enable_link);
  utils.forEachPackage(link_packages);

  async function enable_link(packagName: string, folder: string) {
    allpackages.push(packagName);
    utils.exec(
            "npm", [
              "link",
            ],
      {
        cwd: folder,
        title: "",
      },
        );
  }

  async function link_packages(packageName: string, folder: string) {
    const json = utils.getPackageJsonFor(packageName);
    [
      ...json.dependencies ? Object.keys(json.dependencies) : [],
      ...json.peerDependencies ? Object.keys(json.peerDependencies) : [],
      ...json.devDependencies ? Object.keys(json.devDependencies) : [],
    ].map((dep) => {
      if (allpackages.indexOf(dep) >= 0) {
          utils.exec(
                    "npm", [
                      "link",
                      dep,
                    ],
              {
                cwd: folder,
                title: "",
              },
                );
        }
    });
  }
}
