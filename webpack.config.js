//Variables for Dev Dependencies
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const parts = require('./webpack.parts');
const path = require('path');
const webpack = require('webpack');

//Absolute paths to the Public, SRC, and Styles directories
const PATHS = {
  public: path.join(__dirname, 'public'),
  src: path.join(__dirname, 'src'),
  styles: path.join(__dirname, 'src', 'scss'),
  fonts: path.join(__dirname, 'src', 'fonts'),
};

//Reference to the host name and port number
const options = {
  host: 'localhost',
  port: '8085',
};

//Configuration used for both the Development and Production Environment
const commonConfig = merge([
  {
    output: {
      path: PATHS.public,
      filename: '[name].[hash:8].js',
    },
    //Additional Plugins
    plugins: [
      //Creates an index.html file while linking each file required for our application to run
      new HtmlWebpackPlugin({
        title: '',
        template: path.join(PATHS.src, 'index.html'),
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
        },
      }),
      //Opens the application on the specified port at runtime
      new OpenBrowserPlugin({
        url: `http://${options.host}:${options.port}`,
      }),
      //Extracts CSS to a seperate file called style.css
      parts.extractText('style.[contenthash:8].css'),
      new webpack.LoaderOptionsPlugin({
        options: {
          eslint: {
            failOnWarning: false,
            failOnError: true,
            fix: false,

            //       // Output to Jenkins compatible XML
            //       // outputReport: {
            //       //     filePath: 'checkstyle.xml',
            //       //     formatter: require('eslint/lib/formatters/checkstyle'),
            //       // },
          },
        },
      }),
      //Splits specified code in the vendor array in the entry object to a vendor.bundle.js file
      parts.commonsChunk({name: 'vendor'}),
      // parts.purifyCSS({
      //   paths: glob.sync(`${PATHS.src}/**/*.js`, {nodir: true}),
      // }),
    ],
  },
  // Imports SASS loader
  parts.loadSASS(PATHS.styles),
  // Imports Babel loader
  parts.loadJSX(),
]);
//Production environment configuration additions
const productionConfig = merge([
  {
    entry: {
      index: PATHS.src,
      vendor: [
        'react',
        'react-dom',
      ],
    },
  },{
    plugins: [
      parts.cleanPublic(PATHS.public),
      parts.hashModuleIds(),
      parts.manifest(PATHS.public + '/'),

    ],
  },
  parts.extractBundles([
    {
      name: 'vendor',
    },{
      name: 'manifest',
      minChunks: Infinity,
    },
  ]),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  parts.minifyJavaScript(),
  parts.attachRevision(),
  //Generates Source Maps for js files
  parts.generateSourceMaps({ type: 'source-map' }),
]);
//Development environment configuration additions
const developmentConfig = merge([
  {
    entry: {
      index: PATHS.src,
    },
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.devServer({
    host: options.host,
    port: options.port,
    path: PATHS.public,
  }),
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
]);

//Exports Configuration based on environment
module.exports = (env) => {
  if(env == 'development') {
    return merge(commonConfig, developmentConfig);
  }

  return merge(commonConfig, productionConfig);
};
