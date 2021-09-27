import path from 'path'
import { IConfig } from 'curiosity-bundler'
import pxtoviewport from "postcss-px-to-viewport"

export default (env): IConfig => {
  const isDev = env.dev;
  let publicPath = '/';

  return {
    entry: {
      index: path.join(__dirname, 'src/index.js'),
    },
    html: {
      index: {
        template: path.join(__dirname, 'index.html')
      }
    },
    outputPath: path.join(__dirname, 'dist'),
    publicPath,
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    hash: !isDev,
    webpack(config) {

    },
    extraPostCSSPlugins: [
      pxtoviewport({
        unitToConvert: 'px',
        viewportWidth: 375,
        unitPrecision: 5,
        propList: ['*', '!font*'],
        viewportUnit: 'vw',
        fontViewportUnit: 'px',
        selectorBlackList: [],
        minPixelValue: 1,
        mediaQuery: true,
        replace: true,
        exclude: [/\/node_modules\//],
        landscape: false,
        landscapeUnit: 'vw',
        landscapeWidth: 736
      })
    ],
    devServer: {
      port: 8000,
    },
    analyzer: false,
  }
}
