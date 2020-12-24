import { parse } from "path";
import { BarrelTemplateFn } from "./BarrelTemplateFn";

export interface Barrel {
  /**
   * The path to the generated barrel file.
   */
  out: string;

  /**
   * The root directory used when searching for files.
   */
  matchDirectory: string;

  /**
   * The glob pattern used to find files included in the generated barrel.
   */
  match: string | string[];

  /**
   * The glob patterns to ignore.
   * Includes the generated barrel path automatically.
   */
  matchIgnore?: string[];

  /**
   * The handlebars template source to use when generating the barrel.
   * Defaults to `export * from './file/path';` for every matching file.
   */
  template?: string | BarrelTemplateFn;
}

export function parseBarrels(value: unknown): Barrel[] {
  if (Array.isArray(value)) {
    return value.map((v) => parseBarrel(v));
  }
  return [parseBarrel(value)];
}

export function parseBarrel(value: unknown): Barrel {
  if (value === null || typeof value !== "object") {
    throw new Error("Invalid barrel config. Config must be an object.");
  }

  const { out, matchDirectory, match, matchIgnore, template } = value as Record<
    string,
    unknown
  >;

  if (typeof out !== "string") {
    throw new Error(`Expected out to be a string. Got ${typeof out}.`);
  }

  // Default the match directory to the directory the index is being output into.
  let parsedMatchDirectory: string;
  if (typeof matchDirectory === "string") {
    parsedMatchDirectory = matchDirectory;
  } else {
    parsedMatchDirectory = parse(out).dir;
  }

  const parsedMatch =
    typeof match === "string" ? match : parseStringArray(match, "match");

  const parsedMatchIgnore = matchIgnore
    ? parseStringArray(matchIgnore, "matchIgnore")
    : undefined;

  const parsedTemplate = typeof template === "string" ? template : undefined;

  return {
    out,
    matchDirectory: parsedMatchDirectory,
    template: parsedTemplate,
    matchIgnore: parsedMatchIgnore,
    match: parsedMatch,
  };
}

function parseStringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${name} to be an array. Got ${typeof value}.`);
  }

  const invalidIndex = value.findIndex((value) => typeof value !== "string");
  if (invalidIndex !== -1) {
    throw new Error(
      `Expected ${name}[${invalidIndex}] value to be a string. Got ${typeof value[
        invalidIndex
      ]}.`
    );
  }

  return value;
}
