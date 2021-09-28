/* eslint-disable func-names */
import rollup from 'rollup';
import signale from 'signale';
import getRollupConfig from './getRollupConfig';
import normalizeBundleOpts from './normalizeBundleOpts';

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

export default async function (opts) {
  if (Array.isArray(opts.entry)) {
    const { entry: entries } = opts;
    for (const entry of entries) {
      await build(entry, opts);
    }
  } else {
    await build(opts.entry, opts);
  }
}
