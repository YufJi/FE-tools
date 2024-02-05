import type { Config } from './types';
import { compactDefault, makeArray } from './utils';

export function getUserConfig(configFilePath: string): Config[] {
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
