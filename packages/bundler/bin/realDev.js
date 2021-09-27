const getWebpackConfig = require('../getWebpackConfig');
const getUserConfig = require('../getUserConfig');

const cwd = process.cwd();

let watchConfigsAndRun;

async function webpackConfig(isDev) {
  const { config: userConfig, watch } = await getUserConfig({
    cwd,
  });
  watchConfigsAndRun = watch;
  return getWebpackConfig({
    userConfig,
    cwd,
    isDev,
  });
}

async function realDev() {
  require('../dev')({
    cwd,
    webpackConfig: await webpackConfig(true),
    afterServer: (server) => {
      typeof watchConfigsAndRun === 'function' && watchConfigsAndRun(server);
    },
    onFail: ({ stats }) => {
      console.log(`${stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      })}\n\n`);
    },
  });
}

realDev();
