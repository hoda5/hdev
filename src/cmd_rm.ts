import { existsSync, readFileSync, writeFileSync } from "fs";
import { utils, WorkspaceFile } from "./utils";

export async function cmd_rm(args: any): Promise<boolean> {
  const packageName: string = args.name;
  utils.exec(
        "git", [
          "rm",
          "-f",
          packageName,
        ],
    {
      cwd: utils.root + "/packages",
      title: "",
    },
    );
  const w = utils.workspaceFile;
  if (existsSync(w)) {
    const wf: WorkspaceFile = JSON.parse(readFileSync(w, "utf-8"));
    const path = "packages/" + packageName;
    wf.folders = wf.folders.filter((f) => f.path !== path);
    writeFileSync(w, JSON.stringify(wf, null, 2), "utf-8");
  }
  return true;
}
