const webpack = require("webpack");
const merge = require("webpack-merge");
const base = require("./wp_base");

const prod = {
  plugins: [
    new webpack.DefinePlugin({
      IS_DEV: JSON.stringify(false),
      IS_PROD: JSON.stringify(true),
      'process.env.NODE_ENV': '"production"',
    })
  ]
};

module.exports = merge(base, prod);
