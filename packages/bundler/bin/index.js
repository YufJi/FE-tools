#!/usr/bin/env node

const path = require('path');
const getWebpackConfig = require('../getWebpackConfig');
const getUserConfig = require('../getUserConfig');

const cwd = process.cwd();

async function webpackConfig(isDev) {
  const { config: userConfig } = await getUserConfig({
    cwd,
  });
  return getWebpackConfig({
    userConfig,
    cwd,
    isDev,
  });
}

async function main() {
  switch (process.argv[2]) {
    case 'init':
      require('../init')();
      break;
    case 'dev':
      require('../fork')(path.join(__dirname, './realDev'));
      break;
    case 'build':
      require('../build')({
        cwd,
        webpackConfig: await webpackConfig(),
        onSuccess: ({ stats }) => {
          console.log(`${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
          })}\n\n`);
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
      break;
    default:
      console.error(`Unknown command ${process.argv[2]}`);
      process.exit(1);
  }
}

main();
