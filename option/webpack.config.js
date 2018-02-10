'use strict';
const path = require('path');

module.exports = {
  entry: path.resolve('.', 'option.test.js'),
  output: {
    path: path.resolve('.'),
    filename: 'index.test.js',
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader' },
    ],
  },
};
