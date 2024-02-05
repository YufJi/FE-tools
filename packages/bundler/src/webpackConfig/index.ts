import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { WebpackConfiguration, WebpackConfigOptions } from '../types';
import { makeArray } from '../utils';
import { cssConfig } from './css';
import { devConfig } from './dev';
import { prodConfig } from './prod';

export function webpackConfig(options: WebpackConfigOptions) {
  const isDev = process.env.NODE_ENV === 'development';
  const { root, config } = options;
  
  const {
    mode,
    context = root,
    entry,
    html,
    publicPath,
    dest = 'dist',
    externals,
    alias,
    tsConfigFile = 'tsconfig.json',
    extraTranspileIncludes,
    configWebpack,
    analyzer,
    extarRules = [],
    extraPlugins = []
  } = config;

  const tsLoaderOptions = {
    transpileOnly: true,
    configFile: path.resolve(root, tsConfigFile)
  };

  const rules: WebpackConfiguration['module']['rules'] = [{
    test: /\.m?jsx?$/,
    include: [root],
    use: {
      loader: require.resolve('babel-loader'),
    }
  },  {
    test: /\.tsx?$/,
    include: [root],
    use: [{
      loader: require.resolve('babel-loader'),
    }, {
      loader: require.resolve('ts-loader'),
      options: tsLoaderOptions
    }]
  }];

  if (extraTranspileIncludes?.length) {
    rules.push({
      test: /\.(j|t)sx?$/,
      include: makeArray(extraTranspileIncludes),
      use: [{
        loader: require.resolve('babel-loader'),
      }, {
        loader: require.resolve('ts-loader'),
        options: tsLoaderOptions
      }]
    });
  }

  const plugins = [];

  if (html) {
    for (const key in html) {
      const options = html[key];
      plugins.push(new HtmlWebpackPlugin({
        filename: `${key}.html`,
        ...options,
      }));
    }
  }

  if (analyzer) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  const webpackConfig: WebpackConfiguration = {
    mode: mode ?? isDev ? 'development' : 'production',
    context,
    entry,
    output: {
      publicPath,
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: path.resolve(root, dest),
      clean: true
    },
    externals,
    resolve: {
      alias,
      extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
        '.wasm',
        '.mjs',
      ],
      symlinks: true,
      modules: [
        'node_modules',
        path.join(__dirname, '../../node_modules')
      ]
    },
    resolveLoader: {
      modules: [
        'node_modules',
        path.join(__dirname, '../../node_modules')
      ]
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /\/node_modules\//,
            name: 'vendors',
            chunks: 'all',
          }
        }
      }
    },
    module: {
      rules: [
        ...rules,
        ...extarRules
      ],
    },
    plugins: [
      ...plugins,
      ...extraPlugins
    ],
    stats: 'errors-only'
  };

  cssConfig(webpackConfig, options);

  if (configWebpack) {
    configWebpack(webpackConfig);
  }

  if (isDev) {
    devConfig(webpackConfig, options);
  } else {
    prodConfig(webpackConfig, options);
  }

  return webpackConfig;
}
