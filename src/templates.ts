import { BarrelTemplateFn } from "./BarrelTemplateFn";

export const exportStarTemplate: BarrelTemplateFn = ({ files }) =>
  files.map((file) => `export * from "./${file.path}";`).join("\n");

export const exportDefaultAsNameTemplate: BarrelTemplateFn = ({ files }) =>
  files
    .map((file) => `export { default as ${file.name} } from "./${file.path}";`)
    .join("\n");
