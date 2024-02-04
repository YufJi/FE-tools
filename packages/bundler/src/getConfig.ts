import type { BundlerConfig } from './types'
import { compactDefault, makeArray } from './utils'

export function getUserConfig(configFilePath: string) {
  let config: BundlerConfig;
  if (/\.js$/.test(configFilePath)) {
    config = require(configFilePath);
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

  config = makeArray(config);

  return config;
}
