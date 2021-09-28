/* eslint-disable func-names */

export default function (opts) {
  const {
    target, typescript, type, runtimeHelpers, filePath, browserFiles, nodeFiles, nodeVersion,
  } = opts;

  let isBrowser = target === 'browser';
  // rollup 场景下不会传入 filePath
  if (filePath) {
    if (isBrowser) {
      if (nodeFiles.includes(filePath)) isBrowser = false;
    } else if (browserFiles.includes(filePath)) isBrowser = true;
  }

  const targets = isBrowser ? {
    chrome: '51',
    ie: '9',
  } : { node: nodeVersion || 6 };

  return {
    presets: [
      ...(typescript ? [require.resolve('@babel/preset-typescript')] : []),
      [require.resolve('@babel/preset-env'), {
        loose: true,
        targets,
        modules: type === 'esm' ? false : (type === 'cjs' && !isBrowser) ? 'cjs' : 'auto',
      }],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
      ...(runtimeHelpers
        ? [[require.resolve('@babel/plugin-transform-runtime'), { ...runtimeHelpers, useESModules: isBrowser && (type === 'esm') }]]
        : []),
    ],
  };
}
