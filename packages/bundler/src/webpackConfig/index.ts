import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { WebpackConfiguration, WebpackConfigOptions } from '../types'
import { makeArray } from '../utils'
import { cssConfig } from './css'


export function webpackConfig(options: WebpackConfigOptions) {
  const { cwd, config } = options;
  
  const {
    context = cwd,
    entry,
    html,
    publicPath,
    dest = 'dist',
    externals,
    alias,
    extraBabelIncludes,
    tsConfigFile = path.resolve(cwd, 'tsconfig.json'),
    configWebpack,
  } = config;


  const rules: WebpackConfiguration['module']['rules'] = [{
    test: /\.mjs$/,
    include: [cwd],
    use: [require.resolve('babel-loader')],
  }, {
    test: /\.js$/,
    include: [cwd],
    exclude: [/node_modules/],
    use: [require.resolve('babel-loader')],
  }, {
    test: /\.jsx$/,
    include: [cwd],
    use: [require.resolve('babel-loader')],
  }, {
    test: /\.tsx?$/,
    use: [
      require.resolve('babel-loader'),
      {
        loader: require.resolve('ts-loader'),
        options: {
          transpileOnly: true,
          configFile: tsConfigFile,
        }
      }
    ]
  }]

  if (extraBabelIncludes) {
    rules.push({
      test: /\.jsx?$/,
      include: makeArray(extraBabelIncludes),
      use: [require.resolve('babel-loader')],
    })
  }

  const plugins = []

  if (html) {
    for (const key in html) {
      const options = html[key]
      plugins.push(new HtmlWebpackPlugin({
        filename: `${key}.html`,
        ...options,
      }))
    }
  }

  const webpackConfig: WebpackConfiguration = {
    context,
    entry,
    output: {
      publicPath,
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: path.resolve(cwd, dest)
    },
    externals,
    resolve: {
      alias,
      extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
        '.wasm',
        '.mjs',
      ],
      symlinks: true,
      modules: [
        'node_modules',
        path.join(__dirname, '../../node_modules')
      ]
    },
    resolveLoader: {
      modules: [
        'node_modules',
        path.join(__dirname, '../../node_modules')
      ]
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /\/node_modules\//,
            name: 'vendors',
            chunks: 'all',
          }
        }
      }
    },
    module: {
      rules,
    }
  }

  cssConfig(webpackConfig, options)

  if (configWebpack) {
    configWebpack(webpackConfig);
  }

  return webpackConfig;
}
