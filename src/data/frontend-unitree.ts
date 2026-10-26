import type { Question } from "./types";

/**
 * 宇树科技 Web 前端面经补题。
 * 单点原理题库里已有，这里补面试官连着追问的对照、手写 Promise、
 * 权限与实时通道，以及机器人可视化控制台这道设计题。
 */
export const frontendUnitreeQuestions: Question[] = [
  {
    id: "fe-js-frame",
    category: "frontend",
    title: "一帧里各类任务怎么排",
    difficulty: "hard",
    tags: ["JavaScript", "事件循环", "宇树"],
    prompt: "从一次宏任务开始，把微任务、渲染、requestAnimationFrame、requestIdleCallback 按顺序讲完。queueMicrotask 和 requestIdleCallback 差在哪？",
    parts: [
      {
        type: "list",
        items: [
          "取出一个宏任务跑到调用栈空。脚本本身、setTimeout、setInterval、I/O、用户事件都是宏任务，一次只取一个。",
          "立刻清空微任务队列。这一轮里新排进来的微任务也要清完才往下走。queueMicrotask、Promise.then、MutationObserver 都在这里。",
          "浏览器再决定要不要画这一帧。要画时先跑 requestAnimationFrame，然后样式、布局、绘制，合成器线程把层合成上屏。rAF 不是宏任务，也不是微任务，它卡在绘制之前。",
          "这一帧还有剩余时间，并且没有更急的输入，才跑 requestIdleCallback。回调里用 timeRemaining() 看还剩多少毫秒。传了 timeout 的，到期后不再继续等空闲。",
          "然后才取下一个宏任务。setTimeout(0) 仍要排到微任务和可能的渲染之后，嵌套定时器还有最少 4ms 的间隔。",
          "queueMicrotask 在绘制前一定执行，适合「这次变更在用户看见之前必须做完」的事。微任务里再排微任务会把渲染饿死，点击没有反馈。",
          "requestIdleCallback 不保证本帧执行，后台标签页会拖很久。埋点、预取、非关键缓存可以放这里；用户正在等的结果不行。忙的时候它会一直不来。",
        ],
      },
    ],
    followUps: [
      "微任务里不断 queueMicrotask，这一帧的 rAF 还跑得了吗？",
      "Node 的 process.nextTick 比 Promise.then 更早，浏览器里有这一级吗？",
    ],
  },
  {
    id: "fe-hand-mypromise",
    category: "frontend",
    title: "手写 Promise",
    difficulty: "hard",
    tags: ["手写", "Promise", "宇树"],
    prompt: "手写一个 Promise：状态只能从 pending 走到成功或失败，then 要能链式调用，executor 和回调里的异常要变成拒绝。",
    parts: [
      {
        type: "list",
        items: [
          "状态只有 pending、fulfilled、rejected。resolve 和 reject 都要先看是不是 pending，落定之后再调直接忽略。",
          "executor 同步执行。里面抛错，当成 reject，不要让异常冒出构造函数。",
          "then 必须返回一个新的 Promise。回调不能在 then 调用的同一轮同步执行，规范要求丢进微任务，所以用 queueMicrotask。",
          "onFulfilled 不是函数就把值往后传；onRejected 不是函数就把拒绝往后抛。这样错误能穿透到后面的 catch。",
          "回调的返回值要接着解：普通值直接 resolve 下一个；又是一个 Promise 就接上它的 then；返回自己则拒绝，避免循环。",
          "回调里抛错，下一个 Promise 拒绝。catch(fn) 就是 then(undefined, fn)，处理完默认回到成功，所以 catch 后面的 then 还会走。",
          "面试写到状态机、队列、微任务和异常这四件事就够。完整的 thenable 探测（对方有 then 方法但不是自己的实例）口头补一句即可。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "type Resolve = (value?: unknown) => void;\ntype Reject = (reason?: unknown) => void;\n\nclass MyPromise {\n  private state: \"pending\" | \"fulfilled\" | \"rejected\" = \"pending\";\n  private value: unknown;\n  private reason: unknown;\n  private onFulfilled: Array<() => void> = [];\n  private onRejected: Array<() => void> = [];\n\n  constructor(executor: (resolve: Resolve, reject: Reject) => void) {\n    const resolve: Resolve = (value) => {\n      if (this.state !== \"pending\") return;\n      this.state = \"fulfilled\";\n      this.value = value;\n      this.onFulfilled.forEach((fn) => fn());\n    };\n    const reject: Reject = (reason) => {\n      if (this.state !== \"pending\") return;\n      this.state = \"rejected\";\n      this.reason = reason;\n      this.onRejected.forEach((fn) => fn());\n    };\n    try {\n      executor(resolve, reject);\n    } catch (err) {\n      reject(err);\n    }\n  }\n\n  then(onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {\n    const fulfill = typeof onFulfilled === \"function\" ? onFulfilled : (v: unknown) => v;\n    const reject = typeof onRejected === \"function\" ? onRejected : (e: unknown) => { throw e; };\n    const next = new MyPromise((resolve, rejectNext) => {\n      const run = (handler: (payload: unknown) => unknown, payload: unknown) => {\n        queueMicrotask(() => {\n          try {\n            const result = handler(payload);\n            if (result === next) {\n              rejectNext(new TypeError(\"Chaining cycle\"));\n            } else if (result instanceof MyPromise) {\n              result.then(resolve, rejectNext);\n            } else {\n              resolve(result);\n            }\n          } catch (err) {\n            rejectNext(err);\n          }\n        });\n      };\n      if (this.state === \"fulfilled\") run(fulfill, this.value);\n      else if (this.state === \"rejected\") run(reject, this.reason);\n      else {\n        this.onFulfilled.push(() => run(fulfill, this.value));\n        this.onRejected.push(() => run(reject, this.reason));\n      }\n    });\n    return next;\n  }\n\n  catch(onRejected: (reason: unknown) => unknown) {\n    return this.then(undefined, onRejected);\n  }\n}",
      },
    ],
    followUps: [
      "then 的回调如果同步执行，下面这段的打印顺序会错在哪：new MyPromise(r => r(1)).then(() => console.log(2)); console.log(3)？",
      "resolve 一个 thenable 时，为什么要等它落定，而不是把它当成普通值？",
    ],
  },
  {
    id: "fe-browser-xorigin",
    category: "frontend",
    title: "跨域方案怎么选",
    difficulty: "medium",
    tags: ["浏览器", "CORS", "宇树"],
    prompt: "CORS、JSONP、开发代理、线上反向代理、postMessage 各解决什么？哪一种不该再用于新接口？",
    parts: [
      {
        type: "list",
        items: [
          "同源策略限制的是脚本读取另一源的响应和 DOM，请求本身往往已经发出去了。选方案前先分清：是浏览器不让读，还是服务根本不在这个域上。",
          "CORS 是正道。简单请求直接发，看响应头；自定义头、application/json、PUT/DELETE 会先 OPTIONS 预检。要带 Cookie 必须回显具体 Origin，不能用 *，请求侧 credentials: include。接口是自己的，就让服务端加这组头。",
          "开发代理（Vite 的 server.proxy、webpack-dev-server）只在本地开发生效：浏览器以为在请求同源，开发服务器再转发。上线后这条配置不存在，不能当成生产方案。",
          "线上反向代理（Nginx 把 /api 转到后端）让浏览器始终同源，Cookie 和路径最好控，也避开预检。前后端不同域、又改不了对方 CORS 时用它。代价是多一跳，上传和 WebSocket 要单独配转发。",
          "JSONP 靠 script 标签不受同源限制，只支持 GET，没有状态码，回调挂在全局上，响应当脚本执行，等于信任对方任意代码。只配老接口兜底，新接口不要用。",
          "postMessage 管的是窗口之间：跨域 iframe、弹窗。它不替代 HTTP 接口。监听端必须校验 event.origin，不要用 * 还处理指令或令牌。",
          "一句话：自己的接口用 CORS 或同源反代；本地联调用开发代理；嵌进去的别的站点用 postMessage；JSONP 退出。",
        ],
      },
    ],
    followUps: [
      "预检结果可以缓存多久，缓存存在哪？",
      "iframe 里用 postMessage 下发运动指令，origin 没校验会怎样？",
    ],
  },
  {
    id: "fe-security-rbac",
    category: "frontend",
    title: "路由权限、按钮权限和动态菜单",
    difficulty: "hard",
    tags: ["安全", "权限", "宇树"],
    prompt: "登录后菜单随角色变化，有的按钮只有操作员能点。路由权限、按钮权限、动态菜单怎么配合？只在前端藏起来够不够？",
    parts: [
      {
        type: "list",
        items: [
          "权限数据来自服务端：用户有哪些角色，角色有哪些权限码（route:console、cmd:move）。前端不自己编这份列表。",
          "动态菜单：路由表里每条带权限码，登录后按权限过滤，生成菜单和可注册路由。没权限的路由不要注册，直接输入地址落到 403，而不是渲染完再藏。",
          "按钮权限做成声明：<Can code=\"cmd:move\"> 或一个 v-permission。内部就是当前权限码集合的查找。一个按钮对应一个码，不要用角色名写死在组件里，角色一变就要改组件。",
          "前端隐藏只改善体验。接口必须再验一次，否则对方改本地路由或直接调 API 就绕过了。危险指令（运动、急停解除）除了权限码，还要服务端看设备是否被这个人占用。",
          "令牌无感续期：短期 access 放内存，refresh 放 HttpOnly Cookie。并发 401 时只允许一个请求去刷新，其余排队，成功后用新令牌重放。刷新失败再去登录，不要每个请求各刷一次。",
          "权限变更不必等重新登录。菜单接口给一个版本号，或走推送；对不上就重新拉权限。正在打开的页面如果码被收回，下一次操作返回 403，界面切到无权限。",
        ],
      },
    ],
    followUps: [
      "按钮权限码很多时，每次渲染都查一遍，要不要换成上下文里的 Set？",
      "一个账号两个标签页，一边被管理员改了角色，另一边怎么收场？",
    ],
  },
  {
    id: "fe-browser-heartbeat",
    category: "frontend",
    title: "WebSocket 心跳和断线重连",
    difficulty: "hard",
    tags: ["浏览器", "WebSocket", "宇树"],
    prompt: "状态推送用 WebSocket。心跳怎么定？断线后怎么重连才不会把服务端打满？重连期间用户已经点下去的指令怎么办？",
    parts: [
      {
        type: "list",
        items: [
          "连接上之后客户端定时发 ping，服务端回 pong。每次收到任何业务消息也重置计时。超过两到三次心跳间隔没有入站数据，主动关掉，走重连。不要只靠浏览器的 onclose，半开连接可能既不报错也不来数据。",
          "心跳间隔要大于网络抖动，又要小于中间代理的空闲断开时间。常见是 15 到 30 秒。页面切到后台时，浏览器会节流定时器，回来后先看 readyState，断了再连，不要在后台按前台频率打。",
          "重连用指数退避加抖动：1s、2s、4s，封顶 30s，再乘一个随机系数。同一时刻大量客户端被网关踢掉时，抖动能错开重连高峰。连续失败要有上限，超了就停下来，界面给出重连按钮。",
          "用一个递增的连接代号。旧连接的 onclose 晚到时，如果代号对不上，不要再触发一轮重连。组件卸载时清定时器并关闭 socket，否则离开页面还在重连。",
          "消息带序号。重连后先拉一次全量状态，再接增量，序号断了就丢弃增量重新拉全量。只靠推送补洞，中间丢一包，机器人和画面就不一致。",
          "运动、急停这类指令不在断线队列里自动重放。重连成功后告诉用户「刚才的指令没有送达」，让人再确认。状态订阅可以自动恢复，动作不行。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function nextDelay(attempt: number) {\n  const cap = 30_000;\n  const base = Math.min(cap, 1000 * 2 ** attempt);\n  return Math.round(base * (0.5 + Math.random()));\n}",
      },
    ],
    followUps: [
      "SSE 为什么往往不用自己写重连，WebSocket 却要？",
      "心跳和服务端的空闲超时，谁该更短？",
    ],
  },
  {
    id: "fe-eng-widget",
    category: "frontend",
    title: "组件库的受控、透传和无障碍",
    difficulty: "medium",
    tags: ["工程化", "组件", "宇树"],
    prompt: "组件库里的输入框要同时支持受控和非受控。多余属性怎么透到原生节点？插槽、边界数据和键盘访问怎么处理？",
    parts: [
      {
        type: "list",
        items: [
          "受控：价值在外部，组件只收 value 和 onChange。非受控：用 defaultValue 初始化，之后内部 state 自己走。两者不要混用。如果既传了 value 又在内部改 state，就会出现改了没反应。",
          "判断方式：value !== undefined 走受控，否则走内部状态。需要「有时受控」时，用一个 key 让外部重置，不要在渲染中途把模式切来切去。",
          "Props 透传：明确列出组件自己的 props（value、size、status），其余用 rest 摊到原生 input 上。不要把 onChange 的签名和原生事件混成一个，业务侧会分不清。React 里 class 要写成 className，Vue 里注意 fallthrough 会不会盖掉内部监听。",
          "插槽是扩展点，不是再加十个布尔值。前缀、后缀、空状态、自定义选项渲染，用 children、render props，或 Vue 的具名插槽和作用域插槽把数据交回调用方。",
          "边界：value 为 null、超长文本、disabled 时仍要能读、loading 时阻止重复提交、受控值被外部改回旧值时输入法合成不能被打断。这些要有故事书里的用例，不要等业务踩到。",
          "无障碍：原生 input 或 button 优先。必须用 div 时补 role、tabIndex、键盘（Enter / Space / Esc）和可访问名称。错误文案用 aria-describedby 关联，不要只靠红色。焦点环不要一刀切掉。",
        ],
      },
    ],
    followUps: [
      "受控输入框在中文输入法组字期间，为什么不能每个拼音字母都写回 value？",
      "rest 透传把 onClick 盖掉内部逻辑时，组件库该怎么合并事件？",
    ],
  },
  {
    id: "fe-eng-sample",
    category: "frontend",
    title: "监控上报怎么控量",
    difficulty: "medium",
    tags: ["监控", "工程化", "宇树"],
    prompt: "要采集 PV、FP/FCP/LCP、JS 错误和接口异常。怎样上报才不会把用户流量和监控服务打满？",
    parts: [
      {
        type: "list",
        items: [
          "PV 在路由切换时记一次，带页面和来源。不要在每次渲染时记。FP、FCP、LCP 用 PerformanceObserver，一种指标一页一次，LCP 会更新，取最后一次并在页面隐藏时立刻发出。",
          "JS 错误分三路：window.onerror、unhandledrejection、框架的错误边界。资源加载失败要在捕获阶段听 error，否则冒泡听不到图片和脚本。接口在拦截器里分开网络失败、HTTP 状态和业务错误码。",
          "相同错误在一个时间窗里合并：用消息加堆栈前几帧做键，计数加一，而不是每抛一次打一条。错误风暴（一个循环里抛）必须合并，否则上报本身变成性能问题。",
          "采样分类型。错误可以全量，或者按用户采样但一个用户一旦命中就全程上报，方便还原路径。性能指标按比例采样。PV 如果量太大也采样，后台用采样率反推总量。",
          "上报走批量：内存里攒一小段时间或攒满 N 条再发。页面卸载用 sendBeacon，避免被浏览器取消。失败不要无限重试，监控挂了不能把业务请求拖死。",
          "字段里不要带令牌、指令参数和点位明细。堆栈用 source map 在服务端还原，map 不要部署到公开目录。",
        ],
      },
    ],
    followUps: [
      "为什么 LCP 要等页面隐藏再上报，而不是第一次回调就发？",
      "sendBeacon 有大小限制，一批太长怎么切？",
    ],
  },
  {
    id: "fe-eng-sandbox",
    category: "frontend",
    title: "微前端的样式隔离和 JS 沙箱",
    difficulty: "hard",
    tags: ["微前端", "工程化", "宇树"],
    prompt: "qiankun 怎么隔离样式和全局变量？Module Federation 为什么基本不做沙箱？应用之间怎么通信？",
    parts: [
      {
        type: "list",
        items: [
          "样式隔离三档。约定前缀或 CSS Modules 最便宜，靠纪律。运行时给选择器加作用域，能挡住大部分泄漏，盖不住插到 body 上的弹层。Shadow DOM 隔离最彻底，弹层、字体、全局重置进不去，第三方组件库经常要改挂载点。",
          "JS 沙箱：快照沙箱在挂载前记录 window 上的增量，卸载时还原，同一时刻只能有一个子应用改全局。Proxy 沙箱把 window 代理掉，子应用读写的是假 window，可以多实例。都挡不住真正的逃逸：拿到真实 iframe、改原型、直接操作 document。",
          "qiankun 在 single-spa 上加了 HTML 入口、沙箱和样式作用域，适合多团队、技术栈不统一、要独立发版。接入成本在生命周期、公共依赖和弹层样式。",
          "Module Federation 是构建期声明远程模块，运行时加载，共享依赖可以去重。它没有 JS 沙箱，也没有样式隔离，默认大家活在同一个全局。适合同一个技术栈、彼此信任的拆分。要隔离还得自己加约定或套 iframe。",
          "通信：主应用用 props 把能力传进子应用；全局事件总线适合低频通知；共享的外部 store 适合同一技术栈。不要让子应用互相 import 对方的内部模块，那就把独立发布拆掉了。",
          "选的时候按四个问题：要不要样式和全局隔离、依赖能不能共享、路由谁管、团队是不是要各自发版。隔离要求高、又不怕体验差，iframe 仍然成立。",
        ],
      },
    ],
    followUps: [
      "两个子应用都把 React 打进去，页面上会出现什么问题？",
      "Proxy 沙箱里，子应用给 window 加的定时器，卸载时清得掉吗？",
    ],
  },
  {
    id: "fe-perf-stack",
    category: "frontend",
    title: "大列表：虚拟列表、分片和 Worker",
    difficulty: "medium",
    tags: ["性能", "虚拟列表", "宇树"],
    prompt: "一万行数据把页面卡住了。虚拟列表、分片渲染、Web Worker 各解决哪一段？什么时候叠在一起用？",
    parts: [
      {
        type: "list",
        items: [
          "先看卡在哪。DOM 节点太多，滚动和布局贵，用虚拟列表：只挂可视区加缓冲区，外面用总高度撑开滚动条。行高固定就用除法；行高不定就先估算，渲染后用 ResizeObserver 记真实高度，再用二分找起始下标。",
          "主线程上有一块超过 50ms 的计算（排序、过滤、坐标变换），虚拟列表也救不了，输入还是会顿。把数据切成小块，每块之后 scheduler.yield() 或 setTimeout(0) 把控制权还回去。这是分片，解决的是长任务，不是节点数量。",
          "计算完全不碰 DOM，而且一块就上百毫秒，放到 Web Worker。主线程只收结果。传递大块二进制用 Transferable，避免再拷贝一份。Worker 里不能读 DOM，也不能直接改 React 状态。",
          "三者可以叠：Worker 里算好这一屏要的坐标，主线程分片提交，列表只渲染窗口内的点或行。先提交前几十条让用户看见，剩下的随后补。",
          "不要为了分片把每个元素都 setState 一次，那样每一片都是一次提交。攒一批再更新，或把原始数据放在 ref 里，虚拟列表按窗口自己取。",
        ],
      },
    ],
    followUps: [
      "虚拟列表的表头吸顶和横向滚动同步，为什么不能只靠每一行的 sticky？",
      "Worker 返回的结果到达时，用户已经滚走了，这一批还要提交吗？",
    ],
  },
  {
    id: "fe-design-console",
    category: "frontend",
    title: "设计机器人可视化控制台",
    difficulty: "hard",
    tags: ["设计", "实时", "宇树"],
    prompt: "设计一个机器人可视化控制台：3D 模型、实时指令、WebSocket 状态、海量点位、权限隔离，还要在低性能设备上能用，断网时能看最近状态。你怎么拆？",
    parts: [
      {
        type: "h",
        text: "先划模块",
      },
      {
        type: "p",
        text: "按数据方向拆成六块，而不是按页面拆。画面、指令、状态流、权限、降级、离线各有自己的失败方式，混在一个组件里后面改不动。",
      },
      {
        type: "list",
        items: [
          "场景层：3D 视口和点云，只负责画，不发指令。",
          "指令层：把按钮翻译成带序号的命令，等回执，超时就失败。",
          "状态层：WebSocket 收姿态、电量、关节、告警，维护一份当前快照。",
          "权限层：决定菜单、按钮和某台设备能不能被这个人操作。",
          "降级层：按设备和当前帧率关掉效果。",
          "离线层：缓存最近一次模型和快照，断网只读。",
        ],
      },
      {
        type: "h",
        text: "3D 和海量点位",
      },
      {
        type: "list",
        items: [
          "模型用 glTF。加载、解析放到 Worker 或加载器的异步路径，不要在主线程 JSON.parse 一个很大的场景。几何和材质在切换机器人时 dispose，不然显存只涨不跌。",
          "点位不要做成 DOM，也不要一个点一个 Mesh。用 InstancedMesh、点材质，或单独的点云渲染器。只画视锥里的点，远处合并成一簇。",
          "原始点云在 Worker 里做抽稀和坐标变换，主线程每帧只拿当前要画的缓冲。缓冲用 Transferable 移交。滚动和拖拽视角时暂停非关键更新。",
          "姿态更新走引用或环形缓冲，不要每次推送都拷贝整棵场景树。React 状态里只放「选中了谁、面板上的数字」，不要把每一帧的关节角放进 state。",
        ],
      },
      {
        type: "h",
        text: "指令和状态流",
      },
      {
        type: "list",
        items: [
          "状态用 WebSocket，全量快照加带序号的增量。序号断了就丢增量，重新要一份全量。心跳 15 到 30 秒，超时主动断开。重连指数退避加抖动，旧连接的 onclose 不能再触发新的一轮。",
          "指令是另一条语义：点击后生成命令 id，按钮进入等待，收到对应回执才算成功。超时、断线都算失败，界面说明「没有送达」。",
          "运动和模式切换不在离线队列里自动重放。急停相反，它应该走最短路径，并且断线时界面明确告诉操作员：你现在够不着这台机器。",
          "画面上的姿态以服务端推送为准。不要在本地先把模型转到目标角度再等确认，控制台会把「想要的」画成「已经发生的」。",
        ],
      },
      {
        type: "h",
        text: "权限、降级、离线",
      },
      {
        type: "list",
        items: [
          "菜单和路由按权限码过滤，按钮用同一套码。服务端对每条指令再验一次，还要验这台设备是否分配给当前操作员。前端藏按钮只是为了少误点。",
          "低性能设备：看 hardwareConcurrency、deviceMemory，以及运行中的帧时间。降级顺序是像素比、阴影和后处理、点预算、最后退到 2D 示意图加关键数字。降级是自动的，也给一个手动开关。",
          "离线：Service Worker 缓存控制台壳和上次的模型；IndexedDB 存最近一次快照和时间戳。断网进入只读，标出数据时间，禁止发指令。恢复后先拉全量再接推送，不要把缓存姿态接着当实时。",
          "监控单独采样：连接成功率、重连次数、指令失败原因、帧率、长任务。上报合并去重，不要把点云内容打进日志。",
        ],
      },
    ],
    followUps: [
      "两个人同时控制同一台机器人，界面上怎么表现占用？",
      "点云每秒几十兆，Worker 和主线程之间怎样避免每帧拷贝？",
      "模型很大时，首屏先给操作员看什么，才不至于干等？",
    ],
  },
];
