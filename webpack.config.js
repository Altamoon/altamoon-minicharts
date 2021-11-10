/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    library: 'minichartGrid',
    libraryTarget: 'umd',
    filename: 'minichartGrid.min.js',
    libraryExport: 'default',
    path: path.resolve(__dirname, 'docs'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: '' },
        { from: 'src/style.css', to: '' },
        { from: 'src/minichartGrid.d.ts', to: '' },
      ],
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV', 'SKIP_RUNTIME_TESTS']),
    new UnminifiedWebpackPlugin({
      exclude: /.*.css/,
      // include: /.*minichartGrid\.min\.js/,
    }),
  ],
  devServer: {
    hot: true,
  },
};
