import type { Question } from "./types";

/**
 * 2025 前端面试题合集里反复出现、适合直接跑起来看结果的题。
 * JavaScript 进控制台，React / Vue 进预览页。
 */
export const frontendPlayQuestions: Question[] = [
  {
    id: "fe-js-async-order",
    category: "frontend",
    title: "async 和 Promise 的输出顺序",
    difficulty: "medium",
    tags: ["JavaScript", "事件循环"],
    prompt: "先不要跑。说出下面这段代码的打印顺序，再说 await 为什么等于一次 then。",
    parts: [
      {
        type: "list",
        items: [
          "同步代码先走完：script start、async2 end、promise、script end。async2 在自己的 await 之前是同步的，所以 async2 end 不会进微任务。",
          "await async2() 时，async2 已经返回完成的 Promise，async1 的后半段立刻排进微任务。后面的 then 才注册，所以先 async1 end，再 promise1、promise2。",
          "setTimeout 是宏任务，本轮微任务清空之后才打印。点执行，控制台顺序就是这个。",
          "有的引擎会给 await 再补一个微任务，async1 end 会落到 promise2 后面。面试时先讲清「同步段 / 微任务入队时机 / 宏任务」，再承认引擎差异。",
        ],
      },
      {
        type: "code",
        lang: "js",
        code: "console.log(\"script start\");\n\nasync function async1() {\n  await async2();\n  console.log(\"async1 end\");\n}\n\nasync function async2() {\n  console.log(\"async2 end\");\n}\n\nasync1();\n\nsetTimeout(() => console.log(\"setTimeout\"), 0);\n\nnew Promise((resolve) => {\n  console.log(\"promise\");\n  resolve();\n})\n  .then(() => console.log(\"promise1\"))\n  .then(() => console.log(\"promise2\"));\n\nconsole.log(\"script end\");",
      },
    ],
    followUps: ["如果 async2 里也有一个 await Promise.resolve()，async1 end 会再挪到哪？"],
  },
  {
    id: "fe-react-key-live",
    category: "frontend",
    title: "列表 key 用 index 会串状态",
    difficulty: "medium",
    tags: ["React", "key"],
    prompt: "两个输入框，一个用 index 当 key，一个用稳定 id。在头部插入一项后，输入内容会跟着谁走？",
    parts: [
      {
        type: "list",
        items: [
          "key 是这一项的身份。React 用它决定复用哪个组件实例，输入框里的 state 挂在实例上。",
          "用 index 时，头部插入会让后面的 index 全部错位。原来第 0 项的输入会留在新的第 0 项上，看起来像内容串了。",
          "用稳定 id 时，插入只是多一个节点，原来的输入还在原来的项上。",
          "列表不会重排、不会插入删除时，index 碰巧没问题。面试里要主动说出这个前提。",
        ],
      },
      {
        type: "code",
        lang: "tsx",
        code: "function Row({ label }) {\n  const [text, setText] = React.useState(\"\");\n  return (\n    <label style={{ display: \"block\", marginBottom: 6 }}>\n      {label}{\" \"}\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n    </label>\n  );\n}\n\nfunction Column({ title, items, getKey }) {\n  return (\n    <div>\n      <h4 style={{ margin: \"0 0 8px\" }}>{title}</h4>\n      {items.map((item, index) => (\n        <Row key={getKey(item, index)} label={item.name} />\n      ))}\n    </div>\n  );\n}\n\nfunction App() {\n  const [items, setItems] = React.useState([\n    { id: \"a\", name: \"A\" },\n    { id: \"b\", name: \"B\" },\n  ]);\n  let nextId = React.useRef(0);\n\n  return (\n    <div>\n      <button\n        onClick={() => {\n          nextId.current += 1;\n          const id = \"n\" + nextId.current;\n          setItems((prev) => [{ id, name: id.toUpperCase() }, ...prev]);\n        }}\n      >\n        在头部插入\n      </button>\n      <p>先在输入框里打字，再插入，对比两边的内容跟着谁。</p>\n      <div style={{ display: \"flex\", gap: 24 }}>\n        <Column title=\"key = index\" items={items} getKey={(_, index) => index} />\n        <Column title=\"key = id\" items={items} getKey={(item) => item.id} />\n      </div>\n    </div>\n  );\n}",
      },
    ],
    followUps: ["key 放在组件内部和放在列表的 map 上，有什么差别？"],
  },
];
