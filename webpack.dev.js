const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common,{
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: './dist',
        hot: true,
        host: 'fe-chart.net',
        compress: true,
        overlay: true
    }
})