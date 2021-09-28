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
        : [require.resolve('cssnano'), {
          preset: ['default', opts.cssnano || {
            mergeRules: false,
            normalizeUrl: false,
          }],
        },
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
      rule.use.push({
        loader: MiniCssExtractPlugin.loader,
        options: {},
      });
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

  applyCSSRules({
    test: /\.module\.css$/,
    exclude: opts.cssModulesExcludes,
  }, {
    cssModules: true,
  });
  applyCSSRules({
    test: /\.module\.less$/,
    exclude: opts.cssModulesExcludes,
  }, {
    cssModules: true,
    less: true,
  });

  function cssExclude(filePath) {
    if (/\.module\.(css|less)$/.test(filePath)) return true;

    return false;
  }

  applyCSSRules({
    test: /\.css$/,
    exclude: [cssExclude],
  }, {
    cssModules: false,
  });

  applyCSSRules({
    test: /\.less$/,
    exclude: [cssExclude],
  }, {
    cssModules: false,
    less: true,
  });

  const hash = !isDev && opts.hash ? '.[contenthash:8]' : '';
  if (!opts.ssr) {
    webpackConfig.plugins.push(new MiniCssExtractPlugin({
      filename: `[name]${hash}.css`,
      chunkFilename: `[name]${hash}.css`,
    }));
  }
}
