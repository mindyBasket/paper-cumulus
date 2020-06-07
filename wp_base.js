const path = require('path');
// const webpack = require('webpack');
// const TerserPlugin = require('terser-webpack-plugin');

module.exports = {

  devtool: 'source-map', // cheap-module-source-map is TOO CHEAP

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx'],
  },

  module: {
    rules: [
      // Old way, for flipbook v1
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   include: path.resolve(__dirname, 'frontend/src'),
      //   loaders: ['babel-loader']
      // }
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'storypiper_view/src'),
        loaders: ['babel-loader', 'ts-loader'],
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },

  optimization: {
    minimize: true,
  },

  entry: {
    storypiper_view: './storypiper_view/src/index.tsx',
    // storypiper_editor: '...', // TODO: when the editor comes
  },

  output: {
    path: path.resolve(__dirname, 'static-storage/js'),
    filename: '[name].js',
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },

  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 600,
  },
};
