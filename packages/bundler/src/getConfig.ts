import * as path from 'path';
import * as fs from 'fs';
import type { Config } from './types';
import { compactDefault, makeArray } from './utils';
import { Logger } from './utils/logger';

export function getUserConfig(configFile: string, root: string): Config[] {
  if (!configFile) {
    configFile = 'bundler.config.js';

    const extenstions = ['ts', 'js'];
    for (const ext of extenstions) {
      const fileName = `bundler.config.${ext}`;
      if (fs.existsSync(path.resolve(root, fileName))) {
        configFile = fileName;
        break;
      }
    }
  }

  const configFilePath = path.resolve(root, configFile);
  if (!fs.existsSync(configFilePath)) {
    Logger.error(`Config file not found: ${configFilePath}`);
    process.exit(1);
  }

  let config;
  if (/\.js$/.test(configFilePath)) {
    config = compactDefault(require(configFilePath));
  } else if (/\.ts$/.test(configFilePath)) {
    require('ts-node').register({
      transpileOnly: true,
      compilerOptions: {
        module: 'commonjs',
        target: 'es6',
      },
    });
    config = compactDefault(require(configFilePath));
  }

  return makeArray(config);
}
