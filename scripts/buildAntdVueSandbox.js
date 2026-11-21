/**
 * 把 ant-design-vue 打成一段 IIFE，预览 iframe 在 Vue UMD 之后执行。
 * Vue 不打进包里，运行时用 iframe 里的 window.Vue，避免出现两份 Vue。
 */
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const vueGlobalPlugin = {
  name: "vue-global",
  setup(build) {
    build.onResolve({ filter: /^vue$/ }, (args) => ({
      path: args.path,
      namespace: "vue-global",
    }));
    build.onLoad({ filter: /.*/, namespace: "vue-global" }, () => ({
      contents: "module.exports = window.Vue;",
      loader: "js",
    }));
  },
};

async function buildAntdVueSandbox() {
  const outFile = path.resolve(
    __dirname,
    "../src/blocks/vuePlay/generated/antdVueSandbox.js",
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const result = await esbuild.build({
    stdin: {
      contents: `
        import * as antd from "ant-design-vue";
        import zhCN from "ant-design-vue/es/locale/zh_CN";
        import dayjs from "dayjs";
        import "dayjs/locale/zh-cn";
        dayjs.locale("zh-cn");
        const named = antd.Button ? antd : Object.assign({}, antd.default || {}, antd);
        if (typeof antd.install === "function") named.install = antd.install;
        else if (antd.default && typeof antd.default.install === "function") named.install = antd.default.install;
        window.antd = named;
        window.antdLocale = zhCN.default || zhCN;
      `,
      resolveDir: path.resolve(__dirname, ".."),
      sourcefile: "antdVueSandbox.js",
      loader: "js",
    },
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2019"],
    minify: true,
    legalComments: "none",
    outfile: outFile,
    plugins: [vueGlobalPlugin],
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
  buildAntdVueSandbox()
    .then((file) => {
      const size = fs.statSync(file).size;
      console.log(`[fat-it-interview] ant-design-vue sandbox ${file} (${size} bytes)`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { buildAntdVueSandbox };
