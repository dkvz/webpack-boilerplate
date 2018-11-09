const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const contentBase = path.join(__dirname, 'dist');

// Generates config objects for HtmlWebpackPlugin instances:
const minifyOptions = {
  removeComments: true,
  collapseWhitespace: true,
  removeAttributeQuotes: false
}

const config = {
  entry: {
    app: './src/app.js'
  },
  output: {
    path: contentBase,
    publicPath: '/',
    filename: '[name][hash:5].js'
  },
  optimization: {
    // Had to add the minimize stuff because of 
    // a bug in Safari that shows up only
    // on minified code.
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: {
            safari10: true
          }
        }
      })
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'static/[name][hash:7].[ext]'
            }
          }
        ]
      },
      {
        test: /\.pdf$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1,
              name: 'static/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static/'
          }
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css',
    }),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      { from: 'webroot', to: '' }
    ])
  ],
  devServer: {
    contentBase: contentBase,
    historyApiFallback: true,
    publicPath: '/',
    port: 8081
  }
};

// I have to do this export a function thingy just because
// I need to determine the environment, and NODE_ENV is not
// just unreliable, it's NOT WORKING AT ALL.
module.exports = (env, argv) => {

  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  // Add the main index page here:
  config.plugins.push(
    new HtmlPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: (argv.mode === 'production') ? minifyOptions : false
    })
  );
  
  return config;
};