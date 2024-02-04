import * as fs from 'fs';
import * as path from 'path';
import type { CliOptions } from './types';
import { getUserConfig } from './getConfig';
import { webpackConfig } from './webpackConfig'
import { Logger } from './utils/logger';

export function dev(options: CliOptions) {
  Logger.start('Starting bundler in development mode');
  Logger.info(options);

  const { root: cwd, config: configFile } = options;

  const configFilePath = path.resolve(cwd, configFile);
  if (!fs.existsSync(configFilePath)) {
    Logger.error(`Config file not found: ${configFilePath}`);
    process.exit(1);
  }

  const userConfig = getUserConfig(configFilePath);
  Logger.info(userConfig);

  const config = userConfig.map(config => webpackConfig({
    cwd,
    config,
  }));
}
