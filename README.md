# barro

Flexible barrel file generation for Javascript and Typescript with watching built-in.

## Usage

Build barrels once

```
npx barro --write
```

Build barrels and rebuild when relevant files are added or removed.

```
npx barro --write --watch
```

Define your barrels in `./barro.js`:

```js
module.exports = () => [
  {
    out: "src/models/index.ts",
    match: "**/*Model.ts",
  },
  {
    out: "src/fns/index.ts",
    match: "**/*.ts",
  },
];
```

Alternatively, you can pass the path of your barro config file:

```
npx barro barrel-config.js --write --watch
```

## Config

- `out` - The path the barrel file should be written to.
- `match` - The glob or array of globs to use when searching for files to include in the barrel.
- `matchDirectory` - The root directory to use when searching for files. Default: `path.parse(out).dir`
- `matchIgnore` - The optional array of globs to ignore when seaching for files. Default: `[out, "**/*.test.*"]`
- `template` - The [handlebars](https://www.npmjs.com/package/handlebars) template string or function to use when generating barrel files. Defaults to `export * from "./file/path";` for every matched file.

### Custom templates

You can include custom barrel templates in your barrel config file using the `template` field. The template can be either a handlebars template string or a function that returns a string. Custom templates are provided a `files` input with these fields:

```ts
{
  relativePath: string;
  absolutePath: string;
  path: string;
  name: string;
}
```

#### Custom handlebars template

You can use [handlebars](https://www.npmjs.com/package/handlebars) templates to generate custom barrels.

```js
const { readFileSync } = require("fs");

module.exports = ({ Handlebars }) => {
  Handlebars.registerHelper("loud", (str) => str.toUpperCase());

  return [
    {
      out: "src/models/index.ts",
      match: "**/*Model.ts",
      template: fs.readFileSync("./modelBarrel.hbs", "utf8"),
    },
  ];
};
```

#### Custom function template

You can use plain JS functions to generate custom barrels.

```js
module.exports = () => [
  {
    out: "src/models/index.ts",
    match: "**/*Model.ts",
    template({ files }) {
      return files
        .map(
          (file) =>
            `export { default as ${file.name.toUpperCase()} } from "./${
              file.path
            }";`
        )
        .join("\n");
    },
  },
];
```

## License

MIT
