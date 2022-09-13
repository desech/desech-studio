const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = function (env, options) {
  return [getClientSide(options), getServerSide(options)]
}

function getClientSide (options) {
  const config = {
    target: 'web',
    entry: './src/js/index.js',
    output: {
      filename: 'script.js',
      path: path.resolve(__dirname, 'app/js')
    },
    plugins: [
      new CircularDependencyPlugin(),
      new webpack.ExternalsPlugin('commonjs', [
        'electron'
      ])
    ]
  }
  return config
}

function getServerSide (options) {
  const config = {
    target: 'electron-main',
    entry: './src/electron/index.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'app')
    },
    plugins: [
      new CircularDependencyPlugin()
    ],
    externals: [nodeExternals()]
  }
  return config
}
