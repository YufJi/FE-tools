import { Config, WebpackConfiguration } from '../types'

interface WebpackConfigOptions {
  cwd: string;
  config: Config;
}

export function webpackConfig(options: WebpackConfigOptions) {
  const { cwd, config } = options;
  
  const {
    context = cwd
  } = config;

  const webpackConfig: WebpackConfiguration = {
    context,
  }
}
