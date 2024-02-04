import * as fs from 'fs'
import * as path from 'path'
import WebpackDevServer from 'webpack-dev-server'
import type { CliOptions } from './types'
import { getUserConfig } from './getConfig'
import { webpackConfig } from './webpackConfig'
import { Logger } from './utils/logger'

export function dev(options: CliOptions) {
  Logger.start('Starting bundler in development mode');
  Logger.info(options);

  const { root: cwd, config: configFile } = options;

  const configFilePath = path.resolve(cwd, configFile);
  if (!fs.existsSync(configFilePath)) {
    Logger.error(`Config file not found: ${configFilePath}`);
    process.exit(1);
  }

  const userConfig = getUserConfig(configFilePath);
  Logger.info(userConfig);

  const config = userConfig.map(config => webpackConfig({
    cwd,
    config,
  }));

  const { devServer } = userConfig[0];
  const serverConfig: WebpackDevServer.Configuration = Object.assign({
    port: 8080,
    compress: true,
    hot: true,
    headers: {
      'access-control-allow-origin': '*',
    },
    historyApiFallback: true,
    host: '0.0.0.0',
    client: {
      overlay: true,
      progress: false,
    },
  }, devServer)

  WebpackDevServer.getFreePort(serverConfig.port, serverConfig.host)
    .then(port => {
      Logger.info('port is', port)
    })
    .catch(error => {
      Logger.error(error)
    })

}
