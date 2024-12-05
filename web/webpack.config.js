const { resolve } = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'build'),
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: ['ts-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({ patterns: [{ from: 'assets', to: 'assets' }] }),
    new ProgressBarPlugin(),
    new HtmlWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: 'index.html',
      inject: 'body',
    }),
  ],
};
