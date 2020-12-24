import chokidar from "chokidar";
import { relative } from "path";
import { Barrel } from "./Barrel";

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
    ignored: [
      ...(barrel.matchIgnore ?? []),
      "**/*.test.*",
      relative(barrel.matchDirectory, barrel.out),
    ],
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
