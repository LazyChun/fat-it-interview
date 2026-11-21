import vm from "node:vm";
import lodash from "lodash";
import { describe, expect, it } from "vitest";
import { DEFAULT_JS_SOURCE, readJsPlay } from "../src/blocks/jsPlay/defaultSource";
import { prepareJsSource } from "../src/blocks/jsPlay/prepare";
import { buildJsSandboxHtml } from "../src/blocks/jsPlay/sandboxHtml";

interface TestConsole {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

async function run(source: string, logs: string[] = []): Promise<unknown> {
  const code = prepareJsSource(source);
  const fn = new Function("_", "console", code) as (
    lodash: typeof import("lodash"),
    console: TestConsole,
  ) => Promise<unknown>;
  const sink = (...args: unknown[]) => {
    logs.push(
      args
        .map((item) => {
          if (typeof item === "string") return item;
          try {
            return JSON.stringify(item);
          } catch {
            return String(item);
          }
        })
        .join(" "),
    );
  };
  return fn(lodash, { log: sink, info: sink, warn: sink, error: sink });
}

describe("prepareJsSource", () => {
  it("runs the default sample with lodash imports and the global _", async () => {
    const logs: string[] = [];
    const result = await run(DEFAULT_JS_SOURCE, logs);
    expect(result).toEqual({ 北京: 160, 上海: 80 });
    expect(logs[0]).toContain("北京");
    expect(prepareJsSource(DEFAULT_JS_SOURCE)).not.toMatch(/\bimport\b/);
  });

  it("rewrites default, named, path, and namespace imports", async () => {
    const result = await run(`
      import _ from "lodash";
      import lodash from "lodash-es";
      import * as lo from "lodash";
      import debounce from "lodash/debounce";
      import { chunk } from "lodash";
      return {
        same: _ === lodash && lodash === lo,
        debounced: typeof debounce,
        pairs: chunk([1, 2, 3], 2),
      };
    `);
    expect(result).toEqual({
      same: true,
      debounced: "function",
      pairs: [[1, 2], [3]],
    });
  });

  it("accepts require, dynamic import, and a type annotation", async () => {
    const result = await run(`
      import type { Dictionary } from "lodash";
      const sum = require("lodash/sum");
      const loaded = await import("lodash");
      const totals: Dictionary<number> = { a: sum([1, 2]) };
      return loaded.sum([1]) + totals.a;
    `);
    expect(result).toBe(4);
  });

  it("returns an awaited value", async () => {
    await expect(run(`return await Promise.resolve(_.sum([1, 2, 3]));`)).resolves.toBe(6);
  });

  it("rejects packages that are not lodash", () => {
    expect(() => prepareJsSource(`import x from "dayjs";\nreturn x;`)).toThrow(/dayjs/);
    expect(() => prepareJsSource(`return require("dayjs");`)).toThrow(/dayjs/);
  });

  it("rejects an empty file and a syntax error", () => {
    expect(() => prepareJsSource("  \n")).toThrow(/空/);
    expect(() => prepareJsSource("return {")).toThrow();
  });
});

describe("readJsPlay", () => {
  it("falls back to the sample and the code-card style defaults", () => {
    expect(readJsPlay(undefined)).toMatchObject({
      source: DEFAULT_JS_SOURCE,
      theme: "dark",
      showConsole: true,
      consolePlacement: "bottom",
    });
  });

  it("keeps a saved theme and console placement", () => {
    const play = readJsPlay({
      jsPlay: {
        source: "return 1;",
        theme: "light",
        showConsole: false,
        consolePlacement: "right",
      },
    });
    expect(play).toMatchObject({
      source: "return 1;",
      theme: "light",
      showConsole: false,
      consolePlacement: "right",
    });
  });
});

function bootSource(): string {
  const html = buildJsSandboxHtml("window._ = function () {};");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const boot = scripts[scripts.length - 1]?.[1];
  if (!boot) throw new Error("沙箱脚本缺失");
  return boot;
}

interface SandboxMessage {
  kind?: string;
  level?: string;
  text?: string;
  ok?: boolean;
  hasResult?: boolean;
  result?: unknown;
  error?: string;
}

interface TimerTask {
  id: number;
  delay: number;
  seq: number;
  run: () => void;
}

function createRealm() {
  const messages: SandboxMessage[] = [];
  const tasks: TimerTask[] = [];
  const dead = new Set<number>();
  const listeners: Record<string, Array<(event: { data?: unknown }) => void>> = {};
  let nextId = 0;
  let seq = 0;
  const context = vm.createContext({
    parent: {
      postMessage(payload: SandboxMessage) {
        messages.push(payload);
      },
    },
  });
  context.window = context;
  context._ = function lodashStub() {
    return undefined;
  };
  const clear = (id: number) => {
    dead.add(id);
  };
  context.setTimeout = (fn: () => void, delay?: number) => {
    const id = ++nextId;
    tasks.push({
      id,
      delay: Number(delay) || 0,
      seq: ++seq,
      run() {
        if (dead.has(id)) return;
        fn();
      },
    });
    return id;
  };
  context.setInterval = (fn: () => void, delay?: number) => {
    const id = ++nextId;
    const arm = () => {
      if (dead.has(id)) return;
      tasks.push({
        id,
        delay: Number(delay) || 0,
        seq: ++seq,
        run() {
          if (dead.has(id)) return;
          fn();
          arm();
        },
      });
    };
    arm();
    return id;
  };
  context.clearTimeout = clear;
  context.clearInterval = clear;
  context.addEventListener = (type: string, fn: (event: { data?: unknown }) => void) => {
    const bucket = listeners[type] || [];
    bucket.push(fn);
    listeners[type] = bucket;
  };
  vm.runInContext(bootSource(), context);

  const popNext = () => {
    const live = tasks
      .map((task, index) => ({ task, index }))
      .filter(({ task }) => !dead.has(task.id));
    if (!live.length) return null;
    live.sort((a, b) => a.task.delay - b.task.delay || a.task.seq - b.task.seq);
    const picked = live[0];
    tasks.splice(picked.index, 1);
    return picked.task;
  };

  return {
    messages,
    dispatch(code: string) {
      for (const listener of listeners.message || []) {
        listener({ data: { type: "fat-js-play", kind: "run", id: 1, code } });
      }
    },
    async drain(limit = 40) {
      for (let i = 0; i < limit; i += 1) {
        await new Promise((resolve) => setImmediate(resolve));
        const task = popNext();
        if (!task) return;
        task.run();
      }
    },
  };
}

describe("buildJsSandboxHtml", () => {
  it("inlines lodash and listens for a run message", () => {
    const html = buildJsSandboxHtml("window._ = function () {};");
    expect(html).toContain("window._ = function () {};");
    expect(html).toContain("fat-js-play");
    expect(html).toContain("unsafe-eval");
    expect(html).not.toContain("allow-same-origin");
  });

  it("prints the timeout after microtasks, then finishes", async () => {
    const realm = createRealm();
    realm.dispatch(
      prepareJsSource(`
        console.log(1);
        setTimeout(() => console.log(2));
        Promise.resolve().then(() => console.log(3));
        console.log(4);
      `),
    );
    await new Promise((resolve) => setImmediate(resolve));
    expect(realm.messages.filter((item) => item.kind === "log").map((item) => item.text)).toEqual([
      "1",
      "4",
      "3",
    ]);
    expect(realm.messages.some((item) => item.kind === "done")).toBe(false);
    await realm.drain();
    expect(realm.messages.filter((item) => item.kind === "log").map((item) => item.text)).toEqual([
      "1",
      "4",
      "3",
      "2",
    ]);
    expect(realm.messages.at(-1)).toMatchObject({ kind: "done", ok: true, hasResult: false });
  });

  it("keeps a timer scheduled from a microtask", async () => {
    const realm = createRealm();
    realm.dispatch(`
      console.log(1);
      Promise.resolve().then(() => setTimeout(() => console.log(2)));
    `);
    await realm.drain();
    expect(realm.messages.filter((item) => item.kind === "log").map((item) => item.text)).toEqual(["1", "2"]);
    expect(realm.messages.at(-1)).toMatchObject({ kind: "done", ok: true });
  });

  it("runs a follow-up timeout before finishing", async () => {
    const realm = createRealm();
    realm.dispatch(`
      console.log(1);
      setTimeout(() => {
        console.log(2);
        setTimeout(() => console.log(3));
      });
    `);
    await realm.drain();
    expect(realm.messages.filter((item) => item.kind === "log").map((item) => item.text)).toEqual([
      "1",
      "2",
      "3",
    ]);
    expect(realm.messages.filter((item) => item.kind === "done")).toHaveLength(1);
  });

  it("does not run a cleared timeout", async () => {
    const realm = createRealm();
    realm.dispatch(`
      var id = setTimeout(() => console.log(2));
      clearTimeout(id);
      console.log(1);
    `);
    await realm.drain();
    expect(realm.messages.filter((item) => item.kind === "log").map((item) => item.text)).toEqual(["1"]);
    expect(realm.messages.at(-1)).toMatchObject({ kind: "done", ok: true });
  });

  it("finishes after a cleared interval", async () => {
    const realm = createRealm();
    realm.dispatch(`
      var n = 0;
      var id = setInterval(() => {
        n += 1;
        console.log(n);
        if (n === 2) clearInterval(id);
      });
    `);
    await realm.drain();
    expect(realm.messages.filter((item) => item.kind === "log").map((item) => item.text)).toEqual(["1", "2"]);
    expect(realm.messages.filter((item) => item.kind === "done")).toHaveLength(1);
  });
});
