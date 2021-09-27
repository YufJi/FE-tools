import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import WebpackDevServer from 'webpack-dev-server';
import TerserPlugin from 'terser-webpack-plugin';
import HtmlPlugin from 'html-webpack-plugin';
import CopyPlugin from './copy'

interface Config {
  alias?: {
    [key: string]: string;
  };
  analyzer?: BundleAnalyzerPlugin.Options | boolean;
  autoprefixer?: object;
  webpack?: {
    (config: webpack.Configuration): void;
  };
  copy?: CopyPlugin.Options;
  cssLoaderOptions?: object;
  cssModulesExcludes?: Array<any>;
  cssnano?: object;
  cssPublicPath?: string;
  cssModulesTypescriptLoader?: boolean;
  define?: object;
  devServer?: WebpackDevServer.Configuration; 
  devtool?: webpack.Options.Devtool;
  disableCSSSourceMap?: boolean;
  disableCompress?: boolean;
  disableDynamicImport?: boolean;
  enableCSSModules?: boolean;
  entry: webpack.Entry | webpack.EntryFunc | string | string[];
  env?: object;
  externals?: webpack.ExternalsElement;
  extraBabelIncludes?: Array<any>;
  extraBabelPlugins?: Array<any>;
  extraBabelPresets?: Array<any>;
  extraPostCSSPlugins?: Array<any>;
  hash?: boolean;
  html?: {
    [key: string]: HtmlPlugin.Options;
  };
  inlineLimit?: number;
  lessLoaderOptions?: object;
  manifest?: object;
  outputPath?: string;
  publicPath?: string;
  styleLoader?: object;
  ssr?: boolean;
  terserJSOptions?: TerserPlugin.TerserPluginOptions;
  tsLoaderOptions?: object;
  urlLoaderIncludes?: Array<any>;
}


export type IConfig = Config | Config[];
