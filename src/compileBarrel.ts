import handlebars from "handlebars";
import { Barrel } from "./Barrel";
import { BarrelTemplateFn } from "./BarrelTemplateFn";
import { findBarrelFiles } from "./findBarrelFiles";
import { exportStarTemplate as defaultTemplate } from "./templates";

const banner = `/**
* Generated by barrelboy.
* Do not edit.
*/`;

export async function compileBarrel(barrel: Barrel): Promise<string> {
  const templateFn = getBarrelTemplateFn(barrel);
  const files = await findBarrelFiles(barrel);
  const barrelSrc = templateFn({ files });

  return `${banner}\n\n${barrelSrc}\n`;
}

function getBarrelTemplateFn(barrel: Barrel): BarrelTemplateFn {
  if (!barrel.template) {
    return defaultTemplate;
  }
  if (typeof barrel.template === "function") {
    return barrel.template;
  }
  return handlebars.compile(barrel.template);
}
