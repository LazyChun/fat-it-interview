import type { Question } from "./types";

/**
 * Vite 专题。原「为什么快」仍在题库里，这里补预构建、热更新、
 * 环境变量、插件、资源、拆包、库模式、CSS 和开发代理。
 * 事实对齐 Vite 8（2026-03）：Rolldown + Oxc 取代 esbuild 与 Rollup。
 */
export const frontendViteQuestions: Question[] = [
  {
    id: "fe-vite-prebundle",
    category: "frontend",
    title: "依赖预构建在做什么",
    difficulty: "medium",
    tags: ["Vite", "构建"],
    prompt: "浏览器为什么请求不了 import 'vue'？预构建缓存什么时候会失效，链接的本地包又该怎么处理？",
    parts: [
      {
        type: "list",
        items: [
          "裸导入不是合法的 URL。Vite 扫描入口，把依赖打进 node_modules/.vite/deps，再把源码里的裸导入改写成 /node_modules/.vite/deps/vue.js?v=哈希，浏览器才能发请求。",
          "这一步做两件事：把 CommonJS / UMD 转成 ESM；把一个包里几百个小文件合并成少量请求。lodash-es 这种如果不预构建，开发时会打出瀑布式请求。",
          "业务源码不进预构建，仍然按原生 ESM 按需编译。预构建产物按强缓存头发，所以依赖本身几乎不再占用热更新时间。",
          "缓存键包含锁文件、相关配置和 Vite 版本。改了依赖或配置要重启开发服务器；仍然对不上时删掉 node_modules/.vite。",
          "扫描漏掉的动态依赖会在运行中才被发现。开发服务器返回依赖过期（常见 504），重新预构建并整页刷新。optimizeDeps.include 用来提前声明这些包。",
          "Vite 7 及更早用 esbuild 做预构建。Vite 8 起改由 Rolldown 做，配置从 optimizeDeps.esbuildOptions 迁到 optimizeDeps.rolldownOptions。旧字段还会自动转换，但已经废弃。",
          "工作区里链接的本地包默认当作源码，不预构建，改动能直接进热更新。它若是 CommonJS 或内部文件极多，再放进 optimizeDeps.include。已经进了缓存的 node_modules 文件，改了也不会热更新。",
          "Vite 8 还统一了开发和生产对 CommonJS default 导入的判断。旧版本会出现「开发正常、构建拿到 undefined」，过渡期可以暂时打开 legacy.inconsistentCjsInterop。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "export default defineConfig({\n  optimizeDeps: {\n    include: [\"lodash-es\"],\n    exclude: [\"@my/local-pkg\"],\n  },\n});",
      },
    ],
    followUps: ["页面一打开就 504，终端在重新优化依赖。怎么判断是扫描漏了，还是缓存和锁文件不一致？"],
  },
  {
    id: "fe-vite-hmr",
    category: "frontend",
    title: "热更新边界怎么划定",
    difficulty: "hard",
    tags: ["Vite", "HMR"],
    prompt: "改一个工具函数，什么时候只换模块，什么时候整页刷新？import.meta.hot 要怎么写才生效？",
    parts: [
      {
        type: "list",
        items: [
          "文件变化后，Vite 沿模块图向上找，直到某个模块调用了 import.meta.hot.accept。这个模块就是热更新边界。边界之上的导入方不会收到通知。",
          "找不到边界就整页刷新。Vue 插件和 React Refresh 在组件文件上自动 accept，所以改组件通常不丢状态。没人接受的纯函数会一直冒泡到入口。",
          "accept 必须在源码里写成静态的 import.meta.hot.accept(。Vite 靠静态分析识别边界，运行时拼出来的调用不算。",
          "自接受时，回调拿到新模块。Vite 不给旧模块套一层代理，边界如果再导出依赖，要用 let 自己把绑定更新掉。",
          "dispose 在模块被替换前执行，用来清定时器和全局监听。回调里的 data 会传给下一次模块实例，用来保住开发时的局部状态。",
          "CSS 由注入的 style 标签更新文本，不重跑组件，所以改样式一般不丢输入框里的内容。",
          "插件的 handleHotUpdate 可以接管：返回空数组表示这个文件自己处理了，不再走默认失效；返回模块列表则指定这次要更新谁。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "if (import.meta.hot) {\n  import.meta.hot.accept((mod) => {\n    if (!mod) return;\n    applyConfig(mod.config);\n  });\n  import.meta.hot.dispose((data) => {\n    clearInterval(timer);\n    data.draft = readDraft();\n  });\n}",
      },
    ],
    followUps: ["热更新之后同一条全局监听执行了两次，应该补在 accept 里还是 dispose 里？"],
  },
  {
    id: "fe-vite-env",
    category: "frontend",
    title: "环境变量和 mode",
    difficulty: "medium",
    tags: ["Vite", "环境变量"],
    prompt: "为什么 .env 里的密钥不能加 VITE_ 前缀？vite build --mode staging 时，PROD 和 MODE 各是什么？",
    parts: [
      {
        type: "list",
        items: [
          "只有匹配前缀的变量会进客户端，默认前缀是 VITE_，可以用 envPrefix 改。其余变量在业务代码里是 undefined。",
          "业务里读 import.meta.env.VITE_*。构建时这些访问被换成字面量，所以 if (import.meta.env.DEV) 里的调试代码能从生产包里摇掉。值永远是字符串，\"false\" 也是真值，要自己转类型。",
          "内置字段有 MODE、BASE_URL、DEV、PROD、SSR。PROD 看的是 NODE_ENV 是不是 production，看的不是 mode 的名字。",
          "vite build --mode staging 会加载 .env、.env.local、.env.staging、.env.staging.local，MODE 是 staging。NODE_ENV 仍是 production，所以 PROD 为 true、DEV 为 false，构建照常压缩和摇树。",
          "优先级从高到低：启动进程里已经存在的变量、.env.[mode].local、.env.[mode]、.env.local、.env。具体模式覆盖通用文件。.local 文件不要提交。改了 .env 需要重启开发服务器。",
          "vite.config.ts 里没有现成的 import.meta.env。按模式读文件用 loadEnv(mode, process.cwd(), \"\")。第三个参数是前缀，空字符串才读得到没有 VITE_ 的变量，那些变量只能留在配置和 Node 进程里。",
          "define 是另一条路：编译期替换任意标识符。字符串要自己 JSON.stringify，否则会被当成源码里的变量名。它适合兼容 process.env.NODE_ENV 这种旧写法。",
          "任何 VITE_ 变量都会出现在用户下载的 JS 里。接口密钥和数据库密码走服务端，不要靠前缀隐藏。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "export default defineConfig(({ mode }) => {\n  const env = loadEnv(mode, process.cwd(), \"\");\n  return {\n    define: {\n      __API__: JSON.stringify(env.VITE_API),\n    },\n  };\n});",
      },
    ],
    followUps: ["同一个变量既写在 shell 里又写在 .env.production 里，构建时用哪一个？"],
  },
  {
    id: "fe-vite-plugin",
    category: "frontend",
    title: "Vite 插件和 Rollup 插件",
    difficulty: "hard",
    tags: ["Vite", "插件"],
    prompt: "Vite 插件为什么大多能直接用 Rollup 插件？enforce 和 apply 改变的是哪一段？",
    parts: [
      {
        type: "list",
        items: [
          "Vite 插件就是带额外选项的 Rollup 插件。resolveId、load、transform、generateBundle 这些钩子两边通用，所以多数 Rollup 插件能放进 plugins。Vite 8 换成 Rolldown 后，这套钩子仍然兼容。",
          "开发时钩子在浏览器请求某个模块时才跑，没有一次完整的打包。generateBundle 这类只在构建期有意义的钩子，开发服务器不会触发。",
          "Vite 自己的钩子：config 在解析前返回一部分配置参与合并；configResolved 在合并后只读；configureServer 和 configurePreviewServer 加中间件；transformIndexHtml 改 HTML；handleHotUpdate 改热更新。",
          "执行顺序：别名，然后是 enforce 为 pre 的用户插件，再是 Vite 核心插件，然后是没写 enforce 的用户插件，再是构建插件，最后才是 post。要改解析路径的插件放 pre，否则核心插件已经按原路径把文件读走了。",
          "apply 取 serve、build，或一个函数看本次命令决定。只在开发期注入调试脚本的插件不要进生产构建。",
          "configureServer 里直接 server.middlewares.use，排在 Vite 内部中间件之前。钩子 return 一个函数，才会排到内部中间件之后，适合做兜底处理。",
          "「改了文件却没生效」经常是钩子顺序问题。用 vite-plugin-inspect 看每个钩子实际吃到的代码，比猜数组顺序可靠。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function apiFallback(): Plugin {\n  return {\n    name: \"api-fallback\",\n    apply: \"serve\",\n    configureServer(server) {\n      return () => {\n        server.middlewares.use((req, res, next) => {\n          if (req.url?.startsWith(\"/api\")) res.statusCode = 404;\n          next();\n        });\n      };\n    },\n  };\n}",
      },
    ],
    followUps: ["插件要改 index.html 的标题，为什么不要自己 readFile 再 writeFile？"],
  },
  {
    id: "fe-vite-asset",
    category: "frontend",
    title: "静态资源、public 和 glob",
    difficulty: "medium",
    tags: ["Vite", "资源"],
    prompt: "放进 src 和放进 public 的图片，产物差在哪？import.meta.glob 的参数为什么必须是字面量？",
    parts: [
      {
        type: "list",
        items: [
          "从源码 import 的文件会进模块图。小于 assetsInlineLimit（默认 4KB）的资源内联成 data URI，更大的产出带内容哈希的文件名。内容变了哈希变，缓存可以设得很长。",
          "查询后缀能改处理方式：?url 强制要 URL，?raw 要字符串，?inline 强制内联。Worker 用 new URL(\"./w.ts\", import.meta.url) 或 ?worker，开发和生产才能解析到同一个文件。",
          "public 目录原样拷到产物根目录，不哈希、不压缩，也不能在 JS 里 import。适合 favicon、robots.txt，以及文件名必须固定的文件。引用写根路径。",
          "base 是产物里资源 URL 的前缀，可以是 /repo/，也可以是 CDN 原点。运行时拼接路径用 import.meta.env.BASE_URL。部署子目录却把 base 留成 / 时，HTML 能开，JS 和 CSS 全部 404。",
          "base 设成相对的 ./，资源会相对当前页面解析，适合挂到事先不知道的子路径上。Router 的 history base 要和它一起改。",
          "import.meta.glob(\"./modules/*.ts\") 在编译期展开成按路径懒加载的映射，适合插件目录和约定式路由。参数必须是字面量，变量拼出来的路径在构建时分析不到。eager: true 改成同步导入。",
          "import(`./views/${name}.vue`) 这种变量导入，Vite 会把能匹配的文件都收进一张表。目录放得太大，整棵目录都会进包。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "const pages = import.meta.glob(\"./views/*.vue\");\n\nexport function loadView(name: string) {\n  const key = `./views/${name}.vue`;\n  const load = pages[key];\n  if (!load) throw new Error(`missing view: ${name}`);\n  return load();\n}",
      },
    ],
    followUps: ["希望上线后地址永远是 /logo.png，这张图该放哪，长缓存会受到什么影响？"],
  },
  {
    id: "fe-vite-split",
    category: "frontend",
    title: "生产构建怎么拆包",
    difficulty: "medium",
    tags: ["Vite", "拆包"],
    prompt: "动态 import() 和手动拆 vendor，在 Vite 里分别怎么落地？Vite 8 改了哪项配置？",
    parts: [
      {
        type: "list",
        items: [
          "应用构建的默认入口是 index.html。Vite 从里面的 script 和链接出发找模块，配置里不必再写一份 entry。多页应用把多个 HTML 填进 rolldownOptions.input。",
          "生产要打包，是为了压缩、拆包、摇树和长缓存，避免浏览器发几百个请求。Vite 7 及更早用 Rollup；Vite 8 起底层是 Rolldown。build.rollupOptions 改名为 build.rolldownOptions，旧名字还能用，但已废弃。",
          "业务代码里的 import() 会自然拆成异步 chunk。路由页面按这个边界拆，比按文件夹手拆更稳，也和加载时机一致。",
          "Vite 8 去掉了对象形式的 manualChunks，函数形式也废弃了。手动分组改用 rolldownOptions.output.codeSplitting，用 groups 声明名字和匹配规则，例如把 node_modules 收成 vendor。",
          "拆太碎会增加请求；拆太大则改一行业务代码，用户也要重新下载整份第三方包。稳定依赖和常改的业务分开，文件名里的哈希才有意义。",
          "build.target 默认是 baseline-widely-available。Vite 8 把这条基线调到 Chrome 111、Edge 111、Firefox 114、Safari 16.4 这一档，对应当时已广泛可用约两年半的浏览器。要兼容更老的浏览器再单独降级，不要全局垫片。",
          "JS 压缩默认改用 Oxc，CSS 压缩默认改用 Lightning CSS。线上排错需要的 sourcemap 交给错误监控平台，不要公开到站点目录。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "export default defineConfig({\n  build: {\n    rolldownOptions: {\n      output: {\n        codeSplitting: {\n          groups: [{ name: \"vendor\", test: /node_modules/ }],\n        },\n      },\n    },\n  },\n});",
      },
    ],
    followUps: ["vendor 和业务打在同一个文件里，发布一次文案修改，用户要重新下载哪些字节？"],
  },
  {
    id: "fe-vite-lib",
    category: "frontend",
    title: "用 Vite 打组件库",
    difficulty: "medium",
    tags: ["Vite", "库模式"],
    prompt: "用 Vite 打一个给别人安装的组件库，和打一个网站有哪些配置必须不一样？",
    parts: [
      {
        type: "list",
        items: [
          "build.lib 指定入口、全局名和文件名。单入口默认出 ESM 和 UMD；多入口默认出 ESM 和 CJS，因为 UMD 不能做代码分割。Vite 8 不再支持 system 和 amd。",
          "Vue、React 以及 peerDependencies 放进 external，并用 output.globals 给 UMD 提供全局变量名。依赖被打进库里时，页面上会有两份框架，钩子和上下文对不上。",
          "package.json 同时给出 import 和 require 入口，再加 types。只把 main 指到 ESM，还在用 require 的工具链会直接失败。",
          "库的构建会把 import.meta.env 静态替换掉。库不能靠 VITE_ 变量读取使用方的环境，配置应做成函数参数。",
          "库模式默认把 CSS 抽成一份，由使用方在入口引入。组件如果各自 import 样式，要确认使用方的打包器能接住，而不是假设 cssCodeSplit 和应用构建一样。",
          "Vite 不生成 .d.ts。类型用 tsc --emitDeclarationOnly 或 vue-tsc 另出，再把类型入口写进 package.json。",
          "平时用一个带 index.html 的 demo 调试。lib 配置在 build 时才决定产物形状，开发服务器仍然是应用模式。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "export default defineConfig({\n  build: {\n    lib: {\n      entry: \"src/index.ts\",\n      name: \"MyLib\",\n      fileName: \"my-lib\",\n    },\n    rolldownOptions: {\n      external: [\"vue\"],\n      output: { globals: { vue: \"Vue\" } },\n    },\n  },\n});",
      },
    ],
    followUps: ["使用方报 Invalid hook call，优先怀疑库把哪一类依赖打进包里了？"],
  },
  {
    id: "fe-vite-css",
    category: "frontend",
    title: "CSS 在开发和生产各走哪条路",
    difficulty: "medium",
    tags: ["Vite", "CSS"],
    prompt: "开发时改一行 CSS 为什么不用刷新页面？生产环境里，异步页面的样式又是怎么拆出去的？",
    parts: [
      {
        type: "list",
        items: [
          "开发时 CSS 被编成 JS 模块，执行时创建或更新一个 style 标签。热更新只替换这段文本，不重跑组件，输入框里的内容还在。",
          "生产构建把 CSS 从 JS 里抽出来。应用的 cssCodeSplit 默认为 true，异步 chunk 自己的样式跟着那个 chunk 走，首屏不下载路由页的 CSS。库模式默认合成一份。",
          "*.module.css 编译成对象，类名默认带哈希。:global() 里的选择器保持原名，用来接第三方组件的结构。localsConvention 可以让样式对象同时接受中划线和驼峰。",
          "Sass、Less 只是先变成 CSS，再走同一条管道。装上对应的包就能 import，一般不用再写一个插件。",
          "PostCSS（postcss.config.js 或 css.postcss）负责嵌套、前缀等转换。Vite 8 起压缩默认换成 Lightning CSS；想继续用 esbuild 压 CSS，要自己安装并设置 build.cssMinify。",
          "css.transformer 设为 lightningcss 后，转换而不只是压缩也走 Lightning CSS。这时 CSS Modules 的选项写在 css.lightningcss.cssModules，原来的 css.modules 只管 PostCSS 那条路。",
          "只在异步组件里 import 的 CSS 会晚到，可能先闪出无样式内容。首屏关键样式放在入口同步引入，路由页可以配合骨架或预加载。",
        ],
      },
    ],
    followUps: ["CSS Modules 里要盖掉第三方组件的类名，选择器为什么得有一部分写在 :global 里？"],
  },
  {
    id: "fe-vite-proxy",
    category: "frontend",
    title: "开发代理为什么上线就失效",
    difficulty: "easy",
    tags: ["Vite", "代理"],
    prompt: "本地配了 server.proxy 之后接口不再跨域，打包上传到服务器又跨域了。这条配置实际改的是谁？",
    parts: [
      {
        type: "list",
        items: [
          "server.proxy 只存在于 Vite 开发服务器。浏览器把请求发给开发服务器，服务器再转发到目标，浏览器以为还是同源，所以没有 CORS 预检。",
          "它不会写进产物。vite preview 看的是 preview.proxy，生产环境看的是 Nginx 或网关。三处要各自配置同一条路径。",
          "前端请求应该写同源前缀，例如 /api。环境变量只决定这个前缀或绝对地址；代理决定开发机上这个前缀转到哪。把目标地址写进前端包里，一到生产就会打到错误的主机。",
          "changeOrigin 改的是转发时的 Host 头，给按域名区分站点的后端用。rewrite 用来去掉 /api 前缀。配错时，浏览器看到的往往是代理返回的 500 或 404，而不是 CORS 报错，先看开发服务器终端。",
          "开发服务器默认只听 localhost。手机调试把 server.host 设为 true。摄像头、部分存储要安全上下文，本地要用受信的 HTTPS。",
          "自定义请求头引起的预检失败，要在真正的服务端放行，开发代理绕不过生产环境。代理解决的是开发机的同源，不是鉴权策略。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "export default defineConfig({\n  server: {\n    proxy: {\n      \"/api\": {\n        target: \"http://localhost:8080\",\n        changeOrigin: true,\n        rewrite: (path) => path.replace(/^\\/api/, \"\"),\n      },\n    },\n  },\n});",
      },
    ],
    followUps: ["vite preview 能打开页面，接口却 CORS。要改的是 server.proxy 还是 preview.proxy？"],
  },
];
