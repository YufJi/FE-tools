import type { 
  ConfigAPI,
  SimpleCacheKey,
} from '@babel/core';

import type { Options as EnvOptions  } from '@babel/preset-env';

type ReactOptions = {
  runtime?: 'automatic' | 'classic',
  development?: boolean,
  importSource?: string,
  useBuiltIns?: boolean,
  throwIfNamespace?: boolean,
  useSpread?: boolean,
  pragma?: string,
  pragmaFrag?: string,
}

interface Options {
  cache?: () => SimpleCacheKey,
  env?: EnvOptions,
  react?: ReactOptions,
}

export function preset(api: ConfigAPI, options: Options = {}) {
  api.cache.using(options.cache || (() => false));

  const {
    env,
    react,
  } = options;

  const presets = [
    [require.resolve('@babel/preset-env'), env],
    [require.resolve('@babel/preset-react'), react]
  ];

  const plugins = [
    // 下面两个的顺序的配置都不能动
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],

    require.resolve('@babel/plugin-proposal-export-default-from'),
    [require.resolve('@babel/plugin-proposal-pipeline-operator'), { proposal: 'minimal' }],
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-function-bind'),
  ];

  return {
    presets,
    plugins,
  };
}

export default preset;
