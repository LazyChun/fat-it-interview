/**
 * 把 antd 打成一段 IIFE，预览 iframe 在 React UMD 之后执行。
 * React 不打进包里，运行时用 iframe 里的 window.React，避免出现两份 React。
 */
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const REACT_GLOBALS = {
  react: "React",
  "react-dom": "ReactDOM",
  "react-dom/client": "ReactDOM",
};

const reactGlobalPlugin = {
  name: "react-globals",
  setup(build) {
    build.onResolve({ filter: /^(react|react-dom|react-dom\/client)$/ }, (args) => ({
      path: args.path,
      namespace: "react-global",
    }));
    build.onLoad({ filter: /.*/, namespace: "react-global" }, (args) => ({
      contents: `module.exports = window.${REACT_GLOBALS[args.path]};`,
      loader: "js",
    }));
  },
};

async function buildAntdSandbox() {
  const outFile = path.resolve(
    __dirname,
    "../src/blocks/reactPlay/generated/antdSandbox.js",
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const result = await esbuild.build({
    stdin: {
      contents: `import * as antd from "antd";\nwindow.antd = antd;\n`,
      resolveDir: path.resolve(__dirname, ".."),
      sourcefile: "antdSandbox.js",
      loader: "js",
    },
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2019"],
    minify: true,
    legalComments: "none",
    outfile: outFile,
    plugins: [reactGlobalPlugin],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    logLevel: "warning",
  });
  if (result.errors && result.errors.length) {
    throw new Error(result.errors.map((item) => item.text).join("\n"));
  }
  return outFile;
}

if (require.main === module) {
  buildAntdSandbox()
    .then((file) => {
      const size = fs.statSync(file).size;
      console.log(`[fat-it-interview] antd sandbox ${file} (${size} bytes)`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { buildAntdSandbox };
