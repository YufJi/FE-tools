<h1 align="center">Welcome to curiosity-builder 👋</h1>

> library build tools

## Install

```sh
npm install -g curiosity-builder
```

## Usage

```sh
curiosity-builder build
```

## Config

```js
// .hulkrc.js

module.exports = {
  entry: [] || '', // 仅rollup才适用
  cjs: {
    type: 'babel' || 'rollup',
    minify: Boolean,
  },
  importLibToEs: Boolean, // 仅esm才适用
  target: 'browser' || 'node',
  runtimeHelpers: {},
  extraBabelPresets = [],
  extraBabelPlugins = [],
  browserFiles = ['src/xxxx'],
  nodeFiles = ['src/xxxx'],
  nodeVersion,
  lessInBabelMode: {},
  sassInBabelMode: {},

  extractCSS = false,
  injectCSS = true,
  cssModules: modules,
  autoprefixer: autoprefixerOpts,
  include = /node_modules/,
  namedExports,
  extraPostCSSPlugins = [],
  lessInRollupMode = {},
  sassInRollupMode = {},
}
```
