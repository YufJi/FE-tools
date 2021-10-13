/* eslint-disable global-require */
import { join, resolve, relative } from 'path';
import { EOL } from 'os';
import assert from 'assert';
import { isPlainObject } from 'lodash';
import webpack from 'webpack';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import resolveDefine from './resolveDefine';
import { makeArray } from '../utils';

function getWebpackConfig(opts) {
  const {
    cwd,
    isDev = (process.env.NODE_ENV === 'development'),
  } = opts || {};

  const webpackConfig = {
    entry: {},
    module: {
      rules: [],
    },
    plugins: [],
  };

  // mode
  webpackConfig.mode = 'development';

  // entry
  if (isPlainObject(opts.entry)) {
    // eslint-disable-next-line guard-for-in
    for (const key in opts.entry) {
      const entry = webpackConfig.entry[key] = [];
      makeArray(opts.entry[key]).forEach((file) => {
        entry.push(file);
      });
    }
  } else {
    const entry = webpackConfig.entry.index = [];
    makeArray(opts.entry).forEach((file) => {
      entry.push(file);
    });
  }

  // output
  const absOutputPath = resolve(cwd, opts.outputPath || 'dist');

  webpackConfig.output = {
    path: absOutputPath,
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: opts.publicPath,
  };

  // resolve
  webpackConfig.resolve = {
    symlinks: true,
    modules: [
      'node_modules',
      join(__dirname, '../../node_modules'),
      // Fix yarn global resolve problem
      join(__dirname, '../../../'),
    ],
    extensions: [
      '.wasm',
      '.mjs',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
    ],
  };

  if (opts.alias) {
    // eslint-disable-next-line guard-for-in
    webpackConfig.resolve.alias = {};
    for (const key in opts.alias) {
      webpackConfig.resolve.alias[key] = opts.alias[key];
    }
  }

  // resolveLoader
  webpackConfig.resolveLoader = {
    modules: [
      'node_modules',
      join(__dirname, '../../node_modules'),
    ],
  };

  // optimization
  webpackConfig.optimization = {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /\/node_modules\//,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: 'single',
  };

  // module -> include
  const urlLoader = {
    include: [
      /\.(png|jpe?g|gif|ttf)$/i,
      /\.(mp3|dae)$/,
    ],
    use: [{
      loader: require.resolve('url-loader'),
      options: {
        limit: opts.inlineLimit || 8192,
        name: 'static/[name].[hash:8].[ext]',
      },
    }],
  };

  if (opts.urlLoaderIncludes) {
    opts.urlLoaderIncludes.forEach((include) => {
      urlLoader.include.push(include);
    });
  }

  webpackConfig.module.rules.push(urlLoader);

  // module -> mjs
  webpackConfig.module.rules.push({
    test: /\.mjs$/,
    include: [opts.cwd],
    use: [require.resolve('babel-loader')],
  });

  // module -> js
  webpackConfig.module.rules.push({
    test: /\.js$/,
    include: [opts.cwd],
    exclude: [/node_modules/],
    use: [require.resolve('babel-loader')],
  });

  // module -> jsx
  webpackConfig.module.rules.push({
    test: /\.jsx$/,
    include: [opts.cwd],
    use: [require.resolve('babel-loader')],
  });

  // module -> extraBabelIncludes
  if (opts.extraBabelIncludes) {
    webpackConfig.module.rules.push({
      test: /\.jsx?$/,
      include: makeArray(opts.extraBabelIncludes),
      use: [require.resolve('babel-loader')],
    });
  }

  // module -> tsx?
  webpackConfig.module.rules.push({
    test: /\.tsx?$/,
    use: [
      require.resolve('babel-loader'),
      {
        loader: require.resolve('ts-loader'),
        options: {
          transpileOnly: true,
          // ref: https://github.com/TypeStrong/ts-loader/blob/fbed24b/src/utils.ts#L23
          errorFormatter(error, colors) {
            const messageColor = error.severity === 'warning' ? colors.bold.yellow : colors.bold.red;
            return (
              colors.grey('[tsl] ')
              + messageColor(error.severity.toUpperCase())
              + (error.file === ''
                ? ''
                : messageColor(' in ')
                  + colors.bold.cyan(`${relative(cwd, join(error.context, error.file))}(${error.line},${
                    error.character
                  })` ))
              + EOL
              + messageColor(`      TS${error.code}: ${error.content}`)
            );
          },
          ...(opts.tsLoaderOptions || {}),
        },
      },
    ],
  });

  // module -> glsl,frag,vert
  webpackConfig.module.rules.push({
    test: /\.(glsl|frag|vert)$/,
    exclude: [/node_modules/],
    use: [
      require.resolve('raw-loader'),
      require.resolve('glslify-loader'),
    ],
  });

  // module -> css
  require('./css').default(webpackConfig, opts);

  // plugins -> define
  webpackConfig.plugins.push(new webpack.DefinePlugin(resolveDefine(opts)));

  // plugins -> progress bar
  webpackConfig.plugins.push(new ProgressBarPlugin());

  // plugins -> analyze
  if (opts.analyzer) {
    webpackConfig.plugins.push(new BundleAnalyzerPlugin({
      ...(opts.analyzer || {}),
    }));
  }

  // plugins -> copy
  if (opts.copy) {
    webpackConfig.plugins.push(new CopyWebpackPlugin({
      patterns: opts.copy,
    }));
  }

  // externals
  if (opts.externals) {
    webpackConfig.externals = opts.externals;
  }

  if (isPlainObject(opts.html)) {
    for (const key in opts.html) {
      const val = opts.html[key] || {};

      webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: `${key}.html`,
        ...val,
      }));
    }
  }

  if (isDev) {
    require('./dev').default(webpackConfig, opts);
  } else {
    require('./prod').default(webpackConfig, opts);
  }

  if (opts.webpack) {
    assert(
      typeof opts.webpack === 'function',
      `opts.webpack should be function, but got ${opts.webpack}`,
    );
    opts.webpack(webpackConfig);
  }

  return webpackConfig;
}

export default function (opts) {
  // eslint-disable-next-line prefer-const
  let { userConfig, cwd, isDev } = opts;

  userConfig = makeArray(userConfig);

  return userConfig.map((item) => getWebpackConfig({ ...item, cwd, isDev }));
}
