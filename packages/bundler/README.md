# curiosity-bundler

Shallow packaging webpack.

# Usage

安装

```sh
npm i curiosity-bundler -D
```

项目根目录新建curiosity.config.ts
```js
iimport path from 'path'
import { IConfig } from 'curiosity-bundler'

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
      // 配置你的webpack-chain config
    },
    devServer: {
      port: 8000,
    },
    analyzer: false,
  }
}


```
