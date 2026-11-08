import { describe, expect, it } from "vitest";
import { getCodeLang, setCodeLang, subscribeCodeLang } from "../src/codeLang";
import { ALGORITHM_CODE } from "../src/data/algorithmCode";
import { GO_CODE } from "../src/data/algorithmCode.go";
import { RUST_CODE } from "../src/data/algorithmCode.rust";
import {
  CODE_LANGS,
  CODE_LANG_META,
  code,
  pickSample,
  type CodeLang,
} from "../src/data/codeSamples";
import { answerToText } from "../src/data/format";
import { getQuestion, QUESTIONS } from "../src/data/questions";

const algoQuestions = QUESTIONS.filter((item) => item.category === "algorithm");

describe("algorithm code samples", () => {
  it("covers every algorithm question and nothing else", () => {
    expect(algoQuestions.length).toBe(21);
    expect(Object.keys(ALGORITHM_CODE).sort()).toEqual(
      algoQuestions.map((item) => item.id).sort(),
    );
  });

  it("gives each question seven non-empty, dedented samples", () => {
    for (const question of algoQuestions) {
      const blocks = question.parts.filter((part) => part.type === "samples");
      expect(blocks.length, question.id).toBe(1);
      // 原来的单语言片段已被多语言版本取代
      expect(question.parts.some((part) => part.type === "code")).toBe(false);
      const block = blocks[0];
      if (block.type !== "samples") continue;
      expect(block.title).toBe("代码示例");
      for (const lang of CODE_LANGS) {
        const snippet = block.samples[lang];
        expect(typeof snippet, `${question.id}/${lang}`).toBe("string");
        expect(snippet.trim().length, `${question.id}/${lang}`).toBeGreaterThan(40);
        expect(snippet.startsWith("\n")).toBe(false);
        expect(snippet.startsWith(" ")).toBe(false);
        expect(snippet, `${question.id}/${lang}`).not.toContain("undefined");
        expect(snippet, `${question.id}/${lang}`).not.toContain("${");
      }
    }
  });

  it("maps every language to a monaco language bundled by webpack", () => {
    expect(CODE_LANGS.map((lang) => CODE_LANG_META[lang].monaco)).toEqual([
      "javascript",
      "typescript",
      "java",
      "python",
      "cpp",
      "go",
      "rust",
    ]);
  });
});

describe("Go and Rust samples", () => {
  it("cover exactly the algorithm questions", () => {
    const ids = algoQuestions.map((item) => item.id).sort();
    expect(Object.keys(GO_CODE).sort()).toEqual(ids);
    expect(Object.keys(RUST_CODE).sort()).toEqual(ids);
  });

  it("look like real Go / Rust source", () => {
    for (const [id, snippet] of Object.entries(GO_CODE)) {
      expect(snippet, id).toContain("func ");
      expect(snippet, id).not.toContain("function ");
      expect(snippet, id).not.toContain("def ");
    }
    for (const [id, snippet] of Object.entries(RUST_CODE)) {
      expect(snippet, id).toContain("fn ");
      expect(snippet, id).not.toContain("function ");
      expect(snippet, id).not.toContain("def ");
    }
  });
});

describe("code helpers", () => {
  it("removes common indentation but keeps relative indentation", () => {
    const snippet = code`
      function f() {
        return 1;
      }
    `;
    expect(snippet).toBe("function f() {\n  return 1;\n}");
  });

  it("falls back to the first available language", () => {
    const partial = { ts: "const a = 1;", cpp: "int a = 1;" };
    expect(pickSample(partial, "java")?.lang).toBe("ts");
    expect(pickSample(partial, "cpp")?.lang).toBe("cpp");
    expect(pickSample({}, "js")).toBeNull();
  });
});

describe("copying answers", () => {
  it("includes only the selected language", () => {
    const question = getQuestion("algo-bubble");
    expect(question).not.toBeNull();
    if (!question) return;
    for (const lang of CODE_LANGS) {
      const text = answerToText(question, lang);
      expect(text).toContain("```" + CODE_LANG_META[lang].fence);
      expect(text).toContain(ALGORITHM_CODE["algo-bubble"][lang]);
      for (const other of CODE_LANGS.filter((item) => item !== lang)) {
        expect(text).not.toContain(ALGORITHM_CODE["algo-bubble"][other]);
      }
    }
  });

  it("still emits plain code parts from other categories", () => {
    const withCode = QUESTIONS.find(
      (item) => item.category !== "algorithm" && item.parts.some((part) => part.type === "code"),
    );
    expect(withCode).toBeDefined();
    if (!withCode) return;
    expect(answerToText(withCode)).toContain("```");
  });
});

describe("language preference", () => {
  it("notifies subscribers once per real change", () => {
    const initial = getCodeLang();
    let calls = 0;
    const unsubscribe = subscribeCodeLang(() => {
      calls += 1;
    });
    try {
      setCodeLang("cpp");
      expect(getCodeLang()).toBe("cpp");
      expect(calls).toBe(1);
      setCodeLang("cpp");
      expect(calls).toBe(1);
      expect(answerToText(getQuestion("algo-bubble")!)).toContain("```cpp");
      setCodeLang("rust");
      expect(answerToText(getQuestion("algo-bubble")!)).toContain("fn bubble_sort");
    } finally {
      unsubscribe();
      setCodeLang(initial as CodeLang);
    }
  });
});

interface JsCase {
  id: string;
  fn: string;
  run: (fn: any) => unknown;
  expected: unknown;
}

const tree = () => ({
  val: 2,
  left: { val: 1, left: null, right: null },
  right: { val: 3, left: null, right: null },
});
const grid = () => [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
const valuesOf = (head: any): number[] => {
  const out: number[] = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
};

/** 每道题的 JS 片段都真的能跑，且结果与演示一致。 */
const JS_CASES: JsCase[] = [
  { id: "algo-bubble", fn: "bubbleSort", run: (f) => f([5, 1, 4, 2, 8]), expected: [1, 2, 4, 5, 8] },
  { id: "algo-quick", fn: "quickSort", run: (f) => f([3, 1, 2, 1]), expected: [1, 1, 2, 3] },
  { id: "algo-merge", fn: "mergeSort", run: (f) => f([5, 1, 4, 2, 8]), expected: [1, 2, 4, 5, 8] },
  { id: "algo-binary", fn: "binarySearch", run: (f) => [f([1, 3, 5, 7, 9], 7), f([1, 3, 5], 4)], expected: [3, -1] },
  { id: "algo-selection", fn: "selectionSort", run: (f) => f([3, 1, 2, 1]), expected: [1, 1, 2, 3] },
  { id: "algo-insertion", fn: "insertionSort", run: (f) => f([3, 1, 2, 1]), expected: [1, 1, 2, 3] },
  { id: "algo-heap", fn: "heapSort", run: (f) => f([3, 1, 2, 1]), expected: [1, 1, 2, 3] },
  { id: "algo-lower", fn: "lowerBound", run: (f) => [f([1, 2, 2, 2, 3], 2), f([1, 3, 5], 4)], expected: [1, 2] },
  { id: "algo-two", fn: "twoSum", run: (f) => f([1, 2, 4, 7, 11, 15], 15), expected: [2, 4] },
  { id: "algo-window", fn: "maxWindowSum", run: (f) => f([2, 1, 5, 1, 3, 2], 3), expected: 9 },
  { id: "algo-zero", fn: "moveZeroes", run: (f) => f([0, 1, 0, 3, 12]), expected: [1, 3, 12, 0, 0] },
  { id: "algo-bfs", fn: "shortestPath", run: (f) => f(grid(), [0, 0], [2, 2]), expected: 4 },
  { id: "algo-dfs", fn: "dfsReach", run: (f) => f(grid(), [0, 0], [2, 2]), expected: true },
  {
    id: "algo-list",
    fn: "reverseList",
    run: (f) => valuesOf(f({ val: 1, next: { val: 2, next: { val: 3, next: null } } })),
    expected: [3, 2, 1],
  },
  {
    id: "algo-cycle",
    fn: "hasCycle",
    run: (f) => {
      const a: any = { val: 1, next: null };
      const b: any = { val: 2, next: null };
      const c: any = { val: 3, next: b };
      a.next = b;
      b.next = c;
      return [f(a), f({ val: 1, next: null })];
    },
    expected: [true, false],
  },
  { id: "algo-inorder", fn: "inorder", run: (f) => f(tree()), expected: [1, 2, 3] },
  { id: "algo-level", fn: "levelOrder", run: (f) => f(tree()), expected: [[2], [1, 3]] },
  { id: "algo-knapsack", fn: "knapsack", run: (f) => f([1, 3, 4], [15, 20, 30], 4), expected: 35 },
  { id: "algo-kadane", fn: "maxSubArray", run: (f) => f([-2, 1, -3, 4, -1, 2, 1, -5, 4]), expected: 6 },
  { id: "algo-climb", fn: "climbStairs", run: (f) => f(5), expected: 8 },
  { id: "algo-lcs", fn: "lcsLength", run: (f) => f("ace", "abcde"), expected: 3 },
];

describe("JavaScript samples run correctly", () => {
  it("has a case for every algorithm question", () => {
    expect(JS_CASES.map((item) => item.id).sort()).toEqual(
      algoQuestions.map((item) => item.id).sort(),
    );
  });

  for (const item of JS_CASES) {
    it(`${item.id}: ${item.fn}`, () => {
      const snippet = ALGORITHM_CODE[item.id]?.js ?? "";
      const factory = new Function(snippet + "\nreturn " + item.fn + ";");
      const fn = factory();
      expect(typeof fn).toBe("function");
      expect(item.run(fn)).toEqual(item.expected);
    });
  }
});
