import { existsSync } from 'fs';
import { resolve } from 'path';
import assert from 'assert';
import chalk from 'chalk';
import { isEqual } from 'lodash';
import yargsParser from 'yargs-parser';
import { watch, unwatch } from './watch';
import send, { RESTART } from '../send';
import { makeArray } from '../../lib/utils';
import resolveConfigFile from './resolveConfigFile';

const debug = require('debug')('webpack:getUserConfig');

let devServer = null;
const USER_CONFIGS = 'USER_CONFIGS';

function reload() {
  devServer.sendMessage(devServer.webSocketServer.clients, 'content-changed');
}

function restart(why = []) {
  console.log(chalk.green(`Since ${why.join(' and ')}, try to restart the server`));
  unwatch();
  devServer.stop().then(() => {
    send({ type: RESTART });
  });
}

export function watchConfigs(opts = {}) {
  const { cwd = process.cwd(), configFile = 'curiosity.config' } = opts;

  const jsRCFile = resolve(cwd, `${configFile}.js`);
  const tsRCFile = resolve(cwd, `${configFile}.ts`);

  return watch(USER_CONFIGS, [jsRCFile, tsRCFile]);
}

export function unwatchConfigs() {
  unwatch(USER_CONFIGS);
}

export default async function getUserConfig(opts = {}) {
  const {
    cwd = process.cwd(),
    configFile = 'curiosity.config',
  } = opts;

  // TODO: 支持数组的形式？\
  const jsRCFile = resolve(cwd, `${configFile}.js`);
  const tsRCFile = resolve(cwd, `${configFile}.ts`);

  assert(
    !(existsSync(jsRCFile) && existsSync(tsRCFile)),
    `${configFile}.ts file and ${configFile}.js file can not exist at the same time.`,
  );
  let config = {};
  if (existsSync(jsRCFile)) {
    // no cache
    delete require.cache[jsRCFile];
    // eslint-disable-next-line import/no-dynamic-require
    let jsRCFileConfig = require(jsRCFile);
    jsRCFileConfig = jsRCFileConfig.bundler || jsRCFileConfig;
    if (typeof jsRCFileConfig === 'function') {
      const argv = yargsParser(process.argv.slice(2));
      config = jsRCFileConfig(argv.env || {}, argv);
    } else {
      config = jsRCFileConfig;
      if (config.default) {
        config = config.default;
      }
    }
  } else if (existsSync(tsRCFile)) {
    let tsRCFileConfig = await resolveConfigFile(tsRCFile);
    tsRCFileConfig = tsRCFileConfig.bundler || tsRCFileConfig;
    if (typeof tsRCFileConfig === 'function') {
      const argv = yargsParser(process.argv.slice(2));
      config = tsRCFileConfig(argv.env || {}, argv);
    } else {
      config = tsRCFileConfig;
      if (config.default) {
        config = config.default;
      }
    }
  }

  /* 转数组 */
  config = makeArray(config);

  let configFailed = false;
  function watchConfigsAndRun(_devServer, watchOpts = {}) {
    devServer = _devServer;

    const watcher = watchConfigs(opts);
    watcher.on('all', async () => {
      try {
        if (watchOpts.beforeChange) {
          watchOpts.beforeChange();
        }

        const oldConfig = config;
        const { config: newConfig } = await getUserConfig({
          ...opts,
        });

        // 从失败中恢复过来，需要 reload 一次
        if (configFailed) {
          configFailed = false;
          reload();
        }

        // 比较，然后执行 onChange
        const why = [];
        const len = Math.max(newConfig.length, oldConfig.length);
        for (let i = 0; i < len; i+=1) {
          const latest = newConfig[i];
          const old = oldConfig[i];

          Object.keys(latest).forEach((name) => {
            if (!isEqual(latest[name], old[name])) {
              debug(`Config ${name} changed, from ${JSON.stringify(old[name])} to ${JSON.stringify(latest[name])}`);
              why.push(`${name} changed`);
            }
          });
        }

        if (why.length) {
          restart.call(null, why);
        }
      } catch (e) {
        configFailed = true;
        console.error(chalk.red(`Watch handler failed, since ${e.message}`));
        console.error(e);
      }
    });
    return watcher;
  }

  debug(`UserConfig: ${JSON.stringify(config)}`);

  return { config, watch: watchConfigsAndRun };
}
