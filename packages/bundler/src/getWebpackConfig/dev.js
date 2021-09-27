import webpack from 'webpack';

export default function (webpackConfig, opts) {
  webpackConfig.devtool = opts.devtool || 'cheap-module-source-map';
  webpackConfig.output.pathinfo = true;

  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  if (opts.devServer) {
    webpackConfig.devServer = opts.devServer;
  }
}
