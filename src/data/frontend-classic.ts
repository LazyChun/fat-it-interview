import type { Question } from "./types";

/**
 * 来自 2025 前端面试题合集里仍在问、题库里还没有单独成题的题目。
 * 答案按现行浏览器行为重写，不收录 IE6 Hack 和 jQuery 源码题。
 */
export const frontendClassicQuestions: Question[] = [
  {
    id: "fe-html-draw",
    category: "frontend",
    title: "Canvas 和 SVG 怎么选",
    difficulty: "medium",
    tags: ["HTML", "图形"],
    prompt: "画布和矢量图都能画图，面试里怎么讲它们的差别和适用场景？",
    parts: [
      {
        type: "list",
        items: [
          "Canvas 是位图画布。脚本拿到上下文后按像素绘制，画完就变成像素，没有可点选的图形对象。适合游戏、像素处理、大量粒子。",
          "SVG 是文档里的矢量标签。每个形状都是 DOM，可以用 CSS 和事件，放大不失真。适合图标、图表、需要单独交互的少量图形。",
          "Canvas 改一处通常要清屏重画；SVG 改一个节点即可。节点上万时 SVG 的 DOM 成本会先爆，这时应换 Canvas。",
          "Canvas 导出图片用 toDataURL / toBlob。画了跨域图片且没带 CORS，画布会被污染，导出抛错。",
          "无障碍：Canvas 默认对读屏是一块空白，要补替代文本或隐藏的数据表；SVG 里的文字本身可读。",
        ],
      },
    ],
    followUps: ["图表库什么时候用 Canvas，什么时候用 SVG？"],
  },
  {
    id: "fe-html-src",
    category: "frontend",
    title: "src 和 href 差在哪",
    difficulty: "easy",
    tags: ["HTML", "资源"],
    prompt: "img、script 用 src，a、link 用 href。这两个属性在加载行为上有什么不同？",
    parts: [
      {
        type: "list",
        items: [
          "src 是把资源嵌进当前文档：图片像素、脚本执行、iframe 文档。浏览器会去下载，脚本默认还会阻塞解析。",
          "href 是建立关联或导航：链接指向另一份文档，link 声明样式表、图标、预加载。点链接之前不会把目标页面嵌进来。",
          "改 img.src 会重新请求并替换图像。改 a.href 只改点击后去哪，当前页不刷新。",
          "空 src 有历史坑：某些旧浏览器会把空地址当成当前页再请求一次。动态赋值前不要留空字符串。",
        ],
      },
    ],
    followUps: ["link rel=stylesheet 和页面里的 style 标签，谁先参与层叠？"],
  },
  {
    id: "fe-html-alt",
    category: "frontend",
    title: "alt、title、strong、em",
    difficulty: "easy",
    tags: ["HTML", "可访问性"],
    prompt: "图片的 alt 和 title 都能出现文字，strong 和 em 看起来只是粗体斜体。面试怎么区分？",
    parts: [
      {
        type: "list",
        items: [
          "alt 是图片的替代文本。加载失败、读屏、搜索引擎都靠它。装饰图用空 alt，让读屏跳过；内容图要写这张图在说什么。",
          "title 是补充提示，鼠标悬停才出现。触摸屏几乎用不到，读屏支持也不稳定，不能拿它代替 alt 或可见标签。",
          "strong 表示重要性，em 表示强调语气。b 和 i 只是样式约定，没有这层语义。需要变粗变斜时用 CSS。",
          "按钮里的图标如果没有可见文字，要有 aria-label 或旁边的文本，不要只放 title。",
        ],
      },
    ],
    followUps: ["背景图里的信息，读屏和搜索引擎拿得到吗？"],
  },
  {
    id: "fe-html-pe",
    category: "frontend",
    title: "渐进增强和优雅降级",
    difficulty: "easy",
    tags: ["HTML", "兼容"],
    prompt: "这两个词经常一起问。它们的起点有什么不同，现在还怎么用？",
    parts: [
      {
        type: "list",
        items: [
          "渐进增强从可用的基础开始：语义 HTML 先能读、能提交，再叠 CSS，最后叠需要脚本的交互。脚本挂了，内容还在。",
          "优雅降级从完整体验开始，再为不支持的环境准备退路，例如不支持某 API 时换一条慢路径。",
          "实际工程里两者会混用。新项目用特性检测（supports、有没有这个 API），不要用浏览器名字分支。",
          "核心交易、文章正文尽量不依赖脚本才可见。增强层可以是更顺的动画、离线、拖拽。",
        ],
      },
    ],
    followUps: ["@supports 和直接写新属性让旧浏览器忽略，哪种更合适？"],
  },
  {
    id: "fe-html-replaced",
    category: "frontend",
    title: "替换元素和空元素",
    difficulty: "medium",
    tags: ["HTML", "CSS"],
    prompt: "img、input、br 为什么和普通 div 不一样？哪些标签不能写结束标签？",
    parts: [
      {
        type: "list",
        items: [
          "替换元素的内容来自元素外部：img 的像素、video 的画面、input 的控件。宽高可以作用在它们身上，即使 display 还是 inline。",
          "void 元素没有子节点，也不能写结束标签：br、hr、img、input、meta、link、source、col。里面写文字是无效的。",
          "img 没有内部文本，所以伪元素 ::before 在多数浏览器里不会出现在图片上。要加角标，得包一层元素。",
          "表单控件的默认样式来自 UA，appearance 能去掉一部分，但要自己补焦点环，不能只写 outline: none。",
        ],
      },
    ],
    followUps: ["button 里可以放 div 吗？a 里可以放 button 吗？"],
  },
  {
    id: "fe-css-alpha",
    category: "frontend",
    title: "opacity 和 rgba 的透明",
    difficulty: "easy",
    tags: ["CSS"],
    prompt: "父元素 opacity: 0.5 和背景用 rgba，子元素的表现有什么不同？",
    parts: [
      {
        type: "list",
        items: [
          "opacity 作用在整个元素及其后代，文字、边框、子元素一起变透，而且会创建层叠上下文。",
          "rgba / hsla / #rrggbbaa 只影响那一个颜色。背景半透明时，子元素文字可以保持不透明。",
          "opacity: 0 的元素仍占据布局、仍能点到（除非 pointer-events: none），读屏也可能还读得到。要彻底移出交互，用 hidden 属性或 visibility。",
          "做淡入淡出优先动画 opacity，它通常可以留在合成层。不要为了隐藏去动画 width。",
        ],
      },
    ],
    followUps: ["opacity: 0 和 visibility: hidden，谁还能被点击？"],
  },
  {
    id: "fe-css-ib",
    category: "frontend",
    title: "inline-block 的间隙和基线",
    difficulty: "medium",
    tags: ["CSS", "布局"],
    prompt: "几个 inline-block 并排，中间为什么有一条缝？底部为什么对不齐？",
    parts: [
      {
        type: "list",
        items: [
          "缝来自源码里的空白字符。inline-block 按行内排版，换行和空格会变成一个空格宽度。",
          "处理：父元素 font-size: 0 再给子元素恢复字号，或去掉标签之间的空白，或直接改用 flex / grid。",
          "默认 vertical-align 是 baseline。行内块里如果有文字，会按基线对齐，旁边的图片或空块就会看起来高低不齐。对齐用 vertical-align: top 或 middle。",
          "新布局不要再为了横排去用 inline-block。flex 没有这道缝，对齐也有专门属性。",
        ],
      },
    ],
    followUps: ["两个 img 之间的缝和 inline-block 是同一原因吗？"],
  },
  {
    id: "fe-css-pct",
    category: "frontend",
    title: "百分比相对谁",
    difficulty: "medium",
    tags: ["CSS", "布局"],
    prompt: "width、padding、margin、top 写成百分比时，参照物一样吗？绝对定位的百分比宽又相对谁？",
    parts: [
      {
        type: "list",
        items: [
          "width、max-width 的百分比相对包含块的宽度。height 的百分比相对包含块的高度，而包含块高度若由内容撑开、没有明确高度，百分比高度按 auto 处理。",
          "padding 和 margin 的四个方向，百分比都相对包含块的宽度，包括 padding-top。所以常用 padding-bottom 百分比做固定宽高比，父元素宽度一变，高度跟着变。",
          "绝对定位的 top/right/bottom/left 和百分比宽高，相对的是 padding edge 形成的包含块，不是内容盒。",
          "transform: translate(50%, 50%) 的百分比相对元素自己的边框盒，这是它和 top: 50% 不一样的地方。",
        ],
      },
    ],
    followUps: ["aspect-ratio 出现之后，还有必要用 padding 撑比例吗？"],
  },
  {
    id: "fe-css-norm",
    category: "frontend",
    title: "reset 和 normalize",
    difficulty: "easy",
    tags: ["CSS"],
    prompt: "为什么一上来要清默认样式？reset.css 和 normalize.css 目标有什么不同？",
    parts: [
      {
        type: "list",
        items: [
          "浏览器对标题、列表、按钮、表单有一套 UA 样式，各家不完全一样。不处理的话，同一份 HTML 间距和字号会对不齐。",
          "reset 把外边距、列表样式等尽量清成同一起点，之后全部自己写。代价是连有用的默认也没了，比如按钮焦点。",
          "normalize 保留合理默认，只抹平已知差异，并补上 HTML5 元素在旧环境里的显示。阅读类页面更适合这条路。",
          "组件库通常自带一层预检（preflight）。再引入一份 reset 会打两次，出现按钮没边距、标题突然变小。项目里只留一层。",
        ],
      },
    ],
    followUps: ["全局 * { margin: 0; padding: 0 } 有什么副作用？"],
  },
  {
    id: "fe-css-1px",
    category: "frontend",
    title: "移动端 1px 边框",
    difficulty: "medium",
    tags: ["CSS", "移动端"],
    prompt: "设计稿上的 1px 在手机上为什么显得粗？有哪些做法？",
    parts: [
      {
        type: "list",
        items: [
          "CSS 像素不是物理像素。设备像素比是 2 或 3 时，1px 边框会占 2 到 3 行物理像素，看起来比设计稿粗。",
          "常见做法：用伪元素铺满后 transform: scaleY(0.5)，再把元素高度限制成半像素的视觉结果。四边框则整体 scale(0.5)，宽高写成 200%。",
          "box-shadow: 0 0 0 0.5px 在部分机型上能画出更细的线，但颜色和圆角要单独试。",
          "viewport 里用 1px = 1 物理像素的写法会把整页缩放弄乱，不要为了一条线改初始缩放。",
          "高清屏上优先接受 1 个 CSS 像素，除非设计明确要求发丝线。发丝线在低端机上可能细到看不清。",
        ],
      },
    ],
    followUps: ["border: 0.5px solid 现在能不能直接用？"],
  },
  {
    id: "fe-css-link",
    category: "frontend",
    title: "link 和 @import",
    difficulty: "easy",
    tags: ["CSS", "加载"],
    prompt: "样式表用 link 引入和在 CSS 里 @import，加载顺序有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "link 在解析 HTML 时就能发现，浏览器可以并行下载多个样式表。",
          "@import 要等所属 CSS 下载并解析到这一行才发起下一次请求，等于串行，首屏更容易被拖长。",
          "link 还能带媒体查询、预加载关系。打印样式、深色模式可以用 media，不必下载后再丢掉。",
          "构建工具会把 @import 在打包时内联。源码里的 @import 如果原样发到线上，才是运行时的串行请求。",
        ],
      },
    ],
    followUps: ["样式表没有加 media，会不会阻塞首次渲染？"],
  },
  {
    id: "fe-css-lvha",
    category: "frontend",
    title: "链接伪类为什么要按顺序写",
    difficulty: "easy",
    tags: ["CSS", "选择器"],
    prompt: "a:hover 写了却在访问过的链接上不生效，通常是哪条规则盖掉了它？",
    parts: [
      {
        type: "list",
        items: [
          ":link、:visited、:hover、:active 特异性相同，后写的覆盖先写的。访问过之后元素同时匹配 :visited，如果它写在 :hover 后面，悬停色会被访问色盖住。",
          "约定顺序是 LVHA：link、visited、hover、active。需要同时悬停且已访问时，把更具体的状态放后面。",
          ":visited 能改的属性被浏览器限制在颜色一类，不能用它读出用户访问过哪些地址，否则会泄漏历史。",
          ":focus-visible 用来画键盘焦点，不要用 :hover 代替焦点样式。",
        ],
      },
    ],
    followUps: [":hover 写在移动端会留下「粘住」的悬停态，怎么避免？"],
  },
  {
    id: "fe-js-bigint",
    category: "frontend",
    title: "BigInt 解决什么",
    difficulty: "easy",
    tags: ["JavaScript", "类型"],
    prompt: "超过 Number.MAX_SAFE_INTEGER 的整数为什么不能再用 number？BigInt 和 number 能直接运算吗？",
    parts: [
      {
        type: "list",
        items: [
          "number 是 IEEE-754 双精度，安全整数只有 ±(2^53-1)。再大的整数会舍入，9007199254740992 和隔壁那个数在 number 里可以变成同一个值。",
          "BigInt 是任意精度整数，字面量加 n，或 BigInt(字符串)。不要用 BigInt(一个已经丢精度的 number) 去「补救」。",
          "BigInt 和 number 不能混算，1n + 1 会抛类型错误。比较可以用 ==，但 === 认为类型不同。",
          "JSON.stringify 对 BigInt 会抛错。接口里的雪花 ID、金额分应该用字符串，前端不要先塞进 number。",
          "Math 上的方法不接受 BigInt。需要开方、三角时先想清楚是不是真的要用整数语义。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "const id = \"9007199254740993\";\nconsole.log(Number(id)); // 精度已丢\nconsole.log(BigInt(id) === 9007199254740993n);",
      },
    ],
    followUps: ["0.1 这种小数能用 BigInt 解决吗？"],
  },
  {
    id: "fe-js-is",
    category: "frontend",
    title: "Object.is、=== 和 ==",
    difficulty: "medium",
    tags: ["JavaScript", "类型"],
    prompt: "三个相等判断里，NaN 和 -0 分别怎么处理？什么时候该用哪一个？",
    parts: [
      {
        type: "list",
        items: [
          "== 会做类型转换。null == undefined 为真，其它和 null 的比较为假。布尔会先变成数字。对象和原始值比较时，对象走 ToPrimitive。",
          "=== 不做转换。NaN === NaN 为假，+0 === -0 为真。",
          "Object.is 同样不转换，但 Object.is(NaN, NaN) 为真，Object.is(+0, -0) 为假。React 里判断状态有没有变，用的就是它。",
          "业务代码默认用 ===。只有在明确要合并 null 和 undefined，或要识别 NaN、-0 时，才换另外两个。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "console.log(NaN === NaN, Object.is(NaN, NaN));\nconsole.log(+0 === -0, Object.is(+0, -0));\nconsole.log(null == undefined, null === undefined);",
      },
    ],
    followUps: ["[] == ![] 为什么是 true？"],
  },
  {
    id: "fe-js-loose",
    category: "frontend",
    title: "让 a == 1 且 a == 2",
    difficulty: "medium",
    tags: ["JavaScript", "类型转换"],
    prompt: "不改判断式，怎么让 if (a == 1 && a == 2) 成立？这题在考什么？",
    parts: [
      {
        type: "p",
        text: "== 在一侧是对象、另一侧是数字时，会把对象转成原始值再比。转换优先走 Symbol.toPrimitive，其次 valueOf，再其次 toString。每次比较都可以返回不同的值。",
      },
      {
        type: "code",
        lang: "js",
        code: "const a = {\n  n: 1,\n  valueOf() {\n    return this.n++;\n  },\n};\nconsole.log(a == 1 && a == 2);",
      },
      {
        type: "list",
        items: [
          "这不是写业务的手法。面试用它确认你知道抽象相等会调用 ToPrimitive。",
          "数组和数字比较会先 join 成字符串再转数字：[] == 0 为真，[1,2] == \"1,2\" 为真。",
          "生产代码避免依赖这些转换。接口字段类型不稳定时，在边界上显式 Number、String，不要让 == 帮你猜。",
        ],
      },
    ],
    followUps: ["重写 valueOf 之后，这个对象当 Map 的键还会变吗？"],
  },
  {
    id: "fe-js-args",
    category: "frontend",
    title: "arguments 和剩余参数",
    difficulty: "medium",
    tags: ["JavaScript", "函数"],
    prompt: "arguments 为什么不像数组？箭头函数里为什么没有它？剩余参数解决了什么？",
    parts: [
      {
        type: "list",
        items: [
          "arguments 是类数组：有长度和下标，没有数组的方法，也没有迭代器之外的那些原型方法。它把传入的实参都收进来，包括没有对应形参的。",
          "非严格模式下，arguments[i] 和对应形参互相别名，改一个另一个跟着变。严格模式取消了这个绑定。",
          "箭头函数没有自己的 arguments，沿词法去外层找。外层要是也是箭头，会一直找到普通函数。",
          "剩余参数 ...args 是真正的数组，只包含形参没有接住的部分，而且没有别名问题。新代码用它。",
          "callee、caller 在严格模式不可用。递归写函数名，或把函数放进常量再调用。",
        ],
      },
    ],
    followUps: ["默认参数和 arguments.length 同时存在时，length 算不算默认值？"],
  },
  {
    id: "fe-js-each",
    category: "frontend",
    title: "forEach 里的 return 和 await",
    difficulty: "medium",
    tags: ["JavaScript", "数组"],
    prompt: "想在 forEach 里提前结束，return 有用吗？回调写成 async，外面的 await 等得住吗？",
    parts: [
      {
        type: "list",
        items: [
          "forEach 的回调里 return 只结束这一次回调，循环继续。它不支持 break。要中途停，用 for、for...of、some 或 every。",
          "forEach 不处理回调的返回值。async 回调返回的是 Promise，forEach 直接丢掉，外层 await 一个 forEach 调用等不到里面的请求。",
          "需要按顺序等待：for...of 里 await。可以并发：map 出一组 Promise 再 Promise.all，并自己限制并发数。",
          "forEach 还会跳过稀疏数组的空位。for 循环不会。处理有空位的数组时不要混用两种假设。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "async function run(ids) {\n  const tasks = ids.map((id) => fetch(\"/api/\" + id));\n  const responses = await Promise.all(tasks);\n  return responses;\n}",
      },
    ],
    followUps: ["map 里写 async，得到的数组里是值还是 Promise？"],
  },
  {
    id: "fe-js-wrap",
    category: "frontend",
    title: "基本类型为什么能点方法",
    difficulty: "medium",
    tags: ["JavaScript", "类型"],
    prompt: "'hello'.toUpperCase() 和 (1).toFixed(2) 为什么合法？和 new String 有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "读属性时，字符串、数字、布尔、BigInt、Symbol 会被临时装进对应的包装对象，方法从包装对象的原型上找到，调用完包装对象就丢弃。",
          "所以不能在基本类型上挂自定义属性：obj.foo = 1 写到临时包装上，下一行再读就是 undefined。",
          "new String('a') 是对象，typeof 是 object，和字符串 'a' 用 === 不相等。接口和判断里不要混用。",
          "null 和 undefined 没有包装，对它们读属性会抛错。先用可选链或显式判断。",
          "字面量 1.toFixed(2) 会解析失败，点被当成小数点。写成 (1).toFixed(2) 或 1..toFixed(2)。",
        ],
      },
    ],
    followUps: ["typeof new Number(1) 和 typeof Number(1) 分别是什么？"],
  },
  {
    id: "fe-js-lock",
    category: "frontend",
    title: "冻结、密封和禁止扩展",
    difficulty: "medium",
    tags: ["JavaScript", "对象"],
    prompt: "preventExtensions、seal、freeze 各锁住哪一层？freeze 能防住嵌套对象被改吗？",
    parts: [
      {
        type: "list",
        items: [
          "preventExtensions：不能新增自身属性，已有属性仍能改、能删。",
          "seal：在上一层之上把全部自身属性标成不可配置，不能删，不能改描述符，但仍能改可写属性的值。",
          "freeze：再把数据属性标成不可写。严格模式下修改、新增、删除都会抛错；非严格模式静默失败。",
          "三者都是浅的。嵌套对象要递归处理，并且用 WeakSet 记住已经走过的对象，避免循环引用死递归。",
          "冻结不能代替拷贝。调用方如果还握着内部对象的引用，你冻结的是那个对象，不是「别人那份」。",
          "Object.isFrozen / isSealed / isExtensible 用来检查。冻结后属性默认仍可枚举。",
        ],
      },
    ],
    followUps: ["freeze 一个数组之后，push 和改下标分别会怎样？"],
  },
  {
    id: "fe-js-fn",
    category: "frontend",
    title: "函数声明和函数表达式",
    difficulty: "easy",
    tags: ["JavaScript", "作用域"],
    prompt: "function foo(){} 和 const foo = function(){} 在提升、覆盖和递归上有什么不同？",
    parts: [
      {
        type: "list",
        items: [
          "函数声明在创建执行上下文时整体初始化，同一作用域里可以在声明行之前调用。同名时，后一个函数声明覆盖前一个。",
          "函数表达式的初始化跟在赋值之后。用 const / let 承接时，赋值前处于暂时性死区。",
          "表达式可以是匿名的。递归或需要函数名做调试时，写具名函数表达式，这个名字只在函数内部可见。",
          "块里的函数声明在严格模式下属于该块。老的非严格浏览器曾经把块级函数声明提升到函数作用域，不要依赖这种写法。",
          "立即执行要用表达式：(function () {})() 或箭头函数。单独的 function 声明不能直接跟括号调用。",
        ],
      },
    ],
    followUps: ["把函数当参数传入时，声明和表达式还有差别吗？"],
  },
  {
    id: "fe-js-alike",
    category: "frontend",
    title: "类数组怎么变成数组",
    difficulty: "easy",
    tags: ["JavaScript", "数组"],
    prompt: "arguments、NodeList、jQuery 对象都有下标和 length，为什么还要转数组？有哪些转法？",
    parts: [
      {
        type: "list",
        items: [
          "类数组只保证按下标访问和 length，不一定有 map、filter，也不一定可迭代。DOM 的 NodeList 现在可以 for...of，arguments 也可以，但老集合不一定行。",
          "可迭代的用 Array.from 或扩展运算符。Array.from 还能传映射函数，适合一边转一边改。",
          "只有下标和 length、不可迭代时，用 Array.prototype.slice.call(list)。扩展运算符对这种对象会抛错。",
          "转出来的是浅拷贝的新数组。节点仍是原来的节点，改元素属性会反映到文档上。",
          "不要为了调用一个方法就转数组。能用 for...of 就地处理时，少一次分配。",
        ],
      },
    ],
    followUps: ["HTMLCollection 是活的，转成数组之后再改 DOM，数组会跟着变吗？"],
  },
  {
    id: "fe-js-nan",
    category: "frontend",
    title: "NaN 是怎么来的",
    difficulty: "easy",
    tags: ["JavaScript", "类型"],
    prompt: "NaN 属于什么类型？为什么它不等于自己？isNaN 和 Number.isNaN 用哪个？",
    parts: [
      {
        type: "list",
        items: [
          "NaN 的类型是 number，表示一次无效的数值运算：比如 0/0、Number('x')、undefined 参与算术。",
          "规范规定 NaN 与任何值都不相等，包括它自己。判断要用 Number.isNaN，或 Object.is。",
          "全局 isNaN 会先把参数转成数字。isNaN('x') 为真，因为转换结果是 NaN。Number.isNaN('x') 为假，它不转换。",
          "parseInt('12px', 10) 得到 12，Number('12px') 得到 NaN。从输入框读数字时要先想清楚允不允许尾部杂质。",
          "一个值是不是可用数字：typeof v === 'number' && Number.isFinite(v)。这样把 NaN 和 Infinity 都排除。",
        ],
      },
    ],
    followUps: ["JSON 里能出现 NaN 吗？stringify 会把它变成什么？"],
  },
  {
    id: "fe-browser-ua",
    category: "frontend",
    title: "浏览器引擎现在怎么分",
    difficulty: "easy",
    tags: ["浏览器"],
    prompt: "以前按 Trident、Gecko、WebKit、Blink 来记内核。今天做兼容还要按这个名单分支吗？",
    parts: [
      {
        type: "list",
        items: [
          "页面由渲染引擎排版绘制，JavaScript 引擎执行脚本。Chrome、Edge、Opera 用 Blink + V8；Firefox 用 Gecko + SpiderMonkey；Safari 用 WebKit + JavaScriptCore。",
          "Chromium 系占了桌面和安卓的大多数份额，但 iOS 上所有浏览器都必须用系统 WebKit。测「Chrome」不能代替测 iPhone。",
          "兼容按特性检测，不按 UA 字符串。UA 又长又会被客户端改写，缩减后的 UA 已经不再可靠地暴露版本。",
          "引擎差异仍在：Safari 对部分新 CSS、日期解析、100vh 和视频策略更严格。问题要落到具体 API，而不是说「内核不同」。",
        ],
      },
    ],
    followUps: ["客户端 WebView 和它外面包的浏览器，能当成同一个环境吗？"],
  },
  {
    id: "fe-browser-tier",
    category: "frontend",
    title: "内存缓存、磁盘缓存和推送缓存",
    difficulty: "medium",
    tags: ["浏览器", "缓存"],
    prompt: "强缓存和协商缓存说的是策略。资源实际还可能躺在哪几层？刷新和强刷有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "查找大致是：Service Worker，再内存缓存，再磁盘缓存（这里才套用 Cache-Control / ETag），HTTP/2 推送缓存，最后才是网络。",
          "内存缓存绑在这个文档的生命周期上，后退或同一页里的重复图片经常从这里拿，开发者工具标 memory cache。标签关掉就没了。",
          "磁盘缓存能跨页面会话，容量大，受 Cache-Control 控制。协商缓存的 304 也发生在这一层和服务器之间。",
          "普通刷新会跟服务器核对可协商的资源。地址栏回车可能更愿意用缓存。强制刷新会绕过缓存并带上「不要用本地副本」的语义。",
          "把 HTML 设成每次协商，把带哈希的脚本设成长缓存。这样发版只换 HTML 里的文件名，旧脚本仍可从磁盘拿。",
        ],
      },
    ],
    followUps: ["开发者工具勾上 Disable cache，和用户强刷是一回事吗？"],
  },
  {
    id: "fe-browser-chunk",
    category: "frontend",
    title: "定长正文和分块传输",
    difficulty: "medium",
    tags: ["浏览器", "HTTP"],
    prompt: "响应头里的 Content-Length 和 Transfer-Encoding: chunked 分别在什么时候用？流式输出靠哪个？",
    parts: [
      {
        type: "list",
        items: [
          "知道正文总字节数时用 Content-Length。浏览器靠它算进度，也靠它判断这一段收完没有。",
          "长度事先不知道时用分块传输：每块先写十六进制长度，再写数据，用长度为 0 的块结束。HTTP/1.1 的常见流式写法。",
          "两者不要同时打架。分块时不要再给一个不准确的 Content-Length，中间代理和浏览器会提前截断或一直等。",
          "gzip 压缩的是每一块里的内容还是整段，取决于实现。前端只消费解码后的字节流，不要自己按压缩前的长度切片。",
          "fetch 的 response.body 是可读流。界面上的打字机效果读取的是解码后的块，和 HTTP 分块不是同一个「块」概念，但都不必等完整包。",
        ],
      },
    ],
    followUps: ["HTTP/2 之后还有 chunked 这个头吗？帧是怎么分的？"],
  },
  {
    id: "fe-browser-redir",
    category: "frontend",
    title: "301、302、307、308",
    difficulty: "medium",
    tags: ["浏览器", "HTTP"],
    prompt: "临时跳转和永久跳转，除了能不能被缓存，还会改掉请求方法吗？",
    parts: [
      {
        type: "list",
        items: [
          "301 永久，302 临时。很多客户端遇到这两种时，会把 POST 改成 GET 再去新地址，身体也可能丢掉。这是历史行为，不是规范里最干净的定义。",
          "307 临时、308 永久，都要求保持方法和身体。提交表单、带 JSON 的 POST 若要跳转，应该用它们。",
          "永久重定向会被浏览器记住。配错 301 之后，即使用户侧清站点数据之前，仍可能一直走旧地址。",
          "前端路由的跳转不要依赖这些状态码。SPA 里用路由 API。接口重定向要算进 CORS：跨域时浏览器会先看重定向前的响应允不允许脚本读。",
          "301/302 的 Location 可以是相对路径，参照的是当前请求的 URL。",
        ],
      },
    ],
    followUps: ["fetch 默认跟着重定向。什么时候要改成 manual？"],
  },
  {
    id: "fe-browser-dom",
    category: "frontend",
    title: "为什么说操作 DOM 慢",
    difficulty: "medium",
    tags: ["浏览器", "性能"],
    prompt: "插上一万个节点页面会卡。慢在 JavaScript 调用本身，还是慢在布局？",
    parts: [
      {
        type: "list",
        items: [
          "单次改 DOM 的 API 开销通常不是大头。卡顿来自：每插一个节点就触发布局和绘制，以及用活的 HTMLCollection 边改边查。",
          "读 offsetWidth 会迫使浏览器把之前积压的样式变更先算完。循环里读一次写一次，就是强制同步布局。",
          "批量改：先在 DocumentFragment 或字符串里拼好，再一次挂到树上。或者离线节点上改完再插入。",
          "一万行不要都做成 DOM。视口外的用虚拟列表，只保留可见的几十个节点。",
          "样式用类名切换，让浏览器合并计算。避免逐个写 element.style，除非这就是动画的目标。",
        ],
      },
    ],
    followUps: ["innerHTML 和 createElement 相比，安全上多了什么风险？"],
  },
  {
    id: "fe-browser-window",
    category: "frontend",
    title: "window、document 和 BOM",
    difficulty: "easy",
    tags: ["浏览器", "DOM"],
    prompt: "浏览器对象模型里，面试至少要能说出哪些全局对象？它们和 DOM 是什么关系？",
    parts: [
      {
        type: "list",
        items: [
          "window 是浏览器打开的窗口，也是页面脚本的全局对象。document、location、history、navigator、screen 都挂在它上面。",
          "document 是这一份文档，DOM 树的入口。查节点、创建节点、监听文档事件从这里走。",
          "location 管当前 URL，改 href 会导航。history 管会话历史，pushState 改地址但不请求服务器。navigator 是浏览器和环境能力，不要用它的字符串做功能开关。",
          "DOM 是文档模型，BOM 是浏览器给页面的窗口能力。Node 里没有 window 和 document，这是代码不能直接搬到服务端的原因之一。",
          "同一窗口里的 iframe 有自己的 window。父页面默认读不到跨源 iframe 的 document。",
        ],
      },
    ],
    followUps: ["globalThis、window 和 self 在页面、Worker 里分别指向谁？"],
  },
  {
    id: "fe-vue-data",
    category: "frontend",
    title: "组件的 data 为什么是函数",
    difficulty: "easy",
    tags: ["Vue", "组件"],
    prompt: "Vue 2 里根实例的 data 可以是对象，组件的 data 却必须是函数。差在哪？",
    parts: [
      {
        type: "list",
        items: [
          "组件定义会被创建很多次。data 若是同一个对象，所有实例会共享一份状态，一个实例 push 进数组，其它实例一起变。",
          "写成函数，每次创建实例都调用一次，返回新对象。闭包里不要把外部可变对象又塞回去，否则还是共享。",
          "Vue 3 的 setup 和 script setup 每次执行本来就会产生新的 ref 和 reactive，没有这道「必须返回函数」的门槛，但模块级的 reactive 仍然是共享单例。",
          "根实例在一个应用里只有一个，所以 Vue 2 允许它直接写对象。为了一致，组件里不要学这个例外。",
        ],
      },
    ],
    followUps: ["Vuex 或 Pinia 的 store 是共享的。哪些状态不该放进组件 data？"],
  },
  {
    id: "fe-vue-rr",
    category: "frontend",
    title: "route 和 router",
    difficulty: "easy",
    tags: ["Vue", "路由"],
    prompt: "this.$route 和 this.$router 各是什么？在 script setup 里怎么拿？",
    parts: [
      {
        type: "list",
        items: [
          "route 是当前这条路由记录：路径、参数、query、name、matched。它是只读的状态，路由一变就换成新对象。",
          "router 是路由器实例：push、replace、back、addRoute、beforeEach。用它发起导航，不要改 route 来跳转。",
          "script setup 里用 useRoute() 和 useRouter()。useRoute() 返回的是响应式对象，在 computed 和 watch 里读 params 可以追踪。",
          "params 适合资源身份，query 适合可分享的筛选条件。刷新后两者都还在地址栏里；存在组件内存里的筛选刷新就丢了。",
        ],
      },
    ],
    followUps: ["push 和 replace 对返回键有什么不同？"],
  },
  {
    id: "fe-vue-scoped",
    category: "frontend",
    title: "scoped 样式怎么隔离",
    difficulty: "medium",
    tags: ["Vue", "CSS"],
    prompt: "单文件组件加了 scoped 之后，选择器实际上变成了什么？为什么改不到子组件？",
    parts: [
      {
        type: "list",
        items: [
          "编译时给本组件元素加上 data-v-xxx，选择器变成 .title[data-v-xxx]。样式只匹配带这个属性的元素。",
          "子组件的根节点会同时带父组件和自己的 data 属性，所以父组件的 scoped 能碰到子组件根，碰不到子组件内部。",
          "要碰到子组件内部的某类节点，用 :deep(.child)。这是有意打开的口子，范围尽量写窄。",
          "插槽内容在父组件里编译，带的是父组件的 data 属性。子组件的 scoped 默认管不到插槽里的标记。",
          "全局样式、CSS Modules、原子类可以和 scoped 并存。同一元素上后注入的样式表仍按层叠比较，scoped 不会提高特异性到无法覆盖。",
        ],
      },
    ],
    followUps: [":global 和再写一个不带 scoped 的 style 块，差别是什么？"],
  },
  {
    id: "fe-vue-mix",
    category: "frontend",
    title: "mixin 的问题",
    difficulty: "medium",
    tags: ["Vue", "复用"],
    prompt: "Vue 2 用 mixin 复用逻辑，为什么后来不推荐？和组合式函数比，坏在哪？",
    parts: [
      {
        type: "list",
        items: [
          "mixin 的 data、方法、生命周期会合并进组件。来源不写在组件自己的函数里，读代码时看不出 this.foo 是哪份 mixin 提供的。",
          "两个 mixin 同名方法，后者覆盖前者，没有参数层面的冲突提示。隐含依赖也多：mixin 里用了某个 props，组件忘了声明也能「碰巧能跑」。",
          "组合式函数是普通函数：要什么参数就传什么，返回 ref 和方法，重名由调用方自己起。生命周期在函数里用 onMounted 注册，来源看得见。",
          "mixin 仍可能出现在老项目里。改之前先搜它注入了哪些键，再迁到组合函数，避免合并顺序一变行为就变。",
        ],
      },
    ],
    followUps: ["composables 之间可以互相调用吗？循环依赖怎么避免？"],
  },
  {
    id: "fe-react-pure",
    category: "frontend",
    title: "shouldComponentUpdate 和 PureComponent",
    difficulty: "medium",
    tags: ["React", "性能"],
    prompt: "类组件怎么跳过一次渲染？浅比较会放过哪些变化？函数组件用什么对应？",
    parts: [
      {
        type: "list",
        items: [
          "shouldComponentUpdate 返回 false 时，这一棵子树跳过这次渲染。比较要自己写，写错就会卡住该出现的更新。",
          "PureComponent 对 props 和 state 做浅比较。对象字段内部变了但引用没变，它认为没变化。所以要配合不可变更新。",
          "函数组件用 React.memo 做同样的浅比较，比较函数可以自定义。Hooks 时代更常见的是先拆小组件、把状态下放，而不是到处 memo。",
          "跳过渲染会跳过子组件，即使子组件自己的 context 以外的数据其实该更新。context 的消费者不受祖先 shouldComponentUpdate 阻挡，这是后来专门保证的。",
          "渲染便宜时不要加这些。比较本身也要花时间，尤其 props 上挂了大对象。",
        ],
      },
    ],
    followUps: ["React Compiler 打开之后，手写 memo 还剩什么场景？"],
  },
  {
    id: "fe-react-jsx",
    category: "frontend",
    title: "JSX 编译成什么",
    difficulty: "medium",
    tags: ["React", "JSX"],
    prompt: "写下一个组件标签，运行时实际调用了谁？createElement 和现在的 jsx 运行时有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "经典编译把 JSX 转成 React.createElement(type, props, ...children)，返回一个描述对象，里面有 type、props、key，不是 DOM 节点。",
          "新的 JSX 运行时从 react/jsx-runtime 引入 jsx，不再要求每个文件手动 import React。key 和 ref 从 props 里分开传，避免它们进普通 props。",
          "type 是字符串时表示宿主节点，是函数或类时表示组件。组件函数接收 props，返回下一层描述。",
          "cloneElement 复制一个已有描述并合并 props。它不重新执行组件。要改子组件，优先在渲染时明确写出新 props，而不是克隆别人的元素。",
          "同一位置的描述靠 type 和 key 决定能不能复用状态。type 从 div 换成 span，状态不会留。",
        ],
      },
    ],
    followUps: ["props.children 可能是一个节点、一个数组，还是一个函数？"],
  },
  {
    id: "fe-hand-mapfn",
    category: "frontend",
    title: "手写 map",
    difficulty: "medium",
    tags: ["手写", "数组"],
    prompt: "实现 Array.prototype.map 时，稀疏数组、this 和回调参数这三处最容易写错。你怎么处理？",
    parts: [
      {
        type: "p",
        text: "map 返回新数组，不改原数组。回调参数是当前值、下标、原数组。空位要保留成空位，而不是当成 undefined 去调用回调。",
      },
      {
        type: "code",
        lang: "js",
        code: "function map(list, fn, thisArg) {\n  if (typeof fn !== \"function\") {\n    throw new TypeError(\"fn is not a function\");\n  }\n  const out = new Array(list.length);\n  for (let i = 0; i < list.length; i += 1) {\n    if (Object.prototype.hasOwnProperty.call(list, i)) {\n      out[i] = fn.call(thisArg, list[i], i, list);\n    }\n  }\n  return out;\n}",
      },
      {
        type: "list",
        items: [
          "先记下 length。循环过程中如果回调又往数组末尾 push，规范实现不会处理新下标。",
          "thisArg 用 call 传进去。箭头函数忽略这一点，面试时要说出来。",
          "不要用 forEach 实现 map 再交卷，forEach 本身会跳过空位，但面试官要看你有没有处理 hasOwnProperty。",
        ],
      },
    ],
    followUps: ["手写 filter 时，空位应该出现在结果里吗？"],
  },
  {
    id: "fe-hand-case",
    category: "frontend",
    title: "手写短横线转驼峰",
    difficulty: "easy",
    tags: ["手写", "字符串"],
    prompt: "把 get-element-by-id 转成 getElementById。连续短横线和首尾短横线怎么处理？",
    parts: [
      {
        type: "code",
        lang: "js",
        code: "function toCamel(input) {\n  return input\n    .trim()\n    .toLowerCase()\n    .replace(/[-_\\s]+(.)?/g, (_, ch) => (ch ? ch.toUpperCase() : \"\"));\n}\nconsole.log(toCamel(\"get-element-by-id\"));",
      },
      {
        type: "list",
        items: [
          "分隔符后面没有字符时，替换成空串，避免末尾短横线留下 undefined。",
          "CSS 自定义属性以 -- 开头，不能用这条规则硬转。--theme-color 是属性名本身，不是驼峰变量。",
          "数据集属性 data-user-id 反映到 dataset 时，浏览器会转成 dataset.userId。自己解析 HTML 时要和这个规则对齐。",
        ],
      },
    ],
    followUps: ["驼峰再转回短横线时，连续大写的 URL 怎么处理？"],
  },
  {
    id: "fe-eng-umd",
    category: "frontend",
    title: "AMD、CMD、UMD 和 ESM",
    difficulty: "medium",
    tags: ["工程化", "模块"],
    prompt: "RequireJS 和 SeaJS 那套模块格式现在还见得到吗？和 ES Module 差在哪？",
    parts: [
      {
        type: "list",
        items: [
          "AMD（RequireJS）在浏览器里异步加载，定义依赖数组，加载完再执行工厂函数。适合当时没有原生模块的页面。",
          "CMD（SeaJS）也是异步加载，但依赖可以就近 require，执行到那一行才取。写法更接近同步，加载仍是提前发起的。",
          "CommonJS 是同步的 module.exports，给 Node 用。UMD 在一个文件里判断 define、module 和全局变量，让同一份构建既能被 AMD 加载，也能进 Node，还能用 script 挂到全局。",
          "ESM 是语言标准：静态 import/export 可以做 tree-shaking，动态 import() 才是运行时加载。浏览器和 Node 都支持。",
          "新项目用 ESM。只有发布仍要被老脚本用 script 引入的库，才在产物里再包一层 UMD。",
        ],
      },
    ],
    followUps: ["package.json 的 main、module、exports 各给谁看？"],
  },
  {
    id: "fe-eng-postcss",
    category: "frontend",
    title: "预处理器和 PostCSS",
    difficulty: "easy",
    tags: ["工程化", "CSS"],
    prompt: "Sass、Less 和 PostCSS 分别在什么时机工作？变量和嵌套现在还有必要上 Sass 吗？",
    parts: [
      {
        type: "list",
        items: [
          "Sass、Less 是另一门样式语言，要编译成 CSS。它们提供变量、嵌套、mixin、函数，浏览器不认识源码。",
          "PostCSS 处理的是 CSS（或已经编译出的 CSS），用插件做转换：自动前缀、把未来语法降级、设计令牌替换。它不是完整的另一门语言。",
          "原生 CSS 已经有自定义属性、嵌套和层。主题色优先用自定义属性，才能在运行时切换。Sass 变量在编译后就没了。",
          "mixin 复制出来的是声明，自定义属性复用的是值。大段重复的声明可以用预处理器，也可以用实用类，看项目已有的体系。",
          "工具链里常见顺序是：预处理器编成 CSS，再进 PostCSS。不要两套都定义同名变量却各改各的。",
        ],
      },
    ],
    followUps: ["CSS Modules 是预处理器吗？它改的是选择器还是属性？"],
  },
  {
    id: "fe-perf-yahoo",
    category: "frontend",
    title: "经典性能规则还剩什么",
    difficulty: "medium",
    tags: ["性能", "网络"],
    prompt: "雅虎那套减少请求、放 CDN、压缩、少用 cookie 的条目，在 HTTP/2 和现代构建里哪些还成立？",
    parts: [
      {
        type: "list",
        items: [
          "仍成立：压缩文本、图片选对格式和尺寸、脚本不要堵渲染、缓存可哈希的静态资源、CSS 放前面关键的一小段、第三方脚本限权。",
          "请求数不再越少越好。HTTP/2、HTTP/3 多路复用之后，把所有图标打成一张雪碧图、把所有脚本合成一个大包，反而失去按路由加载和长期缓存。",
          "域名分片是为了绕开浏览器对同一主机的连接数限制。现在同一源多开连接常常更差，握手和拥塞窗口都被拆散。",
          "Cookie 仍要小、要限制 Path 和 Domain。静态资源放到不带业务 Cookie 的域名，避免每个图片请求都带上会话。",
          "测的是指标不是清单：LCP、INP、CLS，加上服务端耗时。规则只用来解释指标为什么差。",
        ],
      },
    ],
    followUps: ["雪碧图在高分屏和深色模式下会带来什么额外成本？"],
  },
];
