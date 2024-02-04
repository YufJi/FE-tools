import webpack from 'webpack';

export interface CliOptions {
  root: string;
  config: string;
}

export interface Config {
  context?: string;
  entry: string | string[] | webpack.EntryObject;
  alias?: {
    [key: string]: string;
  },

  configWebpack?: (config: webpack.Configuration) => void;
}

export type BundlerConfig = Config | Config[];

export type WebpackConfiguration = webpack.Configuration;
