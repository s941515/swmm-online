const webpack = require("webpack");
const UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");

const config = require("./webpack.config");

// 👇 強制指定生產環境的輸出路徑，解決 404 資源找不到與 React #170 崩潰
config.output = config.output || {};
config.output.publicPath = "/swmm-online/";

config.plugins.push(new UglifyJsPlugin({
    beautiful: false,
    comments: false
}));
config.plugins.push(
    new webpack.DefinePlugin({
        'process.env': {
            // This has effect on the react lib size
            'NODE_ENV': JSON.stringify('production'),
        }
    })
);

module.exports = config;
