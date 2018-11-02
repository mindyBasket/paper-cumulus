var path = require('path');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
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
  plugins: [new BundleAnalyzerPlugin()],
  entry: 
  {
      main: "./frontend/src/index.js"
  },
  output: {
    path: __dirname + "/frontend/static/frontend",
    filename: "[name].js"
  },
};