var path = require('path');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {

  devtool: "cheap-module-source-map",

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
    minimize: true
  },
  plugins: [
    new webpack.DefinePlugin({
             'process.env.NODE_ENV': '"production"'
    }),
    new BundleAnalyzerPlugin(),

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

