import { BundlerConfig } from '../src/types'
 
const config: BundlerConfig = [{
  context: './',
  alias: {
    '@@': './src',
  },
  configWebpack(config) {
      
  },
}]

export default config;
