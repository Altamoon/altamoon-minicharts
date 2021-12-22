/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

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
      {
        test: /\.worker\.js$/,
        use: 'worker-loader', // charts listener uses worker
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    library: 'altamoonMinicharts',
    libraryTarget: 'umd',
    filename: 'altamoonMinicharts.min.js',
    chunkFilename: '[id].[chunkhash].js',
    libraryExport: 'default',
    path: path.resolve(__dirname, 'docs'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: '' },
        { from: 'style.css', to: '' },
      ],
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV', 'SKIP_RUNTIME_TESTS']),
  ],
  devServer: {
    hot: true,
  },
};
