/* eslint-disable func-names */
const rollup = require('rollup');
const signale = require('signale');
const getRollupConfig = require('./getRollupConfig');
const normalizeBundleOpts = require('./normalizeBundleOpts');

async function build(entry, opts) {
  const { cwd, type, bundleOpts, importLibToEs } = opts;
  const rollupConfigs = getRollupConfig({
    cwd,
    type,
    entry,
    importLibToEs,
    bundleOpts: normalizeBundleOpts(entry, bundleOpts),
  });

  for (const rollupConfig of rollupConfigs) {
    if (opts.watch) {
      const watcher = rollup.watch([
        {
          ...rollupConfig,
          watch: {},
        },
      ]);
      watcher.on('event', (event) => {
        if (event.error) {
          signale.error(event.error);
        } else if (event.code === 'START') {
          signale.info(`[${type}] Rebuild since file changed`);
        }
      });
    } else {
      const { output, ...input } = rollupConfig;
      const bundle = await rollup.rollup(input);
      await bundle.write(output);
    }
  }
}

module.exports = async function (opts) {
  if (Array.isArray(opts.entry)) {
    const { entry: entries } = opts;
    for (const entry of entries) {
      await build(entry, opts);
    }
  } else {
    await build(opts.entry, opts);
  }
};
