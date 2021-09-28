/* eslint-disable func-names */
import { basename, extname, join } from 'path';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import NpmImport from 'less-plugin-npm-import';
import { camelCase } from 'lodash';
import tempDir from 'temp-dir';
import autoprefixer from 'autoprefixer';
import svgr from '@svgr/rollup';

import getBabelConfig from './getBabelConfig';

export default function (opts) {
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
    runtimeHelpers: runtimeHelpersOpts,
    replace: replaceOpts,
    nodeVersion,
    typescriptOpts,
    nodeResolveOpts = {},
    lessInRollupMode = {},
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
    babelHelpers: 'bundled',
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
          cacheDir: `${tempDir}/.rollup.tscache`,
          tsconfig: join(cwd, 'tsconfig.json'),
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
            exports: 'named',
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
}
