import assert from 'assert';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import { isPlainObject } from 'lodash';
import webpack from 'webpack';
import send, { STARTING, ERROR, UPDATE_PORT } from './send';

const noop = () => {};

process.env.NODE_ENV = 'development';

function getWebpackConfig(webpackConfig) {
  return Array.isArray(webpackConfig) ? webpackConfig[0] : webpackConfig;
}

export default function dev({
  webpackConfig,
  beforeServer,
  afterServer,
  onSuccess = noop,
  onFail = noop,
  serverConfig: serverConfigFromOpts = {},
}) {
  assert(webpackConfig, 'webpackConfig should be supplied.');
  assert(
    isPlainObject(webpackConfig) || Array.isArray(webpackConfig),
    'webpackConfig should be plain object or array.',
  );

  const serverConfig = {
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
    ...serverConfigFromOpts,
    ...(getWebpackConfig(webpackConfig).devServer || {}),
  };

  WebpackDevServer.getFreePort(serverConfig.port).then((port) => {
    if (port === null) {
      return;
    }

    // Send message to parent process when port choosed
    send({
      type: UPDATE_PORT,
      port,
    });

    const compiler = webpack(webpackConfig);
    let server = null;

    compiler.hooks.done.tap('webpack done', (stats) => {
      if (stats.hasErrors()) {
        send({
          type: ERROR,
        });
        onFail({ stats });
        return;
      }

      onSuccess({
        port,
        stats,
        server,
      });
    });

    server = new WebpackDevServer(serverConfig, compiler);

    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => {
        server.stop().then(() => {
          process.exit(0);
        });
      });
    });

    if (beforeServer) {
      beforeServer(server);
    }

    server.start().then(() => {
      console.log(chalk.cyan('\nStarting the development server...\n'));

      send({ type: STARTING });
      if (afterServer) {
        afterServer(server, port);
      }
    }).catch((err) => {
      console.log(err);
    });
  })
    .catch((err) => {
      console.log(err);
    });
}
