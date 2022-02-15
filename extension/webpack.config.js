// @ts-nocheck
'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node', 

    entry: path.resolve(__dirname, 'src/main.ts'),
    output: { 
        path: path.resolve(__dirname, 'pack'),
        filename: 'main.js',
        libraryTarget: "commonjs2"
    },
    devtool: 'nosources-source-map',
    externals: {
        vscode: "commonjs vscode"
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            onlyCompileBundledFiles: true,
                            compilerOptions: {
                                outDir: "dist",
                                declaration: true,
                                declarationMap: true,
                            },
                        },
                    },
                ],
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
}

module.exports = config;