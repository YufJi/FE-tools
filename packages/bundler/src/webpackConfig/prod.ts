import * as webpack from 'webpack';
import { EsbuildPlugin } from 'esbuild-loader';
import type {
  WebpackConfiguration,
  WebpackConfigOptions
} from '../types';

export function prodConfig(webpackConfig: WebpackConfiguration, options: WebpackConfigOptions) {
  const { config } = options;
  const {
    devtool,
    hash = true,
    minify = true
  } = config;

  webpackConfig.mode = 'production';
  webpackConfig.devtool = devtool;

  if (hash) {
    webpackConfig.output.filename = '[name].[contenthash].js';
    webpackConfig.output.chunkFilename = '[name].[contenthash].js';
  }

  webpackConfig.optimization.noEmitOnErrors = true;

  if (minify) {
    webpackConfig.plugins.push(new webpack.ids.HashedModuleIdsPlugin());
    webpackConfig.optimization.minimizer = [
      new EsbuildPlugin({
        css: true
      })
    ];
  } else {
    webpackConfig.output.pathinfo = true;
    webpackConfig.optimization.minimize = false;
  }
}
