import { join, parse, relative } from "path";
import globby from "globby";
import { Barrel } from "./Barrel";
import { BarrelFile } from "./BarrelFile";

export async function findBarrelFiles({
  path,
  match,
  matchDirectory,
  matchIgnore = [relative(matchDirectory, path), "**/*.test.*"],
}: Pick<Barrel, "path" | "match" | "matchDirectory" | "matchIgnore">): Promise<
  BarrelFile[]
> {
  console.log("dir", path);
  const relativePaths = await globby(match, {
    cwd: matchDirectory,
    // Ignore the index file being generated
    ignore: matchIgnore,
  });

  return relativePaths.map((relativePath) => {
    const parsedPath = parse(relativePath);
    return {
      relativePath,
      absolutePath: join(matchDirectory, relativePath),
      // relative path without extension (most useful when generating index files)
      path: join(parsedPath.dir, parsedPath.name),
      name: parsedPath.name,
    };
  });
}
