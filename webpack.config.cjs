const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const WebpackObfuscator = require('webpack-obfuscator')

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
  addUglify(config, options)
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
  addUglify(config, options)
  return config
}

// to test the production app you will need to build it; doesn't run from the ide
function addUglify (config, options) {
  if (options.mode !== 'production') return
  config.plugins.push(new WebpackObfuscator({
    controlFlowFlattening: true,
    deadCodeInjection: true,
    debugProtection: true,
    disableConsoleOutput: true,
    selfDefending: true
  }))
}
