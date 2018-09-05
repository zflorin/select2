const webpack = require('webpack');
const path = require("path")
const fs=require("fs");

const HtmlWebpackPlugin = require("html-webpack-plugin")
module.exports = {
    entry: [path.join(__dirname, "dev", "src", "index.tsx")],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    output: {
        path: path.join(__dirname, "dev", "dist"),
        filename: "index_bundle.js"
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
                include: path.join(__dirname, 'src'),
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: true,
                            namedExport: true,
                            camelCase: true,
                            localIdentName: "[local]" // use css names as defined

                        }
                    },
                    {
                        loader: "sass-loader",
                    }
                    ]
            }
        ]
    },
    plugins: [
        //new CleanWebpackPlugin([path.join(__dirname, "dev", "dist")], {exclude:".gitkeep"}),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "dev", "src", "index.html")  // Specify the HTML template to use
        }),
        new webpack.WatchIgnorePlugin([
            /css\.d\.ts$/
        ]),
        new webpack.BannerPlugin({
            banner: fs.readFileSync(path.join(__dirname, "LICENSE.md"), "utf8"),
            raw: false,
            entryOnly: true,
        })

    ]
}