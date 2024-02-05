# curiosity-bundler

Shallow packaging webpack5.

# Usage

安装

```sh
npm i curiosity-bundler -D
```

项目根目录新建bundler.config.ts
```js
iimport path from 'path'
import { Config } from 'curiosity-bundler'

const config: Config = {
    entry: {
      index: path.join(__dirname, 'src/index.js'),
    },
    html: {
      index: {
        template: path.join(__dirname, 'index.html')
      }
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configWebpack(config) {
      // webpack config
    },
}

export default config
```
