import { join, isAbsolute, parse } from "path";
import { existsSync, writeFileSync } from "fs";
import Handlebars from "handlebars";
import { parseBarrels } from "./Barrel";
import { compileBarrel } from "./compileBarrel";
import { watchBarrelFiles } from "./watchBarrelFiles";

main();
async function main() {
  try {
    const barrelConfigPath = process.argv[2];
    const args = process.argv.slice(2);
    const watch = args.includes("--watch");
    const write = args.includes("--write");
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
      // Make relative barrel paths absolute relative to the barrel config file
      path: join(barrelConfigDir, barrelConfig.path),
      matchDirectory: join(barrelConfigDir, barrelConfig.matchDirectory),
    }));

    if (watch) {
      console.log("Watching barrels");
      for (const barrelConfig of barrelConfigs) {
        console.log(
          `${join(
            barrelConfig.matchDirectory,
            barrelConfig.match.toString()
          )} -> ${barrelConfig.path}`
        );
        watchBarrelFiles(barrelConfig, async (eventType, path) => {
          console.log(
            `Change detected: ${eventType} ${path} - compiling barrel file ${barrelConfig.path}`
          );
          const barrelSource = await compileBarrel(barrelConfig);
          if (write) {
            writeFileSync(barrelConfig.path, barrelSource, "utf8");
          }
        });
      }
    } else {
      await Promise.all(
        barrelConfigs.map(async (barrelConfig) => {
          const barrelSource = await compileBarrel(barrelConfig);
          if (write) {
            writeFileSync(barrelConfig.path, barrelSource, "utf8");
          } else {
            console.log(barrelConfig.path);
            console.log(barrelSource);
          }
        })
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
