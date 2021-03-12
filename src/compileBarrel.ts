import handlebars from "handlebars";
import { Barrel } from "./types/Barrel";
import { BarrelTemplateFn } from "./types/BarrelTemplateFn";
import { findBarrelFiles } from "./findBarrelFiles";
import { exportStarTemplate as defaultTemplate } from "./utils/templates";
import { defaultBanner } from "./utils/defaultBanner";

export async function compileBarrel(barrel: Barrel): Promise<string> {
  const templateFn = getBarrelTemplateFn(barrel);
  const files = await findBarrelFiles(barrel);
  const barrelSrc = templateFn({ files });

  return `${barrel.banner ?? defaultBanner}${barrelSrc}`;
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
