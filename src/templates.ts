import { BarrelTemplateFn } from "./BarrelTemplateFn";

export const exportStar: BarrelTemplateFn = ({ files }) =>
  files.map((file) => `export * from "./${file.path}";`).join("\n");

export const exportDefaultAsName: BarrelTemplateFn = ({ files }) =>
  files
    .map((file) => `export { default as ${file.name} } from "./${file.path}";`)
    .join("\n");
