import * as webpack from 'webpack';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type { 
  WebpackConfigOptions 
} from '../types';


const DEFAULT_BROWSERS = [
  '>1%',
  'last 4 versions',
  'Firefox ESR',
  'not ie < 9',
];

export function cssConfig(webpackConfig: webpack.Configuration, options: WebpackConfigOptions) {
  const isDev = process.env.NODE_ENV === 'development';

  const { config } = options;
  const {
    cssLoaderOptions = {},
    cssModulesExcludes,
    lessLoaderOptions,
    hash,
    extraPostCSSPlugins = [],
    autoprefixer = {},
  } = config;

  cssRules({
    test: /\.module\.css$/,
    exclude: cssModulesExcludes,
  }, {
    modules: true,
  });

  cssRules({
    test: /\.module\.less$/,
    exclude: cssModulesExcludes,
  }, {
    modules: true,
    less: true,
  });

  cssRules({
    test: /\.css$/,
    exclude: [/\.module\.(css|less)$/],
  }, {
    modules: false,
  });

  cssRules({
    test: /\.less$/,
    exclude: [/\.module\.(css|less)$/],
  }, {
    modules: false,
    less: true,
  });

  const isHash = hash ?? !isDev;

  webpackConfig.plugins?.push(new MiniCssExtractPlugin({
    filename: isHash ? '[name].[contenthash].css' : '[name].css',
    chunkFilename: isHash ? '[id].[contenthash].css' : '[id].css',
  }));

  function cssRules(rule: webpack.RuleSetRule, options) {
    rule.use = (rule.use || []) as any[];

    rule.use.push({
      loader: MiniCssExtractPlugin.loader,
    });

    const cssOptions = {
      importLoaders: 1,
      ...cssLoaderOptions
    };

    rule.use.push({
      loader: require.resolve('css-loader'),
      options: {
        ...cssOptions,
        modules: options?.modules,
      },
    });

    rule.use.push({
      loader: require.resolve('postcss-loader'),
      options: { 
        postcssOptions: {
          ident: 'postcss',
          plugins: [
            [require.resolve('autoprefixer'), {
              overrideBrowserslist: DEFAULT_BROWSERS,
              flexbox: 'no-2009',
              ...autoprefixer
            }],
            ...extraPostCSSPlugins,
          ]
        }
      },
    });

    if (options?.less) {
      rule.use.push({
        loader: require.resolve('less-loader'),
        options: {
          lessOptions: lessLoaderOptions
        }
      });
    }

    webpackConfig.module?.rules.push(rule);
  }
}
