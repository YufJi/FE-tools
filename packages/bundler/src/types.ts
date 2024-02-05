import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlPlugin from 'html-webpack-plugin';
import AutoPrefixer from 'autoprefixer';

export type WebpackConfiguration = webpack.Configuration;

export interface CliOptions {
  root: string;
  config: string;
}

export interface WebpackConfigOptions {
  root: string;
  config: Config;
}

export interface Config {
  mode?: WebpackConfiguration['mode'];
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
  extraTranspileIncludes?: Array<string | RegExp>;
  tsConfigFile?: string;
  hash?: boolean;
  minify?: boolean;
  devServer?: WebpackDevServer.Configuration;
  cssLoaderOptions?: {
    url?: 
      | boolean 
      | ((url: string, resourcePath: string) => boolean);
    import?: 
      | boolean
      | {
        filter: (
          url: string,
          media: string,
          resourcePath: string,
          supports?: string,
          layer?: string
        ) => boolean;
      };
    modules?: CssLoaderModules;
    importLoaders?: number;
    sourceMap?: boolean;
    esModule?: boolean;
    exportType?: 'array' | 'string' | 'css-style-sheet';
  };
  cssModulesExcludes?: webpack.RuleSetRule['exclude'];
  lessLoaderOptions?: object;
  autoprefixer?: AutoPrefixer.Options;
  extraPostCSSPlugins?: Array<any>;
  devtool?: WebpackConfiguration['devtool'];
  analyzer?: boolean;
  extraPlugins?: webpack.WebpackPluginInstance[];
  extarRules?: webpack.RuleSetRule[];
}

type CssLoaderModules =
  | boolean
  | 'local'
  | 'global'
  | 'pure'
  | 'icss'
  | {
    auto: boolean | RegExp | ((resourcePath: string) => boolean);
    mode:
      | 'local'
      | 'global'
      | 'pure'
      | 'icss'
      | ((resourcePath) => 'local' | 'global' | 'pure' | 'icss');
    localIdentName: string;
    localIdentContext: string;
    localIdentHashSalt: string;
    localIdentHashFunction: string;
    localIdentHashDigest: string;
    localIdentRegExp: string | RegExp;
    namedExport: boolean;
    exportGlobals: boolean;
    exportLocalsConvention:
      | 'asIs'
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((name: string) => string);
    exportOnlyLocals: boolean;
  };
