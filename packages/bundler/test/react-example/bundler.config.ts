import * as path from 'path';
import { Config } from '../../src/types';
 
const config: Config = {
  entry: './src/index.tsx',
  html: {
    index: {
      template: path.join(__dirname, './index.html'),
    }
  },
  alias: {
    '@': './src',
  },
  analyzer: false
};

export default config;
