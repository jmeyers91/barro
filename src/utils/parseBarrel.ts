import path from "path";
import { Barrel } from "../types/Barrel";
import { BarrelTemplateFn } from "../types/BarrelTemplateFn";
import { parseStringArray } from "./parseStringArray";

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
    out,
    matchDirectory,
    match,
    matchIgnore,
    template,
    banner,
  } = value as Record<string, unknown>;

  if (typeof out !== "string") {
    throw new Error(`Expected out to be a string. Got ${typeof out}.`);
  }

  // Default the match directory to the directory the index is being output into.
  let parsedMatchDirectory: string;
  if (typeof matchDirectory === "string") {
    parsedMatchDirectory = matchDirectory;
  } else {
    parsedMatchDirectory = path.parse(out).dir;
  }

  const parsedMatch =
    typeof match === "string" ? match : parseStringArray(match, "match");

  const parsedMatchIgnore = matchIgnore
    ? parseStringArray(matchIgnore, "matchIgnore")
    : undefined;

  const parsedTemplate =
    typeof template === "string" || typeof template === "function"
      ? (template as string | BarrelTemplateFn)
      : undefined;

  const parsedBanner = typeof banner === "string" ? banner : undefined;

  return {
    out,
    matchDirectory: parsedMatchDirectory,
    template: parsedTemplate,
    banner: parsedBanner,
    matchIgnore: parsedMatchIgnore,
    match: parsedMatch,
  };
}
