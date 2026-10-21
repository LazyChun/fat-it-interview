import type { Question } from "./types";

/** Redux 与 Zustand 的机制题。选型对比见 fe-react-store，这里不再重复。 */
export const frontendStateQuestions: Question[] = [
  {
    id: "fe-redux-flow",
    category: "frontend",
    title: "Redux 的单向数据流",
    difficulty: "medium",
    tags: ["Redux", "状态"],
    prompt: "dispatch 一个 action 之后，store、reducer、视图各走哪一步？为什么规定不能在视图里直接改 state？",
    parts: [
      {
        type: "list",
        items: [
          "界面只通过 dispatch 提交 action。action 是普通对象，至少有 type，载荷放 payload。它描述发生了什么，不描述怎么改。",
          "store 把当前 state 和这个 action 交给 reducer。reducer 是纯函数，必须返回下一份 state，不能改入参、不能发请求。",
          "state 换成新引用之后，store 通知订阅者。react-redux 的 hook 用 useSyncExternalStore 订阅，选中的值变了才让组件渲染。",
          "直接改 state 时引用往往不变，订阅者认为没变化，界面不更新；时间旅行和「把这次变更重放一遍」也失效。",
          "整个应用一份状态树，读从 store 来，写只经过 dispatch。调试时看 action 序列就能重建当时的状态。",
        ],
      },
    ],
    followUps: ["action 里放函数，老的 Redux 会怎样？thunk 是谁接住它的？"],
  },
  {
    id: "fe-redux-rtk",
    category: "frontend",
    title: "Redux Toolkit 和 createSlice",
    difficulty: "medium",
    tags: ["Redux", "RTK"],
    prompt: "现在写 Redux 为什么从 configureStore 和 createSlice 开始？slice 里看起来在改 state，违反纯函数了吗？",
    parts: [
      {
        type: "list",
        items: [
          "configureStore 默认接好开发者工具、thunk，并打开可序列化检查和不变性检查。不必再手写 combineReducers 和一串 applyMiddleware。",
          "createSlice 收拢 name、initialState、reducers。它按函数名生成 action creator 和 type，switch 和字符串常量不用手写。",
          "slice 里对 state.count += 1 能写，是因为 Immer 先给你一份 draft。函数结束时它产出真正的新对象，原 state 不动。这仍然是纯更新。",
          "从 draft 返回一个新值会替换这一整段 state；又改 draft 又 return，Immer 会报错。选定一种写法。",
          "异步用 createAsyncThunk：pending、fulfilled、rejected 三种 action 在 extraReducers 里接。请求本身不要写进 reducer。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "const counter = createSlice({\n  name: \"counter\",\n  initialState: { count: 0 },\n  reducers: {\n    added(state, action: PayloadAction<number>) {\n      state.count += action.payload;\n    },\n  },\n});\n\ndispatch(counter.actions.added(1));",
      },
    ],
    followUps: ["可序列化检查为什么拒绝把 Date 和函数放进 state？"],
  },
  {
    id: "fe-redux-middleware",
    category: "frontend",
    title: "Redux 中间件怎么串起来",
    difficulty: "hard",
    tags: ["Redux", "中间件"],
    prompt: "中间件的函数签名为什么是三层？thunk、saga、listener 各适合什么副作用？",
    parts: [
      {
        type: "list",
        items: [
          "签名是 storeAPI => next => action。storeAPI 里有 dispatch 和 getState。next 是后面的中间件，最后一环才是真正的 reducer。",
          "多个中间件从左到右包成洋葱。前面的可以改 action、不调用 next 来吞掉它，或在 next 返回后再做事。日志通常放最外层。",
          "thunk 约定：action 如果是函数，就调用它并传入 dispatch 和 getState；如果是对象，交给 next。异步因此停在中间件，到不了 reducer。",
          "saga 用生成器把长流程写成 take、put、call 的同步样子，适合跨很多 action 的业务流程。新项目往往用 RTK 的 listener 或直接在组件外调用 thunk，saga 更重。",
          "reducer 里发请求是错的。中间件或 thunk 负责副作用，成功后再 dispatch 一个普通 action 去改状态。",
        ],
      },
    ],
    followUps: ["在中间件里调用 storeAPI.dispatch 和调用 next，走的路径有什么不同？"],
  },
  {
    id: "fe-redux-selector",
    category: "frontend",
    title: "useSelector 的订阅粒度",
    difficulty: "medium",
    tags: ["Redux", "性能"],
    prompt: "store 任意字段变了，组件都会渲染吗？选择器返回新对象时为什么每次都渲染？reselect 记住的是什么？",
    parts: [
      {
        type: "list",
        items: [
          "useSelector 在每次 store 更新时重跑选择器，用严格相等比较这次和上次的返回值。相等就跳过这次渲染。",
          "选出数字、字符串、原来就在 state 里的对象引用，比较才有意义。写出 s => ({ a: s.a, b: s.b }) 时，每次都是新对象，组件会跟着每一次 dispatch 渲染。",
          "要一次取多个字段，用 react-redux 的 shallowEqual 做浅比较，或者拆成多个 useSelector。",
          "createSelector 记住输入和上次的计算结果。users 和 keyword 都没变时，过滤函数不会重跑，返回的数组引用也不变。输入一变就重算。",
          "选择器必须是纯的。它里面发请求或读 Date.now，记忆化和跳过渲染都会乱。",
        ],
      },
    ],
    followUps: ["多个组件共用一个 createSelector 实例时，参数不同会不会互相覆盖缓存？"],
  },
  {
    id: "fe-redux-immutable",
    category: "frontend",
    title: "Redux 里的不可变更新",
    difficulty: "medium",
    tags: ["Redux", "不可变"],
    prompt: "改嵌套对象时，为什么每一层都要拷贝？只拷最内层行不行？Immer 省掉的是哪一步？",
    parts: [
      {
        type: "list",
        items: [
          "订阅比较的是引用。内层换成新对象、外层仍是旧对象时，从根上看引用没变，沿这条路径选出去的组件可能不渲染。",
          "手写就要从根到改动点每一层展开：新的 state、新的 list、新的那一项。没改到的兄弟继续共享旧引用。",
          "数组改某一项用 map 或 toSpliced 得到新数组，不要 splice 原数组。对象用展开运算符覆盖那一个键。",
          "Immer 的 produce 让你按可变写法描述修改，它记录改过的路径并只拷这些节点，结果仍是结构性共享的新树。RTK 的 slice 已经包了这一层。",
          "在 slice 外面拿到的 state 仍然不能改。开发模式的不变性检查会抓住对已提交 state 的写入。",
        ],
      },
    ],
    followUps: ["结构性共享之后，上一次的 state 还能不能给开发者工具回放？"],
  },
  {
    id: "fe-redux-normalize",
    category: "frontend",
    title: "状态为什么要归一化",
    difficulty: "medium",
    tags: ["Redux", "数据"],
    prompt: "接口返回的是嵌套的文章和作者。原样放进 store，改一个作者的名字要动哪些地方？",
    parts: [
      {
        type: "list",
        items: [
          "嵌套结构里同一个作者可能出现在很多文章下。改名就要找到每一处拷贝，漏一处界面就不一致。",
          "归一化后像表：users.byId、posts.byId，文章里只留 authorId。更新作者是一次按 id 写入。",
          "列表顺序单独放 allIds 或各个筛选条件自己的 id 数组，不要让顺序藏在对象的键里。",
          "RTK 的 createEntityAdapter 提供按 id 增删改、排序选择器，省掉手写 byId。关系仍然要自己定，它不是数据库。",
          "组件要树形数据时再在选择器里组装。存储用扁平，展示用嵌套，两边不要绑死。",
        ],
      },
    ],
    followUps: ["服务端又把整棵嵌套树返回来了，选择器里怎么并进已经归一的缓存？"],
  },
  {
    id: "fe-redux-query",
    category: "frontend",
    title: "RTK Query 管什么状态",
    difficulty: "medium",
    tags: ["Redux", "请求"],
    prompt: "列表请求的 loading、缓存、失效，为什么不建议每个页面写一套 slice？RTK Query 靠什么去重？",
    parts: [
      {
        type: "list",
        items: [
          "服务端状态和客户端状态不是一类。前者有请求中、过期、重新校验；后者是主题、草稿、向导走到第几步。",
          "RTK Query 用 endpoint 名字加参数当缓存键。同样的查询在飞时会合并成一次请求，多个组件订阅同一份缓存。",
          "失效靠 tag。mutation 声明自己使哪些 tag 失效，相关 query 会重新请求。不必在每个调用点手动 dispatch refetch。",
          "乐观更新要提供回滚：先改缓存，请求失败再补回。不幂等的操作不要乐观到无法撤销的地步。",
          "登录用户、表格勾选、未提交的表单仍放普通 slice 或组件 state。不要把所有东西都塞进 endpoint。",
        ],
      },
    ],
    followUps: ["参数是对象时，键的顺序不同算不算同一次查询？"],
  },
  {
    id: "fe-hand-redux",
    category: "frontend",
    title: "手写一个最小的 store",
    difficulty: "medium",
    tags: ["手写", "Redux"],
    prompt: "不看库，写一个有 getState、dispatch、subscribe 的 createStore。订阅者什么时候被调用？",
    parts: [
      {
        type: "list",
        items: [
          "闭包里放 currentState 和监听集合。getState 返回当前值，不要返回可以随意改的内部副本以外的活引用，调用方守不守约要在回答里说明。",
          "dispatch 用 reducer 算出新 state，再逐个调用监听。监听里如果再 dispatch，要约定是立刻重入还是排队，真库会做保护。",
          "subscribe 返回取消函数。组件卸载不取消，旧监听会继续跑，并可能去 setState 一个已卸载的树。",
          "中间件可以之后再包：dispatch 换成被包装的函数，reducer 仍是最后一步。先把这三个 API 讲清楚。",
          "和 Zustand 的差别：这个 store 不知道 React，绑定渲染是 react-redux 的事。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "function createStore<S, A>(reducer: (state: S, action: A) => S, initial: S) {\n  let state = initial;\n  const listeners = new Set<() => void>();\n  return {\n    getState: () => state,\n    dispatch(action: A) {\n      state = reducer(state, action);\n      listeners.forEach((listener) => listener());\n    },\n    subscribe(listener: () => void) {\n      listeners.add(listener);\n      return () => listeners.delete(listener);\n    },\n  };\n}",
      },
    ],
    followUps: ["第一次 subscribe 时要不要立刻把当前 state 推给监听者？"],
  },
  {
    id: "fe-zustand-basic",
    category: "frontend",
    title: "Zustand 的 store 怎么建",
    difficulty: "medium",
    tags: ["Zustand", "状态"],
    prompt: "create 拿到的 set 和 get 做什么？为什么组件外面也能读到同一份状态？set 是深合并吗？",
    parts: [
      {
        type: "list",
        items: [
          "create 的参数是 (set, get) => 初始状态。状态和改它的函数放在一起，函数里用 set 写入、用 get 读最新值。",
          "set 默认做一层浅合并：set({ count: 1 }) 只覆盖 count，别的字段还在。返回的对象不是整份替换。第二个参数传 true 才是替换整棵状态。",
          "函数形式 set((state) => ({ count: state.count + 1 })) 同样是浅合并你返回的那一部分。不要在里面改 state 本身，除非包了 immer 中间件。",
          "钩子就是 store。模块加载时 store 已存在，所以组件外可以 useStore.getState() 和 useStore.setState()，事件回调里也不会拿到过期的闭包状态。",
          "没有 Provider，是因为默认就是模块级单例。测试或多实例时要改成工厂函数，每个调用者拿到自己的 store。",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: "const useCounter = create<{ count: number; inc: () => void }>((set) => ({\n  count: 0,\n  inc: () => set((state) => ({ count: state.count + 1 })),\n}));\n\nuseCounter.getState().inc();",
      },
    ],
    followUps: ["把整个状态换成一个新对象时，原来的 action 函数为什么会丢？"],
  },
  {
    id: "fe-zustand-selector",
    category: "frontend",
    title: "Zustand 选择器和重渲染",
    difficulty: "medium",
    tags: ["Zustand", "性能"],
    prompt: "组件写成 useStore() 和写成 useStore(s => s.count)，渲染范围差在哪？什么写法会触发 getSnapshot 死循环？",
    parts: [
      {
        type: "list",
        items: [
          "不传选择器时，组件订阅整份状态，任意字段变化都会渲染。传选择器时，只比较选择器的返回值。",
          "比较是 Object.is。选出 count 这种原始值，别的字段变了不会渲染。选出 state.user 这种本就在 store 里的引用，也只在换了引用时渲染。",
          "选择器里现拼对象或数组，每次调用都是新引用，一次 store 更新就会让这个组件渲染，React 还可能因为 getSnapshot 不稳定而反复渲染。",
          "需要取出多个字段时用 useShallow，按第一层浅比较。或者拆成多次选取。",
          "选择器在渲染期间执行，必须快且纯。过滤大列表应先想缓存，而不是每个组件订阅后再 filter。",
        ],
      },
    ],
    followUps: ["useShallow 浅比较遇到嵌套对象，里面的字段变了但外层引用没变，组件会渲染吗？"],
  },
  {
    id: "fe-zustand-middleware",
    category: "frontend",
    title: "Zustand 的 persist、immer 和 devtools",
    difficulty: "medium",
    tags: ["Zustand", "中间件"],
    prompt: "刷新后状态还在，是 persist 做了什么？它会把 action 也存进 localStorage 吗？中间件的包裹顺序怎么影响结果？",
    parts: [
      {
        type: "list",
        items: [
          "persist 在变更后把状态 JSON 化写入 storage，启动时再合并回来。函数序列化后会消失，所以存的是数据，action 仍由 create 重新定义。",
          "partialize 用来挑字段。令牌、临时的请求中标记、不能序列化的 Map，都不要默默写进 localStorage。",
          "给 persist 配 version 和 migrate。状态形状改了而没有迁移，读出来的旧数据会让界面按新代码去读一个不存在的字段。",
          "immer 中间件允许 set 里按可变方式改 draft。devtools 把变更接到 Redux 开发者工具。包裹时先想清楚谁在最外层看见状态。",
          "persist 是同步 storage 时会卡住主线程。大对象要换存储，或者不要每次按键都写。",
        ],
      },
    ],
    followUps: ["同一个浏览器开两个标签，persist 会不会互相覆盖？"],
  },
  {
    id: "fe-zustand-sync",
    category: "frontend",
    title: "Zustand 为什么不用 Provider",
    difficulty: "hard",
    tags: ["Zustand", "React"],
    prompt: "它靠什么在并发渲染下不撕裂？服务端渲染时，模块级 store 会出什么错？",
    parts: [
      {
        type: "list",
        items: [
          "store 是外部存储，React 组件通过 useSyncExternalStore 订阅。这个 hook 会在渲染中读 getSnapshot，并在存储变化时安排更新。",
          "getSnapshot 必须稳定：同一次存储状态下多次调用要返回相同引用。选择器每次返回新对象，就会触发「snapshot 应被缓存」的警告，严重时死循环。",
          "并发渲染下如果一个组件读到新值、另一个读到旧值，就是撕裂。useSyncExternalStore 保证同一次渲染看到一致的快照。自己用 useEffect 加 useState 去模拟订阅，做不到这一点。",
          "没有 Provider 的代价是：这份 store 跟模块走。Node 上所有请求共享模块时，会把用户 A 的状态泄露给用户 B。服务端要按请求创建 store。",
          "只在浏览器里的全局 UI 状态，模块单例最省事。需要隔离的地方再放进 Context，把 store 实例传下去，而不是把每个字段传下去。",
        ],
      },
    ],
    followUps: ["React 19 的 use 和 useSyncExternalStore 解决的是同一类问题吗？"],
  },
  {
    id: "fe-zustand-slice",
    category: "frontend",
    title: "Zustand 用一个 store 还是多个",
    difficulty: "medium",
    tags: ["Zustand", "架构"],
    prompt: "按功能拆成很多小 store，和合成一个大 store，更新原子性和订阅上各有什么差别？",
    parts: [
      {
        type: "list",
        items: [
          "小 store 彼此独立，选择器自然不会被无关更新打扰，文件也小。一次交互要同时改用户和购物车时，两次 set 是两次通知，中间可能被各画一帧。",
          "一个 store 里可以在一次 set 中改多个切片，订阅者要么看见旧的一整份，要么看见新的一整份。需要同时成立的状态放在一起。",
          "大 store 没有 Redux 那种强制的 reducer 分区，靠对象字段和选择器自己约束。切片可以写成函数再展开进 create，避免一个文件上千行。",
          "跨 store 计算派生数据时没有内置的联合选择器。经常要一起读的状态，不要拆得太散。",
          "和后端缓存库并存时，Zustand 只留界面状态。列表数据不要抄一份进 store 再手工同步。",
        ],
      },
    ],
    followUps: ["切片之间互相调用 action，怎样避免循环依赖？"],
  },
  {
    id: "fe-zustand-subscribe",
    category: "frontend",
    title: "Zustand 的瞬态订阅",
    difficulty: "medium",
    tags: ["Zustand", "订阅"],
    prompt: "鼠标移动要驱动画布，但不想让 React 每帧渲染。不用选择器钩子时怎么听 store？",
    parts: [
      {
        type: "list",
        items: [
          "useStore.subscribe(listener) 在任何变化时调用监听，不经过组件渲染。适合打日志、同步到画布、或非 React 的模块。",
          "只关心一个字段时用 subscribeWithSelector。比较用相等函数，避免无关字段也进回调。",
          "在组件里订阅必须在 effect 里做，并返回取消。写在渲染函数体里会每次渲染加一个监听。",
          "回调里要读最新状态用 getState，不要依赖订阅参数以外的旧闭包。改 DOM 或画布可以直接做，不要再 setState 把渲染请回来。",
          "瞬态更新解决的是「值变了但视图树不必动」。真正要显示在 React 控件里的值，仍应走选择器。",
        ],
      },
    ],
    followUps: ["subscribe 的监听里再 setState，和选择器渲染比，多了哪一次提交？"],
  },
];
