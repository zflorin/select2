const webpack = require('webpack');
const path = require("path")
const fs = require("fs");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: [path.join(__dirname, "src", "select2.tsx")],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "select25.js",
        library: "select25",
        libraryTarget: "umd"
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: true,
                            namedExport: true,
                            camelCase: true,
                            localIdentName: "[local]"
                        }
                    },
                    'sass-loader'
                ],
            }
            ]
    },
    externals: [{
        'react': {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        }
    }, {
        'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom'
        }
    }],
    plugins: [
        new CleanWebpackPlugin(['dist'], {exclude:".gitkeep"}),
        new MiniCssExtractPlugin({
            filename: "select25.css"
        }),
        new CopyWebpackPlugin([
            {from: path.join(__dirname, "src", "select2-jquery-bridge.js"), to: "select25-jquery-bridge.js"}
        ]),
        new webpack.BannerPlugin({
            banner: function() {
                var header="";
                header+=fs.readFileSync(path.join(__dirname, "LICENSE.md"), "utf8");
                header+="\r\n";
                header+="\r\nBuild Timestamp: "+(new Date().toISOString());
                return header;
                },
            raw: false,
            entryOnly: true,
        })

    ]
}