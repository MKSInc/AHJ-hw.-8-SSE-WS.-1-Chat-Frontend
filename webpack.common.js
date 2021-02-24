const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Хеширование файлов только в production mode
function addHash(fileName, buildMode, hash = 'contenthash') {
  return buildMode === 'production' ? fileName.replace(/\.[^.]+$/, `.[${hash}]$&`) : fileName;
}

module.exports = (buildMode) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve('..', 'AHJ-hw.-8-SSE-WS.-1-Chat-Backend', 'public'),
    // path: path.resolve(__dirname, 'dist'),
    filename: addHash('[name].js', buildMode),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader',
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new MiniCssExtractPlugin({
      filename: addHash('[name].css', buildMode),
      chunkFilename: addHash('[id].css', buildMode),
    }),
  ],
});
