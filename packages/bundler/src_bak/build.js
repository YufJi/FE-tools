import webpack from 'webpack';
import rimraf from 'rimraf';
import assert from 'assert';
import { isPlainObject } from 'lodash';

const debug = require('debug')('webpack:build');

function getOutputPath(webpackConfig) {
  return Array.isArray(webpackConfig) ? webpackConfig[0].output.path : webpackConfig.output.path;
}

function getErrorInfo(err, stats) {
  if (!stats) {
    return {
      err,
      stats: err,
    };
  }

  return {
    // eslint-disable-next-line max-len
    err: err || (stats.compilation && stats.compilation.errors && stats.compilation.errors[0]),
    stats,
  };
}

export default function build(opts = {}) {
  const { webpackConfig, cwd = process.cwd(), onSuccess, onFail } = opts;
  assert(webpackConfig, 'webpackConfig should be supplied.');
  assert(
    isPlainObject(webpackConfig) || Array.isArray(webpackConfig),
    'webpackConfig should be plain object or array.',
  );

  const outputPath = getOutputPath(webpackConfig);

  // 清理 output path
  debug(`Clean output path ${outputPath.replace(`${cwd}/`, '')}`);
  rimraf.sync(outputPath);

  debug('build start');
  webpack(webpackConfig, (err, stats) => {
    debug('build done');

    if (err) {
      if (onFail) {
        onFail(getErrorInfo(err, stats));
      }

      const isWatch = isPlainObject(webpackConfig)
        ? webpackConfig.watch
        : webpackConfig.some((config) => config.watch); /* array */

      if (!isWatch) {
        process.exit(1);
      }
    }

    if (onSuccess) {
      onSuccess({ stats });
    }
  });
}
