import * as webpack from 'webpack';
import type {
  WebpackConfigOptions
} from '../types';

export function devConfig(webpackConfig: webpack.Configuration, options: WebpackConfigOptions) {
  const { config } = options;
  const {
    devtool = 'eval',
  } = config;

  webpackConfig.devtool = devtool;
  webpackConfig.output.pathinfo = true;
}
