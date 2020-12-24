import { BarrelFile } from "./BarrelFile";

export type BarrelTemplateFn = (options: { files: BarrelFile[] }) => string;
