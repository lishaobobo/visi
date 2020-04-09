const { resolve, join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
// 设置输入和输出根目录
const APP_PATH = resolve(__dirname, "src");
const BUILD_PATH = resolve(__dirname, "dist");

module.exports = {
  entry: {
    index: "./src/index.js",
    // vendor: ['vue', 'vue-router', 'vuex', 'axios', 'babel-polyfill', 'd3', 'es6-promise'] //多页应用时放开
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      title: "fe-chart",
      // favicon: './src/assets/favicon.ico',
      template: `./src/index.html`,
      filename: `index.html`,
      inject: "body",
      hash: true,
      minify: {
        // 压缩HTML文件
        removeComments: true, // 移除HTML中的注释
        collapseWhitespace: false, // 删除空白符与换行符
      },
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
  ],
  optimization: {
    minimize: true,
  },
  output: {
    filename: "assets/js/[name].[hash].js",
    path: BUILD_PATH,
    chunkFilename: "assets/js/[name].[hash].js",
  },
  module: {
    rules: [
      {
        test: /\.(csv|tsv)$/,
        use: ["csv-loader"],
      },
      {
        test: /\.xml$/,
        use: ["xml-loader"],
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(csv|tsv)$/,
        loader: "file-loader",
        options: {
          name: "assets/csv/[name].[ext]",
        }
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: "file-loader",
        options: {
          name: "assets/images/[name]-[hash:6].[ext]",
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
        options: {
          name: "fonts/[name]-[hash:6].[ext]",
        }
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader", // 将 JS 字符串生成为 style 节点
          "css-loader", // 将 CSS 转化成 CommonJS 模块
          "sass-loader", // 将 Sass 编译成 CSS，默认使用 Node Sass
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["transform-class-properties"],
          }
        }
      },
    ],
  },
  resolve: {
    alias: {
      components: join(APP_PATH, "components"), // 定义文件路径， 加速打包过程中webpack路径查找过程
      sass: join(APP_PATH, "sass"),
      js: join(APP_PATH, "common/js"),
    },
    extensions: [".js", ".scss", ".vue", ".json"], // 可以不加后缀, 直接使用 import xx from 'xx' 的语法
  },
};
