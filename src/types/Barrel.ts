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
   * Ignore `*.test.*` and `*.spec.*` files.
   * Defaults to `true`.
   */
  ignoreTests?: boolean;

  /**
   * Ignore `index.*` files.
   * Defaults to `true`.
   */
  ignoreBarrels?: boolean;

  /**
   * The handlebars template source to use when generating the barrel.
   * Defaults to `export * from './file/path';` for every matching file.
   */
  template?: string | BarrelTemplateFn;

  /**
   * The banner comment placed at the top of the generated barrel file.
   */
  banner?: string;
}
