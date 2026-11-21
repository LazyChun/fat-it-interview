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

describe("buildJsSandboxHtml", () => {
  it("inlines lodash and listens for a run message", () => {
    const html = buildJsSandboxHtml("window._ = function () {};");
    expect(html).toContain("window._ = function () {};");
    expect(html).toContain("fat-js-play");
    expect(html).toContain("unsafe-eval");
    expect(html).not.toContain("allow-same-origin");
  });
});
