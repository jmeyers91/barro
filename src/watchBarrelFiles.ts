import chokidar from "chokidar";
import { Barrel } from "./types/Barrel";
import { getBarrelIgnoreGlobs } from "./getBarrelIgnoreGlobs";

let eventIdCounter = 1;
type EventType = "add" | "unlink" | "unlinkDir";
type CancelWatchFn = () => void;
type OnChangeFn = (
  eventType: EventType,
  filepath: string,
  isCancelled: () => boolean
) => unknown;

export function watchBarrelFiles(
  barrel: Barrel,
  onChange: OnChangeFn
): CancelWatchFn {
  let watchCancelled = false;
  let currentEventId: number = 0; // Used to determine if a watch event is stale and should cancel writing
  let queue: Promise<unknown> = Promise.resolve(); // Promise queue to avoid compiling the same index multiple times concurrently
  const watcher = chokidar.watch(barrel.match, {
    cwd: barrel.matchDirectory,
    ignored: getBarrelIgnoreGlobs(barrel),
    ignoreInitial: true,
  });

  // Wait until all previous calls have run before running again
  const handleWatchEvent = async (eventType: EventType, filepath: string) => {
    const eventId = (currentEventId = eventIdCounter);
    eventIdCounter += 1;
    // if another event was received before this one finishes, allow `onChange` to react accordingly
    const isCancelled = () => watchCancelled || currentEventId !== eventId;
    const nextInQueue = async () => onChange(eventType, filepath, isCancelled);
    queue = queue.then(nextInQueue, nextInQueue);
    await queue;
  };

  // Watch event listeners
  const onAddFile = async (path: string) => handleWatchEvent("add", path);
  const onUnlinkFile = async (path: string) => handleWatchEvent("unlink", path);
  const onUnlinkDir = async (path: string) =>
    handleWatchEvent("unlinkDir", path);

  const teardown = () => {
    watchCancelled = true;
    watcher.off("add", onAddFile);
    watcher.off("unlink", onUnlinkFile);
    watcher.off("unlinkDir", onUnlinkDir);
  };

  watcher.on("add", onAddFile);
  watcher.on("unlink", onUnlinkFile);
  watcher.on("unlinkDir", onUnlinkDir);

  return teardown;
}
