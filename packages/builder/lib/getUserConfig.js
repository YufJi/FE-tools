/* eslint-disable func-names */

const { getExistFile } = require('./utils');

function testDefault(obj) {
  return obj.default || obj;
}

const CONFIG_FILES = [
  'curiosity.config.js',
];

module.exports = function ({ cwd }) {
  const configFile = getExistFile({
    cwd,
    files: CONFIG_FILES,
    returnRelative: false,
  });

  if (configFile) {
    const userConfig = testDefault(require(configFile)); // eslint-disable-line
    return userConfig.build || userConfig;
  } else {
    const error = new Error("请检查根目录下是否存在配置文件'curiosity.config.js'！");
    console.warn(error.message);
    return {};
  }
};

exports.CONFIG_FILES = CONFIG_FILES;
