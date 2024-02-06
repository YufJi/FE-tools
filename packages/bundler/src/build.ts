import * as path from 'path';
import * as fs from 'fs';
import * as webpack from 'webpack';

import type { CliOptions } from './types';
import { getUserConfig } from './getConfig';
import { webpackConfig } from './webpackConfig';
import { Logger } from './utils/logger';

export function build(options: CliOptions) {
  process.env.NODE_ENV = 'production';
  Logger.start('Starting bundler in production mode');

  const { root, config } = options;

  const userConfig = getUserConfig(config, root);

  webpack(userConfig.map(config => webpackConfig({
    root,
    config,
  })), (error, stats) => {
    if (error) {
      Logger.error('Failed to build', error);
      process.exit(1);
    }

    if (stats.hasErrors()) {
      Logger.error('Failed to build', stats.toString('errors-only'));
      process.exit(1);
    }

    Logger.success('Build completed');
  });

}
