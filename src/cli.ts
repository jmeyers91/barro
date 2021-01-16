#!/usr/bin/env node

import { join, isAbsolute, parse } from "path";
import { existsSync, writeFileSync } from "fs";
import Handlebars from "handlebars";
import { compileBarrel } from "./compileBarrel";
import { watchBarrelFiles } from "./watchBarrelFiles";
import { parseBarrels } from "./utils/parseBarrel";

const flags = {
  watch: "--watch",
  write: "--write",
  version: "--version",
};
const allFlags = Object.values(flags);

main();
async function main() {
  try {
    const {
      name: packageName,
      version: packageVersion,
    } = require("../package.json");
    const args = process.argv.slice(2);
    // Find first non-flag argument
    const barrelConfigPath =
      args.find((arg) => !allFlags.includes(arg)) ?? "./barro.js";
    const watch = args.includes(flags.watch);
    const write = args.includes(flags.write);
    const logVersion = args.includes(flags.version);

    // Always log the version, but close immediately if the --version flag is used.
    console.log(`${packageName} v${packageVersion}`);
    if (logVersion) {
      process.exit(0);
    }

    const barrelConfigFullPath = isAbsolute(barrelConfigPath)
      ? barrelConfigPath
      : join(process.cwd(), barrelConfigPath);

    if (!existsSync(barrelConfigFullPath)) {
      throw new Error(`Barrel config file not found: ${barrelConfigFullPath}`);
    }

    const barrelConfigDir = parse(barrelConfigFullPath).dir;
    const barrelConfigExport: unknown = require(barrelConfigFullPath);
    const barrelConfigs = parseBarrels(
      /**
       * Allow the barrel config to export a function.
       */
      typeof barrelConfigExport === "function"
        ? barrelConfigExport({ Handlebars })
        : barrelConfigExport
    ).map((barrelConfig) => ({
      ...barrelConfig,
      // Fix relative paths
      out: maybeRelative(barrelConfig.out, barrelConfigDir),
      matchDirectory: maybeRelative(
        barrelConfig.matchDirectory,
        barrelConfigDir
      ),
    }));

    if (write) {
      console.log("Building barrels");
      await Promise.all(
        barrelConfigs.map(async (barrelConfig) => {
          console.log(
            `${join(
              barrelConfig.matchDirectory,
              barrelConfig.match.toString()
            )} -> ${barrelConfig.out}`
          );
          const barrelSource = await compileBarrel(barrelConfig);
          if (write) {
            writeFileSync(barrelConfig.out, barrelSource, "utf8");
          }
        })
      );
    }

    if (watch) {
      console.log("Watching barrels");
      for (const barrelConfig of barrelConfigs) {
        watchBarrelFiles(barrelConfig, async (eventType, path, isCancelled) => {
          console.log(
            `Change detected: ${eventType} ${path} - compiling barrel file ${barrelConfig.out}`
          );
          const barrelSource = await compileBarrel(barrelConfig);
          if (write && !isCancelled()) {
            writeFileSync(barrelConfig.out, barrelSource, "utf8");
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function maybeRelative(filepath: string, root: string): string {
  return isAbsolute(filepath) ? filepath : join(root, filepath);
}
