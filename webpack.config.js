const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const contentBase = path.join(__dirname, 'dist');

// I just use this to inspect objects in console.log:
//const util = require('util')

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
    // We actuallt set path at the bottom of the config.
    path: contentBase,
    publicPath: '/',
    filename: '[name][hash:5].js'
  },
  module: {
    rules: [
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

  switch (argv.build) {
    case 'es5':
      config.output.path += '/es5';
      config.plugins.push(new CleanWebpackPlugin(['dist/es5']));
      // We can specify the Babel options, presets or whatnot
      // in there I think. But I'm using babelrc.
      config.module.rules.push(
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        }
      );
      break;
    default:
      config.output.path += '/default';
      config.plugins.push(new CleanWebpackPlugin(['dist/default']));
  }

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