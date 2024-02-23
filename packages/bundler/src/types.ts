import * as webpack from 'webpack';
import * as WebpackDevServer from 'webpack-dev-server';
import * as HtmlPlugin from 'html-webpack-plugin';
import * as AutoPrefixer from 'autoprefixer';

interface CliOptions {
  root: string;
  config: string;
}

interface WebpackConfigOptions {
  root: string;
  config: Config;
}

interface Config {
  mode?: webpack.Configuration['mode'];
  context?: webpack.Configuration['context'];
  entry: webpack.Configuration['entry'];
  html?: {
    [key: string]: HtmlPlugin.Options;
  },
  alias?: webpack.Configuration['resolve']['alias'],
  externals?: webpack.Configuration['externals'];
  publicPath?: string;
  dest?: string;
  configWebpack?: (config: webpack.Configuration) => void;
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
  devtool?: webpack.Configuration['devtool'];
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


export type {
  CliOptions,
  WebpackConfigOptions,
  Config
};
