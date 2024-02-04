import { Command } from 'commander';
import { dev } from './dev';

const program = new Command();

program
  .name('bundler')
  .description('Bundler for JavaScript and TypeScript')
  .usage('[command] [options]');

program
  .command('dev')
  .description('Start the bundler in development mode')
  .option('--root <root>', 'Root directory', process.cwd())
  .option('-c, --config <config>', 'Path to the config file', 'bundler.config.js')
  .action(dev)

program.parse(process.argv);
