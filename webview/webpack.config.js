//@ts-check
const path = require('path');

const outputPath = path.resolve(__dirname, '../extension/pack');

const config = {
    target: 'web',

    entry: path.resolve(__dirname, 'src/main.ts'),
    output: {
		filename: 'webview.js',
        path: outputPath
    },
    devtool: 'eval-source-map',

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader']
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            },
            {
                test: /\.css$/,
                exclude: /\.useable\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    node : { fs: 'empty', net: 'empty' }
};

module.exports = config;