/* eslint-disable func-names */

module.exports = function (opts) {
  const { target, typescript, type, runtimeHelpers, filePath, browserFiles, nodeFiles, nodeVersion, lazy } = opts;
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
        targets,
        modules: type === 'esm' ? false : 'auto',
      }],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      ...((type === 'cjs' && lazy && !isBrowser)
        ? [[require.resolve('@babel/plugin-transform-modules-commonjs'), {
          lazy: true,
        }]]
        : []),
      require.resolve('babel-plugin-react-require'),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
      ...(runtimeHelpers
        ? [[require.resolve('@babel/plugin-transform-runtime'), { ...runtimeHelpers, useESModules: isBrowser && (type === 'esm') }]]
        : []),
      ...(process.env.COVERAGE
        ? [require.resolve('babel-plugin-istanbul')]
        : []
      ),
    ],
  };
};
