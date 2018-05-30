import { utils } from "./utils";

export async function cmd_run(args: any): Promise<boolean> {
  const packageName: string = args.name;
  const cmd: string[] = args.cmd;
  const dir = utils.path(packageName);
  if (cmd[0] === "--") { cmd.splice(0, 1); }

  utils.exec(
    cmd[0], cmd.slice(1),
    {
      cwd: dir,
      title: "",
    },
  );

  return true;
}
