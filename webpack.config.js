/*
 * Module Federation build for fat-it-interview.
 *
 * mfName must match plugin.json. Host loads window[mfName] from remoteEntry.js.
 * Shared singletons must match fat-notes-core (React 18.2 / antd 6.3.1).
 */
const path = require("path");
const { execFileSync } = require("child_process");
const {
  ModuleFederationPlugin,
} = require("@module-federation/enhanced/webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const manifest = require("./plugin.json");

const MF_NAME =
  process.env.PLUGIN_MF_NAME ||
  manifest.mfName ||
  manifest.container ||
  "plugin_7e2c9a14_6b58_4f3d_a1e0_9c8d4b7f2a61";

module.exports = (_, argv) => {
  const isProd = argv && argv.mode === "production";
  execFileSync(process.execPath, [path.resolve(__dirname, "scripts/buildAntdSandbox.js")], {
    stdio: "inherit",
    cwd: __dirname,
  });
  execFileSync(process.execPath, [path.resolve(__dirname, "scripts/buildEditorLibs.js")], {
    stdio: "inherit",
    cwd: __dirname,
  });
  // eslint-disable-next-line no-console
  console.log(
    `[fat-it-interview] building remoteEntry as MF name: "${MF_NAME}"`,
  );
  return {
    entry: "./src/bootstrap.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash:8].js",
      chunkFilename: isProd ? "[name].[contenthash:8].js" : "[name].js",
      publicPath: "auto",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        // 包的 exports 不暴露 umd。别名指向文件后，预览 iframe 才能内联 React。
        "fat-react-umd": path.resolve(
          __dirname,
          "node_modules/react/umd/react.production.min.js",
        ),
        "fat-react-dom-umd": path.resolve(
          __dirname,
          "node_modules/react-dom/umd/react-dom.production.min.js",
        ),
        "fat-lodash-umd": path.resolve(__dirname, "node_modules/lodash/lodash.min.js"),
        "fat-antd-sandbox": path.resolve(
          __dirname,
          "src/blocks/reactPlay/generated/antdSandbox.js",
        ),
      },
    },
    module: {
      rules: [
        {
          test: /[\\/]umd[\\/]react(?:-dom)?\.production\.min\.js$|[\\/]lodash\.min\.js$|[\\/]antdSandbox\.js$/,
          type: "asset/source",
        },
        {
          test: /\.(ts|tsx)$/,
          use: {
            loader: "ts-loader",
            options: { transpileOnly: true },
          },
          exclude: /node_modules/,
        },
        {
          // monaco-editor ESM 自带 css（编辑器样式），需要注入页面
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: MF_NAME,
        filename: "remoteEntry.js",
        library: { type: "global", name: MF_NAME },
        exposes: {
          "./plugin": "./src/index.tsx",
        },
        shared: {
          react: { singleton: true, requiredVersion: "18.2.0", eager: false },
          "react-dom": {
            singleton: true,
            requiredVersion: "18.2.0",
            eager: false,
          },
          "react/jsx-runtime": {
            singleton: true,
            requiredVersion: "18.2.0",
            eager: false,
          },
          "react-redux": {
            singleton: true,
            requiredVersion: "9.1.2",
            eager: false,
          },
          "react-intl": {
            singleton: true,
            requiredVersion: "6.8.4",
            eager: false,
          },
          antd: { singleton: true, requiredVersion: "6.3.1", eager: false },
        },
      }),
      new HtmlWebpackPlugin({ template: "./public/index.html" }),
      // Monaco editor workers/language chunks. Languages trimmed to those used
      // by interview answers (+ likely future ones) to keep dist small.
      // cpp / go / rust are required by the algorithm code samples.
      new MonacoWebpackPlugin({
        languages: [
          "javascript",
          "typescript",
          "css",
          "html",
          "xml",
          "json",
          "java",
          "python",
          "cpp",
          "go",
          "rust",
          "sql",
          "shell",
        ],
      }),
    ],
    devtool: isProd ? false : "source-map",
    optimization: { minimize: isProd },
  };
};
