#!/usr/bin/env node

const args = require('yargs-parser')(process.argv.slice(2));
const signale = require('signale');
const program = require('commander');

const pkg = require('../package.json');

const cwd = process.cwd();

program
  .version(pkg.version, '-v, --version', '输出版本号')
  .helpOption('-h, --help', '输出使用信息')
  .option('-w, --watch', '开启监听模式');

program.parse(process.argv);

try {
  require('../lib')({
    cwd,
    watch: args.w || args.watch,
  });
} catch (error) {
  signale.error(error);
  process.exit(1);
}
