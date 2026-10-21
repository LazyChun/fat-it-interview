import type { Question } from "./types";

/**
 * 2026-10 第三批 Web 前端面试题。
 * 补还没单独成题的考点：文档模式与 Web Components、层叠层和滚动、
 * 语言细节、React 水合与外部 store、Vue 组合式、浏览器往返缓存、
 * 类型系统、性能让出、手写、工程门禁和前端安全边界。
 */
export const frontendMoreQuestions: Question[] = [
  // ============ HTML ============
  {
    id: "fe-html-doctype",
    category: "frontend",
    title: "DOCTYPE 和怪异模式",
    difficulty: "easy",
    tags: ["HTML", "渲染"],
    prompt: "页面开头的 <!DOCTYPE html> 是干什么的？少了它，布局会出什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "DOCTYPE 告诉浏览器按哪个文档模式解析。HTML5 只需要 <!DOCTYPE html>，它不是标签，也没有结束标记。",
          "有它是标准模式（standards mode）：盒模型、表格、行内元素的垂直对齐按规范来。",
          "没有它，或写成浏览器不认识的旧声明，会进入怪异模式（quirks mode）。最常见的差别是 width 把 padding 和 border 算进去，像 IE 的 content-box 反了。",
          "还有几乎标准模式：DOCTYPE 在，但个别表格单元格的行高仍按旧规则。现在新页面不会碰到。",
          "document.compatMode 为 CSS1Compat 是标准模式，BackCompat 是怪异模式。线上样式「只在某个老页面错位」时先看这个。",
          "DOCTYPE 必须在文档最前。前面放了注释或 BOM 之外的内容，部分浏览器仍可能退回怪异模式。",
        ],
      },
    ],
    followUps: ["iframe 里的页面和父页面的文档模式是各自独立的吗？"],
  },
  {
    id: "fe-html-form",
    category: "frontend",
    title: "原生表单校验",
    difficulty: "medium",
    tags: ["HTML", "表单"],
    prompt: "不引表单库，浏览器能做哪些校验？自定义错误文案和「提交前再查一遍」怎么接？",
    parts: [
      {
        type: "list",
        items: [
          "约束校验 API：required、min、max、minlength、maxlength、step、pattern、type=\"email\" / url。input.validity 里有 valueMissing、typeMismatch、patternMismatch、tooShort 等标志。",
          "setCustomValidity(\"\") 清空自定义错误；传入非空字符串，checkValidity 就会失败。自定义规则（两次密码不一致）用它，不要只改一段提示文字。",
          "提交时浏览器会 reportValidity，并聚焦第一个非法控件。想自己画错误：form 上 novalidate，提交时手动调 form.checkValidity() 或 requestSubmit 之外的流程，再用 :user-invalid 上色。",
          ":invalid 在用户还没输入时就会匹配空的 required 框，一进页面满屏红。:user-invalid 要等交互之后，适合做提示。",
          "autocomplete 用规范里的 token（username、current-password、one-time-code），密码管理器和验证码自动填充才认得。placeholder 不能代替 label。",
          "inputmode 只影响移动端键盘（numeric、decimal），不参与校验；真正的约束仍是 type 和 pattern。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "passwordConfirm.addEventListener(\"input\", () => {\n  const mismatch = passwordConfirm.value !== password.value;\n  passwordConfirm.setCustomValidity(mismatch ? \"两次密码不一致\" : \"\");\n});",
      },
    ],
    followUps: ["type=\"number\" 的滚轮改值和本地化小数点，为什么很多表单反而避开它？"],
  },
  {
    id: "fe-html-wc",
    category: "frontend",
    title: "Web Components 和 Shadow DOM",
    difficulty: "hard",
    tags: ["HTML", "组件"],
    prompt: "Custom Elements 和 Shadow DOM 各解决什么？为什么业务项目很少把整站都做成 Web Components？",
    parts: [
      {
        type: "list",
        items: [
          "Custom Elements：customElements.define(\"my-panel\", class extends HTMLElement {})。名字必须有连字符，避免和未来的原生标签冲突。",
          "生命周期：constructor 里不要碰属性和子节点；connectedCallback 挂上文档后做订阅；disconnectedCallback 解绑；attributeChangedCallback 配合 observedAttributes 响应属性变化。",
          "Shadow DOM 把内部结构和样式封起来。外面的选择器进不来，组件的样式也漏不出去。插槽 slot 把外部光 DOM 投影进来，::part 有选择地露出可主题化的节点。",
          "mode: \"closed\" 只是不把 shadowRoot 挂在元素上，挡不住页面里已经拿到的引用，不要把它当安全边界。",
          "表单参与要用 ElementInternals（formAssociated），否则自定义输入框进不了 formData，也不会参与原生校验。",
          "业务站很少全盘使用的原因：SSR 和注水要自己做、没有现成的响应式和路由、样式封装和设计系统的全局令牌要额外打通。它更适合跨框架的设计系统、嵌入第三方页面的小组件。",
        ],
      },
    ],
    followUps: ["框架组件和 Custom Element 包一层，属性是字符串，布尔值和事件怎么约定？"],
  },
  {
    id: "fe-html-ready",
    category: "frontend",
    title: "DOMContentLoaded 和 load",
    difficulty: "easy",
    tags: ["HTML", "加载"],
    prompt: "DOMContentLoaded、load、pageshow 分别在什么时候触发？初始化脚本该挂在哪一个？",
    parts: [
      {
        type: "list",
        items: [
          "document.readyState 三态：loading 还在解析，interactive 文档已解析，complete 资源也加载完。",
          "DOMContentLoaded：HTML 解析完，defer 的脚本也执行完。不等图片、字体和子框架。操作 DOM 的初始化放这里，不要干等 load。",
          "样式表会挡住后面的脚本。脚本被挡住时，DOMContentLoaded 也会跟着推迟。把关键脚本放对位置，比换一个事件更有效。",
          "load 在窗口的图片、样式、子框架都结束后触发。只适合「确实要等图片尺寸」的逻辑，用来做首屏计时会偏晚。",
          "pageshow 在每次页面展示时触发，包括从往返缓存恢复。event.persisted 为 true 表示这次没有重新加载。依赖「每次进来都重新请求」的页面要在这里补一次刷新。",
          "不要监听 unload。它既不可靠，也会让页面进不了往返缓存。收尾放 pagehide。",
        ],
      },
    ],
    followUps: ["脚本写在 body 底部，和监听 DOMContentLoaded，效果一样吗？"],
  },

  // ============ CSS ============
  {
    id: "fe-css-sticky",
    category: "frontend",
    title: "sticky 为什么吸不住",
    difficulty: "medium",
    tags: ["CSS", "布局"],
    prompt: "表头 position: sticky; top: 0 不生效，你会按什么顺序查？",
    parts: [
      {
        type: "list",
        items: [
          "sticky 只在自己的包含块里滑动。父元素和粘性元素一样高时，没有可滑动的空间，看起来像完全没吸住。",
          "必须指定 top、bottom、left、right 里至少一个。只写 position: sticky 不会有粘性。",
          "中间任何祖先的 overflow 不是 visible（hidden、auto、scroll、clip）都会变成滚动容器。粘性相对的是这个祖先，而不是窗口。父级为了切圆角写了 overflow: hidden，是最常见的原因。",
          "祖先有 transform、filter、will-change 时，fixed 和 sticky 的包含块都会被改掉，层级和滚动一起错。",
          "表格上 border-collapse: collapse 时，部分浏览器里 thead 的 sticky 会被裁切。可以改成 separate，或给 th 单独做粘性并接受边框缝隙。",
          "排查：从元素往上看 overflow 和高度，而不是把 top 改成更小的数。",
        ],
      },
    ],
    followUps: ["同一列里有两个 sticky 表头，它们会互相推开还是叠在一起？"],
  },
  {
    id: "fe-css-layer",
    category: "frontend",
    title: "级联层、:is 和 :where",
    difficulty: "hard",
    tags: ["CSS", "优先级"],
    prompt: "为什么一个工具类能压过前面的 ID 选择器？:is() 和 :where() 的优先级差在哪？",
    parts: [
      {
        type: "list",
        items: [
          "级联顺序里，来源和重要性之后才比选择器优先级。@layer 把作者样式分成若干层，后面的层压过前面的层，和优先级无关。",
          "没有放进任何层的作者样式，压过所有分层样式。第三方重置放进 @layer reset，自己的页面样式不分层，就不会被重置里的高优先级选择器反咬。",
          "层的顺序由第一次声明决定。文件顶上写 @layer reset, base, components, utilities; 后面再补充某一层的规则，顺序不变。",
          ":is(h1, .title, #hero) 的优先级等于参数里最高的那个，这里等于一个 ID。适合分组，不适合用来「降低」优先级。",
          ":where() 的优先级永远是 0，参数多复杂都一样。主题覆盖、重置里用它，后面的普通类就能盖住，不必再堆选择器。",
          "!important 仍按层来，而且在分层内部是反的：更早的层里的 important 更强。不要靠它整理架构。",
        ],
      },
    ],
    followUps: ["把 Tailwind 的 utilities 放进最后一层之后，组件里的手写类为什么经常打不赢？"],
  },
  {
    id: "fe-css-clamp",
    category: "frontend",
    title: "clamp 和流式字号",
    difficulty: "easy",
    tags: ["CSS", "排版"],
    prompt: "标题想在手机和桌面之间平滑变大，为什么不要只写 font-size: 4vw？clamp 怎么写才不挡用户缩放？",
    parts: [
      {
        type: "list",
        items: [
          "4vw 完全跟着视口走，用户把浏览器默认字号放大时它不动，达不到 WCAG 对文本缩放的要求。也没有上下限，超宽屏会大得离谱。",
          "clamp(最小值, 首选值, 最大值) 把结果限制在两端之间。首选值用 vw 混合 rem，缩放和视口才能同时生效。",
          "推荐形态：font-size: clamp(1.25rem, 1rem + 1.5vw, 2rem)。两端是 rem，跟根字号走；中间的 vw 只负责随宽度补一截。",
          "min() 和 max() 是同一组函数。容器宽度可以用 width: min(72ch, 100%)，不必再套一层媒体查询。",
          "媒体查询适合布局突变（一列变两列）。尺寸平滑变化交给 clamp，不要为 320、375、768 各写一档字号。",
          "行长仍要管。字变大了如果容器也跟着无限变宽，一行会超过 70 个字符，阅读变差。",
        ],
      },
    ],
    followUps: ["根元素 font-size 用 vw，再用 rem 做整站适配，会出什么问题？"],
  },
  {
    id: "fe-css-scroll",
    category: "frontend",
    title: "滚动链和 overscroll",
    difficulty: "medium",
    tags: ["CSS", "滚动"],
    prompt: "弹层里的列表滚到底后，后面的页面跟着滚了。怎么停住？和 overflow: hidden 锁 body 比怎么样？",
    parts: [
      {
        type: "list",
        items: [
          "这是滚动链（scroll chaining）。内层滚到边界后，浏览器把剩下的滚动量交给祖先，所以背后的页面动了。",
          "overscroll-behavior: contain 停在当前滚动容器，不传给父级，自身的到顶回弹可以保留。none 连回弹一起去掉。写在弹层的滚动元素上，不要写在 body 上指望它管住所有弹层。",
          "overflow: hidden 加在 body 上能锁住背景，但会丢掉滚动位置，滚动条消失还会让页面横跳。要自己记 scrollY，关闭时再滚回去。",
          "iOS 上内部滚动要配 -webkit-overflow-scrolling 的历史问题已经过去，现在更常见的是内部元素没有固定高度，根本没形成滚动容器，手势直接作用在页面上。",
          "弹层打开时把焦点困在里面，和锁滚动是两件事。只挡触摸、不挡 Tab，键盘用户仍会滚到背景。",
          "滚动位置恢复交给 history.scrollRestoration。自己用 JS 改 scrollTop 时，先想清楚前进后退还要不要浏览器记得位置。",
        ],
      },
    ],
    followUps: ["position: fixed 的弹层在 iOS 里为什么有时还会带着 body 一起动？"],
  },
  {
    id: "fe-css-arch",
    category: "frontend",
    title: "CSS Modules、原子类和 CSS-in-JS",
    difficulty: "medium",
    tags: ["CSS", "工程化"],
    prompt: "一个新项目的样式方案怎么选？运行时 CSS-in-JS 现在为什么经常被劝退？",
    parts: [
      {
        type: "list",
        items: [
          "全局 CSS 加 BEM：零运行时，选择器你自己负责不冲突。项目一大，类名纪律和覆盖顺序靠人守。",
          "CSS Modules 和 Vue 的 scoped：构建期把类名改成带哈希的局部名，仍然是普通 CSS，没有运行时。伪类、动画、媒体查询都自然。",
          "运行时 CSS-in-JS（styled-components、emotion 的运行时）把样式放进 JS，主题和 props 好写，但要在运行时注入 style 标签。SSR 要收集并注水，组件一多，注入和序列化都进主线程。",
          "零运行时方案（vanilla-extract、Panda、Tailwind、CSS Modules）在构建期产出 CSS。动态值留给 CSS 变量，而不是为每个 props 生成一条规则。",
          "原子类适合有设计约束的产品：间距、颜色、字号从令牌里来。复杂选择器和少量状态用组件类，不要把一段动画全写进 className 字符串。",
          "一个组件里不要同时上 CSS Modules、Tailwind 和 styled-components。覆盖关系会变成三套优先级在打架。",
        ],
      },
    ],
    followUps: ["暗色主题用 CSS 变量，和用 CSS-in-JS 的 ThemeProvider 比，更新代价差在哪？"],
  },
  {
    id: "fe-css-contain",
    category: "frontend",
    title: "contain 和 content-visibility",
    difficulty: "medium",
    tags: ["CSS", "性能"],
    prompt: "长页面折叠线以下的区块，怎么让浏览器先跳过布局和绘制？要用哪个属性防止滚动条乱跳？",
    parts: [
      {
        type: "list",
        items: [
          "contain 告诉浏览器这块子树和外面无关：size 尺寸不依赖子元素，layout 内部布局不影响外部，paint 内部不会画到盒子外，style 计数器和引用不外泄。",
          "content-visibility: auto 让屏外元素跳过布局和绘制，滚进视口再算。长文章、长设置页能少掉一截首屏的布局时间。",
          "跳过布局后浏览器不知道这块有多高，滚动条会突然变长。配 contain-intrinsic-size: auto 500px，先按估计高度占位，真算过一次之后 auto 会记住上次的尺寸。",
          "它适合屏外的独立区块。不要加在首屏、弹层或用户马上要点的控件上，第一次滚到时会付布局成本。",
          "和虚拟列表不同：content-visibility 仍保留 DOM，搜索和读屏找得到；虚拟列表是少挂节点，适合上万行。几百个自然高度的段落，前者更省事。",
          "contain: paint 还会让内部的 position: fixed 相对于这个盒子，而不是视口。用来做性能优化时要看里面有没有固定定位。",
        ],
      },
    ],
    followUps: ["估算高度差很多时，CLS 会怎样？怎么给估计值？"],
  },

  // ============ JavaScript ============
  {
    id: "fe-js-desc",
    category: "frontend",
    title: "属性描述符和枚举",
    difficulty: "medium",
    tags: ["JavaScript", "对象"],
    prompt: "Object.keys、for...in、getOwnPropertyNames、Reflect.ownKeys 各拿到什么？writable 和 configurable 关掉之后还能做什么？",
    parts: [
      {
        type: "list",
        items: [
          "数据属性有 value、writable、enumerable、configurable。访问器属性换成 get 和 set，没有 value 和 writable。",
          "Object.keys 只要自身可枚举的字符串键。for...in 还沿原型链找可枚举字符串键，所以不要用它遍历数组。",
          "Object.getOwnPropertyNames 要自身全部字符串键，包含不可枚举。Reflect.ownKeys 再加 Symbol。JSON.stringify 会丢掉 Symbol 键、函数和 undefined。",
          "writable: false 不能改值，严格模式赋值直接抛 TypeError。configurable: false 之后不能删，也不能再改回 configurable，枚举位也不能从 false 改成 true。",
          "Object.freeze 是浅的：自身属性不可写、不可配置，嵌套对象照样能改。真正的深冻结要自己递归，而且循环引用要先记住已经走过的对象。",
          "类的方法定义在原型上且不可枚举；公有实例字段是自身可枚举属性。展开对象、Object.assign 时两者表现不一样。",
        ],
      },
    ],
    followUps: ["用结构赋值或 Object.assign 复制带 getter 的对象，复制到的是函数还是当时的值？"],
  },
  {
    id: "fe-js-nullish",
    category: "frontend",
    title: "可选链和空值合并",
    difficulty: "easy",
    tags: ["JavaScript", "语法"],
    prompt: "a || defaultValue 在什么数据上会错？??、?. 和 ||= 各管什么？",
    parts: [
      {
        type: "list",
        items: [
          "|| 把 0、\"\"、false、NaN、null、undefined 都当成缺失。分页页码、开关、空字符串作为合法值时，会被默认值盖掉。",
          "?? 只在左边是 null 或 undefined 时取右边。0 和空字符串会留住。",
          "?. 在 null 或 undefined 上短路，返回 undefined，不再往后访问。a?.b() 还会确认 b 存在再调用；如果 b 是 0 这类值，调用仍会抛 TypeError。",
          "a?.[key] 和函数的 fn?.() 是同一套语法。可选链不是空值合并，它不管 0 和空字符串。",
          "||= 用「假值」判断，??= 用「空值」判断，&&= 只在左边为真时赋值。给配置补默认值用 ??=，避免把用户显式写的 false 补掉。",
          "?? 和 ||、&& 混写必须加括号，否则语法错误。不要为了省括号改回 ||。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "const page = input.page || 1;   // page 为 0 时变成 1\nconst page2 = input.page ?? 1;  // 0 保留，null 才变 1\nconst city = user?.address?.city ?? \"未知\";",
      },
    ],
    followUps: ["obj?.method.bind(obj) 在 obj 为空时会怎样？bind 拿到的 this 对吗？"],
  },
  {
    id: "fe-js-symbol",
    category: "frontend",
    title: "Symbol 和内置符号",
    difficulty: "medium",
    tags: ["JavaScript", "对象"],
    prompt: "Symbol 解决什么命名冲突？Symbol.for 和 Symbol() 有什么差别？迭代器协议靠哪个符号？",
    parts: [
      {
        type: "list",
        items: [
          "Symbol() 每次返回一个新的、不相等的值，适合做对象的私有字段键，避免和字符串键撞车。它不是真正的私有，Reflect.ownKeys 仍能列出来。",
          "Symbol.for(key) 走全局注册表，同一个 key 在任何地方拿到的是同一个符号。Symbol.keyFor 只能反查这种符号，查不到 Symbol() 创建的。",
          "对象的字符串键会被 for...in 和 JSON 碰到；符号键默认不会进 JSON.stringify，Object.assign 会复制可枚举的符号键。",
          "内置符号是协议挂钩。Symbol.iterator 让对象能被 for...of 和展开；Symbol.toPrimitive 定制 == 和数学运算时怎么变原始值；Symbol.hasInstance 能改写 instanceof。",
          "Symbol.toStringTag 决定 Object.prototype.toString 打出来的标签，类型判断里的 [object Map] 就是这么来的。",
          "类的真正私有字段是 #field，语言保证外面访问不了。需要「约定私有」用 Symbol，需要「语言私有」用 #。",
        ],
      },
    ],
    followUps: ["给一个普通对象实现迭代器，for...of 会调用哪个方法？"],
  },
  {
    id: "fe-js-pass",
    category: "frontend",
    title: "参数是按值传递的",
    difficulty: "medium",
    tags: ["JavaScript", "函数"],
    prompt: "函数里给对象参数加了一个字段，外面能看到；把参数重新赋值为 null，外面却不变。到底是按值还是按引用？",
    parts: [
      {
        type: "p",
        text: "JavaScript 只有按值传递。传入对象时，传进去的值是这份引用的拷贝。函数里沿着引用改对象，外面看得到；函数里把参数名指到别的值，改的是拷贝，外面的绑定不动。",
      },
      {
        type: "code",
        lang: "js",
        code: "function edit(user) {\n  user.name = \"Ada\"; // 改的是同一个对象\n  user = null;        // 只改了参数绑定\n}\nconst person = { name: \"Grace\" };\nedit(person);\nperson.name; // \"Ada\"",
      },
      {
        type: "list",
        items: [
          "原始值传的是值的拷贝，函数里怎么改都影响不了外面。",
          "「对象按引用传递」是口头说法。精确的说法是：传递引用的值。两个调用方不会共享同一个绑定。",
          "const 限制的是绑定不能重新指向，不限制对象内容。const user = {} 之后 user.name = \"a\" 合法。",
          "想避免被调用方改掉，传之前拷贝，或 Object.freeze。冻结是浅的，嵌套字段仍要单独处理。",
          "React 的 state 也是这份语义加上不可变约定：就地修改对象不会触发更新，因为引用没变。",
        ],
      },
    ],
    followUps: ["把数组传进 sort，为什么外面的数组顺序也变了？"],
  },
  {
    id: "fe-js-error",
    category: "frontend",
    title: "同步错误和未处理拒绝",
    difficulty: "medium",
    tags: ["JavaScript", "异常"],
    prompt: "try/catch 抓不住哪些错误？window.onerror 和 unhandledrejection 各负责什么？",
    parts: [
      {
        type: "list",
        items: [
          "try/catch 只抓当前调用栈里同步抛出的异常。setTimeout 回调、事件处理、没 await 的 Promise，错误发生在另一轮任务里，外面的 catch 已经结束了。",
          "async 函数里 await 的拒绝会变成异常，能被 try/catch 接住。返回一个自己没 await 的 Promise，拒绝会逃到调用方。",
          "Error 上带 cause：throw new Error(\"保存失败\", { cause: err })，日志里保留底层原因，又不要把 SQL 或内部栈直接给用户看。",
          "window.onerror 接收脚本运行时错误。资源加载失败（script、img、link）不冒泡，要在捕获阶段听 error，还要分清 event.target 是不是 window。",
          "unhandledrejection 接收没有 catch 的 Promise。上报后可以 preventDefault，避免控制台重复刷。它拿不到传统的行列号，原因在 event.reason。",
          "跨域脚本如果没有 CORS 和跨域属性，onerror 只能得到 \"Script error.\"，没有栈。第三方脚本要么允许拿到细节，要么自己在边界上报。",
        ],
      },
    ],
    followUps: ["一个 async 事件处理函数里抛错，React 的错误边界接得住吗？"],
  },
  {
    id: "fe-js-v8",
    category: "frontend",
    title: "V8 的隐藏类和内联缓存",
    difficulty: "hard",
    tags: ["JavaScript", "性能"],
    prompt: "同样是存三个字段的对象，为什么一个热循环快、另一个慢一个数量级？和数组上的空洞有什么关系？",
    parts: [
      {
        type: "list",
        items: [
          "V8 为对象维护隐藏类（Map，也叫 shape）：属性名和顺序相同的对象共享同一份形状，属性访问才能变成固定偏移。",
          "在构造函数里按同一顺序初始化字段。先创建空对象再有时加 a、有时加 b，会分裂出很多形状，内联缓存从单态变成多态，再变成超多态就退回慢查找。",
          "delete obj.key 会把对象变成字典模式，后面的访问更慢。不再使用的字段赋 null，而不是删除。",
          "数组分打包元素和带洞元素。arr[10000] = 1 或 delete arr[i] 会打出空洞，很多优化过的数组方法走不了快路径。用 push、填满下标，或新数组过滤。",
          "这些是引擎的经验，不是语言规范。先写清楚的代码，性能分析里看到热点再避免改形状，不要把业务对象提前拆成固定字段的手工优化。",
          "数值上，小整数（Smi）和装箱后的浮点、对象也是不同表示。一个数组里混进字符串，元素种类升档，会多一次间接访问。",
        ],
      },
    ],
    followUps: ["TypeScript 的类型信息能帮助 V8 做这些优化吗？"],
  },
  {
    id: "fe-js-clone",
    category: "frontend",
    title: "structuredClone 能拷贝什么",
    difficulty: "medium",
    tags: ["JavaScript", "对象"],
    prompt: "什么时候用 structuredClone，什么时候它会直接抛错？和展开运算符、JSON 深拷贝怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "structuredClone 走结构化克隆：能拷贝普通对象、数组、Date、RegExp、Map、Set、ArrayBuffer、Blob，也能处理循环引用。",
          "函数、DOM 节点、类的方法拷贝不了，遇到会抛 DataCloneError。类实例会被收成普通对象，原型和私有字段都留在原来那边。",
          "getter 会被调用，拷贝的是得到的值，不是访问器本身。符号键可以拷贝。",
          "展开和 Object.assign 都是浅拷贝。只想避免改到下一层时用它们；嵌套字段仍和原来共享。",
          "JSON 往返会丢掉 undefined、函数、Symbol、循环引用，Date 变成字符串，NaN 变成 null。只适合纯 JSON 数据。",
          "要转移大块内存而不是拷贝，用第二个参数 transferables，把 ArrayBuffer 的所有权交出去，原缓冲随即脱离。",
        ],
      },
    ],
    followUps: ["把带方法的类实例放进 postMessage，对面拿到的是什么？"],
  },
  {
    id: "fe-js-regex",
    category: "frontend",
    title: "正则回溯和 ReDoS",
    difficulty: "hard",
    tags: ["JavaScript", "安全"],
    prompt: "一段校验正则在短字符串上正常，换成几十个字符就卡死页面。原因是什么，怎么改？",
    parts: [
      {
        type: "list",
        items: [
          "灾难性回溯：表达式里有重叠的量词，例如 /(a+)+$/。引擎在失败前会尝试指数级的切分方式。主线程被占住，页面失去响应。",
          "用户输入不要直接 new RegExp(input)。要当普通文本匹配时，先把特殊字符转义。校验用的正则保持固定，不要拼接不受控的片段。",
          "改写法：去掉嵌套量词，把「整段重复」收成明确的结构；能用字符串方法 startsWith、includes、长度判断的，就不要上正则。",
          "再加输入长度上限。即使表达式是安全的，超长文本的匹配也没必要在主线程做。",
          "带 g 或 y 的正则有 lastIndex。把同一个正则复用在多次 test 上，第二次会从上一次停下的位置继续，出现偶发性的 false。每次用前把 lastIndex 归零，或单独 new 一个。",
          "安全扫描和接口校验如果跑在 Node 里，同样吃主线程。不要认为 ReDoS 只是浏览器面试题。",
        ],
      },
    ],
    followUps: ["邮箱校验为什么不建议抄一段超长正则，而应该拆成几条简单规则？"],
  },

  // ============ React ============
  {
    id: "fe-react-useid",
    category: "frontend",
    title: "useId 和水合",
    difficulty: "medium",
    tags: ["React", "SSR"],
    prompt: "label 和 input 要用同一个 id。为什么不能用 Math.random 或一个自增全局变量？useId 保证了什么？",
    parts: [
      {
        type: "list",
        items: [
          "服务端渲染出的 id 必须和客户端第一次渲染一致，否则水合对不上，React 会丢掉这段 DOM 重新渲染，表单状态也可能丢。",
          "Math.random、Date.now、自增计数器在服务端和客户端各跑一遍，顺序或数值对不齐。条件渲染还会让后面的计数全部偏移。",
          "useId 按组件在树上的位置生成稳定 id，同一位置在服务端和客户端得到同一个值。它不是列表 key，也不要拿去当作数据 id。",
          "一个组件里可以调用多次，每次结果不同但稳定。生成的字符串可能含冒号，querySelector 要转义，给 htmlFor 和 aria 属性用则没问题。",
          "同一页面上多份 React 根，或一个页面里嵌了多个带 useId 的应用时，用 identifierPrefix 避开撞车。",
          "水合不一致的常见来源还有：渲染时读 localStorage、按窗口宽度分支、把日期格式化成带时区的字符串。这些都要放到 effect 里，或把结果从服务端一起传下来。",
        ],
      },
    ],
    followUps: ["客户端组件包在 Suspense 里时，useId 还会和 HTML 对上吗？"],
  },
  {
    id: "fe-react-portal",
    category: "frontend",
    title: "Portal 的事件走哪棵树",
    difficulty: "medium",
    tags: ["React", "事件"],
    prompt: "弹层用 createPortal 挂到 document.body，点击弹层里的按钮，父组件的 onClick 还会收到吗？样式和定位又跟着谁？",
    parts: [
      {
        type: "list",
        items: [
          "Portal 只改变 DOM 挂载点。React 眼里这个子节点仍是父组件的孩子，上下文、Redux、错误边界都还沿着 React 树。",
          "合成事件也沿着 React 树冒泡。弹层里的点击会触发父组件的 onClick，即使 DOM 上 body 和父节点毫不相干。在 document 上用原生监听时，顺序要单独测。",
          "CSS、层叠、fixed 的包含块跟着真实 DOM。父级 overflow 或 transform 不再困住弹层，这正是 Portal 的用途。z-index 改成和 body 下其他弹层一起排。",
          "焦点和读屏不认 React 树。弹层打开要把焦点移进去，Tab 循环留在弹层内，关闭后焦点回到触发按钮。aria-modal 和 inert 挡住背景。",
          "服务端没有 document.body。创建 Portal 的分支放在客户端渲染之后，或确认根节点在这段 HTML 里已经存在。",
          "卸载父组件会一起卸载 Portal 里的内容。不要把「挂到 body」理解成脱离了 React 的生命周期。",
        ],
      },
    ],
    followUps: ["父组件 stopPropagation 之后，document 上的原生点击监听还能收到弹层里的点击吗？"],
  },
  {
    id: "fe-react-external",
    category: "frontend",
    title: "useSyncExternalStore 解决撕裂",
    difficulty: "hard",
    tags: ["React", "状态"],
    prompt: "组件订阅了 Redux 或浏览器的 online 状态，为什么不建议在渲染期间直接 store.getState()？useSyncExternalStore 要哪三个函数？",
    parts: [
      {
        type: "list",
        items: [
          "并发渲染可能开始渲染、让出主线程、再继续。中间外部 store 变了的话，同一棵树上已经渲染完的组件和还没渲染的组件会看到两份快照，这就是撕裂。",
          "useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) 在渲染期间读快照。快照变了，React 会丢弃进行中的渲染，用新快照重来，保证这次提交看到的是同一份。",
          "getSnapshot 必须在数据没变时返回稳定引用。每次返回新对象，React 会认为一直在变，造成无限更新。选一个字段就返回字段，返回对象时先在 store 里缓存。",
          "getServerSnapshot 给服务端和注水用。客户端快照如果和它不同（例如 online、窗口宽度），第一次客户端渲染要能解释这个差异，不能在渲染函数里直接读 window。",
          "subscribe 在订阅时返回取消函数。漏掉取消，组件卸载后仍 setState，开发模式会警告，列表里就会漏。",
          "Redux、Zustand 的 React 绑定内部就是这个 Hook。自己接 DOM API（matchMedia、online、selection）时直接用它，不要用 useEffect 加 useState 去追，那会慢一拍还有撕裂窗口。",
        ],
      },
    ],
    followUps: ["getSnapshot 里返回 state.items.filter(...) 为什么一定要缓存？"],
  },
  {
    id: "fe-react-lazy",
    category: "frontend",
    title: "lazy、Suspense 和加载失败",
    difficulty: "medium",
    tags: ["React", "代码分割"],
    prompt: "路由组件用 React.lazy 拆包。加载中、加载失败、服务端渲染各由谁负责？",
    parts: [
      {
        type: "list",
        items: [
          "React.lazy 接收一个返回 Promise 的函数，Promise 需要 resolve 成 { default: Component }。命名导出要包一层再交给它。",
          "渲染到懒组件时如果模块还没到，React 向最近的 Suspense 抛出挂起，显示 fallback。fallback 要占住布局，避免加载完成后把页面顶下去。",
          "网络失败、chunk 404 是拒绝，不是挂起。Suspense 接不住，要有错误边界。边界里提供重试：记住失败状态，用户点击后再换一个新的 lazy 实例。",
          "拆包粒度按路由和重组件，不要每个按钮一个 chunk。过碎会让首屏在瀑布里依次等很多小文件。",
          "对下一跳可以预取：链接进入视口或 hover 时提前 import()。webpack 的魔法注释能标记 prefetch，但浏览器空闲时才拉，别用来替代当前屏的资源。",
          "服务端组件树不会执行 React.lazy 那次动态 import 的同一套路径。SSR 框架有自己的代码分割约定，客户端的 lazy 边界要和它对齐，不然注水对不上。",
        ],
      },
    ],
    followUps: ["错误边界重试时，为什么往往要改变 lazy 组件的 key 或重新 create 一次？"],
  },
  {
    id: "fe-react-derived",
    category: "frontend",
    title: "派生状态不要再存一份",
    difficulty: "medium",
    tags: ["React", "状态"],
    prompt: "props.items 一变，就在 useEffect 里 setState 出一份过滤结果。这会有什么问题，正确写法是什么？",
    parts: [
      {
        type: "list",
        items: [
          "能由现有 props 和 state 算出来的值，在渲染期间直接算。多存一份就会和来源各走各的，出现「上一帧的列表配这一帧的关键字」。",
          "useEffect 里再 setState 至少多一次渲染：先画出过期结果，再画出新结果。搜索和筛选会闪一下。",
          "把 props 抄进 state 的合法场景很少，一般是「这份数据接下来要在本地被用户改」。真要在某个 prop 变化时重置整个子树，给子组件一个能代表身份的 key，React 会卸载再挂上，state 自然回到初始值。",
          "渲染期间发现 prop 和上一次不同、然后 setState，是 React 文档里允许的调整写法。它发生在提交之前，不会画出中间帧。不要为了这个再绕回 effect。",
          "计算很贵再用 useMemo，依赖写来源本身。memo 挡的是重复计算，不是另一份真相。",
          "列表过滤、全选是否勾上、总价、校验结果，都是派生数据。把它们写进 state，后面一定要找地方同步。",
        ],
      },
    ],
    followUps: ["用 key 重置状态时，组件里的请求和订阅会怎样？"],
  },
  {
    id: "fe-react-ime",
    category: "frontend",
    title: "受控输入和中文输入法",
    difficulty: "medium",
    tags: ["React", "表单"],
    prompt: "受控输入框在打中文时，拼音还在候选栏里就被搜了一次，或者字符直接消失。原因是什么？",
    parts: [
      {
        type: "list",
        items: [
          "中文、日文输入期间，浏览器先发 compositionstart，中间是 compositionupdate 和 input，选词结束后才 compositionend。这整段里输入法还持有未确认的文本。",
          "React 的 onChange 对应的是 input 事件，组合期间也会触发。如果这时把 value 改成「去掉空格」或「转成大写」的新字符串，受控值会把输入法正在编辑的内容冲掉，表现为丢字或候选栏关掉。",
          "用 compositionstart / compositionend 记一个 isComposing。组合期间只把原始值放进 state，不要过滤、不要发搜索。compositionend 里再做格式化和请求。",
          "回车提交同样要看 nativeEvent.isComposing。选词的回车不应该触发表单提交。",
          "不要在组合期间根据 maxLength 截断。输入法的中间串可能比最终汉字长，截断会直接打断组字。",
          "非受控输入加上在 compositionend 里读取，能躲开这个问题，但校验和联动就得自己同步。受控可以保留，只要别在组合中途改写 value。",
        ],
      },
    ],
    followUps: ["搜索要防抖的话，防抖计时从 onChange 开始，还是从 compositionend 开始？"],
  },

  // ============ Vue ============
  {
    id: "fe-vue-setup",
    category: "frontend",
    title: "script setup 和响应式解构",
    difficulty: "medium",
    tags: ["Vue", "组合式"],
    prompt: "defineProps、defineEmits 为什么不用 import？在 script 里把 props 解构之后，模板还会更新吗？",
    parts: [
      {
        type: "list",
        items: [
          "script setup 里的 defineProps、defineEmits、defineModel、defineExpose、defineOptions 是编译宏。编译器把它们收成选项，运行时不存在这些函数，所以不能当普通函数绕一层调用。",
          "模板里直接用 props.title 始终是响应式的。编译器知道这些标识符来自 props。",
          "Vue 3.5 起，script setup 里的 props 解构默认保持响应式，编译器会改写成访问原始 props。默认值可以写在解构里。3.5 之前，解构拿到的是一次性的值，之后 prop 变了局部变量不变。",
          "解构后传给一个普通函数，或者放进不是编译器能看到的闭包，响应式仍会丢。要长期拿住某个字段用 toRef(props, \"title\")。",
          "defineExpose 决定父组件通过模板 ref 能点到什么。setup 默认全部关闭，不暴露就不该让父组件依赖内部状态。",
          "defineModel 是 v-model 的编译宏，帮你声明 prop 加 update 事件。组件库对外仍是普通的 modelValue 约定。",
        ],
      },
    ],
    followUps: ["为什么这些宏不能写在 if 里面？"],
  },
  {
    id: "fe-vue-watch",
    category: "frontend",
    title: "watch 和 watchEffect",
    difficulty: "medium",
    tags: ["Vue", "组合式"],
    prompt: "一个请求只依赖 userId，另一个要把当前读到的多个状态同步到 DOM。该用 watch 还是 watchEffect？",
    parts: [
      {
        type: "list",
        items: [
          "watch 显式指定来源，默认懒执行：来源不变就不跑。回调能拿到新值和旧值，适合「id 变了就重新请求」这种边界清楚的副作用。",
          "watchEffect 立刻执行一次，并自动跟踪这次执行里读到的响应式数据。同步逻辑要跟着多份状态走、又不想手写依赖时用它。它没有旧值。",
          "两者默认 flush 是 pre：组件 DOM 更新前调用。要读更新后的 DOM，用 flush: \"post\"，或 watchPostEffect。",
          "回调里返回清理函数，或使用 onCleanup。下一次效果运行前和停止监听时都会调用，用来取消请求、清除定时器。",
          "不要在 watchEffect 里修改它自己读到的来源，否则会循环。能用计算属性得到的值，不要用 watch 再写回一个 ref。",
          "监听一个对象的深层变化用 { deep: true }，代价是遍历。能监听具体字段就不要整棵深监听。reactive 对象被整体替换时，直接 watch 这个对象即可，不必 deep。",
        ],
      },
    ],
    followUps: ["watch 的来源是 getter 和是一个 ref，写法上差在哪？"],
  },
  {
    id: "fe-vue-transition",
    category: "frontend",
    title: "Transition 和列表移动",
    difficulty: "medium",
    tags: ["Vue", "动画"],
    prompt: "单个弹层的进出场，和一组列表项的重排，Vue 分别提供什么？只写 CSS 时类名是哪些？",
    parts: [
      {
        type: "list",
        items: [
          "单个元素或组件的挂载和卸载用 Transition。name=\"fade\" 时，类名是 fade-enter-from、fade-enter-active、fade-enter-to，离开对应 leave-from、leave-active、leave-to。",
          "enter-active 和 leave-active 放 transition 时长和曲线。from 是起始状态，to 是结束状态。Vue 会在下一帧去掉 from，从而触发过渡。",
          "mode=\"out-in\" 让旧元素先离开，再进入新元素，适合页签内容，避免两个同样定位的块叠在一起。",
          "列表用 TransitionGroup。每个子节点必须有稳定 key。新增和删除走 enter/leave，剩下的节点如果位置变了，会加上 move 类，用 CSS transform 做 FLIP。",
          "move 过渡要求元素在布局上是可变换的。inline 元素、以及离开时不用 position: absolute 收起的布局，移动动画会怪。官方示例里离开的项会绝对定位，让兄弟去补位。",
          "用户开了 prefers-reduced-motion 时缩短或取消这些过渡。动画是增强，不应该成为唯一的状态说明。",
        ],
      },
    ],
    followUps: ["同一时刻既要离开又要移动，GPU 层和布局各算一次，怎么避免掉帧？"],
  },
  {
    id: "fe-vue-error",
    category: "frontend",
    title: "Vue 的错误处理",
    difficulty: "medium",
    tags: ["Vue", "异常"],
    prompt: "子组件渲染抛错，应用会白屏吗？errorHandler 和 onErrorCaptured 分别适合做什么？",
    parts: [
      {
        type: "list",
        items: [
          "渲染、事件处理、生命周期、setup、侦听器、指令和过渡钩子里的同步错误，会向上交给 onErrorCaptured，最后到 app.config.errorHandler。",
          "没有处理时，错误仍会抛到控制台，出错的组件可能停止更新。在捕获处渲染一份备用界面，才能避免整页只剩一个空白根节点。",
          "onErrorCaptured 返回 false 阻止继续向上传播。组件库可以用它吞掉内部可恢复的错误，应用级 errorHandler 则负责上报。",
          "setTimeout、原生 addEventListener、没有被 await 的 Promise 拒绝不走这套链。这些要在调用处 catch，或听 window 的 unhandledrejection。",
          "errorHandler 的第三个参数 info 是生命周期名或渲染标记，适合打进日志。不要根据 info 的文案做业务分支，它不是稳定 API。",
          "错误处理函数自己再抛错时，要避免递归上报。加一个正在处理的标志，第二次直接写控制台。",
        ],
      },
    ],
    followUps: ["异步组件加载失败算渲染错误吗？该在哪一层给重试按钮？"],
  },

  // ============ Webpack ============
  {
    id: "fe-webpack-map",
    category: "frontend",
    title: "source map 怎么配才安全",
    difficulty: "medium",
    tags: ["Webpack", "调试"],
    prompt: "线上报错只有压缩后的一行。想还原到源码，又不能把源码公开到 CDN。devtool 怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "开发用 eval-cheap-module-source-map：模块级映射、重建快，能看到未经 loader 转坏之前的源码行列。生产不要用 eval，它把模块包进 eval 字符串。",
          "source-map 生成完整的独立 .map，并在包尾留下 sourceMappingURL。浏览器和任何人都能把源码下载下来，包括环境判断和注释掉的内部地址。",
          "线上用 hidden-source-map：生成映射文件，但包里不写 sourceMappingURL。构建结束把 map 上传到错误监控（Sentry 一类），用版本号对上发布，然后从产物里删掉 map，不要放进公开目录。",
          "nosources-source-map 的映射里不带源码正文，监控里能看到文件和行列，看不到原文。对更敏感的仓库可以用，排查体验会差一截。",
          "第三方依赖一般关掉 source map，否则映射体积接近整包源码。只保留自己的业务代码。",
          "发布版本、git commit 和 map 必须同一份。后补的 map 对不上压缩结果时，还原出来的行会系统性偏移。",
        ],
      },
    ],
    followUps: ["hidden-source-map 已经不引用 map 了，为什么仍不能把它和 js 放在同一个公开桶里？"],
  },
  {
    id: "fe-webpack-cache",
    category: "frontend",
    title: "持久化缓存和 externals",
    difficulty: "medium",
    tags: ["Webpack", "构建"],
    prompt: "Webpack 5 的 filesystem cache 为什么能让第二次构建变快？什么情况下必须把缓存清掉？externals 又在解决什么？",
    parts: [
      {
        type: "list",
        items: [
          "cache.type = \"filesystem\" 把模块图和生成结果放到 node_modules/.cache。第二次只重做失效的模块。开发重建和 CI 增量编译都靠它。",
          "缓存键必须包含会改变产物的输入：webpack 配置、lock 文件、相关环境变量。buildDependencies 把配置文件算进去，改了配置才会整体失效。漏了的话，你会拿到旧配置编出来的包。",
          "CI 上缓存可以跨任务复用，但 Node 大版本、loader 版本和操作系统变了要换缓存命名空间。说不清时宁可删缓存重编，也不要发布一份来源不明的产物。",
          "externals 告诉 Webpack：react 这种依赖不要打进包，运行时从全局或外部模块拿。页面用 CDN 的固定版本时，包体积和缓存都更好。",
          "外部版本必须和开发时的类型、peer 依赖一致。页面上两份 React 是 Hooks 报「invalid hook call」的常见原因：externals 没生效，包里又带了一份。",
          "DllPlugin 是 Webpack 4 时代预编译厂商包的办法。Webpack 5 有持久缓存之后，多数项目不必再维护 dll。",
        ],
      },
    ],
    followUps: ["externals 把 Vue 交给 CDN 之后，SSR 那次 Node 构建还能共用同一份配置吗？"],
  },

  // ============ 浏览器 ============
  {
    id: "fe-browser-bfcache",
    category: "frontend",
    title: "往返缓存 bfcache",
    difficulty: "medium",
    tags: ["浏览器", "性能"],
    prompt: "用户从详情页按返回，列表瞬间回来了，但数据是离开前的。这是缓存头的问题吗？怎样的页面进不了往返缓存？",
    parts: [
      {
        type: "list",
        items: [
          "bfcache 把整页冻在内存里，包括 JS 堆和滚动位置。前进后退时直接恢复，不再发文档请求。Core Web Vitals 把这次恢复也算进 LCP 等指标，所以它影响的是实测分数。",
          "它不是 HTTP 缓存。Cache-Control 再短，返回仍可能走 bfcache。Firefox 里主文档的 Cache-Control: no-store 会挡住它；Chrome 后来放宽了一部分，不能把 no-store 当成稳定的开关。",
          "常见的阻挡：注册了 unload、beforeunload；页面还开着 IndexedDB 的事务或网络连接没有在冻结前收好。用 pagehide 做收尾，不要用 unload。",
          "pageshow 的 event.persisted 为 true 表示这次是恢复。购物车、权限、倒计时这类怕过期的状态在这里重新校验，而不是假设脚本会从头执行。",
          "DevTools 的 Application 面板能看到这块页面为什么进不去。先去掉阻挡，再决定哪些数据要在恢复时刷新。",
          "不想让敏感页面被恢复（公共电脑上的账户页）是产品决策，可以用 no-store 或在 pagehide 时清掉敏感 DOM。不要为了省事全局禁掉。",
        ],
      },
    ],
    followUps: ["从 bfcache 恢复时，setInterval 和 WebSocket 还在吗？"],
  },
  {
    id: "fe-browser-history",
    category: "frontend",
    title: "History API 和 SPA 路由",
    difficulty: "medium",
    tags: ["浏览器", "路由"],
    prompt: "前端路由调用 pushState 之后，为什么不会触发 popstate？刷新深层链接 404 又是谁的责任？",
    parts: [
      {
        type: "list",
        items: [
          "pushState(state, \"\", url) 只往历史栈压一条，并改地址栏，不加载文档，也不发 popstate。popstate 在用户后退、前进，或 history.back / go 时触发。",
          "所以路由库的做法是：自己导航时直接改响应式的当前路由；popstate 里再读 location，同步到同一份状态。只监听 popstate 会漏掉点击链接的那次。",
          "replaceState 替换当前条目。筛选条件、分页这类不值得占一个后退步的更新用它。表单填写到一半不要用 replace 把用户的后退弄丢。",
          "state 被结构化克隆后存进历史。刷新之后仍在，但跨源页面读不到。不要把大对象和函数塞进去，浏览器对这条记录的大小有限制。",
          "history 模式的 URL 是真实路径。刷新时服务器必须把这些路径回落到同一份 index.html，否则直接 404。hash 模式不需要服务器配合，但 URL 丑，也影响一些分析工具。",
          "history.scrollRestoration = \"manual\" 之后，滚动位置由你恢复。列表返回详情再返回时，才有机会滚回原来那一项，而不是总回到顶部。",
        ],
      },
    ],
    followUps: ["query 变化要用 push 还是 replace？分享出去的链接和后退体验怎么取舍？"],
  },
  {
    id: "fe-browser-passive",
    category: "frontend",
    title: "passive 监听和滚动",
    difficulty: "medium",
    tags: ["浏览器", "事件"],
    prompt: "给 touchmove 绑了监听之后，滚动变卡，控制台还提示 Unable to preventDefault。发生了什么？",
    parts: [
      {
        type: "list",
        items: [
          "浏览器为了开始滚动，要先知道这次触摸会不会 preventDefault。监听如果是被动的，它就可以立刻滚动，不必等 JS。",
          "注册在 document 或 window 上的 touchstart、touchmove，Chrome 默认 passive: true。这时调用 preventDefault 会被忽略，并打出警告。",
          "确实要阻止滚动（自绘画布、横向手势抢走纵向滚动）时，显式传 { passive: false }，并且只加在需要的元素上，做完就移除。",
          "wheel 也是同一类。在 window 上监听滚轮做视差，却不阻止默认行为时，应声明 passive: true，让滚动线程不被脚本拖住。",
          "React 的 onTouchMove 挂在根委托上，根上的触摸监听往往是被动的，在里面 preventDefault 不可靠。需要阻止默认行为时，用 ref 拿节点，加上非被动的原生监听。",
          "滚动性能先减主线程工作：不要在 scroll 里读布局再写样式。被动监听解决的是「浏览器敢不敢提前滚」，不是把重计算变轻。",
        ],
      },
    ],
    followUps: ["{ passive: true, once: true } 和卸载时 removeEventListener，哪个还是必须做？"],
  },
  {
    id: "fe-browser-secure",
    category: "frontend",
    title: "安全上下文",
    difficulty: "easy",
    tags: ["浏览器", "安全"],
    prompt: "同样的页面，https 和 localhost 上能调摄像头，放到局域网的 http://192.168.x.x 上就不行。浏览器卡的是什么？",
    parts: [
      {
        type: "list",
        items: [
          "安全上下文（secure context）要求页面通过 HTTPS，或者是 localhost、127.0.0.1 这类本机地址。window.isSecureContext 可以用来分支提示。",
          "不在安全上下文里，一批 API 直接不可用：getUserMedia、地理定位、Service Worker、通知、剪贴板读取、crypto.subtle、Web Bluetooth。不是权限弹窗被拒，是 API 本身不暴露或调用拒绝。",
          "局域网 IP 的 HTTP 既不是 localhost，也不是安全传输。手机真机调试摄像头、Service Worker 时，要给开发环境配证书，或使用带 HTTPS 的隧道。",
          "SharedArrayBuffer 还要跨源隔离：COOP 和 COEP 响应头都到位，页面才算隔离。只有 HTTPS 不够。",
          "安全上下文保护的是「这个来源没有被链路篡改」。它不代替权限询问，用户仍要单独允许摄像头和通知。",
          "嵌入 iframe 时，父页面不安全，子页面的这些能力也受影响。第三方小组件要在文档里写明必须跑在 HTTPS 下。",
        ],
      },
    ],
    followUps: ["新开窗口被浏览器拦住，和安全上下文有关吗？通常是哪条规则？"],
  },
  {
    id: "fe-browser-message",
    category: "frontend",
    title: "postMessage 要校验来源",
    difficulty: "medium",
    tags: ["浏览器", "安全"],
    prompt: "主页面和 iframe、或者和打开的支付窗口通信，直接 postMessage(data, \"*\") 有什么问题？接收方最少要检查什么？",
    parts: [
      {
        type: "list",
        items: [
          "第二个参数是目标源。写 \"*\" 表示谁拿到这个窗口引用都能收到消息。窗口若被重定向到别的站点，消息仍会送过去。能写具体 origin 就不要用星号。",
          "接收方必须看 event.origin 是不是预期的源，再读 event.data。只判断数据里有没有某个字段，攻击页面也能伪造。",
          "event.source 要等于你持有的 iframe.contentWindow 或 window.open 的返回值，避免同个源下另一个框架插话。",
          "数据走结构化克隆，函数、DOM 节点传不过去。不要把令牌放进 message 还同时使用 \"*\"。支付结果用服务端回跳或服务端通知确认，postMessage 只做界面联动。",
          "iframe 的 sandbox 如果不带 allow-scripts，脚本不会跑；带了 allow-scripts 却没有 allow-same-origin 时，它是一个不透明源。origin 判断要按真实约定来写，不能假设还是父页面的源。",
          "MessageChannel 给双方各一个端口，之后的消息不必再广播。端口本身仍要在第一次握手时确认对方是谁。",
        ],
      },
    ],
    followUps: ["targetOrigin 写成 / 开头的路径可以吗？它必须和什么比对？"],
  },

  // ============ TypeScript ============
  {
    id: "fe-ts-predicate",
    category: "frontend",
    title: "类型谓词和函数重载",
    difficulty: "medium",
    tags: ["TypeScript", "类型"],
    prompt: "filter 之后数组仍是联合类型，怎么告诉编译器现在只剩一种？重载和联合入参的函数类型怎么选？",
    parts: [
      {
        type: "list",
        items: [
          "类型谓词写成 parameterName is Type。函数返回 true 时，TypeScript 把这个参数收窄成那个类型。filter(isFish) 之后元素是 Fish，不必再断言。",
          "谓词是你对编译器的承诺。实现里如果判断写错，运行时仍会进来别的值，类型系统不会再帮你查。谓词内部要把真正的判别条件写完。",
          "函数重载用多条调用签名加一条实现签名。调用方只看见前面的签名，实现签名要能覆盖全部调用。适合「入参类型不同、返回值跟着变」而且每条都能写清楚的 API。",
          "只有两种情况、返回值可以用条件类型表达时，一个泛型函数比一串重载好读。重载超过三四条，调用解析会变得难解释。",
          "声明文件里可以只写调用签名。实现在 JS 里时，类型和运行时要自己保持一致，编译器不会去对 JS 函数体。",
          "断言 as 跳过检查。谓词和收窄是把证据写出来。能用 in、判别字段或谓词的地方，不要 as。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "type Shape = { kind: \"circle\"; r: number } | { kind: \"rect\"; w: number };\nfunction isCircle(shape: Shape): shape is Extract<Shape, { kind: \"circle\" }> {\n  return shape.kind === \"circle\";\n}",
      },
    ],
    followUps: ["asserts value is Type 和返回布尔的谓词，在调用方式上有什么不同？"],
  },
  {
    id: "fe-ts-variance",
    category: "frontend",
    title: "函数参数的逆变",
    difficulty: "hard",
    tags: ["TypeScript", "类型"],
    prompt: "Dog 是 Animal 的子类型。为什么 (animal: Animal) => void 可以当成 (dog: Dog) => void，反过来却不行？",
    parts: [
      {
        type: "list",
        items: [
          "返回值是协变的：函数实际返回 Dog，用在承诺返回 Animal 的位置是安全的，因为调用方只依赖 Animal 上的能力。",
          "参数是逆变的：一个能处理任意 Animal 的函数，拿来处理 Dog 是安全的。反过来，一个只会处理 Dog 的函数，不能用在可能传入 Cat 的位置。",
          "strictFunctionTypes 打开后，用函数类型字面量写出的参数按逆变检查。这是推荐打开的严格项。",
          "类和接口里的方法语法仍是双变的，这是为了兼容 Array<T> 这类历史类型。方法位上的回调没有函数类型那么严。真正在意安全时，把回调写成属性上的函数类型。",
          "只读的生产者可以协变，只写的消费者要逆变。Promise<Dog> 可以赋给 Promise<Animal>。可变数组按理两种方向都不安全，但 TypeScript 的方法参数是双变的，所以 Array<Dog> 仍能赋给 Array<Animal>，这是已知的洞。",
          "面试时用「调用方会传入什么」来推，不要背「子类型能不能赋给父类型」这一句。方向取决于这个类型参数出现在参数上还是返回值上。",
        ],
      },
    ],
    followUps: ["Promise<Dog> 能不能赋给 Promise<Animal>？Array<Dog> 呢？"],
  },
  {
    id: "fe-ts-mapped",
    category: "frontend",
    title: "映射类型和模板字面量类型",
    difficulty: "hard",
    tags: ["TypeScript", "类型"],
    prompt: "怎么从一个字段列表生成对应的 getter 名字，或者把接口里所有事件回调的参数提出来？",
    parts: [
      {
        type: "list",
        items: [
          "映射类型遍历键：{ [K in keyof T]: ... }。Partial、Required、Readonly 都是它。键可以改名：as `get${Capitalize<string & K>}`。",
          "模板字面量类型把字符串拼起来，也能拆开。`on${string}` 这种模式用来约束事件名。infer 可以在条件类型里把某一段抠出来。",
          "条件类型遇到裸类型参数的联合时会分配：T extends U ? A : B 对 T 的每个成员分别计算再并起来。不想分配时，把 T 包成 [T] extends [U]。",
          "key remapping 里 as 的结果如果是 never，这个键会被去掉。可以用来按值的类型过滤字段。",
          "这些类型适合生成和源类型绑在一起的 API，例如表格列、表单字段、事件映射。手写一份平行的联合类型，源类型一改就会悄悄对不上。",
          "复杂类型要能在编辑器里展开看懂。一层映射看不懂时，拆成有名字的中间类型，不要嵌四层条件类型。",
        ],
      },
    ],
    followUps: ["Capitalize 对中文键或已经是大写的键会做什么？"],
  },
  {
    id: "fe-ts-brand",
    category: "frontend",
    title: "品牌类型模拟名义类型",
    difficulty: "medium",
    tags: ["TypeScript", "类型"],
    prompt: "UserId 和 OrderId 在运行时都是字符串，怎么让编译器拒绝把其中一个传给另一个参数？",
    parts: [
      {
        type: "list",
        items: [
          "TypeScript 的对象类型是结构类型：只要字段相容就能赋值。两个 type 别名如果都是 string，它们就是同一个类型。",
          "品牌类型在结构上加一个实际不会存在的标记，通常用 unique symbol 做键：type UserId = string & { readonly [brand]: \"UserId\" }。两种品牌相交不到一起，就不能混传。",
          "标记只在类型层。运行时仍是普通字符串。入口函数负责校验并做类型断言，例如从接口读出来之后立刻包成 UserId，业务代码往后只收 UserId。",
          "不要在每个使用点 as。断言散落之后，品牌就只是看起来安全。校验放在边界：解析路由参数、读接口、读表单的那一个函数。",
          "Zod、Valibot 这类库可以在解析成功后返回带品牌的类型，类型和运行时校验绑在同一步。",
          "枚举能提供一定的名义区分，但字符串枚举的运行时开销、数字枚举的反向映射都是另一题。ID 这种本质是字符串的值，品牌比枚举合适。",
        ],
      },
    ],
    followUps: ["品牌类型能阻止别人在运行时伪造一个字符串传进来吗？"],
  },

  // ============ 性能 ============
  {
    id: "fe-perf-skeleton",
    category: "frontend",
    title: "骨架屏和布局稳定",
    difficulty: "easy",
    tags: ["性能", "体验"],
    prompt: "接口慢的时候，转圈和骨架屏怎么选？骨架本身怎样才不会让 CLS 变差？",
    parts: [
      {
        type: "list",
        items: [
          "转圈适合不知道结果长什么样的短等待（提交按钮、保存）。整页或一整块内容用转圈，用户无法判断要等多久，也容易把下面的内容顶开。",
          "骨架屏提前占住最终布局：头像、标题、卡片的位置和最终结果一致。数据到达后是替换内容，不是插入一块新区域。",
          "占位尺寸写死或和真实组件共用同一套宽高比。图片位用 aspect-ratio。骨架比真实内容高一截，替换时仍会位移。",
          "骨架不要闪一下就换成另一套加载态。请求很快（例如 200ms 内）可以延迟显示骨架，避免快请求也闪一帧灰块。",
          "列表骨架的条数按容器高度估计，不要写死 20 条把页脚推得很远。加载失败要换成错误和重试，不能一直停在骨架上。",
          "骨架是 CSS 绘制的块，不要用大 GIF。动画用 transform 和 opacity，并尊重 prefers-reduced-motion。",
        ],
      },
    ],
    followUps: ["SSR 已经吐出正文时，再在客户端先画骨架会发生什么？"],
  },
  {
    id: "fe-perf-split",
    category: "frontend",
    title: "按路由拆包",
    difficulty: "medium",
    tags: ["性能", "工程化"],
    prompt: "首屏 JS 过大，负责人说「把每个组件都 dynamic import」。为什么这常常更慢？拆包应该拆在哪？",
    parts: [
      {
        type: "list",
        items: [
          "每个动态 import 都是一次请求和一次模块求值。组件拆得比路由还碎时，首屏要等一串依赖瀑布，瀑布比一个稍大的包更慢。",
          "按路由拆：当前页的代码进首屏，设置页、后台页、富文本编辑器这类重模块单独成块。用户点到再拉，或在空闲时预取下一跳。",
          "重依赖单独拆：地图、图表、代码高亮、markdown 引擎。不要让它们因为被一个角落 import 了，就进所有页面共用的主包。",
          "稳定的框架运行时和多页共用的组件可以留在长期缓存的块里。业务天天改的代码和一年不动的运行时分开，发版才不会让用户把两份都重新下。",
          "拆完看覆盖率：首屏实际执行了多少。拆出去但又同步等待的代码，只是把同一段时间切成多次往返。",
          "HTTP/2 之后「文件多」不再等于「连接多」，但请求数、缓存粒度和依赖顺序仍要设计。不是文件越多越好。",
        ],
      },
    ],
    followUps: ["两个路由共用一个很重的组件，它应该进主包还是进一个异步公共块？"],
  },
  {
    id: "fe-perf-yield",
    category: "frontend",
    title: "长任务里把主线程让出去",
    difficulty: "hard",
    tags: ["性能", "INP"],
    prompt: "一次点击里要处理上万条数据，火焰图里是一整块 200ms 的长任务。在不能改成 Worker 的前提下，怎么让输入先有响应？",
    parts: [
      {
        type: "list",
        items: [
          "长任务是主线程上超过 50ms 的连续执行。这段时间里输入、渲染都排不上，INP 直接变差。",
          "把工作切成小段，每段之后把控制权交还浏览器。调度 API 可用时用 scheduler.yield()，它返回的 Promise 在让出之后、以原优先级继续。没有这个 API 时退到 setTimeout(fn, 0)，优先级更低，也更容易被别的定时器挤开。",
          "requestIdleCallback 只适合「做不做都行」的工作。它在忙时会一直不调用，页面对用户的承诺不能放在里面。",
          "切分点选在数据块之间，每块控制在几毫秒。切得太碎，调度开销比计算还大。处理时不要每条都读 DOM。",
          "先给用户反馈（按钮进入进行中、先画出前 50 条），再在后续切片里补完。用户感知的是第一次有响应的时间，不是函数最终 return 的时间。",
          "纯计算且不碰 DOM 的大块数据，仍应该放进 Worker。yield 是主线程上的让步，不是并行。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "async function processAll(items: Item[]) {\n  const chunk = 200;\n  for (let i = 0; i < items.length; i += chunk) {\n    consume(items.slice(i, i + chunk));\n    await yieldToMain();\n  }\n}\nfunction yieldToMain() {\n  const scheduler = globalThis.scheduler;\n  if (scheduler?.yield) return scheduler.yield();\n  return new Promise((resolve) => setTimeout(resolve, 0));\n}",
      },
    ],
    followUps: ["切片更新 React state 时，怎样避免每一片都触发一次完整提交？"],
  },

  // ============ 手写题 ============
  {
    id: "fe-hand-instanceof",
    category: "frontend",
    title: "手写 instanceof",
    difficulty: "easy",
    tags: ["手写", "原型"],
    prompt: "不用 instanceof，判断一个对象的原型链上有没有某个构造函数的 prototype。跨窗口时为什么会失效？",
    parts: [
      {
        type: "list",
        items: [
          "从对象出发，用 Object.getPrototypeOf 一层层往上走，直到 null。某一层和构造函数的 prototype 是同一个引用就返回 true。",
          "原始值没有对象的原型链。1 instanceof Number 是 false，手写时对 null 和非对象直接返回 false，不要装箱。",
          "这只是比较引用。iframe 有自己的全局对象，两边的 Array.prototype 不是同一个，数组跨窗口时 instanceof Array 会失败。跨窗口用 Array.isArray，它看的是品牌而不是原型引用。",
          "构造函数如果实现了 Symbol.hasInstance，原生 instanceof 会走那条路径。手写的原型链版本不会，面试时要说出来。",
          "不要用 constructor 比较。constructor 可以被改，而且查的是自身属性，不是整条链。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function myInstanceof(value: unknown, ctor: Function): boolean {\n  if (value == null || (typeof value !== \"object\" && typeof value !== \"function\")) {\n    return false;\n  }\n  let current: object | null = Object.getPrototypeOf(value);\n  while (current) {\n    if (current === ctor.prototype) return true;\n    current = Object.getPrototypeOf(current);\n  }\n  return false;\n}",
      },
    ],
    followUps: ["Object.create(null) 创建的对象，instanceof Object 是什么结果？"],
  },
  {
    id: "fe-hand-memo",
    category: "frontend",
    title: "手写函数缓存",
    difficulty: "medium",
    tags: ["手写", "性能"],
    prompt: "一个纯函数入参是对象，希望同一引用第二次直接返回上次的结果。缓存为什么用 WeakMap，而不是 Map？",
    parts: [
      {
        type: "list",
        items: [
          "只缓存纯函数。函数会改入参、读时间或发请求时，缓存会把第一次的副作用结果永远交出去。",
          "入参是对象时用 WeakMap：键是对象引用，外面不再持有这个对象时，缓存条目可以一起被回收。普通 Map 会把每个入参留到进程结束。",
          "WeakMap 的键不能是原始值。字符串、数字参数用 Map，并且要有上限或 LRU，否则按用户输入缓存会无限长。",
          "多个参数可以嵌套 Map，或者只在参数都是可序列化数据时生成键。JSON.stringify 会受键顺序和 undefined 影响，不能当成通用方案。",
          "返回对象时，调用方如果改了返回值，下一调用拿到的是改过的同一份。要么约定返回值不可变，要么缓存前拷贝。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function memoize<A extends object, R>(fn: (arg: A) => R) {\n  const cache = new WeakMap<A, R>();\n  return (arg: A): R => {\n    if (cache.has(arg)) return cache.get(arg) as R;\n    const value = fn(arg);\n    cache.set(arg, value);\n    return value;\n  };\n}",
      },
    ],
    followUps: ["fn 抛错时，这次失败要不要写进缓存？"],
  },
  {
    id: "fe-hand-inherit",
    category: "frontend",
    title: "手写寄生组合继承",
    difficulty: "medium",
    tags: ["手写", "原型"],
    prompt: "不用 class，让 Child 继承 Parent 的实例属性和原型方法。Child.prototype = new Parent() 错在哪？",
    parts: [
      {
        type: "list",
        items: [
          "组合继承要做两件事：构造函数里 Parent.call(this, ...) 继承实例属性；原型链继承方法，并且只继承一次。",
          "Child.prototype = new Parent() 会执行父构造函数。父级的实例字段跑到子级原型上，变成所有实例共享；父级如果依赖参数，这次调用还没有参数。",
          "正确的原型连接是 Child.prototype = Object.create(Parent.prototype)，再把 constructor 指回 Child。Object.create 不会运行父构造函数。",
          "静态属性不会沿着 prototype 走。class extends 还会把子构造函数的 [[Prototype]] 设为父构造函数。手写时用 Object.setPrototypeOf(Child, Parent)。",
          "方法加在 Child.prototype 上，不要加在实例上。判断继承用原型链，而不是把父级方法拷贝一份到子级。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "function Parent(name) {\n  this.name = name;\n}\nParent.prototype.say = function () {\n  return this.name;\n};\nfunction Child(name, age) {\n  Parent.call(this, name);\n  this.age = age;\n}\nChild.prototype = Object.create(Parent.prototype);\nChild.prototype.constructor = Child;",
      },
    ],
    followUps: ["这个写法和 class Child extends Parent 生成的原型链，差在静态方法上还是实例方法上？"],
  },
  {
    id: "fe-hand-sleep",
    category: "frontend",
    title: "手写 sleep 和串行执行",
    difficulty: "easy",
    tags: ["手写", "异步"],
    prompt: "实现 sleep(ms)。一组返回 Promise 的任务要严格一个接一个执行，为什么 forEach 加 async 做不到？",
    parts: [
      {
        type: "list",
        items: [
          "sleep 就是在指定时间后 resolve 的 Promise。它不阻塞当前调用栈，只是让 await 它的异步函数暂停。",
          "forEach 的回调是同步调用的。回调是 async 函数时，forEach 不会等这个 Promise，循环会马上走完，任务全部并行。",
          "串行用 for...of 配 await，或者 reduce 出一条 Promise 链。for...of 能中途 break，也更易读。",
          "Promise.all 是等全部完成，同时开始。串行是上一个完成才开始下一个。限流是中间态，最多 N 个同时跑，那是调度器，不是 sleep。",
          "sleep 只保证最早在 ms 之后恢复，不保证准时。页面在后台时定时器会被节流到更长。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));\n\nasync function runSerial<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {\n  const results: T[] = [];\n  for (const task of tasks) results.push(await task());\n  return results;\n}",
      },
    ],
    followUps: ["串行过程中某一个失败了，后面的任务还要不要继续？你会把这个选择做成参数吗？"],
  },
  {
    id: "fe-hand-path",
    category: "frontend",
    title: "手写按路径取值",
    difficulty: "medium",
    tags: ["手写", "对象"],
    prompt: "实现 get(obj, \"a.b[0].c\", defaultValue)。中间任何一截是 null 时返回默认值，不要抛错。",
    parts: [
      {
        type: "list",
        items: [
          "先把路径拆成键序列。a.b[0].c 变成 [\"a\", \"b\", \"0\", \"c\"]。方括号和点是两种写法，数字键在对象里仍是字符串。",
          "从对象开始逐段往下走。当前值是 null 或 undefined 就停，返回默认值。不要用 ||，否则 0 和空字符串会被当成缺失。",
          "不要用 eval 或 with。路径来自用户时更不能这样做。",
          "数组下标先确认当前值是对象或数组再访问。遇到原始值还继续取属性，会拿到装箱后的临时对象，结果难解释，直接停更合适。",
          "默认值只在没找到时使用。找到的值就是 undefined 时，要和「路径不存在」区分的话，需要额外约定，面试里说明白即可。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function get(source: unknown, path: string, fallback?: unknown): unknown {\n  const keys = path.split(/\\.|\\[|\\]/).filter(Boolean);\n  let current: unknown = source;\n  for (const key of keys) {\n    if (current == null || typeof current !== \"object\") return fallback;\n    current = (current as Record<string, unknown>)[key];\n  }\n  return current === undefined ? fallback : current;\n}",
      },
    ],
    followUps: ["路径里有真正带点的键，这种拆法会怎样？你怎么改协议？"],
  },
  {
    id: "fe-hand-observe",
    category: "frontend",
    title: "手写一个最小响应式",
    difficulty: "hard",
    tags: ["手写", "Vue"],
    prompt: "用 Object.defineProperty 实现一个只能观察已有字段的 reactive，并在 effect 里自动收集依赖。新增属性为什么观察不到？",
    parts: [
      {
        type: "list",
        items: [
          "defineProperty 只能劫持对象上已经存在的属性。读的时候 get 收集当前 effect，写的时候 set 通知这些 effect 重跑。",
          "用一个全局 currentEffect。effect(fn) 执行 fn 之前把它设为当前，fn 里读到的属性就把这个 effect 放进自己的订阅集合，执行完再清空。",
          "订阅集合用 Set，同一个 effect 读两次不要登记两次。示例里的通知是同步 forEach，effect 里再写同一个字段会重入。正式实现要先拷一份，或把 effect 放进队列，一轮只跑一次。",
          "示例只包住已有的一层字段。嵌套对象要在定义时递归观察，并跳过 null 和已经观察过的对象，否则循环引用会栈溢出。这是 Vue 2 的思路：后加的属性没有访问器，所以要 Vue.set；数组下标和 length 也要另外打补丁。",
          "Proxy 可以拦住 get、set、deleteProperty 和 in，新增属性也能观察到，所以 Vue 3 换了实现。手写到 defineProperty 为止即可，把这个界限说清楚。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "let current: (() => void) | null = null;\nconst subs = new WeakMap<object, Map<string, Set<() => void>>>();\n\nfunction effect(fn: () => void) {\n  current = fn;\n  fn();\n  current = null;\n}\nfunction reactive<T extends object>(obj: T): T {\n  for (const key of Object.keys(obj)) {\n    let value = obj[key as keyof T];\n    Object.defineProperty(obj, key, {\n      get() {\n        if (current) {\n          let bucket = subs.get(obj);\n          if (!bucket) subs.set(obj, (bucket = new Map()));\n          let deps = bucket.get(key);\n          if (!deps) bucket.set(key, (deps = new Set()));\n          deps.add(current);\n        }\n        return value;\n      },\n      set(next) {\n        value = next;\n        subs.get(obj)?.get(key)?.forEach((fn) => fn());\n      },\n    });\n  }\n  return obj;\n}",
      },
    ],
    followUps: ["effect 里读了 a 又写了 a，这个最小实现会怎样？Vue 的调度器怎么避免？"],
  },

  // ============ 工程化 ============
  {
    id: "fe-eng-test",
    category: "frontend",
    title: "前端测试测行为",
    difficulty: "medium",
    tags: ["工程化", "测试"],
    prompt: "一个搜索框组件，你要测「输入后发出请求」。为什么不建议直接断言内部的 state 或 class 名？mock 应该落在哪一层？",
    parts: [
      {
        type: "list",
        items: [
          "测试用户能观察到的行为：角色、名字、输入后屏幕上出现什么、发出的请求长什么样。实现换成别的 state 结构时，这种测试还在。",
          "断言 class 名、组件实例的 state、私有函数被调用了几次，会把测试焊在实现上。重构一下就全红，而且没证明用户路径是通的。",
          "查询优先用 getByRole。按钮和输入框有可访问的名字，测试顺便把无障碍的合同固定下来。",
          "网络放在边界上模拟：拦截 fetch 或用 MSW 看请求路径和参数，返回固定 JSON。不要把组件内部的每个函数都 jest.mock 掉，否则测的是 mock 之间的调用。",
          "防抖和定时器用假定时器，并让用户事件和时钟一起前进。只 mock Date.now 却让 setTimeout 真等，测试会又慢又抖。",
          "快照适合稳定的纯展示。整页快照一改文案就失效，没人看 diff 就更新，这种测试等于没有。",
        ],
      },
    ],
    followUps: ["接口返回 500 时，你期望测试看到加载中、错误文案，还是一个抛出的异常？"],
  },
  {
    id: "fe-eng-lint",
    category: "frontend",
    title: "提交前的检查放哪",
    difficulty: "easy",
    tags: ["工程化", "质量"],
    prompt: "团队说「大家都装了 ESLint 插件」。为什么 CI 里还要再跑一遍类型检查和 lint？pre-commit 适合跑多重的检查？",
    parts: [
      {
        type: "list",
        items: [
          "编辑器插件是个人环境。没装、关了、或只打开了部分文件，都不会拦住提交。能被绕过的检查就不是门禁。",
          "CI 上跑 tsc --noEmit、eslint 和测试，和本地环境无关。合并的唯一标准是这条流水线，而不是某人机器上是绿的。",
          "pre-commit 适合快的检查：暂存文件的格式和 lint。全量类型检查和整库测试放 CI，不然每次提交等几十秒，大家会跳过钩子。",
          "格式化用同一套配置写入文件，CI 只检查有没有格式差，不要在流水线里悄悄改文件。",
          "钩子不是安全边界。--no-verify 就能跳过。真正不能跳的是服务器上的检查，分支保护要求它通过才能合。",
          "类型检查和 lint 看的是不同的东西。any 能让 lint 安静但类型是空的；类型对了也不代表 Hooks 的依赖数组写对了。两个都要。",
        ],
      },
    ],
    followUps: ["lint-staged 只查暂存文件时，改一个类型定义却不提交使用方，会漏掉什么？"],
  },
  {
    id: "fe-eng-flag",
    category: "frontend",
    title: "功能开关和回滚",
    difficulty: "medium",
    tags: ["工程化", "发布"],
    prompt: "新结账流程要先给 5% 的用户。开关放在前端包里和放在远程配置里，回滚速度有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "编译期开关（打包时把未开启的分支摇掉）适合还不能见到用户的半成品。要回滚就得重新发版，而且旧的 index.html 若被缓存，用户还会拿到旧决策。",
          "远程配置在运行时拉一次：按用户 id 的哈希分桶，5% 命中新流程。出问题把配置改回 0，不必等构建。已打开的页面要有一份内存里的值，不要每个点击都等配置接口。",
          "危险功能默认关闭。配置接口失败时走旧路径，不要失败成「全量打开」。",
          "开关只决定 UI 和调用哪个前端分支。权限仍由服务端校验。只在前端藏起按钮，接口不验，等于没有权限。",
          "index.html 本身用 no-cache，静态资源用文件名哈希长期缓存。回滚应用或回滚配置时，用户才能马上拿到新的入口。",
          "开关要有主人、过期时间和删除日期。留在代码里的旧开关会让每条路径都乘二，半年后没人敢动。",
        ],
      },
    ],
    followUps: ["按用户分桶时，同一个用户今天和明天的结果必须一样吗？哈希输入该选什么？"],
  },
  {
    id: "fe-eng-bem",
    category: "frontend",
    title: "BEM、令牌和样式隔离",
    difficulty: "easy",
    tags: ["CSS", "工程化"],
    prompt: "没有 CSS Modules 的老项目，怎么让类名和颜色不要互相覆盖？设计令牌应该收哪一层？",
    parts: [
      {
        type: "list",
        items: [
          "BEM 把名字分成块、元素、修饰符：card、card__title、card--selected。元素类名里带块的前缀，就不会和另一块的 title 撞车。",
          "修饰符表达状态，不要再写 .card.active 这种会漏到别的块的全局类。状态也可以用 data-state，配合属性选择器。",
          "颜色、间距、字号、圆角收成令牌，用 CSS 变量定义在高层。组件使用 var(--space-3)，不写死 12px。改主题时改令牌，而不是全局搜索十六进制。",
          "隔离还有三条路：CSS Modules 改写类名、Shadow DOM 封住子树、@layer 规定覆盖顺序。BEM 是命名约定，后三条是机制。老项目可以先 BEM，新代码再进模块。",
          "不要用元素选择器加 !important 修覆盖。优先级一旦开始竞赛，后面每条规则都要更长。",
          "令牌是设计决定，不是前端私有变量。设计和代码共用一份名字，评审时才说得清「这是主色」还是「这是某个页面随手取的蓝」。",
        ],
      },
    ],
    followUps: ["工具类已经能表达间距之后，BEM 的元素类还留着做什么？"],
  },

  // ============ Web 安全 ============
  {
    id: "fe-security-sri",
    category: "frontend",
    title: "第三方脚本和 SRI",
    difficulty: "medium",
    tags: ["安全", "HTML"],
    prompt: "页面从 CDN 引了一个库。CDN 被换掉内容时，浏览器怎样拒绝执行？只有 SRI 够不够？",
    parts: [
      {
        type: "list",
        items: [
          "子资源完整性：script 或 link 上带 integrity=\"sha384-...\"，浏览器下载后先哈希，对不上就不执行。内容被篡改、被换成另一份构建，都会失败。",
          "跨源脚本要同时写 crossorigin=\"anonymous\"，否则浏览器拿不到可校验的响应，完整性检查直接失败。CDN 也得回 CORS 头。",
          "哈希锁的是字节。你正常发版更新这个文件时，必须一起更新哈希。SRI 不能区分「恶意替换」和「你忘了改哈希」。",
          "它保护不了同源、由你自己的服务器动态输出的 HTML，也保护不了运行时再 document.write 出来的脚本。",
          "第三方统计、客服、A/B 脚本常常不能加 SRI，因为对方会不通知你就改文件。更稳的办法是自托管固定版本，或放进 sandbox iframe，再用 CSP 的 script-src 收紧允许的源。",
          "Permissions-Policy 关掉这些脚本用不到的能力（摄像头、地理定位、支付）。即使脚本被执行，权限也小一圈。",
        ],
      },
    ],
    followUps: ["integrity 校验失败时，页面上的备用方案怎么写？onerror 能接到吗？"],
  },
  {
    id: "fe-security-redirect",
    category: "frontend",
    title: "开放重定向",
    difficulty: "medium",
    tags: ["安全", "路由"],
    prompt: "登录成功后跳到 ?next= 参数指定的地址。直接 location.href = next 会怎样被利用？",
    parts: [
      {
        type: "list",
        items: [
          "开放重定向让攻击者给出你们域名下的链接，登录或点击之后落到钓鱼站。用户看地址栏的前半段是可信域名，警惕会低一截。",
          "next=https://evil.example、next=//evil.example、以及夹杂反斜杠和编码的写法，都不能信。只允许站内相对路径也不够，// 开头会被当成协议相对 URL。",
          "可靠做法：用 new URL(next, location.origin) 解析，再比较 url.origin 和 location.origin。只取 pathname 加 search 作为站内跳转。解析失败就回首页。",
          "拒绝 javascript: 和 data:。它们不是「另一个页面」，赋值给 location 会执行脚本。",
          "服务端 302 的 Location 同样要做这套校验。只在前端改，接口仍会把用户带出站。",
          "能不用跳转参数就用固定的登录后页面。必须带回原页面时，只存站内路径，或者存一个服务端发的短期票据，不存完整 URL。",
        ],
      },
    ],
    followUps: ["next 用 encodeURIComponent 包一层再解码，能代替源的比较吗？"],
  },
  {
    id: "fe-security-secret",
    category: "frontend",
    title: "前端包里没有秘密",
    difficulty: "easy",
    tags: ["安全", "工程化"],
    prompt: "有人把私钥放进 VITE_PRIVATE_KEY，觉得没有打印到控制台就安全。浏览器里到底能看到什么？",
    parts: [
      {
        type: "list",
        items: [
          "打进包的任何字符串，用户都能在源码、source map 或网络响应里看到。Vite 的 VITE_ 和 Next 的 NEXT_PUBLIC_ 就是明确会进客户端的环境变量。",
          "不存在「只在前端用的私钥」。签名、解密、支付密钥放在浏览器里，就等于交给每个访客。需要秘密的调用放到服务端，浏览器只拿短期的用户令牌。",
          "地图、统计这类厂商密钥如果必须出现在前端，只能靠厂商后台的域名白名单和配额限制，不能靠保密。白名单防的是别人嵌你的密钥，防不住在你自己的域名上滥用。",
          "访问令牌放在 httpOnly、Secure、SameSite 严格的 Cookie 里，JS 读不到，XSS 也就偷不走。放进 localStorage，任何能执行的脚本都能读。",
          "source map、错误上报附带的局部变量、打在 URL 上的 token，都是另一条泄露通道。token 放查询串还会进访问日志和 Referer。",
          "仓库里已经提交过的秘密，删掉那次提交不够。要在厂商那里轮换，并认为旧值已经公开。",
        ],
      },
    ],
    followUps: ["SSR 的服务端代码和客户端组件写在一个文件里时，秘密怎样才会被一起打进浏览器包？"],
  },

  // ============ AI 工程 ============
  {
    id: "fe-ai-schema",
    category: "frontend",
    title: "让模型按结构返回",
    difficulty: "medium",
    tags: ["AI", "接口"],
    prompt: "希望模型返回 { title, steps[] } 来渲染一个卡片。为什么不要让它「用 JSON 回答」再正则截取？",
    parts: [
      {
        type: "list",
        items: [
          "自由文本里的 JSON 会被前后说明、Markdown 围栏、注释截断。正则能碰到的只是常见情况，下一次模型多写一个逗号就解析失败。",
          "用接口提供的结构化输出：JSON Schema、工具参数或响应格式。模型被约束在这个形状里，字段缺失和类型错误在协议层就失败，而不是到了渲染才炸。",
          "前端仍要用 schema（例如 Zod）再验一次。模型约束和你的渲染合同不是同一份代码，多验一次才能给出「重试」而不是白屏。",
          "流式输出时 JSON 在结束前都不是合法文档。不要对每个 chunk 做 JSON.parse。等完成，或使用能增量解析并容忍不完整输入的解析器，界面上分「还在生成」和「已可渲染」。",
          "失败时把原始文本留在可折叠的调试区，用户看到的是可恢复的错误。不要把未校验对象的字段直接插进 DOM。",
          "能用普通表单和接口表达的操作，不要绕给模型生成结构。结构返回适合摘要、分类、起草，不适合作为唯一的业务写入路径。",
        ],
      },
    ],
    followUps: ["用户中途点击停止生成，半截 JSON 你是丢掉还是尽量展示已经完整的字段？"],
  },
  {
    id: "fe-ai-cite",
    category: "frontend",
    title: "回答上的引用怎么展示",
    difficulty: "medium",
    tags: ["AI", "界面"],
    prompt: "检索增强的回答看起来很确定，但其中一句是编的。界面上做什么，用户才能核对，而不是只能相信整段话？",
    parts: [
      {
        type: "list",
        items: [
          "每句关键结论旁边给引用标记，标记对应检索到的片段，而不是对应整篇文档。点开能看到标题、位置和原文，原文不要换成模型改写过的「摘要」。",
          "没有检索到足够片段时，明确说资料里没有，并停止生成看起来完整的步骤。空结果也是一种成功的界面状态。",
          "引用和正文的对应由服务端给出结构化字段，不要靠前端在 Markdown 里找 [1] 这种字符。模型漏写标记时，这句就当成无来源，样式上和有来源的句子区分开。",
          "提供「这段不对」的反馈，把问题、检索片段和回答存下来。没有这条回路，界面无法变成以后的评测样本。",
          "长回答先给结论和引用，再展开。用户核对的成本如果高于重问一次，引用就等于没做。",
          "引用解决的是可核对，不是正确性本身。权限仍要在检索前过滤，用户不该看到他本来不能访问的文档片段。",
        ],
      },
    ],
    followUps: ["同一句对应三个互相矛盾的片段时，界面该怎么排？"],
  },
];
