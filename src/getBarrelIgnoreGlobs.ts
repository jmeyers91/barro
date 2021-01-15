import { relative } from "path";
import { Barrel } from "./types/Barrel";
import { barrelGlob, testGlob } from "./utils/commonGlobs";

export function getBarrelIgnoreGlobs({
  out,
  match,
  matchDirectory,
  matchIgnore = [],
  ignoreBarrels = true,
  ignoreTests = true,
}: Barrel): string[] {
  const ignoreGlobs = [
    // Ignore the index file being generated
    relative(matchDirectory, out),

    // User specified
    ...matchIgnore,
  ];

  if (ignoreBarrels) {
    ignoreGlobs.push(barrelGlob);
  }

  if (ignoreTests) {
    ignoreGlobs.push(testGlob);
  }

  return ignoreGlobs;
}
