//@ts-check
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const outputPath = path.resolve(__dirname, '../extension/pack');

/**@type {import('webpack').Configuration}*/
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
                exclude: /node_modules/,
                use: ['ts-loader']
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                exclude: /node_modules/,
                enforce: 'pre'
            },
            {
                test: /\.css$/,
                exclude: /\.useable\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(ttf)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: '',
                    publicPath: '..',
                    postTransformPublicPath: (p) => `__webpack_public_path__ + ${p}`,
                }
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "node_modules/libavoid-js/dist/libavoid.wasm" }
            ],
        }),
    ]
};

module.exports = config;
