import * as fs from 'fs';
import * as path from 'path';
import * as webpack from 'webpack';
import * as WebpackDevServer from 'webpack-dev-server';

import type { CliOptions } from './types';
import { getUserConfig } from './getConfig';
import { webpackConfig } from './webpackConfig';
import { Logger } from './utils/logger';

export function dev(options: CliOptions) {
  process.env.NODE_ENV = 'development';
  Logger.start('Starting bundler in development mode');

  const { root, config } = options;

  const userConfig = getUserConfig(config, root);

  const { devServer = {}, publicPath } = userConfig[0];
  const serverConfig: WebpackDevServer.Configuration = {
    compress: true,
    headers: {
      'access-control-allow-origin': '*',
    },
    historyApiFallback: true,
    client: {
      overlay: true,
      progress: false,
    },
    static: {
      directory: path.resolve(root, 'public'),
      publicPath,
    },
    hot: true,
    ...devServer
  };

  WebpackDevServer.getFreePort(serverConfig.port, serverConfig.host)
    .then(port => {
      const complier = webpack(userConfig.map(config => webpackConfig({
        root,
        config,
      })));
      const server = new WebpackDevServer(serverConfig, complier);

      server.start()
        .then(() => {
          Logger.success('Development server started');
        })
        .catch((error) => {
          Logger.error('Failed to start the development server', error);
        });
    })
    .catch(error => {
      Logger.error('Failed to start the development server', error);
    });
}
