'use strict';

var path = require('path');
var rimraf = require('rimraf');
var lodash = require('lodash');
var signale = require('signale');
var rollup$1 = require('rollup');
var rollupPluginTerser = require('rollup-plugin-terser');
var commonjs = require('@rollup/plugin-commonjs');
var babel$1 = require('@rollup/plugin-babel');
var replace = require('@rollup/plugin-replace');
var json = require('@rollup/plugin-json');
var nodeResolve = require('@rollup/plugin-node-resolve');
var typescript = require('@rollup/plugin-typescript');
var postcss = require('rollup-plugin-postcss');
var NpmImport = require('less-plugin-npm-import');
var tempDir = require('temp-dir');
var autoprefixer = require('autoprefixer');
var svgr = require('@svgr/rollup');
var fs = require('fs');
var vfs = require('vinyl-fs');
var through = require('through2');
var slash = require('slash');
var chokidar = require('chokidar');
var babel$2 = require('@babel/core');
var gulpTs = require('gulp-typescript');
var gulpLess = require('gulp-less');
var gulpIf = require('gulp-if');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var rimraf__default = /*#__PURE__*/_interopDefaultLegacy(rimraf);
var signale__default = /*#__PURE__*/_interopDefaultLegacy(signale);
var rollup__default = /*#__PURE__*/_interopDefaultLegacy(rollup$1);
var commonjs__default = /*#__PURE__*/_interopDefaultLegacy(commonjs);
var babel__default = /*#__PURE__*/_interopDefaultLegacy(babel$1);
var replace__default = /*#__PURE__*/_interopDefaultLegacy(replace);
var json__default = /*#__PURE__*/_interopDefaultLegacy(json);
var nodeResolve__default = /*#__PURE__*/_interopDefaultLegacy(nodeResolve);
var typescript__default = /*#__PURE__*/_interopDefaultLegacy(typescript);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);
var NpmImport__default = /*#__PURE__*/_interopDefaultLegacy(NpmImport);
var tempDir__default = /*#__PURE__*/_interopDefaultLegacy(tempDir);
var autoprefixer__default = /*#__PURE__*/_interopDefaultLegacy(autoprefixer);
var svgr__default = /*#__PURE__*/_interopDefaultLegacy(svgr);
var vfs__default = /*#__PURE__*/_interopDefaultLegacy(vfs);
var through__default = /*#__PURE__*/_interopDefaultLegacy(through);
var slash__default = /*#__PURE__*/_interopDefaultLegacy(slash);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);
var babel__default$1 = /*#__PURE__*/_interopDefaultLegacy(babel$2);
var gulpTs__default = /*#__PURE__*/_interopDefaultLegacy(gulpTs);
var gulpLess__default = /*#__PURE__*/_interopDefaultLegacy(gulpLess);
var gulpIf__default = /*#__PURE__*/_interopDefaultLegacy(gulpIf);

/* eslint-disable func-names */

function getBabelConfig (opts) {
  const {
    target, typescript, type, runtimeHelpers, filePath, browserFiles, nodeFiles, nodeVersion,
  } = opts;

  let isBrowser = target === 'browser';
  // rollup 场景下不会传入 filePath
  if (filePath) {
    if (isBrowser) {
      if (nodeFiles.includes(filePath)) isBrowser = false;
    } else if (browserFiles.includes(filePath)) isBrowser = true;
  }

  const targets = isBrowser ? {
    chrome: '51',
    ie: '9',
  } : { node: nodeVersion || 6 };

  return {
    presets: [
      ...(typescript ? [require.resolve('@babel/preset-typescript')] : []),
      [require.resolve('@babel/preset-env'), {
        loose: true,
        targets,
        modules: type === 'esm' ? false : (type === 'cjs' && !isBrowser) ? 'cjs' : 'auto',
      }],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
      ...(runtimeHelpers
        ? [[require.resolve('@babel/plugin-transform-runtime'), { ...runtimeHelpers, useESModules: isBrowser && (type === 'esm') }]]
        : []),
    ],
  };
}

/* eslint-disable func-names */

function getRollupConfig (opts) {
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
  const entryExt = path.extname(entry);
  const name = file || path.basename(entry, entryExt);
  const isTypeScript = /.tsx?/.test(entryExt);
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'];

  let pkg = {};
  try {
    pkg = require(path.join(cwd, 'package.json')); // eslint-disable-line
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
  const input = path.join(cwd, entry);
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
    svgr__default["default"](),
    postcss__default["default"]({
      extract: extractCSS,
      inject: injectCSS,
      modules,
      use: [
        [
          'less',
          {
            plugins: [new NpmImport__default["default"]({ prefix: '~' })],
            javascriptEnabled: true,
            ...lessInRollupMode,
          },
        ],
      ],
      plugins: [
        autoprefixer__default["default"](autoprefixerOpts),
        ...extraPostCSSPlugins,
      ],
    }),
    ...(replaceOpts && Object.keys(replaceOpts || {}).length ? [replace__default["default"](replaceOpts)] : []),
    nodeResolve__default["default"]({
      mainFields: ['module', 'jsnext:main', 'main'],
      extensions,
      ...nodeResolveOpts,
    }),
    ...(isTypeScript
      ? [
        typescript__default["default"]({
          cacheDir: `${tempDir__default["default"]}/.rollup.tscache`,
          tsconfig: path.join(cwd, 'tsconfig.json'),
          ...(typescriptOpts || {}),
        }),
      ]
      : []),
    babel__default["default"](babelOpts),
    json__default["default"](),
  ];

  switch (type) {
    case 'esm':
      return [
        {
          input,
          output: {
            format,
            file: path.join(cwd, `dist/${(esm && esm.file) || `${name}.esm`}.js`),
          },
          plugins: [...plugins, ...(esm && esm.minify ? [rollupPluginTerser.terser(terserOpts)] : [])],
          external: testExternal.bind(null, external),
        },
        ...(esm && esm.mjs
          ? [
            {
              input,
              output: {
                format,
                file: path.join(cwd, `dist/${(esm && esm.file) || `${name}`}.mjs`),
              },
              plugins: [
                ...plugins,
                replace__default["default"]({
                  'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                rollupPluginTerser.terser(terserOpts),
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
            file: path.join(cwd, `dist/${(cjs && cjs.file) || name}.js`),
          },
          plugins: [...plugins, ...(cjs && cjs.minify ? [rollupPluginTerser.terser(terserOpts)] : [])],
          external: testExternal.bind(null, external),
        },
      ];

    case 'umd':
      // Add umd related plugins
      plugins.push(commonjs__default["default"]({
        include,
      }));

      return [
        {
          input,
          output: {
            format,
            file: path.join(cwd, `dist/${(umd && umd.file) || `${name}.umd`}.js`),
            globals: umd && umd.globals,
            name: (umd && umd.name) || (pkg.name && lodash.camelCase(path.basename(pkg.name))),
          },
          plugins: [
            ...plugins,
            replace__default["default"]({
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
                file: path.join(cwd, `dist/${(umd && umd.file) || `${name}.umd`}.min.js`),
                globals: umd && umd.globals,
                name: (umd && umd.name) || (pkg.name && lodash.camelCase(path.basename(pkg.name))),
              },
              plugins: [
                ...plugins,
                replace__default["default"]({
                  'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                rollupPluginTerser.terser(terserOpts),
              ],
              external: testExternal.bind(null, externalPeerDeps),
            },
          ] : []),
      ];

    default:
      throw new Error(`Unsupported type ${type}`);
  }
}

/* eslint-disable func-names */

function stripDotSlashPrefix(path) {
  return path.replace(/^\.\//, '');
}

function normalizeBundleOpts (entry, opts) {
  let clone = lodash.cloneDeep(opts);
  const stripedEntry = stripDotSlashPrefix(entry);
  if (clone.overridesByEntry) {
    Object.keys(clone.overridesByEntry).forEach((key) => {
      const stripedKey = stripDotSlashPrefix(key);
      if (stripedKey !== key) {
        clone.overridesByEntry[stripedKey] = clone.overridesByEntry[key];
      }
    });
    if (clone.overridesByEntry[stripedEntry]) {
      clone = lodash.merge(clone, clone.overridesByEntry[stripedEntry]);
    }
    delete clone.overridesByEntry;
  }
  return clone;
}

/* eslint-disable func-names */

async function build$1(entry, opts) {
  const { cwd, type, bundleOpts, importLibToEs } = opts;
  const rollupConfigs = getRollupConfig({
    cwd,
    type,
    entry,
    importLibToEs,
    bundleOpts: normalizeBundleOpts(entry, bundleOpts),
  });

  for (const rollupConfig of rollupConfigs) {
    if (opts.watch) {
      const watcher = rollup__default["default"].watch([
        {
          ...rollupConfig,
          watch: {},
        },
      ]);
      watcher.on('event', (event) => {
        if (event.error) {
          signale__default["default"].error(event.error);
        } else if (event.code === 'START') {
          signale__default["default"].info(`[${type}] Rebuild since file changed`);
        }
      });
    } else {
      const { output, ...input } = rollupConfig;
      const bundle = await rollup__default["default"].rollup(input);
      await bundle.write(output);
    }
  }
}

async function rollup (opts) {
  if (Array.isArray(opts.entry)) {
    const { entry: entries } = opts;
    for (const entry of entries) {
      await build$1(entry, opts);
    }
  } else {
    await build$1(opts.entry, opts);
  }
}

/* eslint-disable func-names */

async function babel (opts) {
  const {
    cwd,
    rootPath,
    type,
    watch,
    importLibToEs,
    bundleOpts,
  } = opts;
  const {
    target = 'browser',
    runtimeHelpers,
    extraBabelPresets = [],
    extraBabelPlugins = [],
    browserFiles = [],
    nodeFiles = [],
    nodeVersion,
    disableTypeCheck,
    lessInBabelMode,
  } = bundleOpts;

  const srcPath = path.join(cwd, 'src');
  const targetDir = type === 'esm' ? 'es' : 'lib';
  const targetPath = path.join(cwd, targetDir);

  signale__default["default"].info(`Clean ${targetDir} directory`);
  rimraf__default["default"].sync(targetPath);

  function transform(opts) {
    const { file, type } = opts;
    signale__default["default"].info(`[${type}] Transform: ${slash__default["default"](file.path).replace(`${cwd}/`, '')}`);

    const babelOpts = getBabelConfig({
      target,
      type,
      typescript: true,
      runtimeHelpers,
      filePath: slash__default["default"](path.relative(cwd, file.path)),
      browserFiles,
      nodeFiles,
      nodeVersion,
    });
    if (importLibToEs && type === 'esm') {
      babelOpts.plugins.push(require.resolve('./importLibToEs'));
    }
    babelOpts.presets.push(...extraBabelPresets);
    babelOpts.plugins.push(...extraBabelPlugins);

    return babel__default$1["default"].transform(file.contents, {
      ...babelOpts,
      filename: file.path,
    }).code;
  }

  function getTSConfig() {
    const tsconfigPath = path.join(cwd, 'tsconfig.json');
    const templateTsconfigPath = path.join(__dirname, '../template/tsconfig.json');

    if (fs.existsSync(tsconfigPath)) {
      return JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8')).compilerOptions || {};
    }
    if (rootPath && fs.existsSync(path.join(rootPath, 'tsconfig.json'))) {
      return JSON.parse(fs.readFileSync(path.join(rootPath, 'tsconfig.json'), 'utf-8')).compilerOptions || {};
    }
    return JSON.parse(fs.readFileSync(templateTsconfigPath, 'utf-8')).compilerOptions || {};
  }

  function createStream(src) {
    const tsConfig = getTSConfig();
    const babelTransformRegexp = disableTypeCheck ? /\.(t|j)sx?$/ : /\.jsx?$/;

    function isTsFile(path) {
      return /\.tsx?$/.test(path) && !path.endsWith('.d.ts');
    }

    function isTransform(path) {
      return babelTransformRegexp.test(path) && !path.endsWith('.d.ts');
    }

    return vfs__default["default"]
      .src(src, {
        allowEmpty: true,
        base: srcPath,
      })
      // 开启类型校验且是ts文件
      .pipe(gulpIf__default["default"]((f) => !disableTypeCheck && isTsFile(f.path), gulpTs__default["default"](tsConfig)))
      // 处理less文件
      .pipe(gulpIf__default["default"]((f) => lessInBabelMode && /\.less$/.test(f.path), gulpLess__default["default"]({ ...lessInBabelMode })))
      .pipe(gulpIf__default["default"](
        (f) => isTransform(f.path),
        through__default["default"].obj((file, env, cb) => {
          try {
            file.contents = Buffer.from(transform({
              file,
              type,
            }));
            // .jsx -> .js
            file.path = file.path.replace(path.extname(file.path), '.js');
            cb(null, file);
          } catch (e) {
            signale__default["default"].error(`Compiled faild: ${file.path}`);
            console.log(e);
            cb(null);
          }
        }),
      ))
      .pipe(vfs__default["default"].dest(targetPath));
  }

  return new Promise((resolve) => {
    createStream([
      path.join(srcPath, '**/*'),
    ]).on('end', () => {
      if (watch) {
        signale__default["default"].info('Start watch', srcPath);
        chokidar__default["default"]
          .watch(srcPath, {
            ignoreInitial: true,
          })
          .on('all', (event, fullPath) => {
            const relPath = fullPath.replace(srcPath, '');

            signale__default["default"].info(`[${event}] ${path.join(srcPath, relPath)}`);

            if (!fs.existsSync(fullPath)) return;

            if (fs.statSync(fullPath).isFile()) {
              createStream([fullPath]);
            }
          });
      }
      resolve();
    });
  });
}

/* eslint-disable func-names */

function getExistFile({ cwd, files, returnRelative }) {
  for (const file of files) {
    const absFilePath = path.join(cwd, file);
    if (fs.existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
}

/* eslint-disable func-names */

function testDefault(obj) {
  return obj.default || obj;
}

const CONFIG_FILES = [
  'curiosity.config.js',
];

function getUserConfig ({ cwd }) {
  const configFile = getExistFile({
    cwd,
    files: CONFIG_FILES,
    returnRelative: false,
  });

  if (configFile) {
    const userConfig = testDefault(require(configFile)); // eslint-disable-line
    return userConfig.build || userConfig;
  } else {
    const error = new Error("请检查根目录下是否存在配置文件'curiosity.config.js'！");
    console.warn(error.message);
    return {};
  }
}

function getBundleOpts(opts) {
  const { cwd } = opts;
  const entry = getExistFile({
    cwd,
    files: ['src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js'],
    returnRelative: true,
  });
  const userConfig = getUserConfig({ cwd });
  const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
  return userConfigs.map((userConfig) => {
    const bundleOpts = lodash.merge(
      {
        entry,
      },
      userConfig,
    );

    // Support config esm: 'rollup' and cjs: 'rollup'
    if (typeof bundleOpts.esm === 'string') {
      bundleOpts.esm = { type: bundleOpts.esm };
    }
    if (typeof bundleOpts.cjs === 'string') {
      bundleOpts.cjs = { type: bundleOpts.cjs };
    }

    return bundleOpts;
  });
}

async function build(opts) {
  const { cwd, watch, rootPath } = opts;
  // Get user config
  const bundleOptsArray = getBundleOpts(opts);
  for (const bundleOpts of bundleOptsArray) {
    // Clean dist
    signale__default["default"].info('Clean dist directory');
    rimraf__default["default"].sync(path.join(cwd, 'dist'));

    // Build umd
    if (bundleOpts.umd) {
      signale__default["default"].info('Build umd');
      await rollup({
        cwd,
        type: 'umd',
        entry: bundleOpts.entry,
        watch,
        bundleOpts,
      });
    }

    // Build cjs
    if (bundleOpts.cjs) {
      const { cjs } = bundleOpts;
      signale__default["default"].info(`Build cjs with ${cjs.type}`);
      if (cjs.type === 'babel') {
        await babel({ cwd, rootPath, watch, type: 'cjs', bundleOpts });
      } else {
        await rollup({
          cwd,
          type: 'cjs',
          entry: bundleOpts.entry,
          watch,
          bundleOpts,
        });
      }
    }

    // Build esm
    if (bundleOpts.esm) {
      const { esm } = bundleOpts;
      signale__default["default"].info(`Build esm with ${esm.type}`);
      const importLibToEs = esm && esm.importLibToEs;
      if (esm && esm.type === 'babel') {
        await babel({ cwd, rootPath, watch, type: 'esm', importLibToEs, bundleOpts });
      } else {
        await rollup({
          cwd,
          type: 'esm',
          entry: bundleOpts.entry,
          importLibToEs,
          watch,
          bundleOpts,
        });
      }
    }
  }
}

async function index (options) {
  await build(options);
}

module.exports = index;
