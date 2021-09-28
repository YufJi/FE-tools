module.exports = function (context, opts = {}) {
  const {
    env = {},
    react = {},
    transformRuntime,
  } = opts;

  const plugins = [
    // 下面两个的顺序的配置都不能动
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],

    require.resolve('@babel/plugin-proposal-export-default-from'),
    [require.resolve('@babel/plugin-proposal-pipeline-operator'), { proposal: 'minimal' }],
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-function-bind'),
  ];

  if (transformRuntime) {
    plugins.push([require.resolve('@babel/plugin-transform-runtime'), transformRuntime]);
  }

  return {
    presets: [
      [require.resolve('@babel/preset-env'), env],
      [require.resolve('@babel/preset-react'), react],
    ],
    plugins,
  };
};
