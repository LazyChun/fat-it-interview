import type { Question } from "./types";

/**
 * 2026-10 补充的热门前端面试题批次。
 * 按 2025-2026 高频考点整理：React 19、Vue 3 生态、CSS 新特性、
 * 浏览器运行时、安全、工程化与高频手写题。
 */
export const frontendExtraQuestions: Question[] = [
  // ============ HTML 与可访问性 ============
  {
    id: "fe-html-inline",
    category: "frontend",
    title: "块级元素、行内元素、行内块的区别",
    difficulty: "easy",
    tags: ["HTML", "CSS"],
    prompt: "块级元素、行内元素、行内块元素在布局上有什么区别？img 为什么表现得像行内块？",
    parts: [
      {
        type: "list",
        items: [
          "块级（div、p、h1）：独占一行，默认从上到下排列，可设宽高，上下 margin/padding 都生效。",
          "行内（span、a、strong）：不换行，宽高和上下 margin/padding 不生效，尺寸由内容决定，a 里不能套块级元素。",
          "行内块（img、button、input、display:inline-block）：不换行，但可以设宽高和上下 margin，垂直方向用 vertical-align 对齐。",
          "img 是替换元素，尺寸由图片资源决定，默认表现就像行内块。",
          "flex/grid 容器里的子项 display 计算值会变化，但块级/行内的分类仍是理解 CSS 布局的地基。",
        ],
      },
    ],
    followUps: ["display: inline-flex 和 inline-block 的差别是什么？"],
  },
  {
    id: "fe-html-a11y",
    category: "frontend",
    title: "可访问性（A11y）怎么做",
    difficulty: "medium",
    tags: ["HTML", "可访问性"],
    prompt: "键盘只能 Tab 走页面、读屏软件读不出内容，分别是什么问题？列出最常见的可访问性改进。",
    parts: [
      {
        type: "list",
        items: [
          "交互元素必须用原生可聚焦控件：button/a/input，不要用 div 加 onClick 冒充，补不了键盘和读屏行为。",
          "表单控件配 label（for + id 或包裹），错误提示用 aria-describedby 关联，placeholder 不能当标签。",
          "焦点管理：弹窗打开把焦点移入、关闭移回触发元素；弹窗内做焦点陷阱，防止 Tab 跳到背景页面。",
          "对比度：正文文本至少 4.5:1、大字号 3:1（WCAG AA）；颜色不能是唯一的信息通道。",
          "动态内容用 aria-live 区域通知读屏；图片写 alt，装饰图用空 alt。",
          "能原生实现就别用 ARIA：div + role=button 永远不如一个真 button。",
          "工具：axe-core 接入 CI、Lighthouse 无障碍审计、键盘走查清单。",
        ],
      },
    ],
    followUps: ["aria-hidden 和 role=\"presentation\" 分别在什么时候用？"],
  },

  // ============ CSS ============
  {
    id: "fe-css-box",
    category: "frontend",
    title: "盒模型与 box-sizing",
    difficulty: "easy",
    tags: ["CSS", "布局"],
    prompt: "标准盒模型和怪异盒模型有什么区别？为什么全局要设 box-sizing: border-box？",
    parts: [
      {
        type: "list",
        items: [
          "content-box（默认）：width 只含内容区，padding 和 border 向外加，总宽 = width + padding + border。",
          "border-box：width 含 padding 和 border，内容区自动收缩，总宽就是 width，做栅格和百分比布局最好算。",
          "工程标配：* { box-sizing: border-box }；设置 width: 100% 不会因为 padding 撑破父容器。",
          "margin 不参与盒模型尺寸计算，永远在盒子外，且相邻兄弟的 margin 可能折叠。",
          "内边距参与背景绘制，margin 不参与；border-box 下内容区不足时会溢出内容，配合 overflow 处理。",
        ],
      },
    ],
    followUps: ["border-box 下同时设置 width 和 min-width 时以谁为准？"],
  },
  {
    id: "fe-css-position",
    category: "frontend",
    title: "position 定位与包含块",
    difficulty: "medium",
    tags: ["CSS", "定位"],
    prompt: "static、relative、absolute、fixed、sticky 的定位基准分别是什么？absolute 的包含块怎么确定？",
    parts: [
      {
        type: "list",
        items: [
          "static：默认，不参与定位，top/left 无效。",
          "relative：相对自己原来的位置偏移，仍然占位，不影响兄弟布局。",
          "absolute：脱离文档流，相对最近的「定位祖先」（position 非 static）定位；没有就相对初始包含块。",
          "transform、perspective、filter、contain 等属性也会让元素变成后代 absolute/fixed 的包含块。",
          "fixed：相对视口定位，不随滚动；但祖先有 transform 等属性时会退化成相对该祖先定位。",
          "sticky：先按普通流走，滚动到阈值后钉住，父容器结束就释放；父容器必须有足够高度。",
        ],
      },
    ],
    followUps: ["为什么 transform 会改变 fixed 的定位基准？"],
  },
  {
    id: "fe-css-var",
    category: "frontend",
    title: "CSS 变量与主题化",
    difficulty: "medium",
    tags: ["CSS", "变量"],
    prompt: "CSS 自定义属性和 Sass 变量有什么区别？怎么实现一套暗色主题？",
    parts: [
      {
        type: "list",
        items: [
          "CSS 变量在运行时求值、可继承、可被 JS 和媒体查询改变；Sass 变量编译期就被替换成字面量，运行时不认识。",
          "语义令牌放 :root：--bg、--text、--brand；组件内定义则局部生效，读取用 var(--x, fallback)。",
          "主题切换：html[data-theme=\"dark\"] 下覆盖令牌，或用 prefers-color-scheme 媒体查询跟随系统。",
          "JS 动态改主题：el.style.setProperty(\"--brand\", value)，无需重新加载样式。",
          "注意：变量参与层叠和继承，内联样式优先级最高；动画中改变量是瞬间跳变，要做颜色过渡需用 @property 注册属性。",
        ],
      },
      {
        type: "code",
        lang: "css",
        code: ":root {\n  --bg: #fff;\n  --text: #1a1a1a;\n}\n[data-theme=\"dark\"] {\n  --bg: #121212;\n  --text: #eee;\n}\nbody {\n  background: var(--bg);\n  color: var(--text);\n}",
      },
    ],
    followUps: ["@property 注册自定义属性解决了什么问题？"],
  },
  {
    id: "fe-css-animation",
    category: "frontend",
    title: "CSS 动画与 JS 动画",
    difficulty: "medium",
    tags: ["CSS", "动画"],
    prompt: "CSS 动画和 JS 动画怎么选？为什么 transform/opacity 动画流畅而 left/top 卡？",
    parts: [
      {
        type: "list",
        items: [
          "CSS 动画适合 UI 状态切换、hover、循环动效：声明式、可暂停、可被浏览器优化。",
          "JS 动画适合需要交互插值、物理模拟、复杂编排的场景（或用 Web Animations API 兼顾两者）。",
          "流畅关键：只动画 transform 和 opacity。left/top 每帧触发布局 + 绘制，主线程容易掉帧；transform/opacity 走合成器线程，由 GPU 合成。",
          "will-change 提前提示浏览器分配合成层，但不要滥用：每个元素一层会爆内存。",
          "60fps 意味着每帧要在 16.7ms 内完成样式计算、布局、绘制和合成。",
        ],
      },
    ],
    followUps: ["怎么用 DevTools 确认动画在合成器线程而不是主线程？"],
  },
  {
    id: "fe-css-container",
    category: "frontend",
    title: "容器查询与 :has()",
    difficulty: "medium",
    tags: ["CSS", "响应式"],
    prompt: "媒体查询按视口响应，容器查询按什么响应？:has() 能替代哪些 JS 逻辑？",
    parts: [
      {
        type: "list",
        items: [
          "媒体查询基于视口宽度，同一个组件在不同容器里表现无法按父容器自适应。",
          "容器查询：父元素声明 container-type: inline-size，子元素用 @container (min-width: 400px) 按容器宽度切样式，适合卡片、表格等可复用组件。",
          "容器查询单位 cqw/cqh（容器宽/高的 1%），相当于 vw/vh 之于视口。",
          ":has() 选择器按子元素状态给父元素加样式：.card:has(img)、表单 :has(input:checked)，替代大量 JS class 切换。",
          "两者都是 2023+ 基线特性，现代浏览器直接可用，正在取代「媒体查询 + JS 状态类」的老套路。",
        ],
      },
      {
        type: "code",
        lang: "css",
        code: ".card-list {\n  container-type: inline-size;\n}\n@container (min-width: 480px) {\n  .card {\n    display: grid;\n    grid-template-columns: 120px 1fr;\n  }\n}",
      },
    ],
    followUps: ["container-type 设了 inline-size 后，容器的高度计算和普通块级元素有什么不同？"],
  },
  {
    id: "fe-css-pseudo",
    category: "frontend",
    title: "伪类与伪元素",
    difficulty: "easy",
    tags: ["CSS", "选择器"],
    prompt: ":hover/:focus/:nth-child 这类伪类和 ::before/::after 伪元素有什么区别？伪元素能做什么？",
    parts: [
      {
        type: "list",
        items: [
          "伪类是单冒号，描述元素的状态：:hover、:focus、:checked、:nth-child(2n)、:not()、:focus-within。",
          "伪元素是双冒号，创造内容节点：::before、::after、::placeholder、::selection，真实参与布局和绘制。",
          "::before/::after 必须有 content 才渲染，默认是行内元素；常用于图标、装饰线、气泡角、清除浮动。",
          ":nth-child(2n+1) 做斑马纹；:focus-visible 只在键盘焦点时高亮，鼠标点击不打扰。",
          "伪元素不能被 JS 直接选中，只能通过 computedStyle 读 content；用 CSS 动画可以在伪元素上做纯装饰动效。",
        ],
      },
    ],
    followUps: [":nth-child 和 :nth-of-type 的区别是什么？"],
  },

  // ============ JavaScript ============
  {
    id: "fe-js-float",
    category: "frontend",
    title: "0.1 + 0.2 的精度问题",
    difficulty: "easy",
    tags: ["JavaScript", "精度"],
    prompt: "0.1 + 0.2 为什么不等于 0.3？金额计算怎么避免精度丢失？",
    parts: [
      {
        type: "list",
        items: [
          "JS 的 Number 是 IEEE 754 双精度浮点数：0.1 转二进制是无限循环小数，按 52 位尾数截断后已经是个近似值。",
          "0.1 + 0.2 = 0.30000000000000004，是两次截断误差累积的结果。",
          "判断浮点相等用差值：Math.abs(a - b) < Number.EPSILON。",
          "金额用整数分单位计算（先乘 100），或用 decimal.js/big.js；展示用 toFixed(2)。",
          "超过 2^53 的整数会丢精度，用 BigInt；接口传输大数建议用字符串。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "console.log(0.1 + 0.2); // 0.30000000000000004\nconsole.log(0.1 + 0.2 === 0.3); // false\n// 整数分单位\nconst total = Math.round(19.9 * 100) + Math.round(0.1 * 100);\nconsole.log(total / 100); // 20",
      },
    ],
    followUps: ["Number.EPSILON 具体是多少？它能用来判断任意两个浮点数相等吗？"],
  },
  {
    id: "fe-js-coercion",
    category: "frontend",
    title: "== 与隐式类型转换",
    difficulty: "medium",
    tags: ["JavaScript", "类型"],
    prompt: "== 和 === 的区别是什么？+ 运算和比较运算的隐式转换规则有什么不同？",
    parts: [
      {
        type: "list",
        items: [
          "=== 先比较类型，类型不同直接 false；== 会做隐式转换再比较。",
          "== 的规则：null == undefined 为 true；字符串和数字比时字符串转数字；对象转原始值（先 valueOf 后 toString）；布尔先转数字再比。",
          "经典坑：[] == false 为 true（[] → \"\" → 0，false → 0）；null == 0 为 false（null 只等于 undefined）。",
          "+ 二元运算：有一方是字符串就拼接，否则转数字；[] + [] 是 \"\"，[] + {} 是 \"[object Object]\"。",
          "工程规范：默认用 ===；只有明确想判断 null/undefined 时用 value == null。",
        ],
      },
    ],
    followUps: ["[1] == 1 为什么是 true？[1] == \"1\" 呢？"],
  },
  {
    id: "fe-js-tdz",
    category: "frontend",
    title: "var/let/const 与暂时性死区",
    difficulty: "easy",
    tags: ["JavaScript", "作用域"],
    prompt: "var 和 let/const 在提升、重复声明上有什么差别？暂时性死区是什么？",
    parts: [
      {
        type: "list",
        items: [
          "var 提升到函数作用域顶部并初始化为 undefined，可重复声明，循环里共享同一个绑定。",
          "let/const 是块级作用域：声明会提升，但进入「暂时性死区」，声明前访问抛 ReferenceError。",
          "const 绑定引用本身，对象内部可改但不能重新赋值，声明时必须初始化。",
          "顶层 var 会挂到 window 上，let/const 不会，形成独立的全局词法环境。",
          "经典题：for (var i) 里 setTimeout 都打印同一个 i，换成 let 每次迭代有独立绑定。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "console.log(a); // undefined（var 提升，值为 undefined）\nconsole.log(b); // ReferenceError：Cannot access 'b' before initialization\nvar a = 1;\nlet b = 2;",
      },
    ],
    followUps: ["typeof 一个未声明变量和 TDZ 中的变量分别报什么？"],
  },
  {
    id: "fe-js-array",
    category: "frontend",
    title: "数组方法 map/filter/reduce 怎么选",
    difficulty: "easy",
    tags: ["JavaScript", "数组"],
    prompt: "map、filter、reduce、some、every、forEach 各自返回什么？什么场景用哪个？",
    parts: [
      {
        type: "list",
        items: [
          "forEach：遍历执行副作用，无返回值，不能中断；要提前退出用 for...of + break 或 some。",
          "map：返回等长新数组，适合变换，不修改原数组。",
          "filter：返回满足条件的子集；some 判断是否存在（可短路），every 判断是否全部满足。",
          "reduce：把数组折叠成任意值，能替代「map 后再 filter」的两遍遍历。",
          "注意：稀疏数组会跳过空位；reduce 空数组不传初始值会报错；回调里改原数组行为不可预测。",
          "链式调用保持可读性：reduce 里做太多事不如拆成两个步骤。",
        ],
      },
    ],
    followUps: ["怎么用 reduce 实现数组去重和拍平一层？"],
  },
  {
    id: "fe-js-mapset",
    category: "frontend",
    title: "Map/Set/WeakMap 选型",
    difficulty: "medium",
    tags: ["JavaScript", "集合"],
    prompt: "什么时候用对象、什么时候用 Map？WeakMap 和 Map 的关键差别是什么？",
    parts: [
      {
        type: "list",
        items: [
          "普通对象做字典的坑：键只能是字符串/Symbol、继承原型属性（{} 上有 toString）、遍历顺序不保证。",
          "Map：键可以是任意类型（含对象）、插入有序、size 直接可得、频繁增删性能更稳。",
          "需要「对象作为键」的映射（缓存、去重、关联数据）必须用 Map。",
          "WeakMap/WeakSet 的键是弱引用：不可枚举、无 size，键被回收时条目自动消失，专门存「依附于对象的数据」（DOM 元数据、对象私有字段）。",
          "Set 用于去重和集合判断：new Set(arr) 去重、has 判断、并集/交集运算。",
        ],
      },
    ],
    followUps: ["为什么 Vue/React 内部大量用 WeakMap？缓存场景选 Map 还是 WeakMap？"],
  },
  {
    id: "fe-js-iterator",
    category: "frontend",
    title: "迭代器与生成器",
    difficulty: "medium",
    tags: ["JavaScript", "迭代器"],
    prompt: "什么是可迭代协议？for...of 能遍历普通对象吗？生成器有什么实际用途？",
    parts: [
      {
        type: "list",
        items: [
          "可迭代协议：对象有 Symbol.iterator 方法并返回带 next() 的迭代器；for...of、展开运算符、解构都依赖它。",
          "数组、字符串、Map、Set、arguments 原生可迭代；普通对象不行，要先用 Object.keys/entries 转数组或 for...in。",
          "生成器 function* 是迭代器的语法糖：yield 暂停、next 恢复，可以写惰性序列、无限序列、状态机。",
          "实际用途：自定义遍历顺序、异步分页拉取（async generator）、递归结构拍平。",
          "迭代器协议让任何数据结构都能统一 for...of，是数据访问的抽象层。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "const range = {\n  from: 1,\n  to: 3,\n  *[Symbol.iterator]() {\n    for (let i = this.from; i <= this.to; i++) yield i;\n  },\n};\nconsole.log([...range]); // [1, 2, 3]",
      },
    ],
    followUps: ["for...in 和 for...of 分别遍历什么？"],
  },
  {
    id: "fe-js-proxy",
    category: "frontend",
    title: "Proxy 与 Reflect",
    difficulty: "medium",
    tags: ["JavaScript", "元编程"],
    prompt: "Proxy 能拦截哪些操作？Reflect 和它是什么关系？和 Object.defineProperty 相比强在哪？",
    parts: [
      {
        type: "list",
        items: [
          "Proxy 代理整个对象：get/set/has/deleteProperty/ownKeys/apply/construct 等 13 种陷阱，新增属性、删除、数组下标天然可拦截。",
          "Reflect 提供与陷阱一一对应的静态方法；陷阱里调用 Reflect 同名方法能保证默认行为正确（含 receiver 绑定）。",
          "对比 defineProperty：后者只能逐属性劫持，新增属性、数组 length 变化都监听不到；Proxy 是整个对象的门面。",
          "缺点：性能开销大于直接访问、无法 polyfill 旧浏览器；代理后对象 === 判断不再等价于原对象。",
          "应用：Vue 3 响应式、表单校验代理、访问日志、依赖注入。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "const target = { name: \"a\" };\nconst proxy = new Proxy(target, {\n  get(obj, key, receiver) {\n    console.log(\"get\", key);\n    return Reflect.get(obj, key, receiver);\n  },\n  set(obj, key, value, receiver) {\n    console.log(\"set\", key, value);\n    return Reflect.set(obj, key, value, receiver);\n  },\n});",
      },
    ],
    followUps: ["为什么 Vue 3 用 Proxy 后新增属性也能响应？set 陷阱里为什么要返回 Reflect.set 的结果？"],
  },
  {
    id: "fe-js-abort",
    category: "frontend",
    title: "AbortController 取消请求",
    difficulty: "medium",
    tags: ["JavaScript", "异步"],
    prompt: "用户连续点了两个搜索，怎么取消第一个请求？AbortController 怎么用？",
    parts: [
      {
        type: "list",
        items: [
          "AbortController 提供 signal 和 abort()：把 signal 传给 fetch，调用 abort() 就取消请求并触发 AbortError。",
          "场景：搜索竞态（旧请求覆盖新结果）、离开页面/切换 Tab 取消在途请求、上传下载取消。",
          "React 里在 useEffect cleanup 中 abort，避免组件卸载后 setState 的告警和内存残留。",
          "Promise.race 是「谁先到用谁」，并不能真正停止另一个请求；要停只能用 AbortController。",
          "abort 会抛 AbortError，catch 里要区分取消和真实失败：取消的不上报错误监控。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "async function search(keyword, signal) {\n  const res = await fetch(`/api/search?q=${keyword}`, { signal });\n  return res.json();\n}\nconst controller = new AbortController();\nsearch(\"react\", controller.signal).catch((err) => {\n  if (err.name !== \"AbortError\") reportError(err);\n});\ncontroller.abort(); // 取消在途请求",
      },
    ],
    followUps: ["怎么用 AbortController 给 fetch 加超时？超时和取消能同时生效吗？"],
  },

  // ============ React ============
  {
    id: "fe-react-actions",
    category: "frontend",
    title: "React 19 的 Actions 与表单 Hooks",
    difficulty: "hard",
    tags: ["React", "React19"],
    prompt: "React 19 的 Actions、useActionState、useOptimistic、useFormStatus 分别解决什么问题？",
    parts: [
      {
        type: "list",
        items: [
          "Actions 是放进 transition 的异步函数：React 自动管理 pending、错误和乐观更新；表单的 action 属性直接传函数即可，不用手动 preventDefault。",
          "useActionState(fn, initialState) 返回 [state, formAction, isPending]：fn 接收 (previousState, formData)，错误写进 state，提交状态自动管理。",
          "useOptimistic：请求还没返回时先展示预期结果，成功后用真实数据校正，失败自动回滚旧值。",
          "useFormStatus 在子组件里读父表单的 pending，用于「提交中禁用按钮」。",
          "它们给「表单和变更操作」提供声明式糖，不是万能：复杂跨页状态仍要状态管理或服务端缓存。",
          "面试要点：Action 运行在 transition 里，可中断、不阻塞输入。",
        ],
      },
      {
        type: "code",
        lang: "tsx",
        code: "const [state, formAction, isPending] = useActionState(\n  async (prev, formData) => {\n    const name = formData.get(\"name\");\n    const err = await updateName(name);\n    return err ? { error: err } : { error: null };\n  },\n  { error: null }\n);\n\n<form action={formAction}>\n  <input name=\"name\" />\n  <button disabled={isPending}>保存</button>\n  {state.error && <p>{state.error}</p>}\n</form>",
      },
    ],
    followUps: ["Actions 和普通 async 事件处理函数的区别是什么？为什么要放进 transition？"],
  },
  {
    id: "fe-react-transition",
    category: "frontend",
    title: "useTransition 与 useDeferredValue",
    difficulty: "hard",
    tags: ["React", "并发"],
    prompt: "输入框每次按键都让一个大列表重算，怎么不卡？useTransition 和 useDeferredValue 的区别？",
    parts: [
      {
        type: "list",
        items: [
          "根本问题：紧急更新（输入）和非紧急更新（过滤大列表）挤在同一渲染里，主线程被长任务占满，输入没反应。",
          "useTransition 返回 [isPending, startTransition]：把非紧急更新包进 startTransition，React 可以中断它、让出给紧急输入。",
          "useDeferredValue 返回一个「延迟追赶」的值：适合值来自外部 props/state、只想降低派生计算优先级的场景，不用手动包 setState。",
          "区别：useTransition 包的是状态更新动作；useDeferredValue 包的是值。两者都依赖并发渲染的可中断机制。",
          "注意：被延后的渲染可能被丢弃重跑，别在里面放副作用；配合 useMemo 才有意义，否则 defer 了也是白算。",
        ],
      },
      {
        type: "code",
        lang: "tsx",
        code: "const [query, setQuery] = useState(\"\");\nconst deferredQuery = useDeferredValue(query);\nconst filtered = useMemo(\n  () => bigList.filter((item) => item.includes(deferredQuery)),\n  [bigList, deferredQuery]\n);",
      },
    ],
    followUps: ["startTransition 里能放有副作用的代码吗？为什么？"],
  },
  {
    id: "fe-react-controlled",
    category: "frontend",
    title: "受控组件与非受控组件",
    difficulty: "easy",
    tags: ["React", "表单"],
    prompt: "受控组件和非受控组件有什么区别？分别适合什么场景？",
    parts: [
      {
        type: "list",
        items: [
          "受控：value 由 state 驱动，onChange 更新 state，React 是唯一数据源，可预测、可校验、可联动。",
          "非受控：用 ref 读 DOM 的 value，不触发渲染，适合一次性取值（文件上传、不需要回显的输入）。",
          "defaultValue 是「初始值」不是「当前值」，只在首次渲染生效。",
          "受控的坑：忘记写 onChange，输入框看起来打不了字（value 永远回弹）。",
          "复杂表单用 React Hook Form（非受控 + 校验）或受控 + 表单库，按需选型。",
        ],
      },
    ],
    followUps: ["受控组件里中文输入法的 composition 事件会带来什么问题？"],
  },
  {
    id: "fe-react-effect",
    category: "frontend",
    title: "useEffect 与 useLayoutEffect",
    difficulty: "medium",
    tags: ["React", "Hooks"],
    prompt: "useEffect 和 useLayoutEffect 的执行时机差在哪？为什么在 effect 里 setState 会出问题？",
    parts: [
      {
        type: "list",
        items: [
          "useEffect 在浏览器绘制后异步执行，不阻塞渲染；适合请求、订阅、日志。",
          "useLayoutEffect 在 DOM 变更后、浏览器绘制前同步执行，适合先量 DOM 再改样式（避免闪烁）。",
          "StrictMode 开发模式会 mount → unmount → 再 mount，effect 的 setup/cleanup 各跑两次，用来暴露没清理的副作用。",
          "依赖数组决定重跑时机：[] 只在挂载后跑一次；依赖变化时先 cleanup 再 setup。",
          "在 effect 里 setState 会触发额外渲染，依赖没写对就死循环；能派生的数据别放 state，能在事件里算的别放 effect。",
        ],
      },
    ],
    followUps: ["为什么说「数据获取只用 useEffect」是反模式？有什么更好的替代？"],
  },
  {
    id: "fe-react-ref",
    category: "frontend",
    title: "useRef 与渲染",
    difficulty: "easy",
    tags: ["React", "Hooks"],
    prompt: "useRef 的返回值为什么能跨渲染保持不变？修改 ref.current 为什么不触发渲染？",
    parts: [
      {
        type: "list",
        items: [
          "useRef 初始创建一次，之后每次渲染返回同一个对象（同一个引用），所以是跨渲染的「可变盒子」。",
          "修改 .current 不触发渲染：它不走 state 的更新通道，React 不知道也不关心；UI 不会自动更新。",
          "用途：定时器 id、DOM 引用、记录上一次的值、不参与渲染的实例字段。",
          "和 useState 对比：state 变了要渲染，ref 变了不渲染；「值要变但不想重渲染」用 ref。",
          "坑：不要在 render 过程中读写 ref.current 来驱动 UI 逻辑，读到的可能是旧值。",
        ],
      },
    ],
    followUps: ["怎么用 ref 实现「上一次渲染的 props」？"],
  },
  {
    id: "fe-react-context",
    category: "frontend",
    title: "Context 与状态管理选型",
    difficulty: "medium",
    tags: ["React", "状态管理"],
    prompt: "Context 适合放什么？为什么 value 不稳定会导致性能问题？和 Redux/Zustand 怎么分工？",
    parts: [
      {
        type: "list",
        items: [
          "Context 解决跨层传递：主题、语言、登录用户等「低频变化的全局配置」最合适。",
          "性能问题：Provider 的 value 每次渲染都是新引用，所有消费组件都会重渲染；value 用 useMemo、按用途拆多个 Context。",
          "Context 不是状态管理工具：它只解决「怎么传」，不解决「怎么改」。",
          "Redux：全局复杂状态、需要中间件/时间旅行，样板多；Zustand：轻量、selector 粒度细、很少多余渲染。",
          "选型经验：局部状态用 useState/useReducer；跨层低频用 Context；跨组件高频共享用 Zustand；服务端数据缓存交给请求库。",
        ],
      },
    ],
    followUps: ["Redux 的 useSelector 为什么能精准订阅？和 Context 的渲染粒度差在哪？"],
  },
  {
    id: "fe-react-reducer",
    category: "frontend",
    title: "useState 与 useReducer",
    difficulty: "medium",
    tags: ["React", "Hooks"],
    prompt: "什么场景用 useReducer 而不是 useState？reducer 为什么必须是纯函数？",
    parts: [
      {
        type: "list",
        items: [
          "useState 适合独立、简单的状态；状态更新逻辑复杂（多字段、多动作、多步流转）时，useReducer 把逻辑收敛到一个函数里。",
          "useReducer(reducer, initialState)：dispatch(action) 触发，reducer(prevState, action) 返回新状态，动作可枚举、可测试、可复现。",
          "reducer 必须纯：不能发请求、改外部变量、用 Date.now/random，否则并发渲染下结果不可预测（React 可能重放 reducer）。",
          "组合：复杂对象内部联动用 reducer，外层简单开关用 useState。",
          "可以配 Immer：reducer 里直接写「看起来在改」的代码，减少样板。",
        ],
      },
    ],
    followUps: ["useReducer 和 Redux 的 reducer 概念有什么关系？"],
  },
  {
    id: "fe-react-compiler",
    category: "frontend",
    title: "React Compiler 自动记忆化",
    difficulty: "medium",
    tags: ["React", "React19"],
    prompt: "React Compiler 解决什么问题？用了它还需要手动 memo 吗？",
    parts: [
      {
        type: "list",
        items: [
          "核心问题：React 默认父组件渲染就递归渲染子组件，开发者手动用 memo/useMemo/useCallback 控制，容易漏、容易错。",
          "React Compiler 在编译期分析组件依赖，自动生成相当于 memo + useMemo 的记忆化逻辑，跳过不必要的重渲染。",
          "它是编译期插件，不需要运行时；对符合规则的代码透明生效。",
          "用了它原则上可以去掉手动 memo，但要求代码遵守规则：渲染期间不修改状态、不读可变值、Hooks 规则要遵守。",
          "现状：Meta 内部生产使用，2025 起逐步对外；迁移时用 eslint-plugin-react-compiler 渐进开启。",
        ],
      },
    ],
    followUps: ["React Compiler 和手写 useMemo 冲突时以谁为准？"],
  },
  {
    id: "fe-react-use",
    category: "frontend",
    title: "use() 与 Suspense 数据获取",
    difficulty: "hard",
    tags: ["React", "Suspense"],
    prompt: "use(promise) 是什么？为什么它能配合 Suspense 做声明式加载态？",
    parts: [
      {
        type: "list",
        items: [
          "use() 是 React 19 的 hook，可以读 Promise 或 Context：传 Promise 时，未完成就抛给最近的 Suspense 边界，由 Suspense 显示 fallback。",
          "对比 useEffect 取数：use 是声明式的，组件只描述「我要这个数据」，加载/错误由 Suspense/ErrorBoundary 统一处理，没有手动 loading 标志。",
          "注意：传的 Promise 每次渲染要稳定，否则会反复重放；结合请求库的 suspense 模式（SWR/TanStack Query）缓存去重。",
          "Suspense 还能包 React.lazy 路由懒加载、图片；多个边界实现局部加载。",
          "生产要点：把取数逻辑封装进请求库，别每次渲染 new Promise。",
        ],
      },
      {
        type: "code",
        lang: "tsx",
        code: "function User({ id }: { id: string }) {\n  const user = use(getUser(id)); // 未完成时抛给 Suspense\n  return <div>{user.name}</div>;\n}\n\n<Suspense fallback={<Spinner />}>\n  <User id=\"1\" />\n</Suspense>",
      },
    ],
    followUps: ["use(promise) 每次渲染都传新 Promise 会怎样？怎么缓存？"],
  },

  // ============ Vue ============
  {
    id: "fe-vue-router",
    category: "frontend",
    title: "Vue Router 模式与导航守卫",
    difficulty: "medium",
    tags: ["Vue", "路由"],
    prompt: "hash 和 history 模式的区别？导航守卫的执行顺序是什么？路由切换时组件会复用吗？",
    parts: [
      {
        type: "list",
        items: [
          "createWebHistory 用 History API，URL 干净，但刷新深链接要服务端回退到 index.html；createWebHashHistory 用 #，无需服务端配置。",
          "同一路由组件在参数变化时默认复用（不重新挂载），要响应参数变化用 watch route.params 或 beforeRouteUpdate。",
          "守卫顺序：全局 beforeEach → 路由独享 beforeEnter → 组件内 beforeRouteEnter → 解析完成 → afterEach；离开时有 beforeRouteLeave。",
          "权限路由：动态 addRoute 注册 + 全局守卫校验登录态和角色。",
          "懒加载：路由级 () => import() 拆包，减少首屏体积。",
        ],
      },
    ],
    followUps: ["用 query 传对象参数有什么问题？怎么避免？"],
  },
  {
    id: "fe-vue-pinia",
    category: "frontend",
    title: "Pinia 状态管理",
    difficulty: "medium",
    tags: ["Vue", "Pinia"],
    prompt: "Pinia 比 Vuex 好在哪？defineStore 的 state、getters、actions 怎么分工？",
    parts: [
      {
        type: "list",
        items: [
          "Vuex 的问题：mutation 必须同步、样板多、TS 支持弱；Pinia 去掉 mutation，state 可直接改（devtools 仍可追踪），写法更接近组合式。",
          "组合式写法：defineStore(\"id\", () => {...})，ref 当 state、computed 当 getter、普通函数当 action。",
          "state 用 ref/reactive，响应式直接继承 Vue 机制；getters 有缓存；actions 支持 async 和互相调用。",
          "不要在 store 外解构 state（会失去响应性），用 storeToRefs。",
          "该放 store 的：跨组件共享、需要持久化的（配插件）、服务端状态缓存；组件私有状态留在组件里。",
        ],
      },
    ],
    followUps: ["Pinia 的 store 在组件卸载后还存在吗？什么时候该 reset？"],
  },
  {
    id: "fe-vue-teleport",
    category: "frontend",
    title: "Teleport 与 Suspense",
    difficulty: "medium",
    tags: ["Vue", "内置组件"],
    prompt: "Teleport 解决什么问题？Suspense 在 Vue 里怎么用？",
    parts: [
      {
        type: "list",
        items: [
          "Teleport 把内容渲染到指定 DOM 位置（如 body 下），但逻辑上仍属于原组件：解决弹窗被父容器 overflow: hidden、z-index 层叠上下文困住的问题。",
          "用法：<Teleport to=\"body\">，to 支持选择器或元素；disabled 可切换是否传送。",
          "Suspense 包裹异步依赖（defineAsyncComponent 或 setup 里 await）：未就绪时显示 fallback，做加载态的声明式编排。",
          "注意：Vue 的 Suspense 目前偏实验性，官方建议谨慎在生产大面积使用。",
          "弹窗类组件常组合 Teleport + Transition + 全局状态控制。",
        ],
      },
    ],
    followUps: ["Teleport 的内容在 DevTools 里归属于哪个组件？"],
  },
  {
    id: "fe-vue-async",
    category: "frontend",
    title: "异步组件与 defineAsyncComponent",
    difficulty: "easy",
    tags: ["Vue", "组件"],
    prompt: "组件体积大、用得少，怎么按需加载？defineAsyncComponent 的 loading/error 选项是干什么的？",
    parts: [
      {
        type: "list",
        items: [
          "异步组件：defineAsyncComponent(() => import(\"./Big.vue\"))，浏览器运行到才加载对应 chunk，减少首屏 JS。",
          "选项：loadingComponent 加载中占位、errorComponent 失败兜底、delay 延迟显示 loading（避免瞬间加载闪一下）、timeout 超时。",
          "Vue Router 的组件字段也支持函数式 import，路由懒加载同理。",
          "Suspense 可以包异步组件统一显示 fallback。",
          "和 v-if 按需渲染的区别：v-if 只控制是否渲染，代码仍在主包里；异步组件是真正的代码分包。",
        ],
      },
    ],
    followUps: ["异步组件加载失败时怎么自动重试？"],
  },
  {
    id: "fe-vue-shallow",
    category: "frontend",
    title: "shallowRef、readonly 与 markRaw",
    difficulty: "medium",
    tags: ["Vue", "响应式"],
    prompt: "shallowRef、shallowReactive、readonly、markRaw 各解决什么问题？为什么性能敏感场景要用浅层响应式？",
    parts: [
      {
        type: "list",
        items: [
          "shallowRef 只代理 .value 本身，value 内部对象不深追踪：大对象、第三方实例（echarts/地图实例）不需要内部变化驱动 UI 时用，省掉深层代理开销。",
          "shallowReactive 同理，只代理第一层。",
          "readonly 返回只读代理，改数据抛警告：给「只允许外部注入、内部不可改」的配置用。",
          "markRaw 标记对象永不转代理：放进 reactive/ref 里保持原始引用，防止把不该代理的类实例代理掉引发 bug。",
          "组合用法：列表里塞大量 markRaw 的静态数据，避免深层代理拖慢渲染。",
        ],
      },
    ],
    followUps: ["把 reactive 对象放进 shallowRef 的 value 里，改内部属性会触发更新吗？"],
  },
  {
    id: "fe-vue-compile",
    category: "frontend",
    title: "Vue 模板编译原理",
    difficulty: "hard",
    tags: ["Vue", "编译"],
    prompt: "模板是怎么变成渲染函数的？编译阶段做了哪些优化让更新更快？",
    parts: [
      {
        type: "list",
        items: [
          "三步：parse（模板 → AST）、transform（打 patchFlag、静态标记等编译信息）、generate（AST → render 函数）。",
          "运行时 render 返回 VNode 树，diff 后 patch 到真实 DOM。",
          "静态提升：静态节点提取到渲染函数外只创建一次。",
          "patchFlag：标记节点动态的部分，diff 时只比较变化的属性/文本/子节点，不做全量对比。",
          "block tree：收集动态子节点，跳过静态内容，更新范围从整棵树缩小到动态分支。",
          "这些编译期信息是 Vue 3 比 Vue 2 更新更省的主要原因；裸写 h 函数没有这些优化。",
        ],
      },
    ],
    followUps: ["v-if 和 v-for 在编译期分别被处理成什么？"],
  },

  // ============ TypeScript ============
  {
    id: "fe-ts-infer",
    category: "frontend",
    title: "条件类型与 infer",
    difficulty: "hard",
    tags: ["TypeScript", "类型编程"],
    prompt: "条件类型是什么？infer 关键字怎么用？写一个 ReturnType。",
    parts: [
      {
        type: "list",
        items: [
          "条件类型 T extends U ? X : Y 在类型层面做判断；联合类型做参数时是分布式条件类型，逐个分支计算。",
          "infer 在 extends 子句里声明「待推断的类型变量」：从传入类型里提取形状。",
          "ReturnType<T> 即 T extends (...args: any) => infer R ? R : never。",
          "应用：提取数组元素类型、函数参数、Promise 的返回值（Awaited 的底层）、字符串模板匹配。",
          "递归条件类型可以做类型级运算：元组转对象、字符串替换。",
          "面试写 ReturnType、Parameters、Awaited 的简化版即可，别陷进类型体操。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "type MyReturnType<T extends (...args: any) => any> = T extends (\n  ...args: any\n) => infer R\n  ? R\n  : never;\n\ntype A = MyReturnType<() => number>; // number\ntype B = MyReturnType<(s: string) => Promise<void>>; // Promise<void>",
      },
    ],
    followUps: ["分布式条件类型为什么对裸类型参数生效？包一层 [T] 为什么就失效？"],
  },
  {
    id: "fe-ts-enum",
    category: "frontend",
    title: "enum 与字面量联合类型",
    difficulty: "medium",
    tags: ["TypeScript", "类型"],
    prompt: "用 enum 还是 const 对象加字面量联合？enum 有哪些坑？",
    parts: [
      {
        type: "list",
        items: [
          "数字枚举：值可以反查（Color[0]），成员没有约束，任何数字都能赋值，类型安全弱。",
          "字符串枚举更安全但不能反查；const enum 编译期内联，但和 isolatedModules 及部分工具链有兼容问题。",
          "推荐替代：const 对象 + as const + 字面量联合，类型和运行时值同一来源，天然支持 tree-shaking。",
          "写法：const Status = { Active: \"active\" } as const; type Status = typeof Status[keyof typeof Status]。",
          "面试结论：新代码优先字面量联合，enum 的历史包袱多。",
        ],
      },
    ],
    followUps: ["typeof obj[keyof typeof obj] 这句怎么拆开理解？"],
  },
  {
    id: "fe-ts-runtime",
    category: "frontend",
    title: "类型与运行时校验",
    difficulty: "medium",
    tags: ["TypeScript", "工程实践"],
    prompt: "TS 类型编译后就没了，接口返回的数据怎么在运行时校验？zod 这类库的价值是什么？",
    parts: [
      {
        type: "list",
        items: [
          "类型擦除意味着编译期类型保护不了运行时数据：接口字段缺失、结构变了，代码里全是「类型说有、运行时没有」的 bug。",
          "运行时校验库（zod、valibot）：先定义 schema，运行时校验并从 schema 推断 TS 类型（z.infer），一份定义两端用。",
          "校验时机：API 响应、localStorage 读取、URL 参数、表单提交。",
          "不用库的替代：手写类型守卫逐字段检查，容易漏且难维护。",
          "zod 还能：parse 失败给详细错误、transform 清洗数据、和 React Hook Form 集成。",
          "实践：后端 OpenAPI 生成类型，或前端 schema 校验兜底，至少保留一条运行时防线。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "import { z } from \"zod\";\n\nconst UserSchema = z.object({\n  id: z.number(),\n  name: z.string().min(1),\n  email: z.string().email(),\n});\ntype User = z.infer<typeof UserSchema>;\n\nconst user = UserSchema.parse(await res.json()); // 运行时校验 + 类型推断",
      },
    ],
    followUps: ["schema 校验失败时怎么优雅降级而不是整页崩？"],
  },

  // ============ 浏览器 ============
  {
    id: "fe-browser-process",
    category: "frontend",
    title: "浏览器进程与线程模型",
    difficulty: "medium",
    tags: ["浏览器", "架构"],
    prompt: "现代浏览器为什么是多进程的？一个标签页崩溃为什么不影响其他标签页？",
    parts: [
      {
        type: "list",
        items: [
          "进程分工：浏览器主进程（界面、网络、存储管理）、GPU 进程、渲染进程（每个站点一个）、网络/存储/音频等工具进程。",
          "多进程隔离：一个标签页的渲染进程崩溃不影响其他进程；站点隔离（Site Isolation）让不同源页面分进程，防内存越权和 Spectre 类侧信道。",
          "渲染进程内部多线程：主线程（JS、布局、绘制）、合成器线程、栅格线程、Worker 线程；JS 单线程但渲染靠多线程并行。",
          "进程间通信用 IPC；崩溃的渲染进程可以独立回收，浏览器还能提示「页面崩溃，重新加载」。",
          "代价：进程多内存开销大，所以浏览器有进程复用与内存回收策略。",
        ],
      },
    ],
    followUps: ["为什么打开很多标签页内存飙升？浏览器怎么缓解？"],
  },
  {
    id: "fe-browser-storage",
    category: "frontend",
    title: "Cookie/localStorage/IndexedDB 怎么选",
    difficulty: "easy",
    tags: ["浏览器", "存储"],
    prompt: "Cookie、localStorage、sessionStorage、IndexedDB 分别适合什么？容量和同步异步差别？",
    parts: [
      {
        type: "list",
        items: [
          "Cookie：每次请求自动带上，约 4KB，配合 HttpOnly/Secure/SameSite 控制，主要用于会话与登录态，别塞业务数据。",
          "localStorage：约 5MB，持久，同步 API，适合主题、偏好、非敏感缓存；大对象 JSON 序列化会卡主线程。",
          "sessionStorage：标签页级别，关标签即清，适合表单草稿、页内临时状态。",
          "IndexedDB：异步、事务型、按索引查询、GB 级，适合离线数据、文件缓存、大量结构化数据（配 idb 库更好用）。",
          "token 放哪：localStorage 在 XSS 下比 HttpOnly Cookie 危险；Cookie 要防 CSRF——结合 SameSite 权衡，别只用一种想当然。",
        ],
      },
    ],
    followUps: ["storage 事件什么时候触发？跨标签页怎么同步数据？"],
  },
  {
    id: "fe-browser-raf",
    category: "frontend",
    title: "requestAnimationFrame 与 requestIdleCallback",
    difficulty: "medium",
    tags: ["浏览器", "性能"],
    prompt: "rAF 和 setTimeout 做动画有什么区别？requestIdleCallback 什么时候用？",
    parts: [
      {
        type: "list",
        items: [
          "rAF 在浏览器下一次重绘前执行，与刷新率同步（60Hz 一帧一次），页面切后台自动暂停，省电省资源。",
          "setTimeout 不感知帧：可能一帧内执行多次或跨帧执行，动画容易抖动，还有最小 4ms 延迟和后台节流。",
          "高频事件（滚动、resize）用 rAF 合并：把多次触发的读写集中到一帧执行一次。",
          "requestIdleCallback 在主线程空闲时执行低优先级任务（埋点、预渲染、非关键计算），用 timeRemaining() 判断剩余时间。",
          "优先级：rAF（视觉）> setTimeout（常规）> rIC（空闲兜底）；React 并发调度内部实现了类似 rIC 的机制。",
        ],
      },
    ],
    followUps: ["React 的调度器为什么不用 rIC 而是自己实现？"],
  },
  {
    id: "fe-browser-rendering",
    category: "frontend",
    title: "CSR/SSR/SSG/ISR 渲染模式",
    difficulty: "medium",
    tags: ["浏览器", "渲染"],
    prompt: "CSR、SSR、SSG、ISR 各自的适用场景？为什么说 SSR 不是银弹？",
    parts: [
      {
        type: "list",
        items: [
          "CSR：SPA 客户端渲染，白屏期长、SEO 弱，适合后台/工具类应用。",
          "SSR：服务端渲染出 HTML 再水合，首屏快、SEO 好，但每次请求都要服务端跑渲染（成本高、TTFB 变慢），水合不一致容易出 bug。",
          "SSG：构建期生成静态 HTML，最便宜最快，适合内容型站点（博客、文档），配合 CDN 全球加速。",
          "ISR：SSG + 定时/按需再生成，内容更新不重建全站（Next.js）。",
          "选择：内容以读为主用 SSG；强交互且要 SEO 用 SSR/混合；纯工具用 CSR。",
          "2026 趋势：RSC + 流式渲染把「服务端取数 + 客户端交互」组合起来，边界不再是整页。",
        ],
      },
    ],
    followUps: ["水合（hydration）是什么？水合不一致会怎样？"],
  },
  {
    id: "fe-browser-blob",
    category: "frontend",
    title: "Blob/File/ArrayBuffer 与文件处理",
    difficulty: "medium",
    tags: ["浏览器", "二进制"],
    prompt: "前端做文件下载、图片预览、上传，Blob、File、ArrayBuffer 怎么分工？",
    parts: [
      {
        type: "list",
        items: [
          "Blob：不可变的二进制数据块，带 type；new Blob([str], { type }) 构造，URL.createObjectURL(blob) 做预览和下载。",
          "File 继承 Blob，多了 name 和 lastModified，来自 <input type=\"file\"> 或拖拽 dataTransfer.files。",
          "ArrayBuffer/TypedArray：字节视图，适合处理原始二进制（文件分片、音视频解码、canvas 像素）。",
          "读取：FileReader 读成 dataURL/ArrayBuffer/text；新 API blob.arrayBuffer() / blob.text() 更简洁。",
          "下载：a 标签 + createObjectURL，用完后 revokeObjectURL 释放内存。",
          "上传进度用 XHR 的 upload.onprogress；分片上传用 blob.slice。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "const blob = new Blob([\"hello\"], { type: \"text/plain\" });\nconst url = URL.createObjectURL(blob);\nconst a = document.createElement(\"a\");\na.href = url;\na.download = \"hello.txt\";\na.click();\nURL.revokeObjectURL(url);",
      },
    ],
    followUps: ["createObjectURL 用完后不 revoke 会怎样？"],
  },

  // ============ 性能优化 ============
  {
    id: "fe-perf-longtask",
    category: "frontend",
    title: "长任务与 INP 优化",
    difficulty: "medium",
    tags: ["性能", "交互"],
    prompt: "点击按钮半天没反应，怎么定位和优化主线程长任务？",
    parts: [
      {
        type: "list",
        items: [
          "长任务：主线程执行超过 50ms 的任务，期间输入、点击、动画都卡住；Performance 面板的 Long Tasks 和 INP 指标直接反映。",
          "定位：DevTools Performance 录制，找红色长任务条，判断是 JS 执行、强制同步布局还是渲染超时。",
          "常见元凶：大循环/深递归、超大列表全量渲染、同步解析大 JSON、强制同步布局、图片解码。",
          "优化：时间切片分批处理、重计算挪 Web Worker、低优先级任务用 rIC/startTransition、虚拟列表、防抖高频事件。",
          "交互优先：点击先给反馈（乐观更新、骨架屏），再出结果；startTransition 包非紧急更新。",
        ],
      },
    ],
    followUps: ["怎么量化优化前后的效果？INP 的现场数据在哪里看？"],
  },
  {
    id: "fe-perf-bundle",
    category: "frontend",
    title: "Bundle 体积分析",
    difficulty: "medium",
    tags: ["性能", "构建"],
    prompt: "首屏 JS 包 2MB，怎么定位是哪个库拖累的？怎么拆？",
    parts: [
      {
        type: "list",
        items: [
          "工具：webpack-bundle-analyzer / vite-bundle-visualizer 生成依赖体积图，按 chunk 找大头。",
          "大头常见：UI 库全量引入（改按需/用 ESM 版本）、moment/lodash 全家桶（换 dayjs、按需引入）、重复的 React 副本（peerDependencies 对齐）。",
          "策略：路由懒加载拆包、vendors 单独 chunk（长缓存）、动态 import 按需、CDN 外链公共库（权衡可靠性）、压缩 + gzip/brotli。",
          "设体积预算：webpack performance 配置或 CI 检查，超预算告警。",
          "先看 gzip 后的真实传输体积再下结论：2MB 源码不等于 2MB 传输。",
        ],
      },
    ],
    followUps: ["dynamic import 的魔法注释 /* webpackChunkName */ 有什么用？"],
  },

  // ============ 工程化 ============
  {
    id: "fe-eng-module",
    category: "frontend",
    title: "ESM 与 CommonJS",
    difficulty: "medium",
    tags: ["模块化", "工程化"],
    prompt: "ESM 和 CommonJS 在加载时机、导出语义、循环依赖上有什么区别？",
    parts: [
      {
        type: "list",
        items: [
          "加载时机：CJS 的 require 是运行时同步读取并执行整个模块；ESM 的 import 是编译期静态解析，动态加载用 import()。",
          "导出语义：CJS 导出 module.exports 对象的引用，重新赋值不影响已 require 方；ESM 是 live binding，导入方始终看到最新值。",
          "循环依赖：CJS 循环里可能拿到未初始化完的 module.exports（undefined）；ESM 的 binding + TDZ 会直接报错或等到求值完成，更容易暴露问题。",
          "互操作：ESM 默认不能直接 import CJS 的具名导出（靠工具猜），Node 22+ 支持 require ESM 部分场景。",
          "工程含义：库要发 ESM 版本才能被 tree-shaking；浏览器原生 ESM 是 Vite 开发模式的基础。",
        ],
      },
    ],
    followUps: ["为什么 Vite 生产环境还要打包，而不是直接用浏览器 ESM？"],
  },
  {
    id: "fe-eng-monorepo",
    category: "frontend",
    title: "Monorepo 与 pnpm workspace",
    difficulty: "medium",
    tags: ["工程化", "Monorepo"],
    prompt: "什么规模需要 Monorepo？pnpm workspace、Turborepo 各解决什么问题？",
    parts: [
      {
        type: "list",
        items: [
          "多包共享代码、统一发版、跨包重构、原子提交时 Monorepo 收益明显；单仓库单体应用不需要。",
          "痛点：依赖管理、构建缓存、作用域感知（只构建变更的包）。",
          "pnpm workspace：符号链接 node_modules、依赖去重硬链接、避免幽灵依赖；workspace:* 协议做版本联动。",
          "Turborepo/Nx：任务编排 + 内容哈希缓存（命中跳过重建）、并行执行、远程缓存。",
          "工具链组合：pnpm + Turborepo + changesets（版本与 changelog）+ CI 按 diff 跑任务。",
          "代价：仓库变大后 Git 变慢、权限粒度粗、工具链学习成本。",
        ],
      },
    ],
    followUps: ["workspace:* 的依赖协议怎么理解？发布时怎么转换？"],
  },
  {
    id: "fe-eng-component",
    category: "frontend",
    title: "组件分层与组件库设计",
    difficulty: "medium",
    tags: ["工程化", "组件"],
    prompt: "业务组件越写越耦合，怎么分层？组件库和业务组件怎么划边界？",
    parts: [
      {
        type: "list",
        items: [
          "分层：基础组件（Button/Input，无业务语义）→ 复合组件（表单、弹窗）→ 业务组件（用户卡片、订单列表）→ 页面。",
          "基础层只依赖设计令牌和自身，不 import 业务状态、不写死接口字段；业务层通过 props/插槽组合基础层。",
          "无样式组件（headless）：逻辑与样式分离，如 Radix、React Aria、VueUse，样式由消费方决定，适合设计系统。",
          "状态放哪：受控化（value + onChange）让父组件拥有状态；内部状态只放纯展示的局部逻辑。",
          "设计令牌走 CSS 变量：颜色、间距、字号，换肤不用改组件。",
          "治理：Storybook 文档 + 视觉回归测试 + 语义化版本，组件库才能长期演进。",
        ],
      },
    ],
    followUps: ["怎么给组件库做视觉回归测试？快照和像素对比各有什么问题？"],
  },

  // ============ Web 安全 ============
  {
    id: "fe-security-csp",
    category: "frontend",
    title: "CSP 内容安全策略",
    difficulty: "medium",
    tags: ["安全", "CSP"],
    prompt: "CSP 怎么配置？为什么说没配 CSP 的 XSS 防御是不完整的？",
    parts: [
      {
        type: "list",
        items: [
          "CSP 通过响应头 Content-Security-Policy 告诉浏览器「允许从哪里加载脚本/样式/图片/连接」。",
          "常用指令：default-src、script-src、style-src、img-src、connect-src、frame-ancestors；unsafe-inline/unsafe-eval 会大幅削弱防护。",
          "script-src 'self' + 白名单域名：内联脚本被禁，XSS 注入的 <script> 和 onclick 直接不执行。",
          "报告模式：Content-Security-Policy-Report-Only 只上报不拦截，先灰度再切 enforce。",
          "定位：CSP 是纵深防御的最后一层，不是唯一防线；配置过严会拦掉正常内联样式/脚本，要逐步收紧。",
        ],
      },
      {
        type: "code",
        lang: "http",
        code: "Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.example.com",
      },
    ],
    followUps: ["页面必须用内联脚本时，CSP 的 nonce 和 hash 机制是什么？"],
  },
  {
    id: "fe-security-clickjack",
    category: "frontend",
    title: "点击劫持与 iframe 安全",
    difficulty: "easy",
    tags: ["安全"],
    prompt: "点击劫持是什么？X-Frame-Options 和 frame-ancestors 有什么区别？",
    parts: [
      {
        type: "list",
        items: [
          "点击劫持：攻击者用透明 iframe 叠加在诱导页面上，用户点击「领取」实际点到了隐藏的「授权/转账」按钮。",
          "防御一：X-Frame-Options: DENY / SAMEORIGIN，老方案，不能按域名细粒度控制。",
          "防御二：CSP 的 frame-ancestors 'self' 或白名单，更灵活，是推荐替代。",
          "前端 JS frame-busting（检测 window.top !== self）只是辅助，可被 sandbox 绕过，别依赖。",
          "iframe 里用 sandbox 属性限制脚本/表单/弹窗能力；同源策略已阻止跨域 iframe 读父页面。",
        ],
      },
    ],
    followUps: ["自己的页面被别人 iframe 嵌入展示，怎么发现和处理？"],
  },
  {
    id: "fe-security-supply",
    category: "frontend",
    title: "供应链安全",
    difficulty: "medium",
    tags: ["安全", "工程化"],
    prompt: "npm 包被投毒会怎样？怎么防供应链攻击？",
    parts: [
      {
        type: "list",
        items: [
          "供应链攻击：攻击者入侵知名包或注册相似包名（typosquatting），安装后执行恶意脚本（偷环境变量、改源码、挖矿）。",
          "典型事件：event-stream、ua-parser-js 等；postinstall 脚本是重灾区。",
          "防护：lockfile 提交进仓库锁定版本、npm audit / pnpm audit 扫描已知漏洞、限制来源（私有 registry 镜像）、审查 postinstall 脚本。",
          "CI 里跑依赖扫描（OSV、Snyk）并阻断高危；生产构建尽量用已审计的锁定版本。",
          "心态：供应链安全不是「包没问题」，而是「变更可控、可审计、可回滚」。",
        ],
      },
    ],
    followUps: ["package-lock.json 提交进仓库和不提交各有什么后果？"],
  },

  // ============ 手写题 ============
  {
    id: "fe-hand-eventemitter",
    category: "frontend",
    title: "手写发布订阅 EventEmitter",
    difficulty: "medium",
    tags: ["手写", "设计模式"],
    prompt: "实现一个带 on/once/off/emit 的事件总线，注意 emit 过程中 off 的边界。",
    parts: [
      {
        type: "list",
        items: [
          "数据结构：Map<事件名, 回调数组>，按事件名存回调列表。",
          "on：注册；once：包装一层，触发后自动 off。",
          "emit：取出回调列表逐个调用、参数透传；单个回调抛错要用 try 隔离，不能中断其他回调。",
          "off：删除指定回调；要点：emit 内部迭代时用列表副本，避免「emit 过程中 off」导致漏调或下标错乱。",
          "应用：Vue 2 事件总线、跨组件解耦、SDK 内部事件通知。",
          "进阶：支持通配符、按 context 绑定、返回取消订阅函数。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "class EventEmitter {\n  private map = new Map<string, Set<Function>>();\n\n  on(event: string, cb: Function) {\n    if (!this.map.has(event)) this.map.set(event, new Set());\n    this.map.get(event)!.add(cb);\n    return () => this.off(event, cb);\n  }\n\n  once(event: string, cb: Function) {\n    const wrap = (...args: unknown[]) => {\n      this.off(event, wrap);\n      cb(...args);\n    };\n    this.on(event, wrap);\n  }\n\n  emit(event: string, ...args: unknown[]) {\n    const cbs = this.map.get(event);\n    if (!cbs) return;\n    for (const cb of [...cbs]) {\n      try {\n        cb(...args);\n      } catch (err) {\n        console.error(err);\n      }\n    }\n  }\n\n  off(event: string, cb: Function) {\n    this.map.get(event)?.delete(cb);\n  }\n}",
      },
    ],
    followUps: ["事件总线和直接调用函数相比，代价是什么？"],
  },
  {
    id: "fe-hand-lru",
    category: "frontend",
    title: "手写 LRU 缓存",
    difficulty: "medium",
    tags: ["手写", "数据结构"],
    prompt: "实现一个 LRU Cache，get/put 都是 O(1)，容量满了淘汰最久未使用的。",
    parts: [
      {
        type: "list",
        items: [
          "Map 版本：Map 天然维护插入顺序；get 时 delete 再 set 把它挪到末尾（最新），put 已存在先删再插，超容量删第一个。",
          "只用 Map 就能 O(1) 实现，不需要手写双向链表；能讲清原理即可。",
          "更标准的实现：双向链表 + HashMap，链表头最新、尾最旧，淘汰断尾。",
          "边界：容量为 0、get 不存在的键返回 -1、重复 put 同一键只更新值不增容量。",
          "应用：浏览器缓存、请求缓存、组件渲染缓存。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "class LRUCache<K, V> {\n  private map = new Map<K, V>();\n  constructor(private capacity: number) {}\n\n  get(key: K): V | -1 {\n    if (!this.map.has(key)) return -1;\n    const value = this.map.get(key)!;\n    this.map.delete(key);\n    this.map.set(key, value); // 挪到末尾 = 最近使用\n    return value;\n  }\n\n  put(key: K, value: V) {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size > this.capacity) {\n      const oldest = this.map.keys().next().value;\n      this.map.delete(oldest);\n    }\n  }\n}",
      },
    ],
    followUps: ["为什么「删除再插入」能维持 LRU 顺序？它和双向链表的实现差在哪？"],
  },
  {
    id: "fe-hand-array",
    category: "frontend",
    title: "手写数组去重/扁平化/乱序",
    difficulty: "easy",
    tags: ["手写", "数组"],
    prompt: "手写数组去重（含对象）、扁平化（指定深度）、Fisher-Yates 乱序。",
    parts: [
      {
        type: "list",
        items: [
          "去重：基本类型 new Set(arr)；对象数组按 id 用 Map 去重或键拼接。",
          "扁平化：递归 reduce 或 while + 展开运算符，指定深度就 depth 递减；Infinity 用 flat(Infinity)。",
          "乱序：不要用 arr.sort(() => Math.random() - 0.5)，分布不均匀且有实现相关性问题；用 Fisher-Yates 从后往前交换。",
          "手写 flat：depth 为 0 直接返回，否则递归拼接。",
          "复杂度：去重 O(n)、扁平化 O(n)、乱序 O(n)。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function flat<T>(arr: unknown[], depth = 1): unknown[] {\n  if (depth <= 0) return arr;\n  return arr.reduce<unknown[]>(\n    (acc, cur) => acc.concat(Array.isArray(cur) ? flat(cur, depth - 1) : [cur]),\n    []\n  );\n}\n\nfunction shuffle<T>(arr: T[]): T[] {\n  const a = [...arr];\n  for (let i = a.length - 1; i > 0; i--) {\n    const j = Math.floor(Math.random() * (i + 1));\n    [a[i], a[j]] = [a[j], a[i]];\n  }\n  return a;\n}",
      },
    ],
    followUps: ["arr.sort(() => Math.random() - 0.5) 为什么分布不均？"],
  },
  {
    id: "fe-hand-format",
    category: "frontend",
    title: "手写千分位与字符串处理",
    difficulty: "easy",
    tags: ["手写", "字符串"],
    prompt: "手写数字千分位格式化、字符串转驼峰。",
    parts: [
      {
        type: "list",
        items: [
          "千分位：/\B(?=(\\d{3})+(?!\\d))/g 替换为逗号；或 toLocaleString；小数部分别格式化。",
          "转驼峰：str.replace(/-\\w/g, (m) => m[1].toUpperCase())；反向转下划线类似。",
          "模板解析：匹配 /\\${([^}]+)}/g 取值替换；注意别用 eval 执行用户输入。",
          "面试要点：说清正则每个分组含义，比背答案重要。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "function thousands(num: number): string {\n  const [int, dec] = String(num).split(\".\");\n  const formatted = int.replace(/\\B(?=(\\d{3})+(?!\\d))/g, \",\");\n  return dec ? `${formatted}.${dec}` : formatted;\n}\n\nfunction toCamelCase(str: string): string {\n  return str.replace(/-\\w/g, (m) => m[1].toUpperCase());\n}\n\nconsole.log(thousands(1234567.89)); // 1,234,567.89\nconsole.log(toCamelCase(\"user-name\")); // userName",
      },
    ],
    followUps: ["大数精度场景下做千分位格式化要注意什么？"],
  },
  {
    id: "fe-hand-jsonp",
    category: "frontend",
    title: "手写 JSONP 与请求封装",
    difficulty: "easy",
    tags: ["手写", "网络"],
    prompt: "手写 JSONP，它解决什么问题？和 CORS 怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "JSONP 原理：动态创建 <script src=\"url?callback=fn\">，服务端返回 fn(data) 调用，全局函数拿到数据。",
          "实现要点：全局注册回调、带超时、onerror 处理、用完清理 script 节点和全局函数。",
          "局限：只支持 GET、无状态码/请求头控制、依赖全局函数、必须服务端配合；现在基本被 CORS 取代，仅老接口兜底。",
          "fetch 封装要点：统一 baseURL、超时（AbortController）、错误归一化（网络/HTTP/业务错误码）、token 注入、支持取消。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function jsonp(url: string, params: Record<string, string>) {\n  return new Promise((resolve, reject) => {\n    const cbName = `__jsonp_${Date.now()}`;\n    const script = document.createElement(\"script\");\n    const query = new URLSearchParams({ ...params, callback: cbName });\n    const timer = setTimeout(() => {\n      cleanup();\n      reject(new Error(\"timeout\"));\n    }, 5000);\n    (window as any)[cbName] = (data: unknown) => {\n      cleanup();\n      resolve(data);\n    };\n    script.onerror = () => {\n      cleanup();\n      reject(new Error(\"load error\"));\n    };\n    script.src = `${url}?${query}`;\n    function cleanup() {\n      clearTimeout(timer);\n      delete (window as any)[cbName];\n      script.remove();\n    }\n    document.body.appendChild(script);\n  });\n}",
      },
    ],
    followUps: ["JSONP 的请求会被浏览器缓存吗？怎么避免拿到旧数据？"],
  },
];
