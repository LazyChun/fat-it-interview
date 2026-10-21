import type { Question } from "./types";

/**
 * 2026-10 第二批热门前端面试题。
 * 对照当年面经里还没覆盖的高频点：CSS 层叠与布局细节、JS 语言机制、
 * React 事件与调度、Vue 组合式细节、浏览器运行时、工程化、安全与手写题。
 */
export const frontendHotQuestions: Question[] = [
  // ============ HTML ============
  {
    id: "fe-html-meta",
    category: "frontend",
    title: "meta、viewport 与 SEO",
    difficulty: "easy",
    tags: ["HTML", "SEO"],
    prompt: "head 里哪些 meta 是必须的？前端能做的 SEO 和做不了的分别是什么？",
    parts: [
      {
        type: "list",
        items: [
          "charset=utf-8 必须尽早出现，否则浏览器可能按错误编码解析后面的内容。",
          "viewport：width=device-width, initial-scale=1。移动端没有它会按 980px 布局再缩放，媒体查询和 rem 都会失真。",
          "title、meta description、canonical、Open Graph（og:title / og:image）影响摘要和分享卡片，不直接决定排名。",
          "语义化标签、可抓取的链接（用 a href，不要只靠点击跳转）、服务端输出的正文，爬虫才能读到。纯 CSR 首屏如果 HTML 是空壳，要靠 SSR、预渲染或动态渲染。",
          "robots meta、sitemap、合理的状态码（软 404 返回 200 会伤害收录）。前端不要用 JS 把关键内容藏在用户交互之后。",
          "做不了的：外链权重、内容质量、服务端速度和索引预算。把 SEO 理解成「让页面在不执行复杂 JS 时也有完整内容」。",
        ],
      },
    ],
    followUps: ["SPA 用 history 模式时，直接打开深层链接为什么常常 404？"],
  },
  {
    id: "fe-html-srcset",
    category: "frontend",
    title: "响应式图片：srcset 与 picture",
    difficulty: "medium",
    tags: ["HTML", "图片"],
    prompt: "同一张图怎么按屏幕宽度和 DPR 给不同资源？img 的 srcset 和 picture 怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "srcset + sizes：同一张图的不同分辨率。浏览器按视口和 DPR 选择，例如 400w、800w、1600w，sizes 告诉布局宽度。",
          "picture + source：艺术方向或格式切换。source 可按 media 换裁切，或按 type=\"image/avif\" 优先现代格式，不支持再落到 img。",
          "img 永远要有 src 作为兜底，width/height 或 aspect-ratio 占位，避免加载后把下面内容挤下去（CLS）。",
          "首屏 LCP 图不要 loading=\"lazy\"，用 fetchpriority=\"high\" 和 preload；折叠线以下才懒加载。",
          "不要用 JS 自己算 DPR 再改 src，浏览器的选择发生在预加载扫描阶段，比脚本更早。",
        ],
      },
      {
        type: "code",
        lang: "html",
        code: "<picture>\n  <source type=\"image/avif\" srcset=\"hero.avif\" />\n  <img\n    src=\"hero.jpg\"\n    srcset=\"hero-400.jpg 400w, hero-800.jpg 800w\"\n    sizes=\"(max-width: 600px) 100vw, 800px\"\n    width=\"800\"\n    height=\"450\"\n    alt=\"产品主图\"\n  />\n</picture>",
      },
    ],
    followUps: ["为什么只写 srcset 不写 sizes，浏览器往往会下载最大的那张？"],
  },

  // ============ CSS ============
  {
    id: "fe-css-stack",
    category: "frontend",
    title: "层叠上下文和 z-index",
    difficulty: "medium",
    tags: ["CSS", "层叠"],
    prompt: "子元素 z-index 设得很大，为什么还是被旁边一个普通盒子盖住？层叠上下文是怎么形成的？",
    parts: [
      {
        type: "list",
        items: [
          "z-index 只在同一个层叠上下文里比较。父级自己形成了上下文之后，子元素再高的 z-index 也出不了这个父级。",
          "常见触发：position 非 static 且 z-index 不是 auto；opacity 小于 1；transform、filter、perspective、will-change；flex/grid 子项 z-index 不是 auto；isolation: isolate。",
          "比较规则：先比上下文本身的层级，再在上下文内部按背景、负 z-index、块级、浮动、行内、正 z-index 的顺序画。",
          "弹层被裁：祖先有 transform 或 opacity 时，fixed 也会改定位基准，z-index 大战往往是这个原因。解法是把弹层挂到 body，或用隔离干净的顶层容器。",
          "排查：DevTools 的 Layers 或计算样式看谁创建了上下文，不要靠把 z-index 加到 99999。",
        ],
      },
    ],
    followUps: ["isolation: isolate 和多写一个定位元素比，好处是什么？"],
  },
  {
    id: "fe-css-margin",
    category: "frontend",
    title: "margin 折叠的规则",
    difficulty: "medium",
    tags: ["CSS", "布局"],
    prompt: "父子 margin 重叠、相邻兄弟 margin 只剩较大的那个，规则是什么？哪些情况不会折叠？",
    parts: [
      {
        type: "list",
        items: [
          "只发生在垂直方向、同一个块级格式化上下文里、都处于普通流的块盒之间。水平 margin 不折叠。",
          "相邻兄弟：两个 margin 取绝对值更大的那个；一正一负则相加。空块（没有 border、padding、行内内容）的上下 margin 也会自己和自己折叠。",
          "父子折叠：父元素没有 border-top、padding-top、也没有形成 BFC 时，第一个子元素的 margin-top 会穿过父元素。表现是「给子元素加 margin，父元素一起被推下去」。",
          "不折叠：flex/grid 子项之间、浮动、绝对定位、inline-block、父元素 overflow 不是 visible、display: flow-root。",
          "想隔开父子又不要 padding：给父元素 padding-top: 0.1px 很脏；用 flow-root 或把间距改成 padding / gap。",
        ],
      },
    ],
    followUps: ["BFC 为什么能阻止 margin 折叠？"],
  },
  {
    id: "fe-css-unit",
    category: "frontend",
    title: "em、rem、vw、vh 怎么选",
    difficulty: "easy",
    tags: ["CSS", "单位"],
    prompt: "em 和 rem 的参照物分别是谁？移动端地址栏伸缩时 100vh 为什么会多出一块？",
    parts: [
      {
        type: "list",
        items: [
          "em：多数属性相对当前元素 font-size；font-size 自身相对父元素。嵌套会连乘，组件内部间距用它能跟着字号走。",
          "rem：相对根元素 font-size。整站缩放改一处即可，不要在组件库里到处用 rem 绑死根字号，否则嵌进别人的页面会失控。",
          "%：宽相对包含块宽度，高相对包含块高度（父级高度得是确定值），padding 百分比始终相对包含块宽度。",
          "vw/vh 相对视口。100vh 在移动端常包含被地址栏挡住的区域。用 100dvh（动态视口）做全屏，svh/lvh 分别是最小和最大视口。",
          "容器查询单位 cqw 相对容器宽度，组件跟着卡片变，而不是跟着窗口变。",
          "经验：字号 rem 或直接 px（配合用户缩放），组件内间距 em，页面级栅格用 flex/grid 的 fr 和 gap，少手写一长串魔法数字。",
        ],
      },
    ],
    followUps: ["用户在浏览器里放大字号时，哪些写法会把文字裁掉？"],
  },
  {
    id: "fe-css-column",
    category: "frontend",
    title: "两栏和三栏布局",
    difficulty: "medium",
    tags: ["CSS", "布局"],
    prompt: "左右固定、中间自适应，说出 flex、grid 和经典浮动写法。中间栏为什么有时会被挤没？",
    parts: [
      {
        type: "list",
        items: [
          "Flex：容器 display:flex。两侧 flex: 0 0 200px，中间 flex: 1 1 auto 并加 min-width: 0，否则内容的最小宽度会把两侧挤出去。",
          "Grid：grid-template-columns: 200px 1fr 200px。两栏就是 240px 1fr。gap 负责间距，不必再算 margin。",
          "圣杯 / 双飞翼是浮动时代的写法：中间栏先写并留出两侧 padding，左右栏用负 margin 拉回去。现在面试讲清楚即可，新代码用 flex 或 grid。",
          "绝对定位把两侧钉住、中间留 margin 也能做，但中间高度和滚动要自己处理，不如 flex。",
          "「左边随文字变宽、右边只收缩」：左 flex: 0 1 auto，右 flex: 1 1 0 再 min-width: 0。先分清谁在抢剩余空间。",
        ],
      },
      {
        type: "code",
        lang: "css",
        code: ".layout {\n  display: flex;\n  min-height: 100%;\n}\n.side {\n  flex: 0 0 200px;\n}\n.main {\n  flex: 1 1 auto;\n  min-width: 0;\n}",
      },
    ],
    followUps: ["中间栏内部再套一个 flex 子项，省略号不生效，先查什么？"],
  },
  {
    id: "fe-css-float",
    category: "frontend",
    title: "浮动和清除浮动",
    difficulty: "easy",
    tags: ["CSS", "布局"],
    prompt: "float 脱离文档流之后，父元素高度为什么会塌？现在为什么很少用浮动做布局？",
    parts: [
      {
        type: "list",
        items: [
          "浮动元素不参与块级排列，但行盒会缩短来绕开它。文字环绕是它的本职，多栏布局是后来的误用。",
          "父元素高度只由普通流子元素撑开。子元素全浮动时高度变成 0，后面的兄弟会钻上来。",
          "清除：父元素 display: flow-root（只为了包住浮动）；或 ::after { content: \"\"; display: block; clear: both }。overflow: hidden 能形成 BFC 但会裁切。",
          "float 和 absolute 都脱离普通流，但浮动仍影响行盒，绝对定位不影响；浮动元素的包含块仍是最近的块容器。",
          "新布局用 flex/grid。浮动只留在文字环绕图片、以及维护老页面。",
        ],
      },
    ],
    followUps: ["clear: both 加在浮动元素自己身上有用吗？"],
  },
  {
    id: "fe-css-masonry",
    category: "frontend",
    title: "瀑布流怎么做",
    difficulty: "medium",
    tags: ["CSS", "布局"],
    prompt: "卡片高度不固定，要做成多列瀑布流。纯 CSS 和 JS 方案各有什么问题？",
    parts: [
      {
        type: "list",
        items: [
          "column-count：实现快，但阅读顺序是先下后右，键盘和读屏顺序别扭，某一列底部经常留大块空白，也难做「加载更多后保持位置」。",
          "Grid 的 masonry 值能按行填充最短列，规范还在演进，不能当生产默认方案。",
          "JS 方案：列数由容器宽度决定，把每个卡片 append 到当前最矮的列；或用绝对定位加前缀高度。图片要等 onload 再量高，否则高度是 0。",
          "虚拟化瀑布流更难：高度未知，滚动位置要用估算高度，图片回来后再修正，并补偿 scrollTop，否则会跳。",
          "数据按「行优先」渲染、视觉按列排时，别让 DOM 顺序和视觉顺序差太远，否则可访问性会坏。",
        ],
      },
    ],
    followUps: ["容器宽度变化时，怎么避免整列重排造成滚动跳动？"],
  },
  {
    id: "fe-css-ellipsis",
    category: "frontend",
    title: "文字截断和 flex 子项收缩",
    difficulty: "easy",
    tags: ["CSS", "布局"],
    prompt: "单行、多行省略怎么写？放进 flex 里经常不生效，原因是什么？",
    parts: [
      {
        type: "list",
        items: [
          "单行：overflow: hidden; white-space: nowrap; text-overflow: ellipsis。元素需要有确定的宽度上限。",
          "多行：display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden。这是事实标准，line-clamp 正在标准化。",
          "flex 子项默认 min-width: auto，最小尺寸是内容的最小宽度，文字不换行时就不会收缩，省略号永远不出现。加上 min-width: 0（纵向则 min-height: 0）。",
          "grid 子项同样会被 min-content 撑开，处理办法一样。",
          "截断会伤害可访问性：完整文本用 title 或可展开，不要让关键信息只存在于被截掉的部分。",
        ],
      },
    ],
    followUps: ["按钮里的文字省略和按钮的点击区域，哪个不该被挤没？"],
  },

  // ============ JavaScript ============
  {
    id: "fe-js-type",
    category: "frontend",
    title: "数据类型、栈和堆",
    difficulty: "easy",
    tags: ["JavaScript", "类型"],
    prompt: "JS 有哪些数据类型？typeof null 为什么是 object？基本类型和对象在赋值时差在哪？",
    parts: [
      {
        type: "list",
        items: [
          "七种原始类型：undefined、null、boolean、number、bigint、string、symbol，再加上 object。函数是可调用的对象，typeof 对它有特例返回 function。",
          "typeof null === \"object\" 是早期实现把类型标签和空指针撞在一起留下的，规范保留了这个结果。判断 null 用严格相等。",
          "原始值按值传递，赋给新变量是一份新的值。对象按引用传递，赋值只复制地址，改属性两边都看见。",
          "引擎会把短生命周期对象放新生代、长生命周期放老年代，这是 V8 的堆，不是「基本类型一定在栈上」这么绝对。闭包引用的原始值也会留在堆上。",
          "number 是 IEEE-754 双精度，安全整数到 2^53-1，超出用 BigInt。字符串不可变，看似修改其实是新字符串。",
        ],
      },
    ],
    followUps: ["const 绑定一个对象，为什么还能改它的属性？"],
  },
  {
    id: "fe-js-arrow",
    category: "frontend",
    title: "箭头函数和普通函数",
    difficulty: "easy",
    tags: ["JavaScript", "函数"],
    prompt: "箭头函数除了写法短，还有哪些能力是没有的？哪些场景必须用普通函数？",
    parts: [
      {
        type: "list",
        items: [
          "没有自己的 this、arguments、super、new.target，也不能作为构造函数，没有 prototype。",
          "this 在定义时沿词法作用域确定，call/apply/bind 改不了。适合回调，不适合做对象方法（方法里需要动态 this 时）。",
          "不能用作生成器。需要 arguments 时用剩余参数，箭头函数同样支持 ...args。",
          "对象字面量方法用简写 method() {} 或 function，这样 this 指向调用者。class 字段箭头函数会绑到实例，每个实例一份函数，能当回调但更占内存。",
          "面试时把「简写」和「词法 this」分开讲，后者才是选它的原因。",
        ],
      },
    ],
    followUps: ["class 里用箭头函数写方法，和写在原型上有什么差别？"],
  },
  {
    id: "fe-js-for",
    category: "frontend",
    title: "for...in 和 for...of",
    difficulty: "easy",
    tags: ["JavaScript", "迭代"],
    prompt: "遍历对象和遍历数组分别用哪一个？for...in 遍历数组会踩什么坑？",
    parts: [
      {
        type: "list",
        items: [
          "for...in 遍历对象可枚举的字符串键，包括原型链上的。顺序对整数索引有规定，其余键不要依赖顺序。",
          "for...of 遍历可迭代对象的值，走迭代器协议。数组、字符串、Map、Set、arguments、NodeList 都可以。普通对象默认不行。",
          "数组不要用 for...in：会扫到原型上的枚举属性，索引是字符串，稀疏数组会跳过空洞但也会带上额外的键。",
          "对象用 Object.keys / entries，或先判断 hasOwn。需要中断用 for/for...of，forEach 不能 break。",
          "让对象支持 for...of：实现 Symbol.iterator，每次 next 返回 { value, done }。",
        ],
      },
    ],
    followUps: ["forEach 里 return 为什么停不掉循环？"],
  },
  {
    id: "fe-js-timer",
    category: "frontend",
    title: "setTimeout 和 setInterval",
    difficulty: "medium",
    tags: ["JavaScript", "定时器"],
    prompt: "setInterval 为什么会堆积回调？嵌套 setTimeout 为什么到不了 0 毫秒？页面在后台时定时器会怎样？",
    parts: [
      {
        type: "list",
        items: [
          "两者都是宏任务。延迟是「最早多久之后入队」，不是「精确在那一毫秒执行」。前面的任务没跑完就会推迟。",
          "setInterval 按固定节拍入队，不管上一次回调是否结束。回调超过间隔时会堆在队列里，看起来越跑越赶。",
          "递归 setTimeout 在回调结束再预约下一次，能避免重入，间隔更可控。做轮询、动画节拍优先用它或 requestAnimationFrame。",
          "HTML 规范对嵌套超过 5 层的定时器有 4ms 下限。后台标签页通常被限制到 1 秒甚至更稀，省电。",
          "卸载组件、离开页面要 clear。定时器持有的闭包会把大对象留住。",
        ],
      },
    ],
    followUps: ["用 setTimeout 做动画和用 requestAnimationFrame 比，丢帧时差在哪？"],
  },
  {
    id: "fe-js-promise-api",
    category: "frontend",
    title: "Promise.all、allSettled、race、any",
    difficulty: "medium",
    tags: ["JavaScript", "Promise"],
    prompt: "四个组合方法各自在什么时候结束、失败条件是什么？一个请求很慢时 all 会不会取消它？",
    parts: [
      {
        type: "list",
        items: [
          "all：全部成功才成功，结果数组顺序与输入一致；第一个拒绝就拒绝。其他请求不会被取消，只是结果没人要了。",
          "allSettled：等全部落定，每项是 { status: \"fulfilled\", value } 或 { status: \"rejected\", reason }。适合一批无关任务，要知道谁失败了。",
          "race：谁先落定就跟谁，成功或失败都算。常用来和超时 Promise 赛跑。",
          "any：谁先成功就成功；全部失败才失败，原因是 AggregateError。找第一个可用镜像、多个源里要一个结果时用它。",
          "空数组：all 和 allSettled 立刻成功，any 立刻失败，race 永远挂起。",
          "要取消慢请求必须传 AbortSignal，Promise 本身没有取消。",
        ],
      },
    ],
    followUps: ["all 的输入里有普通数字，会怎样？"],
  },
  {
    id: "fe-js-context",
    category: "frontend",
    title: "执行上下文、作用域链和提升",
    difficulty: "medium",
    tags: ["JavaScript", "作用域"],
    prompt: "函数声明和 var 为什么能在声明前访问？let 提升了没有？作用域是在调用时决定的吗？",
    parts: [
      {
        type: "list",
        items: [
          "执行上下文分创建和执行两段。创建时建立变量环境、词法环境和 this；执行时才逐行赋值。",
          "var 提升到函数作用域顶部并初始化为 undefined。function 声明整体提升，所以可以先调用。",
          "let/const 也会被创建绑定，但在到达声明语句前是暂时性死区，访问直接抛错。块级作用域是词法环境里的一块。",
          "作用域链在函数定义时按词法位置接好，不是调用位置。闭包就是内部函数一直握着外层环境。",
          "每次调用生成新的执行上下文，压到调用栈。栈溢出通常是递归没有终止，或同步循环里不断调用。",
        ],
      },
    ],
    followUps: ["var a = function(){} 和 function a(){} 的提升结果一样吗？"],
  },
  {
    id: "fe-js-inherit",
    category: "frontend",
    title: "继承：原型链和 class extends",
    difficulty: "medium",
    tags: ["JavaScript", "原型"],
    prompt: "寄生组合继承解决了什么？class extends 本质上做了哪几件事？子类构造函数里为什么要先 super？",
    parts: [
      {
        type: "list",
        items: [
          "只把子构造函数的 prototype 设成父类实例，会在原型上留下多余的自身属性，也不方便给父构造传参。",
          "寄生组合：子实例的属性用 Parent.call(this) 拷到自己身上；原型用 Object.create(Parent.prototype)，再把 constructor 指回子类。方法共享，属性各有一份。",
          "class extends 就是这件事的语法：设置原型链两端（实例链和构造函数链），子类构造里 this 在 super() 之前不可用，因为父类要先把实例分配出来。",
          "extends null 可以做出没有 Object.prototype 的对象基类。静态方法走构造函数的原型链，Child.__proto__ === Parent。",
          "能用组合就别用深层继承。继承耦合的是实现，组合耦合的是接口。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "function inherit(Child, Parent) {\n  Child.prototype = Object.create(Parent.prototype);\n  Child.prototype.constructor = Child;\n  Object.setPrototypeOf(Child, Parent);\n}",
      },
    ],
    followUps: ["super.method() 里的 this 指向谁？"],
  },
  {
    id: "fe-js-pattern",
    category: "frontend",
    title: "前端常见设计模式",
    difficulty: "medium",
    tags: ["JavaScript", "设计模式"],
    prompt: "单例、观察者、发布订阅、策略、装饰器，各举一个前端里的真实用法。不要背定义。",
    parts: [
      {
        type: "list",
        items: [
          "单例：ES 模块天然是单例。登录态、埋点客户端、WebSocket 连接放模块作用域，避免每个组件 new 一个。",
          "观察者：主体直接持有观察者并通知。DOM 事件、响应式的 dep 收集 watcher，属于这一类。",
          "发布订阅：中间有事件通道，发布者不认识订阅者。EventEmitter、跨组件总线。代价是调用链变隐式，不好追踪。",
          "策略：把 if/else 换成表。表单校验规则、支付方式、权限点到组件的映射，新增一种不改主流程。",
          "装饰器 / 中间件：函数包函数。埋点包一层请求、Express/Koa 洋葱、React HOC。注意包太深会让类型和调试变差。",
          "面试加分：说出你没用它的理由。不是每个状态都该上观察者。",
        ],
      },
    ],
    followUps: ["观察者和发布订阅差在「知不知道对方是谁」上，举一个因此踩坑的例子。"],
  },
  {
    id: "fe-js-json",
    category: "frontend",
    title: "JSON.parse 和 stringify 的坑",
    difficulty: "medium",
    tags: ["JavaScript", "序列化"],
    prompt: "用 JSON 做深拷贝会丢掉什么？把接口数据 parse 进来时，原型污染从哪进来？",
    parts: [
      {
        type: "list",
        items: [
          "对象里的 undefined、function、symbol 会被丢掉；数组里的它们变成 null。NaN、Infinity 变成 null。Date 变成字符串，parse 回来不是 Date。",
          "Map、Set、RegExp、类实例会退化成普通对象或空对象。循环引用直接抛错。",
          "键的顺序和 number 键会被重排成数组下标的样子。bigint 不能序列化。",
          "不要 JSON.parse(JSON.stringify(obj)) 当通用深拷贝。需要的话用 structuredClone，它支持循环引用和更多内置类型，但仍不拷函数和 DOM 节点。",
          "不可信 JSON 里如果有 __proto__、constructor，再深合并进现有对象就会污染原型。解析后只取白名单字段，或合并到 Object.create(null)。",
        ],
      },
    ],
    followUps: ["replacer 和 reviver 分别在哪一步插手？"],
  },
  {
    id: "fe-js-node-loop",
    category: "frontend",
    title: "Node 事件循环和浏览器的差别",
    difficulty: "hard",
    tags: ["JavaScript", "事件循环"],
    prompt: "process.nextTick、Promise.then、setTimeout、setImmediate 的先后怎么排？为什么 React 调度不用 setTimeout？",
    parts: [
      {
        type: "list",
        items: [
          "浏览器一轮：执行一个宏任务，清空微任务，然后有机会渲染。Node 按阶段走：timers、pending callbacks、poll、check、close callbacks。",
          "每个阶段结束后先清空 nextTick 队列，再清空 Promise 微任务。所以 nextTick 比 then 更早，也更容易把 I/O 饿死，库里不要递归 nextTick。",
          "setTimeout 在 timers 阶段，setImmediate 在 check 阶段。主模块里两者谁先不确定；I/O 回调里 setImmediate 总是先于 setTimeout(0)。",
          "浏览器没有标准 setImmediate。嵌套 setTimeout 有 4ms 下限，后台标签还会被节流。",
          "React 调度器用 MessageChannel 制造宏任务来让出主线程：比 setTimeout 更及时，又不会像微任务那样卡死渲染，也不跟帧绑定。",
        ],
      },
    ],
    followUps: ["微任务里不断 queueMicrotask，页面会怎样？"],
  },
  {
    id: "fe-js-copy",
    category: "frontend",
    title: "浅拷贝和深拷贝怎么选",
    difficulty: "easy",
    tags: ["JavaScript", "对象"],
    prompt: "展开运算符是深拷贝吗？哪些内置方法只拷一层？什么时候必须深拷贝？",
    parts: [
      {
        type: "list",
        items: [
          "浅拷贝：只复制第一层。对象用扩展运算符或 Object.assign，数组用 slice、from、扩展、concat。嵌套对象仍是同一个引用。",
          "深拷贝：每个可达对象都新建。手写要处理循环引用（WeakMap）、数组、Date、RegExp、Map、Set，并跳过函数。",
          "structuredClone 是浏览器和 Node 的标准深拷贝，能处理循环引用，不能拷函数、DOM、某些对象方法。",
          "不可变更新不一定要深拷贝整棵树：只拷从根到改动节点的路径，其余共享。这是 Redux 和不可变库在做的事。",
          "大多数业务改一份接口数据去展示，浅拷贝加明确的字段赋值就够。深拷贝整个状态树常常是在掩盖共享可变状态。",
        ],
      },
    ],
    followUps: ["拷贝时碰到 Vue 的响应式 Proxy，应该拷代理还是拷原始对象？"],
  },
  {
    id: "fe-js-strict",
    category: "frontend",
    title: "严格模式改变了什么",
    difficulty: "medium",
    tags: ["JavaScript", "语言"],
    prompt: "use strict 之后，this、静默失败和 arguments 有哪些变化？模块和 class 呢？",
    parts: [
      {
        type: "list",
        items: [
          "独立调用函数时 this 是 undefined，不是 window。漏写 new、拆出来的方法会马上暴露，而不是悄悄写到全局。",
          "给未声明变量赋值直接报错，不再创造全局变量。delete 变量、写只读属性、重复的函数参数名都会抛错。",
          "arguments 不再和形参别名同步。with 被禁止。八进制字面量被禁止。",
          "ES 模块和 class 体内部本来就是严格模式，不用再写指令。",
          "老代码迁严格模式前要搜隐式全局和 arguments 别名，这两处最容易行为变化。",
        ],
      },
    ],
    followUps: ["严格模式能在函数体内局部打开吗？它会影响外层吗？"],
  },
  {
    id: "fe-js-cycle",
    category: "frontend",
    title: "ESM 循环依赖",
    difficulty: "hard",
    tags: ["JavaScript", "模块"],
    prompt: "a 引 b、b 又引 a，为什么有时拿到的绑定是未初始化？和 CommonJS 循环有什么不同？",
    parts: [
      {
        type: "list",
        items: [
          "ESM 是活绑定：导入的是模块环境里的那个绑定，导出方后来赋值，导入方能看见新值。不是拷贝一份。",
          "求值顺序是深度优先。循环回来时，对方模块已经实例化但可能还没执行到那一行导出，读取会落入暂时性死区。",
          "函数声明会先初始化，所以循环里调用对方的函数常常能工作；调用对方的 const 对象，取决于那一行有没有执行完。",
          "CommonJS 拿到的是当时的 module.exports 对象。循环时常常是不完整的 exports，后面再补属性，早期拿到的引用有时能、有时不能看见，取决于导出写法是直接挂属性还是整体赋值。",
          "解法：把循环的两边收成第三个模块，或把依赖改成函数参数传进去。循环依赖是设计问题，不是语法技巧。",
        ],
      },
    ],
    followUps: ["动态 import() 能打破循环吗？代价是什么？"],
  },

  // ============ React ============
  {
    id: "fe-react-event",
    category: "frontend",
    title: "React 合成事件和原生事件",
    difficulty: "medium",
    tags: ["React", "事件"],
    prompt: "组件里 onClick 和 document 上的 addEventListener，谁先执行？stopPropagation 能挡住 document 上的监听吗？",
    parts: [
      {
        type: "list",
        items: [
          "React 17 起把委托绑到渲染根节点，不再绑 document。事件仍是原生捕获/冒泡，只是 React 在根上监听后再分发到组件。",
          "冒泡阶段：目标上的 React onClick 先于根上的委托，因此也先于 document 上的冒泡监听。捕获阶段的 document 监听最先发生。",
          "在 React 里 stopPropagation，原生事件到不了根节点外面，document 上的冒泡监听不会执行。这是和 React 16 不同的地方：16 的监听就在 document 上，组件里停止冒泡挡不住已经注册在 document 上的原生监听。",
          "合成事件对象会复用概念已经弱化，但不要异步去读 event 字段，需要的值当时就取出来。拿原生对象用 nativeEvent。",
          "混用时最容易错的是：原生监听绑在 document、React 里以为自己先处理完了。把原生监听绑到根节点内部的具体 DOM，顺序才直观。",
        ],
      },
    ],
    followUps: ["onClick 传的是函数调用还是函数引用，差别在哪？"],
  },
  {
    id: "fe-react-hoc",
    category: "frontend",
    title: "HOC、render props 和自定义 Hook",
    difficulty: "medium",
    tags: ["React", "复用"],
    prompt: "逻辑复用经历过哪三代写法？现在为什么优先自定义 Hook？HOC 还剩什么场景？",
    parts: [
      {
        type: "list",
        items: [
          "高阶组件是包一层的函数，通过 props 注入能力。问题是 ref 默认到不了内层、静态属性丢失、多层包裹后 DevTools 里全是匿名组件，props 来源也不清。",
          "render props 把渲染交给调用方，嵌套一深就成金字塔。适合「一个组件控制另一块 UI 的行为」，比如旧的 mouse position tracker。",
          "自定义 Hook 只复用状态逻辑，不增加节点。命名用 use 开头，内部遵守 Hooks 规则。它不是一种组件抽象，所以没有包装地狱。",
          "HOC 仍适合横切、且必须包在组件外面的事：错误边界只能是类组件，权限路由、注入埋点上下文。写的时候用 hoist-non-react-statics，并 forwardRef。",
          "自定义 Hook 里不要偷偷订阅全局再让每个调用者各持一份状态，除非那就是你要的。共享状态放到外部 store。",
        ],
      },
    ],
    followUps: ["两个自定义 Hook 调用了同一个 useState，状态会共享吗？"],
  },
  {
    id: "fe-react-vs-vue",
    category: "frontend",
    title: "React 和 Vue 的差异",
    difficulty: "medium",
    tags: ["React", "Vue"],
    prompt: "两者的更新粒度差在哪？模板和 JSX、响应式和 setState，各有什么后果？",
    parts: [
      {
        type: "list",
        items: [
          "React 默认从状态变化的组件开始整棵子树重新执行函数，再用 memo 和编译器跳过没变的子树。心智模型是 UI 等于状态的函数。",
          "Vue 用 Proxy 精确收集渲染用到的字段，字段变了只通知对应的 effect。模板编译期还能把静态节点提出来。不写额外 memo 也能少渲染。",
          "JSX 就是 JS，条件和循环用语言本身。Vue 模板有指令和限定的表达式，静态分析更强，复杂逻辑要进脚本。",
          "Vue 的 v-model 是显式的语法糖；React 表单默认受控，值在 state 里。不是 Vue 有魔法双向绑定到任意对象。",
          "选型看团队和生态，不看口号。React 的服务端组件和 Next 生态、Vue 的单文件组件和渐进接入，都是具体约束，不是谁更先进。",
        ],
      },
    ],
    followUps: ["把 Vue 的响应式塞进 React 组件，和 React 的模型冲突在哪？"],
  },
  {
    id: "fe-react-store",
    category: "frontend",
    title: "Redux 和 Zustand 怎么选",
    difficulty: "medium",
    tags: ["React", "状态"],
    prompt: "Redux 的单一状态树和纯函数换来了什么？Zustand 少了哪些约束，又少了什么？",
    parts: [
      {
        type: "list",
        items: [
          "Redux：一个 store，action 描述发生了什么，reducer 纯函数算出下一状态。时间旅行、可回放、中间件（日志、异步）都建立在「变化可序列化」上。Redux Toolkit 把样板收掉了，不要用十年前的写法评价它。",
          "Zustand：store 在 React 外面，用 hook 按选择器订阅，不需要 Provider。写法短，适合中小应用。没有强制的 action 协议，纪律靠约定。",
          "Context 适合低频的依赖注入（主题、当前用户）。高频字段放 Context，所有消费者都会跟着渲染。",
          "服务端状态用缓存库（React Query、SWR）：请求、缓存、失效、重试不是 Redux 该手写的。全局 store 放真正的客户端状态。",
          "大团队、要审计每一次变更，用 Redux。页面级或独立 SDK，用 Zustand 或组件 state。先问状态到底要不要全局。",
        ],
      },
    ],
    followUps: ["选择器返回新对象时，订阅会不会每次都触发渲染？"],
  },
  {
    id: "fe-react-life",
    category: "frontend",
    title: "类组件生命周期对照 Hooks",
    difficulty: "medium",
    tags: ["React", "生命周期"],
    prompt: "componentDidMount、DidUpdate、WillUnmount 分别对应哪段 Hook？哪些旧生命周期已经被废弃？",
    parts: [
      {
        type: "list",
        items: [
          "挂载：constructor 里的初始状态就是 useState 的初值。先 render，提交 DOM，再 componentDidMount。对应 useEffect 的空依赖，它在绘制之后。",
          "更新：render 之后 componentDidUpdate。同一个 effect 在依赖变化时先跑上一次的清理，再跑新的 effect。",
          "卸载：componentWillUnmount 对应 effect 返回的清理函数。这里解绑监听、取消请求、清定时器。",
          "要在浏览器绘制前读布局并同步改 DOM，用 useLayoutEffect，对应类组件里更早的提交阶段，不是 DidMount。",
          "componentWillMount、WillUpdate、WillReceiveProps 在并发渲染下不安全，因为 render 可能被中断重做。替代是 getDerivedStateFromProps，但多数情况只是派生状态，不该存在。",
        ],
      },
    ],
    followUps: ["空依赖的 effect 里读到的 props，后来变了会怎样？"],
  },
  {
    id: "fe-react-forward",
    category: "frontend",
    title: "forwardRef 和 useImperativeHandle",
    difficulty: "medium",
    tags: ["React", "ref"],
    prompt: "为什么函数组件默认接不到 ref？什么时候该暴露命令式方法，而不是再加一个 prop？",
    parts: [
      {
        type: "list",
        items: [
          "ref 不是普通 props。React 18 及以前，函数组件要用 forwardRef 才能接到父组件传来的 ref。React 19 把 ref 当成普通 prop，forwardRef 不再必需。",
          "把 ref 直接挂到 DOM 上，父组件拿到的是节点，可以聚焦、测量。这是最常见的用法。",
          "useImperativeHandle 让你只暴露 { focus, scrollTo } 这样的方法，而不是整个 DOM。第三方输入框、视频播放器、必须命令式滚动的列表会用到。",
          "能用状态表达就别用命令式。Imperative 把时序藏起来了，调用方要保证子组件已经挂载。",
          "库组件用 forwardRef 时记得设置 displayName，否则栈里只有匿名组件。",
        ],
      },
    ],
    followUps: ["callback ref 和 Ref 对象比，适合什么场景？"],
  },
  {
    id: "fe-react-strict",
    category: "frontend",
    title: "StrictMode 双调用和水合不一致",
    difficulty: "hard",
    tags: ["React", "SSR"],
    prompt: "开发环境 effect 执行了两次是 bug 吗？服务端和客户端首屏 HTML 不一致会发生什么？",
    parts: [
      {
        type: "list",
        items: [
          "StrictMode 在开发环境会额外执行一次渲染，并把 effect 做「挂载、清理、再挂载」。用来暴露缺清理函数、非纯渲染。生产环境不会双调用。",
          "渲染必须对同样的输入给出同样结果。渲染期间写全局变量、发请求、读 Math.random，双调用会让问题提前出现。",
          "水合是复用服务端 HTML 并绑上事件。文本对不上时 React 会丢掉这段服务端 HTML，在客户端重绘，并在控制台报警。代价是闪烁和白做的 SSR。",
          "常见原因：渲染用了 Date.now、随机数、本地时区、window 是否存在、非法 HTML 嵌套被浏览器改写（p 里套 div）。",
          "只在客户端出现的 UI 放到已挂载之后再渲染，或用 suppressHydrationWarning 标记那一个文本节点。不要用它盖住整棵树。",
        ],
      },
    ],
    followUps: ["useId 解决了水合里的什么问题？"],
  },
  {
    id: "fe-react-schedule",
    category: "frontend",
    title: "React 时间分片和优先级",
    difficulty: "hard",
    tags: ["React", "调度"],
    prompt: "Fiber 把渲染拆开之后，靠什么让出主线程？输入和过渡更新怎么不互相卡住？",
    parts: [
      {
        type: "list",
        items: [
          "渲染阶段把组件树走成链表，每处理完一个单元看时间。超过大约 5ms 就把剩余工作让出去，浏览器才能响应输入和绘制。",
          "让出用的是宏任务。MessageChannel 比 setTimeout 少了嵌套 4ms 的限制，又不会像微任务一样把渲染饿死。",
          "更新带优先级（lane）。点击、输入是离散的高优先级；startTransition 里的更新是过渡，可以被打断。高优先级来了，进行中的低优先级渲染作废重来。",
          "所以渲染里不能有副作用。同一个组件函数可能执行多次，只有提交阶段的 DOM 操作和 layout effect 保证一次。",
          "useDeferredValue 让一份派生值落后于紧急值，输入先画出来，列表用旧关键字再追上。它不减少计算量，只是改了顺序。",
        ],
      },
    ],
    followUps: ["过渡更新被打断后，已经算过的那部分会保留吗？"],
  },

  // ============ Vue ============
  {
    id: "fe-vue-ref",
    category: "frontend",
    title: "ref 和 reactive",
    difficulty: "medium",
    tags: ["Vue", "响应式"],
    prompt: "为什么 ref 要 .value，reactive 不用？把 reactive 对象解构、整个替换，响应式为什么会丢？",
    parts: [
      {
        type: "list",
        items: [
          "Proxy 只能代理对象。数字、字符串要能被替换，就得包一层对象，.value 是这层包装的读写口。模板里 ref 会自动解包，脚本里不会。",
          "reactive 返回代理，读属性时收集依赖。它不能包原始值，替换整个对象等于换掉了代理，旧代理上的依赖不会跟着新对象。",
          "解构把基本值拷出来，之后和代理无关。要用 toRefs，让每个字段仍是指向源对象的 ref。",
          "reactive 的属性如果是 ref，访问时会自动解包。从别的地方把 ref 放进 reactive 要清楚这一点，否则会多一层或少一层 .value。",
          "组合式函数对外尽量返回 ref，调用方可以自己决定要不要放进 reactive。大列表用 shallowRef，避免深层代理。",
        ],
      },
    ],
    followUps: ["ref 装一个对象，和 reactive 比，替换整个值时行为差在哪？"],
  },
  {
    id: "fe-vue-life",
    category: "frontend",
    title: "Vue 生命周期",
    difficulty: "easy",
    tags: ["Vue", "生命周期"],
    prompt: "setup、onMounted、onUpdated、onUnmounted 各能碰到什么？父组件和子组件谁先 mounted？",
    parts: [
      {
        type: "list",
        items: [
          "setup 在组件实例初始化时同步执行，此时还没有 DOM。请求如果只依赖 props，可以在这里发，但要处理卸载后的写入。",
          "onMounted：本组件和子组件的 DOM 都已经挂上。量尺寸、聚焦、接第三方库放这里。",
          "挂载顺序是父 beforeMount，子 beforeMount，子 mounted，父 mounted。父组件 mounted 时子组件一定已经 mounted。",
          "onUpdated 在本组件 DOM 因响应式更新打补丁之后。不要在里面改会再次触发渲染的状态，容易循环。",
          "onUnmounted 做清理。keep-alive 的组件离开时走 onDeactivated，真正销毁才走 onUnmounted。",
          "选项式的 beforeCreate/created 被 setup 取代；beforeMount、mounted、beforeUnmount、unmounted 仍在。",
        ],
      },
    ],
    followUps: ["在 setup 里访问 document.getElementById 自己的根节点，为什么是 null？"],
  },
  {
    id: "fe-vue-priority",
    category: "frontend",
    title: "v-if 和 v-for 的优先级",
    difficulty: "medium",
    tags: ["Vue", "指令"],
    prompt: "同一个元素上同时写 v-if 和 v-for，Vue 2 和 Vue 3 谁先执行？为什么不建议这么写？",
    parts: [
      {
        type: "list",
        items: [
          "Vue 2：v-for 优先级更高，v-if 能用到循环变量，但每次都会先整表循环再判断，列表很大时浪费。",
          "Vue 3：v-if 优先级更高，执行时还没有循环变量，在 v-if 里写 item.xxx 会取不到。这是故意改的，逼你别写在一起。",
          "要过滤：用计算属性先得到短列表，再 v-for。要整块开关：把 v-if 放到外层 template。",
          "v-for 必须配稳定 key，并且 key 不要用 index，除非列表只追加、不重排。",
          "v-if 是真的销毁和重建，组件状态会丢；频繁切换用 v-show，只改 display。",
        ],
      },
    ],
    followUps: ["template 上的 v-for 会不会产生真实 DOM？"],
  },
  {
    id: "fe-vue-slot",
    category: "frontend",
    title: "插槽和作用域插槽",
    difficulty: "medium",
    tags: ["Vue", "组件"],
    prompt: "默认插槽、具名插槽、作用域插槽各解决什么？Vue 3 的插槽为什么说是函数？",
    parts: [
      {
        type: "list",
        items: [
          "默认插槽是组件留下的一块内容缺口，父组件传入的结构仍然在父组件的作用域里编译，看不到子组件的 data。",
          "具名插槽把缺口分成 header、footer。Vue 3 用 v-slot:name，简写 #name。",
          "作用域插槽由子组件把数据传回来，父组件决定怎么画。列表组件把 item 交出来，分页表格把行交出来，都是这个模式。",
          "Vue 3 把插槽编译成函数，调用才渲染，未使用的插槽不会白白创建 vnode。子组件用 useSlots 拿到这些函数。",
          "插槽内容的 CSS 属于父组件的作用域。想让父组件的样式进到子组件内部，不要指望样式会自动穿透整棵子树。",
        ],
      },
    ],
    followUps: ["作用域插槽和 props 回调渲染比，差在哪？"],
  },
  {
    id: "fe-vue-provide",
    category: "frontend",
    title: "provide 和 inject",
    difficulty: "medium",
    tags: ["Vue", "组件"],
    prompt: "跨多层传参用 provide/inject，怎么保持响应式？它适合当组件库的公开 API 吗？",
    parts: [
      {
        type: "list",
        items: [
          "provide 在祖先上提供，子孙 inject，中间组件不用转发 props。依赖注入，不是事件总线。",
          "直接 provide 一个普通对象，后面给这个对象加属性，注入方看不到更新。要响应式就 provide ref 或 reactive。",
          "应用级用 app.provide，例如主题、国际化函数。组件级 provide 只覆盖这条子树。",
          "inject 要有默认值，独立使用组件时不会得到 undefined 还继续往下执行。库组件用 Symbol 当 key，避免和业务字符串撞名。",
          "不要用它绕开明确的 props 传递来隐藏依赖。阅读组件时注入是隐式的，层级一深就难找谁提供的。",
        ],
      },
    ],
    followUps: ["子组件能改 inject 到的 ref 吗？这样设计好不好？"],
  },
  {
    id: "fe-vue-model",
    category: "frontend",
    title: "v-model 的原理",
    difficulty: "medium",
    tags: ["Vue", "组件"],
    prompt: "v-model 在原生输入框和组件上分别编译成什么？Vue 3 怎么做多个 v-model？",
    parts: [
      {
        type: "list",
        items: [
          "原生 input：绑定 value，监听 input 事件写回。它是语法糖，不是把数据和 DOM 神秘地锁在一起。",
          "组件上，Vue 3 默认是 modelValue 加上 update:modelValue。v-model=\"foo\" 等于 :modelValue=\"foo\" 再加 @update:modelValue。",
          "Vue 2 是 value 和 input，额外字段用 .sync。Vue 3 用 v-model:title=\"title\" 这种参数支持多个双向绑定。",
          "修饰符：.lazy 改成 change 再提交，.number 转数字，.trim 去空白。组件可以通过 modelModifiers 自己处理。",
          "Vue 3.4 的 defineModel 把 props 和 emit 收成一个 ref，赋值就会发出更新。",
          "不要在子组件里直接改 props。发出更新，让父组件持有数据。",
        ],
      },
    ],
    followUps: ["v-model 配 Vuex/Pinia 时，计算属性的 getter/setter 怎么写？"],
  },
  {
    id: "fe-vue-directive",
    category: "frontend",
    title: "自定义指令",
    difficulty: "medium",
    tags: ["Vue", "指令"],
    prompt: "什么逻辑该写成指令而不是组件？beforeMount、mounted、updated、unmounted 里各做什么？",
    parts: [
      {
        type: "list",
        items: [
          "指令操作的是真实 DOM 的低级行为：自动聚焦、点击外部关闭、懒加载、权限下直接把节点摘掉。它不负责产出结构，产出结构用组件。",
          "钩子：created / beforeMount 还没有稳定 DOM；mounted 可以绑监听；updated 在组件更新后根据新的 binding.value 调整；unmounted 必须解绑，否则监听留在 document 上。",
          "binding 里有 value、oldValue、arg、modifiers。不要把复杂对象塞进指令还期望深度监听，指令不会替你做响应式diff，要自己比较。",
          "全局指令污染面大，能局部注册就局部注册。服务端渲染时指令钩子大多不执行，涉及 DOM 的指令要确认只在客户端用。",
          "一个指令只做一件事。权限、曝光、懒加载写成三个，不要合成一个什么都看的 v-magic。",
        ],
      },
    ],
    followUps: ["点击外部关闭的监听绑在 document 上，列表里有一百个弹层会怎样？"],
  },

  // ============ TypeScript ============
  {
    id: "fe-ts-keyof",
    category: "frontend",
    title: "keyof、typeof 和 satisfies",
    difficulty: "medium",
    tags: ["TypeScript", "类型"],
    prompt: "keyof 和 typeof 在类型位置上是什么意思？satisfies 和类型断言差在哪？",
    parts: [
      {
        type: "list",
        items: [
          "keyof T 是 T 所有公共键的联合。对字符串索引签名，keyof 会包含 string | number。",
          "typeof 放在类型位置，取变量或函数的类型，而不是运行时字符串。配合 ReturnType、Parameters 就不用把函数类型手写第二遍。",
          "satisfies 检查表达式符合某个类型，但保留更窄的推断。as 是你告诉编译器「相信我」，写错了它也信。",
          "as const 把对象收成只读字面量，配合 keyof typeof config 做配置表的键约束，很常见。",
          "索引访问 T[K]，K 是联合时结果也是联合。想按键取值又保持对应关系，用泛型 K extends keyof T。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "const routes = {\n  home: \"/\",\n  user: \"/users/:id\",\n} as const;\n\ntype Path = (typeof routes)[keyof typeof routes];\n\nconst theme = {\n  color: \"red\",\n  padding: 8,\n} satisfies Record<string, string | number>;",
      },
    ],
    followUps: ["Parameters 和 ConstructorParameters 分别提取什么？"],
  },
  {
    id: "fe-ts-union",
    category: "frontend",
    title: "可辨识联合和穷尽检查",
    difficulty: "medium",
    tags: ["TypeScript", "类型"],
    prompt: "几个形状相近的对象塞进一个联合类型，怎么让 switch 在漏掉一种情况时编译失败？",
    parts: [
      {
        type: "list",
        items: [
          "给每个成员一个字面量标签，例如 type: \"success\" | \"error\"。这就是可辨识联合，标签是判别字段。",
          "switch 收到这个字段后，每个分支里的类型会被收窄。default 里把值赋给 never，漏掉的成员会让这一行报错。",
          "可选字段表达「有或没有」往往不如拆成两个对象清楚。undefined 和缺失在 exactOptionalPropertyTypes 下并不是一回事。",
          "联合是「或」，交叉是「与」。把两个接口交叉，必填字段会叠加；把两个对象联合，访问时只能碰到共有成员。",
          "接口返回值优先用可辨识联合，而不是 { ok: boolean; data?: T; error?: string }，后者在 ok 为 true 时 data 仍可能被当成可选。",
        ],
      },
    ],
    followUps: ["in 操作符收窄和判别字段收窄，哪个更稳？"],
  },
  {
    id: "fe-ts-tuple",
    category: "frontend",
    title: "元组、as const 和只读",
    difficulty: "easy",
    tags: ["TypeScript", "类型"],
    prompt: "useState 返回的数组为什么类型不会丢？元组和不限长度的数组差在哪？",
    parts: [
      {
        type: "list",
        items: [
          "元组是长度固定、每位类型可以不同的数组。React 的 useState 返回 [S, Dispatch] 这种元组，解构后两边类型还在。",
          "普通数组推断常常被放宽成一个元素类型。as const 把它收成只读元组，元素变成字面量类型。",
          "readonly 防止把数组当可变的传出去。Readonly<T> 和 readonly T[] 是浅的，嵌套对象仍可改。",
          "可变元组 ...T[] 用在「若干确定参数加剩余参数」的函数类型上。标签元组可以给每一位起名字，读函数签名时清楚些。",
          "运行时没有元组。长度约束只存在于编译期，接口如果真要保证长度，还是要校验。",
        ],
      },
    ],
    followUps: ["const 断言之后为什么不能再 push？"],
  },
  {
    id: "fe-ts-strict",
    category: "frontend",
    title: "tsconfig 里该开的严格项",
    difficulty: "medium",
    tags: ["TypeScript", "工程"],
    prompt: "strict 打开了哪些检查？为什么 any 会传染？noUncheckedIndexedAccess 解决什么？",
    parts: [
      {
        type: "list",
        items: [
          "strict 包含 strictNullChecks、noImplicitAny、strictFunctionTypes、strictBindCallApply 等。新项目直接开，不要一项项商量。",
          "strictNullChecks 让 undefined 和 null 成为显式成员。不开的话可选链和收窄都是假的安全感。",
          "any 关闭了那一块的检查，还会在赋值、返回值里向外流。未知的外部数据用 unknown，进函数之前先收窄。",
          "noUncheckedIndexedAccess 让 arr[i] 和 obj[key] 的结果带上 undefined。下标访问本来就可能越界，这个选项把这件事说出来。",
          "isolatedModules 要求每个文件能单独编译，避免 const enum 这种需要跨文件信息的语法。打包器场景应该开。skipLibCheck 只是跳过依赖的声明检查，不是让你的代码变松。",
        ],
      },
    ],
    followUps: ["exactOptionalPropertyTypes 打开后，可选属性能不能显式赋 undefined？"],
  },

  // ============ 浏览器 ============
  {
    id: "fe-browser-crp",
    category: "frontend",
    title: "关键渲染路径和合成层",
    difficulty: "hard",
    tags: ["浏览器", "渲染"],
    prompt: "从 HTML、CSS 到像素，浏览器中间有哪些树？哪些 CSS 会让元素单独提升成一层？",
    parts: [
      {
        type: "list",
        items: [
          "解析 HTML 得到 DOM，解析 CSS 得到 CSSOM。CSS 会阻塞渲染，JS 默认阻塞 HTML 解析，除非 async 或 defer。",
          "两者合成渲染树：display:none 的子树不在里面，visibility:hidden 还在。然后布局（几何）、绘制（像素命令）、合成（把层合到屏幕上）。",
          "只改 transform 和 opacity，并且元素已经有自己的层时，合成器线程能自己完成，不必主线程重新布局和绘制。",
          "提升成层的典型条件：3D transform、will-change、video、canvas、opacity 动画、filter。每层都有内存，列表里给每一行 will-change: transform 会把内存打满。",
          "强制同步布局：读 offsetHeight 又立刻改样式，浏览器不得不提前把布局做完。把读和写分成两批。",
        ],
      },
    ],
    followUps: ["content-visibility: auto 跳过的是渲染路径的哪一段？"],
  },
  {
    id: "fe-browser-hint",
    category: "frontend",
    title: "preload、prefetch、preconnect",
    difficulty: "medium",
    tags: ["浏览器", "加载"],
    prompt: "这三个资源提示分别在什么时候用？把所有脚本都 preload 会怎样？",
    parts: [
      {
        type: "list",
        items: [
          "preload：当前页马上要用，优先级高。必须写 as（script、style、font、image），字体还要 crossorigin，否则预加载和正式请求对不上，下两次。",
          "prefetch：下一页可能要用，优先级低，浏览器空闲再下。适合路由跳转前的下一屏脚本，不适合当前 LCP 图片。",
          "preconnect：提前做 DNS、TCP 和 TLS。只对马上会请求的少数源使用，每个连接都占资源。dns-prefetch 只解析域名，更便宜。",
          "modulepreload 给 ES 模块，连同依赖一起预加载并编译。",
          "提示是在抢带宽。预加载一堆用不到的资源，会把真正的首屏请求挤下去。只对 LCP 图片、首屏字体、关键入口脚本使用。",
        ],
      },
    ],
    followUps: ["preload 了却没有在几秒内使用，控制台为什么会警告？"],
  },
  {
    id: "fe-browser-origin",
    category: "frontend",
    title: "同源策略",
    difficulty: "medium",
    tags: ["浏览器", "安全"],
    prompt: "同源看哪三段？脚本请求跨域接口时，请求有没有发出去？iframe 里的页面为什么读不到？",
    parts: [
      {
        type: "list",
        items: [
          "协议、主机、端口三者一致才同源。子域不同也是跨域。同源策略限制的是脚本读取对方的响应和 DOM，不是禁止一切网络活动。",
          "img、script、link 可以跨域加载，但脚本读不到原始内容。canvas 画了跨域图片会变脏，toDataURL 会抛错，除非图片带 CORS 头并且请求带了 crossOrigin。",
          "跨域 XHR/fetch：简单请求会直接发出去，脚本读不读得到响应取决于 Access-Control-Allow-Origin。非简单请求先 OPTIONS 预检。",
          "跨域 iframe 的 DOM 不能访问。双方约定用 postMessage，并检查 event.origin，不要用 * 还处理敏感数据。",
          "document.domain 放松同源已经过时且被限制。别用它做新系统。",
        ],
      },
    ],
    followUps: ["同源策略能挡住 CSRF 吗？"],
  },
  {
    id: "fe-browser-sw",
    category: "frontend",
    title: "Service Worker 和往返缓存",
    difficulty: "hard",
    tags: ["浏览器", "缓存"],
    prompt: "Service Worker 的生命周期是怎样的？为什么有时改了代码用户还是旧页面？bfcache 又是什么？",
    parts: [
      {
        type: "list",
        items: [
          "Service Worker 跑在独立线程，能拦截 fetch、操作 Cache Storage、接收推送。必须是 HTTPS（localhost 除外），作用域默认是脚本所在路径。",
          "生命周期：安装、等待、激活。新版本安装后默认不接管已打开的页面，要 skipWaiting 再 clients.claim。更新策略写错，用户会永远停在旧缓存。",
          "缓存策略要按资源分：带内容哈希的静态文件用 cache-first；HTML 用 network-first，否则发版后入口还是旧的，去拉已经不存在的 chunk。",
          "bfcache 是浏览器对「后退/前进」整页冻结，包括 JS 堆，恢复时不重新请求。unload 事件、Cache-Control: no-store、部分连接会让页面进不了 bfcache。",
          "pageshow 的 persisted 表示从 bfcache 恢复。这时该刷新的接口要自己补，不要假设页面是新打开的。",
        ],
      },
    ],
    followUps: ["Service Worker 和 HTTP 缓存谁先被问到？"],
  },
  {
    id: "fe-browser-cookie",
    category: "frontend",
    title: "Cookie 的安全和 SameSite",
    difficulty: "medium",
    tags: ["浏览器", "Cookie"],
    prompt: "HttpOnly、Secure、SameSite 各自挡住什么？前端 JS 什么时候读得到 Cookie？",
    parts: [
      {
        type: "list",
        items: [
          "Cookie 大约 4KB，每次匹配 Domain 和 Path 的请求都会带上，所以不要塞业务数据。过期看 Max-Age 或 Expires，会话 Cookie 在浏览器会话结束时丢。",
          "HttpOnly：document.cookie 读不到，XSS 偷不走这枚 Cookie，但请求仍会自动带上，CSRF 还在。",
          "Secure：只在 HTTPS 发送。SameSite=None 必须同时 Secure，否则浏览器丢掉。",
          "SameSite=Lax 是现代浏览器的默认：跨站子请求和跨站 POST 不带，顶级 GET 导航会带。Strict 更紧，从外部链接点进来的首次请求也不带。None 允许跨站携带，用于嵌入式场景，必须配 CSRF 防护。",
          "前端能读到的只有非 HttpOnly 的 Cookie。登录态令牌若放这里，等于假设页面上永远没有 XSS。",
        ],
      },
    ],
    followUps: ["sessionStorage 刷新页面还在吗？新开一个标签呢？"],
  },
  {
    id: "fe-browser-sse",
    category: "frontend",
    title: "SSE、WebSocket 和轮询",
    difficulty: "medium",
    tags: ["浏览器", "网络"],
    prompt: "服务端要持续把文本推给页面，用 SSE 还是 WebSocket？断线之后怎么续上？",
    parts: [
      {
        type: "list",
        items: [
          "短轮询浪费请求。长轮询拿一个挂起的 HTTP 请求，有数据就返回再立刻重连，服务器连接数上去之后很重。",
          "SSE 是普通 HTTP，响应类型 text/event-stream，服务端到客户端单向。浏览器 EventSource 会自动重连，并带上 Last-Event-ID。适合通知、股价、模型逐字输出。",
          "WebSocket 先用 HTTP 升级，之后全双工，能发二进制。适合聊天、协同编辑、游戏。重连、心跳、消息序号要自己做。",
          "SSE 走 fetch 可读流时能带自定义头（EventSource 不能带 Authorization），也能用 AbortController 取消。代理和 HTTP/1.1 的连接数要留意，HTTP/2 下好很多。",
          "流式渲染要把「网络收包」和「往 DOM 写」拆开。每个 token 都改一次大 Markdown 树会把主线程打满，应该合批，按帧刷新。",
        ],
      },
    ],
    followUps: ["SSE 和 WebSocket 谁更容易穿过公司代理？"],
  },
  {
    id: "fe-browser-observer",
    category: "frontend",
    title: "三种 Observer 怎么用",
    difficulty: "medium",
    tags: ["浏览器", "API"],
    prompt: "IntersectionObserver、MutationObserver、ResizeObserver 分别替代了以前的什么写法？有什么坑？",
    parts: [
      {
        type: "list",
        items: [
          "IntersectionObserver 异步告诉你元素和视口（或某个滚动父级）相交了多少。懒加载、无限滚动、曝光埋点用它，不要在 scroll 里同步 getBoundingClientRect。rootMargin 可以提前加载。",
          "MutationObserver 在微任务里批量给出 DOM 变化。适合接第三方脚本改了 DOM、或富文本。观察整棵 document 并且什么都记，会非常吵。",
          "ResizeObserver 在布局之后、绘制之前通知尺寸变化。在回调里再改尺寸可能造成循环，浏览器会在控制台警告并跳过后续通知。",
          "三个都要在不用时 disconnect。SPA 路由离开时这是常见泄漏点。",
          "它们都不保证和某一帧对齐到「立刻」。需要跟帧走的动画仍用 requestAnimationFrame。",
        ],
      },
    ],
    followUps: ["曝光埋点用相交比例 0 和 0.5，产品含义有什么不同？"],
  },
  {
    id: "fe-browser-wasm",
    category: "frontend",
    title: "WebAssembly 什么时候值得用",
    difficulty: "medium",
    tags: ["浏览器", "性能"],
    prompt: "把计算搬到 WASM 一定更快吗？它能不能操作 DOM？和 Web Worker 怎么配合？",
    parts: [
      {
        type: "list",
        items: [
          "WASM 是紧凑的二进制指令，适合 CPU 密集、控制流规整的计算：图像和音视频、压缩、加密、游戏物理、已有的 C++/Rust 库。",
          "它没有 DOM 接口。改页面仍要回 JS。频繁跨边界传大量小对象，开销会吃掉收益。大块数据用线性内存或共享的 ArrayBuffer。",
          "实例化和下载也有成本。一个几毫秒的函数不值得搬。先用性能面板确认是 JS 计算热点，再搬这一块。",
          "重计算即使用 WASM 也不该堵主线程，放进 Worker。Worker 和 WASM 解决的是两件不同的事：一个是线程，一个是指令密度。",
          "调试、包体积和安全审计都更贵。业务 CRUD 页面几乎用不到。",
        ],
      },
    ],
    followUps: ["SIMD 和多线程 WASM 对响应头有什么要求？"],
  },
  {
    id: "fe-browser-http",
    category: "frontend",
    title: "前端要讲清的 HTTP 方法和状态码",
    difficulty: "easy",
    tags: ["浏览器", "HTTP"],
    prompt: "GET 和 POST 的区别只是参数位置吗？304、401、403、409 在前端分别怎么处理？",
    parts: [
      {
        type: "list",
        items: [
          "GET 应当安全且幂等，结果可以被缓存，参数在 URL 上，有长度和日志泄露问题。POST 用来提交，默认不缓存，身体可以是 JSON、表单或文件。",
          "幂等看的是语义不是方法名：PUT 替换、DELETE 删除，做一次和做多次效果相同；POST 创建通常不幂等，所以刷新会提示重新提交。",
          "200 成功，201 创建并带 Location，204 没身体。301/302 浏览器对方法和跨域有自己的跟随规则，前端路由不要乱用 302 当业务跳转。",
          "304 是协商缓存命中，不是错误。401 未认证，去刷新登录；403 已认证但没权限，不要拿去刷新令牌。404 资源不存在，409 冲突（重复提交、版本冲突）。",
          "Content-Type 是身体的格式。application/json 会让跨域变成非简单请求；multipart 用来上传文件，不要自己拼边界还配错类型。",
        ],
      },
    ],
    followUps: ["fetch 在 404 和 500 时会进入 catch 吗？"],
  },

  // ============ 性能 ============
  {
    id: "fe-perf-upload",
    category: "frontend",
    title: "大文件分片上传和秒传",
    difficulty: "hard",
    tags: ["性能", "网络"],
    prompt: "几个 G 的文件怎么传？断网后续传靠什么？秒传判断的是整文件还是分片？",
    parts: [
      {
        type: "list",
        items: [
          "用 Blob.slice 按固定大小切片，例如 5MB。每个分片带文件 id、序号、本片哈希。并发数要限流，全部 Promise.all 会把浏览器连接和内存打满。",
          "整文件哈希用增量 MD5 或 SHA，放在 Worker 里算，主线程只负责切和发。算哈希期间给进度，否则用户以为卡死。",
          "秒传：先把整文件哈希给服务端，已存在就直接成功，不再上传。分片哈希用来校验每一片，不能代替整文件身份。",
          "断点续传：服务端记下已收到的序号，客户端开传前先问。不要靠本地 localStorage 当唯一进度，换浏览器就丢了。",
          "服务端合并时按序号写，合并后再比对整文件哈希。失败的片单独重试，并限制次数。暂停用 AbortController 取消还在飞的请求。",
        ],
      },
    ],
    followUps: ["哈希算了很久，用户改选了另一个文件，上次的计算怎么停？"],
  },
  {
    id: "fe-perf-cdn",
    category: "frontend",
    title: "CDN 在前端发版里怎么用",
    difficulty: "medium",
    tags: ["性能", "缓存"],
    prompt: "静态资源放 CDN 之后，为什么 HTML 不能也缓存一年？回源和缓存击穿跟前端有什么关系？",
    parts: [
      {
        type: "list",
        items: [
          "CDN 把文件放到离用户近的节点。对前端来说，带内容哈希的 JS/CSS/图片可以缓存一年：文件名变了就是新资源。",
          "HTML 是入口，必须短缓存或协商缓存。它里面写着这次构建的文件名。HTML 被缓存一年，用户会一直去拉已经删除的旧 chunk。",
          "同一页面的资源尽量同协议、少域名。域名多了要多做连接；HTTP/2 之后合并域名往往更好，不要再为了老浏览器拆一堆域。",
          "发版先上传永不覆盖的哈希文件，再切换 HTML。顺序反了，新 HTML 会引用还没传到节点的文件。",
          "接口默认不要丢给 CDN 缓存，除非明确按 URL 区分用户、并设置正确的 Vary。缓存了带 Cookie 的个性化响应是事故。",
        ],
      },
    ],
    followUps: ["文件名哈希没变，但你确实想让所有用户刷新，该清哪一层？"],
  },
  {
    id: "fe-perf-font",
    category: "frontend",
    title: "字体加载和布局抖动",
    difficulty: "medium",
    tags: ["性能", "字体"],
    prompt: "自定义字体导致文字先看不见、然后整页抖一下，怎么处理？",
    parts: [
      {
        type: "list",
        items: [
          "font-display: swap 先用后备字体画出文字，自定义字体到了再换。FOIT（文字空白）通常比 FOUT（闪一下）更伤首屏。",
          "后备字体的度量差很多时，替换的一瞬间行高会变，这是 CLS。用 size-adjust、ascent-override 把后备字体调到接近，或用工具生成回退声明。",
          "只 preload 首屏真正用到的那一两个 woff2，并加 crossorigin。子集化，把没人用的字形从文件里拿掉。",
          "不要在正文上叠四套字重。每一套都是一个关键请求。图标优先用 SVG，而不是整套图标字体。",
          "系统字体栈在后台产品里完全够用。自定义字体是品牌需求，不是性能默认项。",
        ],
      },
    ],
    followUps: ["font-display: optional 和 swap 对慢速网络的差别是什么？"],
  },
  {
    id: "fe-perf-white",
    category: "frontend",
    title: "SPA 白屏怎么拆开看",
    difficulty: "medium",
    tags: ["性能", "首屏"],
    prompt: "用户说打开是白的。你怎么区分是 HTML 慢、JS 大、还是接口慢？",
    parts: [
      {
        type: "list",
        items: [
          "白屏不是一个指标。先看导航时间线：TTFB 高是服务端或网络；HTML 到了但 FCP 晚，多半是 CSS/JS 阻塞或长任务；FCP 有了但 LCP 晚，是最大的那张图或那块文字没准备好。",
          "SPA 常见路径：下 HTML 壳子、下一大包 JS、解析执行、拉路由组件、再请求数据。每一段都能白。对症：入口分包、路由懒加载、数据不要等整包执行完才开始（能在 HTML 里预取就预取）。",
          "骨架屏只能掩盖短等待。JS 要执行 3 秒时，骨架也出不来，因为骨架也在 JS 里。关键骨架可以是 HTML 里的纯 CSS。",
          "错误也会看起来像白屏：入口脚本 404、运行时异常把根组件卸掉。要有不依赖框架的错误兜底，监控要报「入口执行失败」。",
          "SSR 把首屏 HTML 先给出来，白屏会短，但水合的长任务仍会让页面点不了。要一起看可交互时间，不只看第一次上色。",
        ],
      },
    ],
    followUps: ["把所有路由都 prefetch 了，白屏为什么可能更差？"],
  },

  // ============ 工程化 ============
  {
    id: "fe-eng-babel",
    category: "frontend",
    title: "Babel、polyfill 和语法降级",
    difficulty: "medium",
    tags: ["工程化", "构建"],
    prompt: "编译能把可选链变旧语法，为什么旧浏览器还是没有 Promise？browserslist 在这里起什么作用？",
    parts: [
      {
        type: "list",
        items: [
          "Babel 的流程是解析成 AST、用插件变换、再生成代码。它默认只做语法：箭头函数、可选链、class。不往全局补 API。",
          "Promise、Array.from、Object.hasOwn 这类是库，要 polyfill。@babel/preset-env 配 useBuiltIns: \"usage\" 和 corejs，按你用到的 API 和目标浏览器按需注入。",
          "browserslist 是目标浏览器的唯一清单，Babel、autoprefixer、打包器的压缩都读它。不要一处写死 chrome 80、另一处又去兼容 IE。",
          "TypeScript 的 tsc 或 esbuild 转译只是擦掉类型，不做类型检查的那一步仍然要跑 tsc --noEmit。转译成功不代表类型对。",
          "SWC 和 esbuild 做同样的语法降级更快，插件生态不如 Babel。选谁取决于你有没有离不开的 Babel 插件。",
        ],
      },
    ],
    followUps: ["polyfill 污染全局，和按需从 core-js 纯导入，包体积和兼容性差在哪？"],
  },
  {
    id: "fe-eng-pkg",
    category: "frontend",
    title: "npm、pnpm 和幽灵依赖",
    difficulty: "medium",
    tags: ["工程化", "包管理"],
    prompt: "为什么代码里没声明 lodash 却能 import？pnpm 怎么让这个问题消失？lock 文件为什么必须提交？",
    parts: [
      {
        type: "list",
        items: [
          "npm 的扁平 node_modules 会把依赖的依赖抬到顶层。你没在 package.json 里写的包，有时也能解析到，这就是幽灵依赖。哪天上层不再依赖它，你的构建就断了。",
          "pnpm 用内容寻址的全局仓库加硬链接，项目里的 node_modules 是符号链接，且只有直接依赖可见。磁盘和安装时间都更好，幽灵依赖会被直接报错。",
          "lock 文件锁的是整棵树的版本和完整性哈希。不提交它，同事和 CI 会在浮动范围内装到不同版本。",
          "依赖分 dependencies 和 devDependencies。打包进浏览器的库必须在 dependencies，只在构建时用的放 dev。应用和库的发布规则不一样，别照搬。",
          "包导出用 exports 字段限制深路径导入。依赖方引你的内部文件，你一重构他就坏。",
        ],
      },
    ],
    followUps: ["peerDependency 不自动安装时，组件库作者想表达什么？"],
  },
  {
    id: "fe-eng-i18n",
    category: "frontend",
    title: "前端国际化怎么设计",
    difficulty: "medium",
    tags: ["工程化", "国际化"],
    prompt: "只把中文换成键值就完了吗？日期、复数、文案长度和语言切换各要处理什么？",
    parts: [
      {
        type: "list",
        items: [
          "文案用键，不要在代码里拼句子。语序不同，\"共 \" + n + \" 条\" 在别的语言里不成立。复数用 ICU 消息格式，由文案声明规则。",
          "日期、数字、货币用 Intl，不要自己切片。时区以服务器给的绝对时间加用户时区来显示，存 UTC。",
          "德语和俄语往往更长，中文按钮宽度不能写死。布局用弹性，从第一天就用长文案试。",
          "语言包按路由拆，不要把四十种语言打进首屏。当前语言可以内联关键文案，其余懒加载。切换语言时已发出的请求不要用旧语言的响应对上新界面。",
          "翻译缺失要有回退语言，并在开发环境大声失败。图片里的字、服务端错误码、SEO 的 title 都在范围内，不只是组件里的字符串。",
        ],
      },
    ],
    followUps: ["从右往左的语言，只靠 CSS 的 direction 够不够？"],
  },
  {
    id: "fe-eng-git",
    category: "frontend",
    title: "Git 协作和撤回提交",
    difficulty: "easy",
    tags: ["工程化", "Git"],
    prompt: "功能分支怎么合回主干？已经推送的提交发现错了，用 reset 还是 revert？",
    parts: [
      {
        type: "list",
        items: [
          "主干保持可发布。功能在短分支上做，小步提交，提交说明写为什么。合入用合并请求，让 CI 先跑。",
          "还没推送的本地提交可以用 reset 整理。已经推送并给别人用过的提交，用 revert 新增一个反向提交，历史不改写，别人不会对不上。",
          "rebase 会改写提交哈希。只对还没共享的本地提交做。对公共分支强推需要团队明确约定，否则会覆盖别人的提交。",
          "冲突是双方改了同一处。先理解两边的意图再留代码，不要把冲突标记提交上去。拉最新主干到功能分支上解决，比在落后几十个提交时硬合更清楚。",
          "stash 用来临时腾工作区，不是备份系统。大于半天的改动应该在分支上。",
        ],
      },
    ],
    followUps: ["merge 和 rebase 之后，git blame 的体验差在哪？"],
  },
  {
    id: "fe-webpack-flow",
    category: "frontend",
    title: "Webpack 一次构建在做什么",
    difficulty: "medium",
    tags: ["Webpack", "构建"],
    prompt: "从入口到产出文件，Webpack 经过哪些阶段？loader 和 plugin 分别插在哪？",
    parts: [
      {
        type: "list",
        items: [
          "初始化配置和插件，从 entry 出发递归解析依赖，建成模块图。这一阶段 resolver 决定一个导入路径对应哪个文件。",
          "loader 从后往前组成管道，把单个文件变成 JS 模块能认识的内容。babel-loader 转脚本，css-loader 处理导入，它们不决定打包结构。",
          "seal 阶段生成 chunk 图：把模块按动态 import 和 splitChunks 放进文件。优化、tree-shaking 的标记使用、运行时清单都在这附近完成。",
          "emit 把资产写出来。HtmlWebpackPlugin、压缩、把哈希写进文件名，都是挂在生命周期上的 plugin。",
          "所以：loader 是文件变换，plugin 是构建过程的钩子。想在每个文件上做事用 loader，想在「全部模块已经清楚」之后做事用 plugin。",
        ],
      },
    ],
    followUps: ["source map 放在哪一阶段生成，为什么生产环境要单独考虑它的泄露？"],
  },
  {
    id: "fe-webpack-hmr",
    category: "frontend",
    title: "热更新是怎么换掉模块的",
    difficulty: "hard",
    tags: ["Webpack", "Vite"],
    prompt: "改一行代码，页面为什么可以不刷新？Vite 和 Webpack 的热更新差在哪一步？",
    parts: [
      {
        type: "list",
        items: [
          "开发服务器和页面里的运行时用 WebSocket 通信。服务端算出这次变了哪个模块，客户端去拉新模块，替换模块图里的那一格，再沿 accept 链向上通知。",
          "没有人 accept，更新会冒泡到入口，然后整页刷新。React、Vue 的官方插件在组件边界 accept，只重新执行组件，并尽量保住 state。",
          "Webpack 要先把改动的模块放进已有的打包图再推补丁。项目大时，这一步仍然跟整张图有关。",
          "Vite 开发模式不打包业务代码，浏览器按原生 ESM 请求模块。改一个文件，只让这个模块和接受它的边界失效，所以冷启动和热更新都不随项目体积线性变慢。生产构建再打包，Vite 8 起这一步由 Rolldown 完成。",
          "热更新保不住的状态：模块顶层的变量会重新初始化。依赖「只执行一次」的副作用（注册全局监听而不清理）会在热更新后执行多次。",
        ],
      },
    ],
    followUps: ["CSS 热更新为什么通常连组件状态都不用丢掉？"],
  },

  // ============ 安全 ============
  {
    id: "fe-security-proto",
    category: "frontend",
    title: "原型污染",
    difficulty: "hard",
    tags: ["安全", "JavaScript"],
    prompt: "一个递归合并 JSON 的函数，怎么会让后来所有对象都多出 isAdmin？前端该怎么写才不会中招？",
    parts: [
      {
        type: "list",
        items: [
          "攻击载荷把 __proto__ 或 constructor.prototype 当成普通键。递归赋值时走到对象的原型，给 Object.prototype 加了属性。之后 for-in、hasOwn 写错的判断、依赖原型属性的逻辑都会中招。",
          "来源常常是 query、JSON body、富文本配置，经过一个「深合并默认值」的工具函数。lodash 旧版本有过这类问题，升级不是唯一的事，自己写的 merge 同样危险。",
          "防御：合并时跳过 __proto__、prototype、constructor；用 Object.create(null) 做字典，或直接用 Map；用新版本且有测试的库。",
          "Object.hasOwn 或 hasOwnProperty.call 做判断，不要用 in，也不要假设原型是干净的。",
          "污染是 JS 特有的注入，不是 XSS。即使用户看不见，服务端如果把被污染的对象拿去鉴权，就会变成权限问题。前端挡一遍，服务端不能信任这份对象。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "function safeMerge(target, source) {\n  for (const key of Object.keys(source)) {\n    if (key === \"__proto__\" || key === \"constructor\" || key === \"prototype\") continue;\n    const value = source[key];\n    if (value && typeof value === \"object\" && !Array.isArray(value)) {\n      target[key] = safeMerge(target[key] && typeof target[key] === \"object\" ? target[key] : {}, value);\n    } else {\n      target[key] = value;\n    }\n  }\n  return target;\n}",
      },
    ],
    followUps: ["Object.freeze(Object.prototype) 能当通用方案吗？会破坏什么？"],
  },
  {
    id: "fe-security-token",
    category: "frontend",
    title: "登录态、双令牌和无感刷新",
    difficulty: "hard",
    tags: ["安全", "鉴权"],
    prompt: "access token 放本地存储还是内存？多个请求同时 401 时，怎么只刷新一次令牌？",
    parts: [
      {
        type: "list",
        items: [
          "短期 access token 用来访问接口，长期 refresh token 只用来换新的 access。refresh 放 HttpOnly、Secure、SameSite 合适的 Cookie，JS 读不到。access 可以放内存，刷新页面就没了，再用 refresh 换一次。",
          "放 localStorage 实现简单，但页面上任何 XSS 都能把令牌拿走，而且它不会随请求自动过期策略一起被浏览器管理。这是便利和风险的交换，要讲出来。",
          "并发 401：第一个请求去刷新，其余请求排进队列。刷新成功后用新令牌重放；失败则清空队列并去登录。没有这把锁，十个请求会打十次刷新，把 refresh 用乱，甚至互相作废。",
          "重放时要沿用当初的参数。分页请求如果用了过期响应插进列表，会出现重复和错页。刷新期间不要把失败响应当成空数据渲染。",
          "退出登录要让服务端的 refresh 失效，不只是前端删一个 key。XSS 和 CSRF 的取舍要一起讲：Cookie 方案必须有 CSRF 防护。",
        ],
      },
    ],
    followUps: ["iframe 里静默刷新令牌，是在躲过什么限制？"],
  },

  // ============ 手写题 ============
  {
    id: "fe-hand-all",
    category: "frontend",
    title: "手写 Promise.all",
    difficulty: "medium",
    tags: ["手写", "Promise"],
    prompt: "实现 Promise.all：保持结果顺序，遇到拒绝就拒绝，输入里可以有普通值。",
    parts: [
      {
        type: "list",
        items: [
          "返回一个新 Promise。用下标写入结果数组，不能用 push，否则完成顺序会打乱。",
          "每个元素先 Promise.resolve，这样普通值也能 then。剩下的计数到 0 时 resolve。",
          "拒绝只处理一次。Promise 的状态定了之后再 reject 没有效果，所以多个失败不用额外加锁也能对，但语义上要知道只会采用第一个原因。",
          "空数组立刻成功。不取消其它还在进行的任务。",
          "接着能写 allSettled：永远不 reject，每项记下成功或失败。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function promiseAll<T>(items: Iterable<T | PromiseLike<T>>): Promise<T[]> {\n  return new Promise((resolve, reject) => {\n    const list = [...items];\n    const result: T[] = [];\n    let left = list.length;\n    if (left === 0) {\n      resolve([]);\n      return;\n    }\n    list.forEach((item, index) => {\n      Promise.resolve(item).then((value) => {\n        result[index] = value;\n        left -= 1;\n        if (left === 0) resolve(result);\n      }, reject);\n    });\n  });\n}",
      },
    ],
    followUps: ["如果某一项永远不落定，你的实现会怎样？调用方能怎么办？"],
  },
  {
    id: "fe-hand-scheduler",
    category: "frontend",
    title: "手写并发调度器",
    difficulty: "hard",
    tags: ["手写", "异步"],
    prompt: "有一批返回 Promise 的任务，同一时间最多跑 2 个，写一个调度器。任务要按完成来补位，不是按入队分批。",
    parts: [
      {
        type: "list",
        items: [
          "维护正在运行的数量和等待队列。启动一个任务时数量加一，结束时减一，再从队列取下一个。",
          "调度器返回的每个 run() 本身是 Promise，调用方还能 Promise.all 它们，从而既限流又知道全部结果。",
          "失败的任务要放掉名额，否则一个拒绝就把并发池卡死。是否重试是策略，不要写死在池子里。",
          "和「切成每组 2 个再 await all」不同：那是批处理，快的要等慢的。池子是谁先完成谁补位，总时间更短。",
          "真实上传还要能暂停：队列里的不开始，已经发出去的用 AbortSignal 取消。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function createPool(limit: number) {\n  let active = 0;\n  const queue: Array<() => void> = [];\n  const pump = () => {\n    while (active < limit && queue.length) {\n      active += 1;\n      queue.shift()!();\n    }\n  };\n  function run<T>(task: () => Promise<T>): Promise<T> {\n    return new Promise((resolve, reject) => {\n      queue.push(() => {\n        Promise.resolve()\n          .then(task)\n          .then(resolve, reject)\n          .finally(() => {\n            active -= 1;\n            pump();\n          });\n      });\n      pump();\n    });\n  }\n  return { run };\n}",
      },
    ],
    followUps: ["任务有优先级时，队列从哪一头取？"],
  },
  {
    id: "fe-hand-tree",
    category: "frontend",
    title: "手写列表转树",
    difficulty: "medium",
    tags: ["手写", "数据结构"],
    prompt: "后端给的是带 id 和 parentId 的扁平数组，转成嵌套树。复杂度能不能做到线性？",
    parts: [
      {
        type: "list",
        items: [
          "先用 Map 把每个 id 对应到节点，并给一个 children 数组。这一遍不要找父节点。",
          "第二遍：parentId 能在 Map 里找到就推进父节点的 children，否则它是根。森林就收集成数组。",
          "时间 O(n)，空间 O(n)。不要对每个节点再 filter 一遍全表，那是 O(n^2)，数据到几万就明显卡。",
          "拷贝节点再挂children，避免改到接口原始对象。parentId 指向自己或成环时要有访问标记，否则递归渲染会爆栈。",
          "反向，树转列表用 DFS 或 BFS，带上 parentId 即可。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "type Item = { id: number; parentId: number | null };\ntype Node = Item & { children: Node[] };\n\nfunction listToTree(list: Item[]): Node[] {\n  const map = new Map<number, Node>();\n  for (const item of list) map.set(item.id, { ...item, children: [] });\n  const roots: Node[] = [];\n  for (const node of map.values()) {\n    const parent = node.parentId == null ? undefined : map.get(node.parentId);\n    if (parent && parent !== node) parent.children.push(node);\n    else roots.push(node);\n  }\n  return roots;\n}",
      },
    ],
    followUps: ["兄弟节点要按原数组的顺序，你的实现能保证吗？"],
  },
  {
    id: "fe-hand-compose",
    category: "frontend",
    title: "手写 compose 和管道",
    difficulty: "medium",
    tags: ["手写", "函数"],
    prompt: "实现 compose，让 compose(f, g, h)(x) 等于 f(g(h(x)))。中间件的洋葱模型和它是什么关系？",
    parts: [
      {
        type: "list",
        items: [
          "compose 从右往左：reduceRight，每一层返回一个新函数，调用时先进入更右边的函数。",
          "pipe 从左往右，更符合阅读顺序。两者差在折叠方向。空列表时应返回恒等函数，而不是 undefined。",
          "同步版本假设每个函数只有一个返回值。异步版本要在每层 await，或者约定每个函数返回 Promise。",
          "Koa 洋葱是增强版：每个中间件收到 next，自己决定要不要进入下一层，返回后再执行后半段。普通 compose 没有「后半段」。",
          "redux 的 applyMiddleware 就是 compose 加上把 store API 注入每一层。讲这个例子比背折叠函数有用。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "type Fn = (value: any) => any;\n\nfunction compose(...fns: Fn[]) {\n  if (fns.length === 0) return (value: unknown) => value;\n  return fns.reduceRight((next, fn) => (value: unknown) => fn(next(value)));\n}",
      },
    ],
    followUps: ["如果某一层返回了 Promise，同步 compose 会在哪一层把链弄断？"],
  },
  {
    id: "fe-hand-retry",
    category: "frontend",
    title: "手写超时和指数退避重试",
    difficulty: "medium",
    tags: ["手写", "异步"],
    prompt: "给一个请求函数加上超时和最多三次重试。哪些错误该重试，哪些不该？",
    parts: [
      {
        type: "list",
        items: [
          "超时：用 Promise.race 配一个 reject 的定时器，同时把 AbortSignal 传进 fetch。只 race 不 abort，请求仍占着连接。",
          "重试只针对短暂失败：网络错误、429、502、503、504。400 和 403 重试没有意义，还会放大故障。",
          "间隔用指数退避加少量随机，避免所有客户端在同一秒重试把服务再次打垮。次数必须有上限。",
          "接口不幂等时，超时后重试可能执行两次。创建订单这类操作要有服务端幂等键，不能只在前端多试几次。",
          "组件卸载后不要再 setState。把 signal 放进重试函数，取消时停止后续尝试。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "async function retry<T>(task: () => Promise<T>, times = 3): Promise<T> {\n  let error: unknown;\n  for (let i = 0; i < times; i++) {\n    try {\n      return await task();\n    } catch (err) {\n      error = err;\n      if (i === times - 1) break;\n      const wait = 200 * 2 ** i + Math.random() * 100;\n      await new Promise((resolve) => setTimeout(resolve, wait));\n    }\n  }\n  throw error;\n}",
      },
    ],
    followUps: ["race 超时之后，那个还在飞的请求后来成功了，会发生什么？"],
  },
  {
    id: "fe-hand-query",
    category: "frontend",
    title: "手写 URL 参数解析",
    difficulty: "easy",
    tags: ["手写", "字符串"],
    prompt: "把 search 字符串解析成对象。重复键、编码、空值和 hash，分别怎么处理？",
    parts: [
      {
        type: "list",
        items: [
          "优先用 URL 和 URLSearchParams，不要自己按 & 和 = split 后再忘了解码。加号在表单编码里表示空格，URLSearchParams 会处理。",
          "重复键要决定语义：后者覆盖，或收成数组。不要默默只留一个还让调用方以为只有一个。",
          "hash 不是 search。服务端拿不到 hash。前端路由如果把参数放在 hash 里，解析的是 location.hash，不是 search。",
          "缺值的键（?flag）通常得到空字符串。布尔开关别用字符串 \"false\"，那在判断里是真的。",
          "拼接参数用 URLSearchParams，它负责编码。手写模板字符串很容易把未编码的 & 拼进去，把参数截断。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function parseQuery(search: string): Record<string, string | string[]> {\n  const text = search.startsWith(\"?\") ? search.slice(1) : search;\n  const result: Record<string, string | string[]> = {};\n  for (const [key, value] of new URLSearchParams(text)) {\n    const prev = result[key];\n    if (prev === undefined) result[key] = value;\n    else if (Array.isArray(prev)) prev.push(value);\n    else result[key] = [prev, value];\n  }\n  return result;\n}",
      },
    ],
    followUps: ["中文参数出现乱码，先查编码还是先查被解码了几次？"],
  },
  {
    id: "fe-hand-version",
    category: "frontend",
    title: "手写版本号比较",
    difficulty: "easy",
    tags: ["手写", "字符串"],
    prompt: "比较 1.0.1 和 1.0.10，为什么字符串比较是错的？缺位和前导零怎么处理？",
    parts: [
      {
        type: "list",
        items: [
          "按点拆开，逐段按数字比。1.0.10 大于 1.0.1，因为第三段 10 > 1。直接 localeCompare 会得到相反结果。",
          "长度不同时，缺的段当 0。1.0 等于 1.0.0。比较前先确定产品要不要把 1.0 和 1 当成相等。",
          "返回 -1、0、1，不要返回布尔，否则调用方无法排序。",
          "前导零：\"01\" 当数字是 1。如果版本里有 1.0.0-alpha 这种预发布号，数字段比完还要单独定规则，不要塞进同一个 parseInt 就结束。",
          "排序一列版本号时，比较器必须满足传递性。特殊情况处理不一致时，排序结果会不稳定。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function compareVersion(a: string, b: string): number {\n  const as = a.split(\".\");\n  const bs = b.split(\".\");\n  const n = Math.max(as.length, bs.length);\n  for (let i = 0; i < n; i++) {\n    const x = Number(as[i] ?? 0);\n    const y = Number(bs[i] ?? 0);\n    if (x !== y) return x > y ? 1 : -1;\n  }\n  return 0;\n}",
      },
    ],
    followUps: ["段里出现非数字，你的函数会返回 NaN 比较结果吗？"],
  },
  {
    id: "fe-hand-lazy",
    category: "frontend",
    title: "手写图片懒加载",
    difficulty: "medium",
    tags: ["手写", "性能"],
    prompt: "用 IntersectionObserver 实现图片懒加载。首屏大图为什么不应该走这套逻辑？",
    parts: [
      {
        type: "list",
        items: [
          "图片先不写 src，放到 data-src。真正的 src 一旦写上，浏览器就会开始请求，后面再拦也晚了。",
          "观察器回调里只处理 isIntersecting 的项，赋 src 后 unobserve。rootMargin 设成 200px 一类的值，让图片在进入视口前提前开始，避免滚到了才出现空白。",
          "原生 loading=\"lazy\" 能覆盖简单场景，兼容性和细控（提前量、占位、失败重试）不如自己写。首屏 LCP 图片两种都不要用。",
          "别在 scroll 事件里对每张图 getBoundingClientRect，那会强制布局。这正是观察器要替换的写法。",
          "组件卸载时 disconnect。失败时给一个 onerror 占位，不要无限重试同一地址。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function lazyLoad(root: ParentNode = document) {\n  const io = new IntersectionObserver(\n    (entries) => {\n      for (const entry of entries) {\n        if (!entry.isIntersecting) continue;\n        const img = entry.target as HTMLImageElement;\n        if (img.dataset.src) img.src = img.dataset.src;\n        io.unobserve(img);\n      }\n    },\n    { rootMargin: \"200px\" },\n  );\n  root.querySelectorAll<HTMLImageElement>(\"img[data-src]\").forEach((img) => io.observe(img));\n  return () => io.disconnect();\n}",
      },
    ],
    followUps: ["容器自己滚动、不是窗口滚动时，观察器的 root 该设成谁？"],
  },
];
