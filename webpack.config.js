const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  mode: 'development', // Set the mode
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // CSS loaders
      },
      {
        test: /\.(png|jpe?g|gif)$/i, // Regex to match image files
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]', // Output file naming format
              outputPath: 'images/', // Directory to output image files
            },
          },
        ],
      },
      // Add other loaders for different file types as needed
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  // ... other configurations
};
