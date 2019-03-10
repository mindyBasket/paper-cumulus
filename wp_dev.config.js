const webpack = require("webpack");
const merge = require("webpack-merge");
const base = require("./wp_base");

const dev = {
  plugins: [
    new webpack.DefinePlugin({
      IS_DEV: JSON.stringify(true),
      IS_PROD: JSON.stringify(false),
      'process.env.NODE_ENV': '"production"',
    })
  ]
};

module.exports = merge(base, dev);
