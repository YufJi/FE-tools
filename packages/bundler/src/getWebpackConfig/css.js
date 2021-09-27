import { extname } from 'path';
// import autoprefixer from 'autoprefixer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const DEFAULT_BROWSERS = [
  '>1%',
  'last 4 versions',
  'Firefox ESR',
  'not ie < 9',
];

export default function (webpackConfig, opts) {
  const { isDev = (process.env.NODE_ENV === 'development'), disableCompress } = opts;
  const cssOpts = {
    importLoaders: 1,
    sourceMap: !opts.disableCSSSourceMap,
    ...(opts.cssLoaderOptions || {}),
  };
  const postcssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebookincubator/create-react-app/issues/2677
    ident: 'postcss',
    plugins: [
      [require.resolve('postcss-flexbugs-fixes')],
      [require.resolve('autoprefixer'), {
        overrideBrowserslist: DEFAULT_BROWSERS,
        flexbox: 'no-2009',
        ...(opts.autoprefixer || {}),
      }],
      ...(opts.extraPostCSSPlugins ? opts.extraPostCSSPlugins : []),
      ...(isDev || disableCompress
        ? []
        : [
          require('cssnano')({
            preset: [
              'default',
              opts.cssnano || {
                mergeRules: false,

                normalizeUrl: false,
              },
            ],
          }),
        ]),
    ],
  };
  const cssModulesConfig = {
    modules: true,
  };

  const lessOptions = {
    ...(opts.lessLoaderOptions || {}),
  };

  function applyCSSRules(rule, { cssModules, less }) {
    rule.use = rule.use || [];

    if (!opts.ssr) {
      if (opts.styleLoader) {
        rule.use.push({
          loader: require.resolve('style-loader'),
          options: {
            base: opts.styleLoader.base || 0,
            convertToAbsoluteUrls: true,
          },
        });
      } else {
        rule.use.push({
          loader: require('mini-css-extract-plugin').loader,
          options: {
            publicPath: isDev ? '/' : opts.cssPublicPath,
          },
        });
      }
    }
    // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/90
    const cssLoader = opts.ssr ? 'css-loader/locals' : 'css-loader';

    if (isDev && cssModules && opts.cssModulesTypescriptLoader) {
      rule.use.push({
        loader: require.resolve('css-modules-typescript-loader'),
      });
    }

    rule.use.push({
      loader: require.resolve(cssLoader),
      options: {
        ...cssOpts,
        ...(cssModules ? cssModulesConfig : {}),
      },
    });

    rule.use.push({
      loader: require.resolve('postcss-loader'),
      options: { postcssOptions },
    });

    if (less) {
      rule.use.push({
        loader: require.resolve('less-loader'),
        options: lessOptions,
      });
    }

    webpackConfig.module.rules.push(rule);
  }

  if (opts.cssModulesExcludes) {
    opts.cssModulesExcludes.forEach((exclude) => {
      const rule = {
        test: (filePath) => {
          if (exclude instanceof RegExp) {
            return exclude.test(filePath);
          } else {
            return filePath.indexOf(exclude) > -1;
          }
        },
      };

      const ext = extname(exclude).toLowerCase();
      applyCSSRules(rule, {
        less: ext === '.less',
      });
    });
  }

  applyCSSRules({
    test: /\.module\.css$/,
  }, {
    cssModules: true,
  });
  applyCSSRules({
    test: /\.module\.less$/,
  }, {
    cssModules: true,
    less: true,
  });

  function cssExclude(filePath) {
    if (/node_modules/.test(filePath)) {
      return true;
    }

    if (/\.module\.(css|less)$/.test(filePath)) return true;

    if (opts.cssModulesExcludes) {
      for (const exclude of opts.cssModulesExcludes) {
        if (filePath.indexOf(exclude) > -1) return true;
      }
    }
    return false;
  }

  applyCSSRules({
    test: /\.css$/,
    exclude: [cssExclude],
  }, {
    cssModules: opts.enableCSSModules,
  });
  applyCSSRules({
    test: /\.css$/,
    include: [/node_modules/],
  }, {});
  applyCSSRules({
    test: /\.less$/,
    exclude: [cssExclude],
  }, {
    cssModules: opts.enableCSSModules,
    less: true,
  });
  applyCSSRules({
    test: /\.less$/,
    include: [/node_modules/],
  }, {
    less: true,
  });

  const hash = !isDev && opts.hash ? '.[contenthash:8]' : '';
  if (!opts.ssr && !opts.styleLoader) {
    webpackConfig.plugins.push(new MiniCssExtractPlugin({
      filename: `[name]${hash}.css`,
      chunkFilename: `[name]${hash}.css`,
    }));
  }
}
