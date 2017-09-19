const BabiliPlugin = require('babili-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const cssnano = require('cssnano');
const ETP = require('extract-text-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const webpack = require('webpack');

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
});

exports.cleanPublic = (path) => new CleanWebpackPlugin(path);

exports.commonsChunk = (entry) => new webpack.optimize.CommonsChunkPlugin(entry);

exports.devServer = ({host, port, path} = {})=> ({
  devServer: {
    compress: true,
    contentBase: path,
    historyApiFallback: true,
    host,
    port,
    overlay: {
      errors: true,
      warnings: true,
    },
    stats: 'errors-only',
  },
});

exports.extractBundles = (bundles) => ({
  plugins: bundles.map((bundle) => (
    new webpack.optimize.CommonsChunkPlugin(bundle)
  )),
});

exports.extractText = (filename) => new ETP(filename);

exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});

exports.hashModuleIds = () => new webpack.HashedModuleIdsPlugin();

exports.loadCSS = () => ({
  module:{
    loaders: [{
      test: /\.css$/,
      loader: ETP.extract({
        fallback: 'style-loader',
        use: 'css-loader!postcss-loader',
      }),
    }],
  },
});

exports.loadFonts = (path, options) => ({
  module: {
    loaders: [{
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      include: path,
      exclude : /\node_modules/,
      use: {
        loader: 'url-loader?limit=10000',
        options
      }
    }],
  }
});

exports.loadJSX = () => ({
  module:{
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: '/node_modules/',
      loader: 'babel-loader',
    }],
  },
});

exports.loadSASS = (path) => ({
  module: {
    loaders: [{
      test: /\.(css|sass|scss)$/,
      use: ETP.extract({
        fallback: 'style-loader',
        use: 'css-loader!postcss-loader!sass-loader',
      }),
      include: path,
    }],
  },
});

exports.manifest = (path) => new ManifestPlugin({
  fileName: 'manifest.json',
  basePath: path,
  seed: {
    name: 'Manifest'
  }
});

exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});

exports.minifyJavaScript = () => ({
  plugins: [
    new BabiliPlugin(),
  ],
});

exports.purifyCSS = ({ paths }) => (new PurifyCSSPlugin({paths}));


