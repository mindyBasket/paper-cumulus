var path = require('path');
var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {

  devtool: "source-map", // cheap-module-source-map is TOO CHEAP

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "frontend/src"),
        loaders: ["babel-loader"]
      }
    ]
  },
  optimization: {
    minimize: true,
  },
  entry: 
  {
      main: "./frontend/src/index.js"
  },
  output: {
    path: __dirname + "/frontend/static/frontend",
    filename: "[name].js"
  },
};