#!/usr/bin/env node

import * as path from 'path';
import { Command } from 'commander';
import * as webpack from 'webpack';
import { dev } from './dev';
import { build } from './build';

export * from './types';

export {
  webpack
};

const program = new Command();

program
  .name('bundler')
  .description('Bundler for JavaScript and TypeScript')
  .usage('[command] [options]');

program
  .command('dev')
  .description('Start the devServer')
  .option('--root <root>', 'Root directory')
  .option('-c, --config <config>', 'Path to the config file')
  .action((options) => {
    const cwd = process.cwd();
    const root = path.resolve(cwd, options.root || '');
    
    dev({
      root,
      config: options.config,
    });
  });

program
  .command('build')
  .description('Build the project')
  .option('--root <root>', 'Root directory')
  .option('-c, --config <config>', 'Path to the config file')
  .action((options) => {
    const cwd = process.cwd();
    const root = path.resolve(cwd, options.root || '');

    build({
      root,
      config: options.config,
    });
  });

program.parse(process.argv);
