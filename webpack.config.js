const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', //development
  entry: {
    main: path.resolve(__dirname, 'src/index.js'),
    login: path.resolve(__dirname, 'login/index.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  devtool: 'inline-source-map',
  devServer: {
    static: path.resolve(__dirname, 'dist/login.html'),
    port: 8080,
    open: true,
    hot: true,
  },
  // loaders
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.(svg|ico|png|webp|gif|jpeg)$/, type: 'asset/resource' }
    ],
  },
  // plugins
  plugins: [
    new HtmlWebpackPlugin({
      title: 'URL Shortner',
      filename: 'home.html',
      template: path.resolve(__dirname, 'src/template.html'),
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      title: 'URL Shortner Login',
      filename: 'index.html',
      template: path.resolve(__dirname, 'login/template.html'),
      chunks: ['login']
    }),
  ],
};
