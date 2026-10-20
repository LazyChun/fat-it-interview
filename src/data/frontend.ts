import type { Question } from "./types";

export const frontendQuestions: Question[] = [
  {
    id: "fe-bfc",
    category: "frontend",
    title: "什么是 BFC，怎么触发",
    difficulty: "medium",
    tags: ["CSS", "布局"],
    prompt: "说说 BFC 是什么，它能解决什么问题，有哪些触发条件？",
    parts: [
      {
        type: "p",
        text: "BFC（Block Formatting Context，块级格式化上下文）是一块独立的布局区域。内部的块盒按从上到下排列，外边距在区域内折叠，浮动元素参与高度计算，区域外的浮动不会侵入进来。",
      },
      {
        type: "list",
        items: [
          "外边距折叠只发生在同一个 BFC 里，两个相邻块分属不同 BFC 时不再折叠。",
          "包含浮动：父元素形成 BFC 后会包住内部浮动，用来清除浮动。",
          "阻止文字环绕：一侧浮动、另一侧 BFC，BFC 区域不会和浮动重叠。",
          "常见触发：overflow 不是 visible、display: flow-root、flex/grid 容器、绝对定位、float 非 none。",
          "优先用 display: flow-root，它只为创建 BFC，不引入滚动条或脱离文档流。",
        ],
      },
    ],
    followUps: [
      "margin 折叠的具体规则是什么？",
      "flex 子项还会和外面的兄弟发生 margin 折叠吗？",
    ],
  },
  {
    id: "fe-center",
    category: "frontend",
    title: "水平垂直居中有哪些写法",
    difficulty: "easy",
    tags: ["CSS", "布局"],
    prompt: "一个不定宽高的元素，如何在父容器里水平垂直居中？说出至少三种，并说明适用场景。",
    parts: [
      {
        type: "list",
        items: [
          "flex / grid：父元素 display:flex; align-items:center; justify-content:center。现代布局首选，子元素尺寸未知也适用。",
          "grid 单行写法：place-items: center。",
          "绝对定位：子元素 top/left 50%，transform: translate(-50%, -50%)。父元素要 position: relative。适合脱离文档流的浮层。",
          "绝对定位加 inset: 0; margin: auto; 需要子元素有宽高。",
          "line-height 等于高度只适合单行文本，不要用在块级组件上。",
        ],
      },
      {
        type: "code",
        lang: "css",
        code: ".parent {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}",
      },
    ],
    followUps: ["只居中一行文字和居中一个卡片，选法有什么不同？"],
  },
  {
    id: "fe-event-loop",
    category: "frontend",
    title: "浏览器事件循环",
    difficulty: "medium",
    tags: ["JavaScript", "事件循环"],
    prompt: "说一下浏览器里宏任务、微任务的执行顺序。下面这段代码输出什么？",
    parts: [
      {
        type: "p",
        text: "调用栈清空后，先一次性清空微任务队列，再取一个宏任务执行，然后浏览器才有机会渲染。Promise.then、queueMicrotask、MutationObserver 是微任务；setTimeout、setInterval、I/O、用户事件是宏任务。",
      },
      {
        type: "code",
        lang: "js",
        code: "console.log(1);\nsetTimeout(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n// 1 4 3 2",
      },
      {
        type: "list",
        items: [
          "同步代码先跑完：1、4。",
          "当前栈空后先跑微任务：3。",
          "再跑下一个宏任务：2。",
          "微任务里再产生的微任务会在本次清空阶段继续执行，可能饿死渲染。",
          "async 函数在第一个 await 之前是同步的，await 后面的代码相当于 then。",
        ],
      },
    ],
    followUps: [
      "Node.js 的事件循环和浏览器有什么差别？",
      "requestAnimationFrame 排在哪一步？",
    ],
  },
  {
    id: "fe-closure",
    category: "frontend",
    title: "闭包是什么，会带来什么问题",
    difficulty: "easy",
    tags: ["JavaScript", "闭包"],
    prompt: "什么是闭包？循环里用 var 注册点击事件为什么都打印同一个值？怎么改？",
    parts: [
      {
        type: "p",
        text: "闭包是函数记住并访问它定义时所在词法作用域的能力，即使外层函数已经返回。它是模块私有变量、柯里化、防抖函数保存 timer 的基础。",
      },
      {
        type: "list",
        items: [
          "var 没有块级作用域，循环共用一个 i，点击时 i 已经是最终值。",
          "改成 let，每次迭代有独立绑定。",
          "或者用 IIFE / bind 把当时的 i 作为参数传进去。",
          "代价：被闭包引用的外层变量无法回收。脱离文档的 DOM、定时器、全局缓存若一直握着大对象，会表现为泄漏。",
          "排查：事件解绑、clearTimeout、不再把回调挂到全局。",
        ],
      },
    ],
    followUps: ["闭包和 React Hooks 的陈旧状态有什么关系？"],
  },
  {
    id: "fe-this",
    category: "frontend",
    title: "this 的绑定规则",
    difficulty: "medium",
    tags: ["JavaScript", "this"],
    prompt: "JavaScript 里 this 有哪几种绑定方式？箭头函数为什么不能用 call 改 this？",
    parts: [
      {
        type: "list",
        items: [
          "默认绑定：独立调用。严格模式是 undefined，非严格模式是全局对象。",
          "隐式绑定：obj.fn() 时 this 是 obj。把方法拆出来赋值后再调用，隐式绑定丢失。",
          "显式绑定：call / apply / bind。bind 返回新函数，之后的 call 改不掉它的 this。",
          "new 绑定：this 是新创建的对象，优先级最高（bind 过的函数仍可 new，此时 new 胜出）。",
          "箭头函数没有自己的 this，沿词法作用域找外层，call/apply/bind 都无法替换。",
        ],
      },
    ],
    followUps: ["「优先级：new > 显式 > 隐式 > 默认」怎么用例子证明？"],
  },
  {
    id: "fe-prototype",
    category: "frontend",
    title: "原型链和 instanceof",
    difficulty: "medium",
    tags: ["JavaScript", "原型"],
    prompt: "画出原型链。instanceof 的判断过程是什么？如何自己实现一个？",
    parts: [
      {
        type: "p",
        text: "每个函数有 prototype，new 出来的对象的 [[Prototype]] 指向这个 prototype。属性查找沿这条链走到 Object.prototype，再到 null。",
      },
      {
        type: "list",
        items: [
          "obj.__proto__ === Constructor.prototype，标准写法是 Object.getPrototypeOf(obj)。",
          "instanceof 沿着左边的原型链，看能否遇到右边的 prototype。",
          "基本类型没有原型链，1 instanceof Number 为 false；new Number(1) 才为 true。",
          "原型能被改写，所以 instanceof 不是绝对可靠的类型判断。跨 realm（iframe）时 Object 不是同一个。",
          "更稳妥的类型判断常用 Object.prototype.toString.call(value)。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "function myInstanceof(obj, Ctor) {\n  if (obj == null || typeof Ctor !== \"function\") return false;\n  let proto = Object.getPrototypeOf(obj);\n  while (proto) {\n    if (proto === Ctor.prototype) return true;\n    proto = Object.getPrototypeOf(proto);\n  }\n  return false;\n}",
      },
    ],
    followUps: ["class 继承和原型链是什么关系？"],
  },
  {
    id: "fe-fiber",
    category: "frontend",
    title: "React Fiber 在解决什么",
    difficulty: "hard",
    tags: ["React", "Fiber"],
    prompt: "为什么 React 要做 Fiber？渲染和提交两个阶段有什么区别？key 在调和里起什么作用？",
    parts: [
      {
        type: "p",
        text: "栈调和一旦开始就要递归到底，长列表更新会卡住主线程。Fiber 把组件树变成可中断的工作单元链表，让渲染阶段可以让出主线程，优先处理输入等高优先级更新。",
      },
      {
        type: "list",
        items: [
          "每个 Fiber 节点保存 type、state、child / sibling / return，以及对应的 DOM。",
          "render 阶段可中断：对照 current 树生成 workInProgress，计算副作用列表。此阶段的 render 可能重复执行，必须保持纯。",
          "commit 阶段同步：操作 DOM、跑 useLayoutEffect、浏览器绘制后再跑 useEffect。",
          "同层用 type 和 key 判断是否复用。key 不稳定（用 index 且列表会插入）会导致状态串到错误的组件上。",
          "并发特性（startTransition、useDeferredValue）依赖这套优先级调度。",
        ],
      },
    ],
    followUps: ["setState 是同步还是异步？在 React 18 自动批处理里怎么理解？"],
  },
  {
    id: "fe-hooks",
    category: "frontend",
    title: "Hooks 规则和闭包陷阱",
    difficulty: "medium",
    tags: ["React", "Hooks"],
    prompt: "为什么 Hooks 不能写在 if 里？useEffect 里读到旧 state 是怎么发生的？",
    parts: [
      {
        type: "p",
        text: "Hooks 按调用顺序存在当前 Fiber 的链表上，没有名字。条件调用会让下一次渲染对错链表节点，状态就串了。所以只能写在组件或自定义 Hook 的顶层。",
      },
      {
        type: "list",
        items: [
          "每次渲染都有自己的 state、props 和函数。effect 捕获的是那一次渲染的值。",
          "依赖写漏时，定时器或订阅会一直看到旧值，这就是陈旧闭包。",
          "能用函数式更新就不要依赖旧 state：setCount(c => c + 1)。",
          "effect 的依赖要写全。eslint 的 exhaustive-deps 是在防止这种 bug，不要随手关掉。",
          "useRef 保存的是同一份可变盒子，适合定时器 id、不触发渲染的最新值。",
        ],
      },
    ],
    followUps: ["useMemo 和 useCallback 什么时候才值得用？"],
  },
  {
    id: "fe-cors",
    category: "frontend",
    title: "跨域和 CORS 预检",
    difficulty: "medium",
    tags: ["浏览器", "HTTP", "CORS"],
    prompt: "浏览器同源策略限制什么？简单请求和预检请求怎么区分？带 Cookie 的跨域要怎么配？",
    parts: [
      {
        type: "list",
        items: [
          "同源指协议、主机、端口都相同。限制的是脚本读另一源的响应，不是请求发不出去。",
          "简单请求：GET/HEAD/POST，且头部在白名单内，Content-Type 只限表单三类。浏览器直接发，看响应头是否允许。",
          "其他方法、自定义头、application/json 会先发 OPTIONS 预检。",
          "Allow-Origin 为 * 时不能和 Allow-Credentials: true 同时用。要带 Cookie 必须回显具体 Origin，并在请求里设 credentials: include。",
          "预检可以用 Access-Control-Max-Age 缓存。服务端不要只在业务接口加 CORS 头，OPTIONS 也要答。",
        ],
      },
    ],
    followUps: ["JSONP、代理、CORS 各自解决的是哪一层的问题？"],
  },
  {
    id: "fe-cache",
    category: "frontend",
    title: "强缓存和协商缓存",
    difficulty: "medium",
    tags: ["浏览器", "缓存", "HTTP"],
    prompt: "强缓存和协商缓存怎么区分？Cache-Control: no-cache 是不缓存吗？",
    parts: [
      {
        type: "list",
        items: [
          "强缓存命中时不发请求。Cache-Control: max-age 优先于 Expires。",
          "协商缓存每次都问服务器。ETag / If-None-Match 比 Last-Modified 更精确，未改动返回 304。",
          "no-cache 的意思是缓存前必须向服务器确认，不是禁止存储。",
          "no-store 才是不落地缓存。private 只允许浏览器缓存，public 允许中间代理缓存。",
          "带 hash 的静态资源可以长缓存；HTML 入口用协商缓存，避免用户永远拿不到新包。",
        ],
      },
    ],
    followUps: ["从输入 URL 到页面展示，缓存发生在哪些环节？"],
  },
  {
    id: "fe-vitals",
    category: "frontend",
    title: "怎么看页面性能指标",
    difficulty: "medium",
    tags: ["性能", "Web Vitals"],
    prompt: "LCP、INP、CLS 分别衡量什么？实验室数据和现场数据有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "LCP：最大内容绘制，看首屏主要内容什么时候出来。常见拖累是大图、阻塞渲染的 CSS/JS、慢接口。",
          "INP：交互到下一次绘制的延迟，取代了 FID。长任务、过大的渲染、同步状态更新都会拉高它。",
          "CLS：意外布局偏移。图片没写宽高、字体晚到、广告插入都会造成。",
          "实验室数据（Lighthouse）是可控环境下的一次测量；现场数据（RUM）才反映真实设备和网络。",
          "优化顺序通常是：先保证关键资源优先级，再减 JS 体积，再避免布局抖动。",
        ],
      },
    ],
    followUps: ["首屏接口很慢时，前端能做哪些不改后端的缓解？"],
  },
  {
    id: "fe-promise",
    category: "frontend",
    title: "Promise 和 async 的错误怎么传",
    difficulty: "medium",
    tags: ["JavaScript", "Promise"],
    prompt: "Promise 链上的错误会跳到哪里？async 函数里忘记 await 会怎样？",
    parts: [
      {
        type: "list",
        items: [
          "then 的第二个参数或紧随的 catch 能接住前面的拒绝。catch 本身返回成功的 Promise，后面的 then 会继续。",
          "throw 和 return Promise.reject 在 async 函数里都会变成拒绝。",
          "忘记 await 时，函数会提前返回成功，错误变成未处理的 rejection。",
          "Promise.all 一个失败就失败，其他请求仍会跑完但结果被丢弃。需要全部落定用 allSettled。",
          "并发上限不能靠无脑 Promise.all 打满，要用池子控制同时进行的数量。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "async function load() {\n  try {\n    const user = await api.user();\n    return user;\n  } catch (err) {\n    // 在这里处理，或继续 throw 让调用方决定\n    throw err;\n  }\n}",
      },
    ],
    followUps: ["微任务里抛出的错误，window.onerror 抓得到吗？"],
  },
  {
    id: "fe-semantic",
    category: "frontend",
    title: "HTML 语义化解决什么问题",
    difficulty: "easy",
    tags: ["HTML"],
    prompt: "为什么不用 div 包一切？header、main、button 和 div 上的点击有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "语义标签告诉浏览器和读屏软件这块内容是什么。main 一页一个，导航用 nav，按钮用 button。",
          "div 加 onClick 默认不能用键盘触发，也没有按钮的可访问名称。button 自带 Enter / Space。",
          "标题用 h1 到 h6 按层级来，不要为了字号去跳级。样式用 CSS 改。",
          "图片要有 alt。装饰图用空 alt，内容图说明它在表达什么。",
          "表单控件配 label，不要只靠 placeholder 当标签。",
        ],
      },
    ],
    followUps: ["div 必须做成按钮时，要补哪些 ARIA 和键盘行为？"],
  },
  {
    id: "fe-script",
    category: "frontend",
    title: "script 的 defer 和 async",
    difficulty: "easy",
    tags: ["HTML", "加载"],
    prompt: "普通 script、async、defer 对解析和执行顺序有什么影响？",
    parts: [
      {
        type: "list",
        items: [
          "不带属性的 script 会停下 HTML 解析，下载并执行完才继续。放在 head 里会拖住首屏。",
          "async：下载和解析并行，下载完立刻执行，执行时仍会打断解析。多个 async 谁先下完谁先跑，不保证顺序。",
          "defer：下载和解析并行，HTML 解析完、DOMContentLoaded 之前按文档顺序执行。适合有依赖的业务脚本。",
          "type=module 默认就是 defer，并且严格模式、独立作用域。",
          "统计脚本可以用 async。依赖 DOM 或依赖前一个脚本的，用 defer。",
        ],
      },
    ],
    followUps: ["动态插入的 script 默认是 async 吗？"],
  },
  {
    id: "fe-vue-reactive",
    category: "frontend",
    title: "Vue 的响应式是怎么追上去的",
    difficulty: "medium",
    tags: ["Vue", "响应式"],
    prompt: "Vue 3 的 ref 和 reactive 有什么差别？改一个属性为什么能触发视图更新？",
    parts: [
      {
        type: "list",
        items: [
          "Vue 3 用 Proxy 拦截对象的读写。读的时候把当前 effect（渲染或 computed）收成依赖，写的时候通知这些 effect 重新跑。",
          "ref 把基本类型包进一个带 value 的对象，模板里会自动解包。reactive 适合对象，不能替换整个引用，否则响应链接断。",
          "解构 reactive 会丢掉响应性，要用 toRefs，或者一开始就用 ref。",
          "Vue 2 用 Object.defineProperty，所以后来新增的属性要 Vue.set。Proxy 没有这个限制。",
          "不要在响应式对象里塞大块不需要追踪的数据，依赖收集是有成本的。",
        ],
      },
    ],
    followUps: ["computed 和 watch 怎么选？"],
  },
  {
    id: "fe-vue-comp",
    category: "frontend",
    title: "Vue 组件怎么通信",
    difficulty: "medium",
    tags: ["Vue", "组件"],
    prompt: "父子组件传值有哪些方式？v-model 在组件上实际是什么？",
    parts: [
      {
        type: "list",
        items: [
          "父到子用 props，子到父用 emit。props 在子组件里不要直接改。",
          "组件上的 v-model 是 modelValue 加 update:modelValue 的语法糖。Vue 3 可以有多个 v-model。",
          "跨多层可以用 provide / inject。全局状态用 Pinia，不要把什么都 provide。",
          "插槽是父组件把模板交给子组件的出口。作用域插槽让子组件把数据交回给父组件的插槽模板。",
          "生命周期里，子组件先挂载，父组件后挂载。销毁时父组件的钩子先走。",
        ],
      },
    ],
    followUps: ["Composition API 和 Options API 的逻辑复用差在哪？"],
  },
  {
    id: "fe-webpack-loader",
    category: "frontend",
    title: "Webpack 的 loader 和 plugin",
    difficulty: "medium",
    tags: ["Webpack", "构建"],
    prompt: "loader 和 plugin 分别工作在什么阶段？从入口到产物经过哪些步骤？",
    parts: [
      {
        type: "list",
        items: [
          "Webpack 从 entry 出发，顺着 import / require 把模块收成依赖图。",
          "loader 是转换器，从右到左处理单个文件。比如 ts-loader 把 TypeScript 转成 JavaScript，css-loader 处理 @import。",
          "plugin 挂在整个编译生命周期上，可以改输出、注入变量、生成 HTML。能力比 loader 大，也更容易把构建搞慢。",
          "mode 为 production 时会压缩、做作用域提升。development 保留 source map，方便定位。",
          "构建慢时先看是哪个 loader 在全量跑，再考虑缓存，而不是先加插件。",
        ],
      },
    ],
    followUps: ["file-loader 和 asset modules 是什么关系？"],
  },
  {
    id: "fe-webpack-split",
    category: "frontend",
    title: "Webpack 怎么拆包",
    difficulty: "medium",
    tags: ["Webpack", "性能"],
    prompt: "为什么要把 vendor 和业务代码拆开？动态 import 会得到什么？",
    parts: [
      {
        type: "list",
        items: [
          "不常变的依赖打进单独的 chunk，业务发布时浏览器还可以用上次缓存的 vendor。",
          "splitChunks 按模块被引用的次数和体积决定抽不抽公共包。抽得太碎，请求数会上去。",
          "import() 是一个分割点，会生成异步 chunk，运行到那一行才加载。路由级懒加载就是这么做的。",
          "HMR 在开发时替换变更的模块，不刷新整个页面。它不是生产环境的更新方案。",
          "产物要带内容哈希。HTML 入口不要长缓存，带哈希的 JS/CSS 可以长缓存。",
        ],
      },
    ],
    followUps: ["runtimeChunk 单独拆出去是为了解决什么缓存问题？"],
  },
];
