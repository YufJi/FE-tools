import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import { isPlainObject } from 'lodash';
import terserOptions from './terserOptions';

function mergeConfig(config, userConfig) {
  if (typeof userConfig === 'function') {
    return userConfig(config);
  } else if (isPlainObject(userConfig)) {
    return {
      ...config,
      ...userConfig,
    };
  } else {
    return config;
  }
}

export default function (webpackConfig, opts) {
  const { disableCompress } = opts;

  webpackConfig.mode = 'production';
  webpackConfig.devtool = opts.devtool;

  if (disableCompress) {
    webpackConfig.output.pathinfo = true;
    webpackConfig.optimization.namedModules = true;
    webpackConfig.optimization.namedChunks = true;
  }

  if (opts.hash) {
    webpackConfig.output.fileName = '[name].[contenthash:8].js';
    webpackConfig.output.chunkFilename = '[name].[contenthash:8].js';
  }

  webpackConfig.performance = {
    hints: false,
  };

  // server build not generate manifest
  // TODO: better manifest for ssr,
  // {
  //   "common": { "a.js": "...", "b.css": "..." }
  //   "pages": { "/about": { "about_index.js": "...", "about_index.css": "..." } }
  // }
  if (opts.manifest && !opts.ssr) {
    webpackConfig.plugins.push(new WebpackManifestPlugin({
      fileName: 'asset-manifest.json',
      ...opts.manifest,
    }));
  }

  webpackConfig.optimization.noEmitOnErrors = true;

  if (disableCompress) {
    webpackConfig.optimization.minimize = false;
  } else {
    webpackConfig.plugins.push(new webpack.ids.HashedModuleIdsPlugin());

    const minimizerOptions = mergeConfig({
      ...terserOptions,
    }, opts.terserJSOptions);

    webpackConfig.optimization.minimizer = [
      new TerserPlugin(minimizerOptions),
    ];
  }
}
