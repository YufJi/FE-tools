/* eslint-disable func-names */
const { basename, extname, join } = require('path');
const { terser } = require('rollup-plugin-terser');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const json = require('rollup-plugin-json');
const nodeResolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const commonjs = require('rollup-plugin-commonjs');
const postcss = require('rollup-plugin-postcss');
const NpmImport = require('less-plugin-npm-import');
const { camelCase } = require('lodash');
const tempDir = require('temp-dir');
const autoprefixer = require('autoprefixer');
const svgr = require('@svgr/rollup').default;

const getBabelConfig = require('./getBabelConfig');

module.exports = function (opts) {
  const { type, entry, cwd, importLibToEs, bundleOpts } = opts;
  const {
    umd,
    esm,
    cjs,
    file,
    target = 'browser',
    extractCSS = false,
    injectCSS = true,
    cssModules: modules,
    extraPostCSSPlugins = [],
    extraBabelPresets = [],
    extraBabelPlugins = [],
    autoprefixer: autoprefixerOpts,
    include = /node_modules/,
    namedExports,
    runtimeHelpers: runtimeHelpersOpts,
    replace: replaceOpts,
    nodeVersion,
    typescriptOpts,
    nodeResolveOpts = {},
    disableTypeCheck,
    lessInRollupMode = {},
    sassInRollupMode = {},
  } = bundleOpts;
  const entryExt = extname(entry);
  const name = file || basename(entry, entryExt);
  const isTypeScript = /.tsx?/.test(entryExt);
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'];

  let pkg = {};
  try {
    pkg = require(join(cwd, 'package.json')); // eslint-disable-line
  } catch (e) {
    console.log(e);
  }

  // cjs 不给浏览器用，所以无需 runtimeHelpers
  const runtimeHelpers = type === 'cjs' ? false : runtimeHelpersOpts;
  const babelOpts = {
    ...getBabelConfig({
      type,
      target: type === 'esm' ? 'browser' : target,
      typescript: false,
      runtimeHelpers,
      nodeVersion,
    }),
    runtimeHelpers,
    exclude: /\/node_modules\//,
    babelrc: false,
    // ref: https://github.com/rollup/rollup-plugin-babel#usage
    extensions,
  };
  if (importLibToEs && type === 'esm') {
    babelOpts.plugins.push(require.resolve('./importLibToEs'));
  }
  babelOpts.presets.push(...extraBabelPresets);
  babelOpts.plugins.push(...extraBabelPlugins);

  // rollup configs
  const input = join(cwd, entry);
  const format = type;

  // ref: https://rollupjs.org/guide/en#external
  // 潜在问题：引用包的子文件时会报 warning，比如 @babel/runtime/helpers/esm/createClass
  // 解决方案：可以用 function 处理
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];
  // umd 只要 external peerDependencies
  const externalPeerDeps = Object.keys(pkg.peerDependencies || {});

  function testExternal(pkgs, id) {
    return pkgs.includes(id);
  }

  const terserOpts = {
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  };
  const plugins = [
    svgr(),
    postcss({
      extract: extractCSS,
      inject: injectCSS,
      modules,
      use: [
        [
          'less',
          {
            plugins: [new NpmImport({ prefix: '~' })],
            javascriptEnabled: true,
            ...lessInRollupMode,
          },
        ],
        [
          'sass',
          {
            ...sassInRollupMode,
          },
        ],
      ],
      plugins: [
        autoprefixer(autoprefixerOpts),
        ...extraPostCSSPlugins,
      ],
    }),
    ...(replaceOpts && Object.keys(replaceOpts || {}).length ? [replace(replaceOpts)] : []),
    nodeResolve({
      mainFields: ['module', 'jsnext:main', 'main'],
      extensions,
      ...nodeResolveOpts,
    }),
    ...(isTypeScript
      ? [
        typescript({
          // @see https://github.com/ezolenko/rollup-plugin-typescript2/issues/105
          objectHashIgnoreUnknownHack: true,
          cacheRoot: `${tempDir}/.rollup_plugin_typescript2_cache`,
          // TODO: 支持往上找 tsconfig.json
          // 比如 lerna 的场景不需要每个 package 有个 tsconfig.json
          tsconfig: join(cwd, 'tsconfig.json'),
          tsconfigDefaults: {
            compilerOptions: {
              // Generate declaration files by default
              declaration: true,
            },
          },
          tsconfigOverride: {
            compilerOptions: {
              // Support dynamic import
              target: 'esnext',
            },
          },
          check: !disableTypeCheck,
          ...(typescriptOpts || {}),
        }),
      ]
      : []),
    babel(babelOpts),
    json(),
  ];

  switch (type) {
    case 'esm':
      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${(esm && esm.file) || `${name}.esm`}.js`),
          },
          plugins: [...plugins, ...(esm && esm.minify ? [terser(terserOpts)] : [])],
          external: testExternal.bind(null, external),
        },
        ...(esm && esm.mjs
          ? [
            {
              input,
              output: {
                format,
                file: join(cwd, `dist/${(esm && esm.file) || `${name}`}.mjs`),
              },
              plugins: [
                ...plugins,
                replace({
                  'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                terser(terserOpts),
              ],
              external: testExternal.bind(null, externalPeerDeps),
            },
          ]
          : []),
      ];

    case 'cjs':
      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${(cjs && cjs.file) || name}.js`),
          },
          plugins: [...plugins, ...(cjs && cjs.minify ? [terser(terserOpts)] : [])],
          external: testExternal.bind(null, external),
        },
      ];

    case 'umd':
      // Add umd related plugins
      plugins.push(commonjs({
        include,
        namedExports,
      }));

      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${(umd && umd.file) || `${name}.umd`}.js`),
            globals: umd && umd.globals,
            name: (umd && umd.name) || (pkg.name && camelCase(basename(pkg.name))),
          },
          plugins: [
            ...plugins,
            replace({
              'process.env.NODE_ENV': JSON.stringify('development'),
            }),
          ],
          external: testExternal.bind(null, externalPeerDeps),
        },
        ...(umd && umd.minFile === true
          ? [
            {
              input,
              output: {
                format,
                file: join(cwd, `dist/${(umd && umd.file) || `${name}.umd`}.min.js`),
                globals: umd && umd.globals,
                name: (umd && umd.name) || (pkg.name && camelCase(basename(pkg.name))),
              },
              plugins: [
                ...plugins,
                replace({
                  'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                terser(terserOpts),
              ],
              external: testExternal.bind(null, externalPeerDeps),
            },
          ] : []),
      ];

    default:
      throw new Error(`Unsupported type ${type}`);
  }
};
