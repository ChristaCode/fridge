const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js', // The entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output bundle file name
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Path to your HTML template
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Regex for JavaScript and JSX files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Loader for transpiling ES6 and JSX to ES5
        },
      },
      // You can add more loaders here for other file types (e.g., CSS, images)
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Automatically resolve these file extensions
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // or 'public', depending on your setup
    },
    historyApiFallback: true, // Add this line
    compress: true,
    port: 9000, // Port where dev server will run
  },
};
