import chokidar from "chokidar";
import { Barrel } from "./types/Barrel";
import { getBarrelIgnoreGlobs } from "./getBarrelIgnoreGlobs";

type CancelWatchFn = () => void;
type OnChangeFn = (
  eventType: "add" | "unlink" | "unlinkDir",
  filepath: string
) => unknown;

export function watchBarrelFiles(
  barrel: Barrel,
  onChange: OnChangeFn
): CancelWatchFn {
  const watcher = chokidar.watch(barrel.match, {
    cwd: barrel.matchDirectory,
    ignored: getBarrelIgnoreGlobs(barrel),
    ignoreInitial: true,
  });

  const onAddFile = async (path: string) => {
    await onChange("add", path);
  };

  const onUnlinkFile = async (path: string) => {
    await onChange("unlink", path);
  };

  const onUnlinkDir = async (path: string) => {
    await onChange("unlinkDir", path);
  };

  watcher.on("add", onAddFile);
  watcher.on("unlink", onUnlinkFile);
  watcher.on("unlinkDir", onUnlinkDir);

  return () => {
    watcher.off("add", onAddFile);
    watcher.off("unlink", onUnlinkFile);
    watcher.off("unlinkDir", onUnlinkDir);
  };
}
