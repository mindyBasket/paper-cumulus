var path = require('path');
var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new webpack.DefinePlugin({
             'process.env.NODE_ENV': '"production"'
    }),
  ],
  entry: 
  {
      main: "./frontend/src/index.js"
  },
  output: {
    path: __dirname + "/frontend/static/frontend",
    filename: "[name].js"
  },
};