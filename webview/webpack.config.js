//@ts-check
const path = require('path');

const outputPath = path.resolve(__dirname, 'out');

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'web',

    entry: path.resolve(__dirname, 'src/main.ts'),
    output: {
		filename: 'webview.js',
        path: outputPath
    },
    devtool: 'nosources-source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ]
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
    }
};

module.exports = config;