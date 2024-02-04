import { BundlerConfig } from '../src/types'
 
const config: BundlerConfig = [{
  context: './',
  entry: "./src/index.js",
  html: {
    index: {
      template: 'index.html',
      filename: 'index',
    }
  },
  alias: {
    '@@': './src',
  },
  extraBabelIncludes: [
    /node_modules\/lodash/
  ]
}]

export default config;
