import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlPlugin from 'html-webpack-plugin';

export type WebpackConfiguration = webpack.Configuration;

export interface CliOptions {
  root: string;
  config: string;
}

export interface WebpackConfigOptions {
  cwd: string;
  config: Config;
}

export interface Config {
  context?: WebpackConfiguration['context'];
  entry: WebpackConfiguration['entry'];
  html?: {
    [key: string]: HtmlPlugin.Options;
  },
  alias?: WebpackConfiguration['resolve']['alias'],
  externals?: WebpackConfiguration['externals'];
  publicPath?: string;
  dest?: string;
  configWebpack?: (config: WebpackConfiguration) => void;
  extraBabelIncludes?: string | RegExp | Array<string | RegExp>;
  tsConfigFile?: string;
  hash?: boolean;
  minify?: boolean;
  devServer?: WebpackDevServer.Configuration;
}

export type BundlerConfig = Config | Config[];

