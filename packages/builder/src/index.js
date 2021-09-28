import { join } from 'path';
import rimraf from 'rimraf';
import { merge } from 'lodash';
import signale from 'signale';
import rollup from './rollup';
import babel from './babel';
import { getExistFile } from './utils';
import getUserConfig from './getUserConfig';

function getBundleOpts(opts) {
  const { cwd } = opts;
  const entry = getExistFile({
    cwd,
    files: ['src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js'],
    returnRelative: true,
  });
  const userConfig = getUserConfig({ cwd });
  const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
  return userConfigs.map((userConfig) => {
    const bundleOpts = merge(
      {
        entry,
      },
      userConfig,
    );

    // Support config esm: 'rollup' and cjs: 'rollup'
    if (typeof bundleOpts.esm === 'string') {
      bundleOpts.esm = { type: bundleOpts.esm };
    }
    if (typeof bundleOpts.cjs === 'string') {
      bundleOpts.cjs = { type: bundleOpts.cjs };
    }

    return bundleOpts;
  });
}

async function build(opts) {
  const { cwd, watch, rootPath } = opts;
  // Get user config
  const bundleOptsArray = getBundleOpts(opts);
  for (const bundleOpts of bundleOptsArray) {
    // Clean dist
    signale.info('Clean dist directory');
    rimraf.sync(join(cwd, 'dist'));

    // Build umd
    if (bundleOpts.umd) {
      signale.info('Build umd');
      await rollup({
        cwd,
        type: 'umd',
        entry: bundleOpts.entry,
        watch,
        bundleOpts,
      });
    }

    // Build cjs
    if (bundleOpts.cjs) {
      const { cjs } = bundleOpts;
      signale.info(`Build cjs with ${cjs.type}`);
      if (cjs.type === 'babel') {
        await babel({ cwd, rootPath, watch, type: 'cjs', bundleOpts });
      } else {
        await rollup({
          cwd,
          type: 'cjs',
          entry: bundleOpts.entry,
          watch,
          bundleOpts,
        });
      }
    }

    // Build esm
    if (bundleOpts.esm) {
      const { esm } = bundleOpts;
      signale.info(`Build esm with ${esm.type}`);
      const importLibToEs = esm && esm.importLibToEs;
      if (esm && esm.type === 'babel') {
        await babel({ cwd, rootPath, watch, type: 'esm', importLibToEs, bundleOpts });
      } else {
        await rollup({
          cwd,
          type: 'esm',
          entry: bundleOpts.entry,
          importLibToEs,
          watch,
          bundleOpts,
        });
      }
    }
  }
}

export default async function (options) {
  await build(options);
}
