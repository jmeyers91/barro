# barrelboy

Flexible barrel file generation for Javascript and Typescript with watching built-in.

## Usage

Build barrels once

```
npx barrelboy barrels.js --write
```

Build barrels and rebuild when relevant files are added or removed.

```
npx barrelboy barrels.js --write --watch
```

The `barrels.js` file defines everything needed to watch your source files and generate barrel files when files are added or deleted. Here's an example barrel file that defines two barrels.

```js
module.exports = () => [
  {
    path: "src/models/index.ts",
    matchDirectory: "src/models",
    match: "**/*Model.ts",
  },
  {
    path: "src/fns/index.ts",
    matchDirectory: "src/fns",
    match: "**/*.ts",
  },
];
```

## Config

- `path` - The path the barrel file should be written to.
- `match` - The glob or array of globs to use when searching for files to include in the barrel.
- `matchDirectory` - The root directory to search for files to include in the barrel.
- `matchIgnore` - The optional array of globs to ignore when seaching for files. Default: `[path, "**/*.test.*"]`
- `template` - The [handlebars](https://www.npmjs.com/package/handlebars) template string or function to use when generating barrel files. Defaults to `export * from './file/path'` for every matched file.

### Custom templates

You can include custom barrel templates in your barrel config file using the `template` field. The template can be either a handlebars template string or a function that returns a string.

#### Custom handlebars template

You can use [handlebars](https://www.npmjs.com/package/handlebars) templates to generate custom barrels.

```js
const { readFileSync } = require("fs");

module.exports = ({ Handlebars }) => {
  Handlebars.registerHelper("loud", (str) => str.toUpperCase());

  return [
    {
      path: "src/models/index.ts",
      matchDirectory: "src/models",
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
    path: "src/models/index.ts",
    matchDirectory: "src/models",
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
