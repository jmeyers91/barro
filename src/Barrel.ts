import { BarrelTemplateFn } from "./BarrelTemplateFn";

export interface Barrel {
  /**
   * The path to the generated barrel file.
   */
  path: string;

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

  const {
    path,
    matchDirectory,
    match,
    matchIgnore,
    template,
  } = value as Record<string, unknown>;

  if (typeof path !== "string") {
    throw new Error(`Expected path to be a string. Got ${typeof path}.`);
  }

  if (typeof matchDirectory !== "string") {
    throw new Error(
      `Expected matchDirectory to be a string. Got ${typeof matchDirectory}.`
    );
  }

  const parsedMatch =
    typeof match === "string" ? match : parseStringArray(match, "match");

  const parsedMatchIgnore = matchIgnore
    ? parseStringArray(matchIgnore, "matchIgnore")
    : undefined;

  const parsedTemplate = typeof template === "string" ? template : undefined;

  return {
    path,
    matchDirectory,
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
