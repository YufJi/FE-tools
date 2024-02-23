# curiosity-bundler

Bundler是一个基于Webpack5的封装工具。它简化了Webpack配置的复杂性，提供了一种更简洁、更直观的方式来打包应用程序。Bundler不仅继承了Webpack的强大功能，如模块热替换和代码分割，还提供了一些额外的工具和设置来优化开发体验和生产效率。

## 使用

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

## 配置说明

- **mode**：Webpack的模式设置，可选值为`development`、`production`或`none`
- **context**：Webpack的上下文路径
- **entry**：Webpack的入口文件
- **html**：HtmlWebpackPlugin的选项
- **alias**：模块别名，用于Webpack解析
- **externals**：外部扩展，这些模块不会被打包到bundle中
- **publicPath**：公共URL路径
- **dest**：输出目录
- **configWebpack**：用户自定义Webpack配置函数
- **extraTranspileIncludes**：额外的转译包含路径
- **tsConfigFile**：TypeScript配置文件路径
- **hash**：是否启用hash
- **minify**：是否压缩
- **devServer**：开发服务器的配置
- **cssLoaderOptions**：CSS加载器选项
- **cssModulesExcludes**：CSS模块排除选项
- **lessLoaderOptions**：Less加载器选项
- **autoprefixer**：自动添加浏览器前缀选项
- **extraPostCSSPlugins**：额外的PostCSS插件
- **devtool**：Webpack devtool选项
- **analyzer**：是否启用包分析器
- **extraPlugins**：额外的Webpack插件
- **extarRules**：额外的Webpack规则
