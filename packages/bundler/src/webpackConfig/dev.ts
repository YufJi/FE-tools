import type {
  WebpackConfiguration,
  WebpackConfigOptions
} from '../types';

export function devConfig(webpackConfig: WebpackConfiguration, options: WebpackConfigOptions) {
  const { config } = options;
  const {
    devtool = 'eval',
  } = config;

  webpackConfig.devtool = devtool;
  webpackConfig.output.pathinfo = true;
}
