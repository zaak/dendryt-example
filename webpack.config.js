const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	entry: "./src/index.js",
	output: {
		path: path.join( __dirname, 'dist' ),
		filename: "bundle.js"
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({minimize: true})
	]
};
