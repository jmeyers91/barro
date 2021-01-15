import { join, parse } from "path";
import globby from "globby";
import { Barrel } from "./types/Barrel";
import { BarrelFile } from "./types/BarrelFile";
import { getBarrelIgnoreGlobs } from "./getBarrelIgnoreGlobs";

export async function findBarrelFiles(barrel: Barrel): Promise<BarrelFile[]> {
  const { match, matchDirectory } = barrel;
  const relativePaths = await globby(match, {
    cwd: matchDirectory,
    ignore: getBarrelIgnoreGlobs(barrel),
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
