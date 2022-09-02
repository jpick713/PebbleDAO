/* eslint @typescript-eslint/no-var-requires: "off" */
const webpack = require('webpack')

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url')
  })
  config.resolve.fallback = fallback

  config.module.rules[config.module.rules[1] ? 1 : 0].oneOf[4] = {
    test: /\.(js|mjs)$/,
    exclude: /@babel(?:\/|\\{1,2})runtime/,
    loader: require.resolve('babel-loader'),
    resolve: {
      fullySpecified: false
    },
    options: {
      babelrc: false,
      configFile: false,
      compact: false,
      presets: [[require.resolve('babel-preset-react-app/dependencies'), { helpers: true }]],
      cacheDirectory: true,
      // See #6846 for context on why cacheCompression is disabled
      cacheCompression: false,
      // @remove-on-eject-begin
      cacheIdentifier:
        'development:babel-plugin-named-asset-import@0.3.8:babel-preset-react-app@10.0.1:react-dev-utils@12.0.1:react-scripts@5.0.1',
      // @remove-on-eject-end
      // Babel sourcemaps are needed for debugging into node_modules
      // code.  Without the options below, debuggers like VSCode
      // show incorrect code and set breakpoints on the wrong lines.
      sourceMaps: true,
      inputSourceMap: true
    }
  }
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    })
  ])
  return config
}