import { watch } from "chokidar";
import { join, resolve } from "path";
import { launchBus, start, stop } from "pm2";
import { watchTypeScript } from "./build/buildTypeScript";
import { initUi } from "./ui";
import { utils } from "./utils";

export async function cmd_start(args: any, opts: any): Promise<boolean> {
  if (utils.verbose) {
    utils.debug("start_with_args", process.argv || args);
  }
  if (opts.noService) return start_no_service(opts.logMode);
  else return start_as_service(opts.follow);
}
async function start_no_service(logMode: boolean): Promise<boolean> {
  let ok = false;
  await utils.forEachPackage(async (pkg) => {
    if (pkg !== "@hoda5-hdev") {
      if (await watchTypeScript(pkg)) {
        ok = true;
      }
    }
  });
  if (ok) {
    initUi(logMode);
  }
  return ok;
}

async function start_as_service(follow: boolean): Promise<boolean> {

  const isTempWS = __dirname === resolve(join(utils.root, "../dist"));
  const wsHasHDEV = utils.listPackages().indexOf("@hoda5-hdev") >= 0;

  if (wsHasHDEV) {
    // tslint:disable-next-line
    console.log("usando hdev do workspace");
  }

  const restartService = utils.limiteAsync({
    ms: 1500,
    async fn() {
      if (restartService.pending) { return; }
      await stop_service();
      if (restartService.pending) { return; }
      await start_service();
    },
  });

  if (follow) {
    await follow_service();
    await start_service();
  } else {
    await start_service();
    setTimeout(() => process.exit(0), 2000);
  }

  return true;

  function start_service() {
    if (utils.verbose) {
      // tslint:disable-next-line
      console.log("starting hdev");
    }
    return new Promise<void>((fnResolve, fnReject) => {
      const args = ["start", "--no-service", "--log-mode"];
      if (utils.verbose) { args.push("--verbose"); }
      let script = process.argv[1];
      if (wsHasHDEV) {
        script = utils.path("@hoda5-hdev", "dist/hdev.js");
      } else if (isTempWS) {
        script = resolve(join(utils.root, "../dist/hdev.js"));
      }
      const pm2Opts = {
        name: "hdev",
        script,
        cwd: process.cwd(),
        args,
        restartDelay: 100,
        watch: false,
      };
      if (utils.verbose) utils.debug("pm2", pm2Opts);
      start(pm2Opts, (err) => {
        if (err) fnReject(err);
        else {
          setTimeout(() => {
            fnResolve();
            if (utils.verbose) utils.debug("hdev started!");
          }, 1);
        }
      });
    });
  }
  function stop_service() {
    if (utils.verbose) {
      utils.debug("stopping hdev");
    }
    return new Promise<void>(
      (resolveStop) =>
        stop("hdev", () => {
          if (utils.verbose) utils.debug("hdev stopped");
          resolveStop();
        }),
    );
  }

  async function follow_service() {
    if (utils.verbose) {
      // tslint:disable-next-line
      console.dir({ follow_service: { wsHasHDEV, isTempWS } });
    }
    if (!(wsHasHDEV || isTempWS)) {
      utils.throw("hdev precisa estar no workspace para poder ser reconstruido");
    }
    await watch_hdev_for_rebuild();
    await watch_dist();
    await followLogs();
    monitor_SIGINT();
  }

  async function watch_hdev_for_rebuild() {
    const p = await utils.spawn("npm", ["run", "watch"], {
      cwd: resolve(join(__dirname, "..")),
      name: "rebuild-hdev",
    });
    return new Promise((resolveB: any) => {
      p.on("line", (line) => {
        if (/Compilation complete/g.test(line)) {
          // tslint:disable-next-line
          console.log("hdev rebuilded");
          if (resolveB) { resolveB(); }
          resolveB = false;
        }
      });
    });
  }
  async function watch_dist() {
    return new Promise((resolveWatch) => {
      const watcherDist = watch(__dirname);
      watcherDist.on("ready", () => {
        watcherDist.on("all", restartService);
        resolveWatch();
      });
    });
  }

  async function followLogs() {
    return new Promise((resolveF, rejectF) => {
      launchBus((err, bus) => {
        if (err) return rejectF(err);
        bus.on("log:out", (d: any) => {
          process.stdout.write(d.data);
        });
        bus.on("log:err", (d: any) => {
          process.stdout.write(d.data);
          setTimeout(() => process.exit(0), 2000);
        });
        resolveF();
      });
    });
  }

  function monitor_SIGINT() {
    process.on("SIGINT", () => {
      // tslint:disable-next-line
      console.log("   SIGINT");
      stop_service();
      setTimeout(() => process.exit(0), 2000);
    });
  }
}
