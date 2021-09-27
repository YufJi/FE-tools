/* eslint-disable func-names */
const { existsSync } = require('fs');
const { join } = require('path');

exports.getExistFile = function ({ cwd, files, returnRelative }) {
  for (const file of files) {
    const absFilePath = join(cwd, file);
    if (existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
};
