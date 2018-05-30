
import { utils } from "./utils";

export async function cmd_login(args: any): Promise<boolean> {
  const name: string = args.name;
  const email: string = args.email;
  utils.exec(
        "git", [
          "config",
          "--global",
          "user.name",
          name,
        ],
    {
      cwd: utils.root,
      title: "",
    },
    );
  utils.exec(
        "git", [
          "config",
          "--global",
          "user.email",
          email,
        ],
    {
      cwd: utils.root,
      title: "",
    },
    );
  utils.exec(
        "git", [
          "credential-cache",
          "exit",
        ],
    {
      cwd: utils.root,
      title: "",
    },
    );
  utils.exec(
        "git", [
          "config",
          "credential.helper",
          "'cache --timeout=300'",
        ],
    {
      cwd: utils.root,
      title: "",
    },
    );
    // utils.exec(
    //     'git', [
    //         'credential',
    //         'fill'
    //     ],
    //     {
    //         cwd: utils.root,
    //     }
    // );
  return true;
}
