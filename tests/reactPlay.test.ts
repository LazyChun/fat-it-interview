import { describe, expect, it } from "vitest";
import {
  DEFAULT_REACT_SOURCE,
  readReactPlay,
  readReactSource,
} from "../src/blocks/reactPlay/defaultSource";
import { compileLess } from "../src/blocks/reactPlay/compileLess";
import { prepareReactSource } from "../src/blocks/reactPlay/prepare";
import { buildReactSandboxHtml } from "../src/blocks/reactPlay/sandboxHtml";

interface FakeElement {
  type: unknown;
  props: Record<string, unknown> | null;
  children: unknown[];
}

function createFakeReact() {
  const React = {
    Fragment: "fragment",
    useState<T>(value: T): [T, (next: T | ((prev: T) => T)) => void] {
      return [value, () => undefined];
    },
    createElement(
      type: unknown,
      props: Record<string, unknown> | null,
      ...children: unknown[]
    ): FakeElement {
      return { type, props, children };
    },
  };
  return React;
}

function renderSource(source: string): FakeElement {
  const React = createFakeReact();
  const component = new Function("React", "ReactDOM", prepareReactSource(source))(
    React,
    {},
  ) as () => FakeElement;
  expect(typeof component).toBe("function");
  return component();
}

describe("prepareReactSource", () => {
  it("compiles the default sample into a component", () => {
    const element = renderSource(DEFAULT_REACT_SOURCE);
    expect(element.type).toBe("div");
    expect(element.children.some((child) => (child as FakeElement).type === "button")).toBe(true);
  });

  it("rewrites react imports and keeps hooks", () => {
    const element = renderSource(`
      import { useState } from "react";
      export default function Counter() {
        const [n] = useState(2);
        return <span>{n}</span>;
      }
    `);
    expect(element.type).toBe("span");
    expect(element.children).toContain(2);
    expect(prepareReactSource(`import { useState } from "react";\nfunction App(){ return <i/> }`)).not.toContain(
      "from \"react\"",
    );
  });

  it("accepts a react import with no space before from", () => {
    const element = renderSource(`
      import React,{useState}from "react"
      function App() {
        const [count] = useState(0);
        return <button>点击 {count}</button>;
      }
    `);
    expect(element.type).toBe("button");
    expect(element.children).toContain("点击 ");
    expect(element.children).toContain(0);
  });

  it("rewrites lodash and antd imports onto the sandbox globals", () => {
    const code = prepareReactSource(`
      import _ from "lodash"
      import { Button } from "antd"
      import debounce from "lodash/debounce"
      function App() {
        return <Button>{_.join(["a", "b"], "-")}</Button>;
      }
    `);
    expect(code).not.toMatch(/\bimport\b/);
    expect(code).toContain("const { Button } = antd");
    expect(code).toContain("const debounce = _.debounce");
  });

  it("rejects packages the preview does not ship", () => {
    expect(() => prepareReactSource(`import x from "dayjs"\nfunction App(){ return null }`)).toThrow(
      /dayjs/,
    );
  });

  it("wraps a bare jsx element as App", () => {
    const element = renderSource("<p>hi</p>");
    expect(element.type).toBe("p");
    expect(element.children).toContain("hi");
  });

  it("strips a type import and a type annotation", () => {
    const element = renderSource(`
      import type { FC } from "react";
      const App: FC = () => <b>ok</b>;
    `);
    expect(element.type).toBe("b");
  });

  it("rejects empty code", () => {
    expect(() => prepareReactSource("  \n")).toThrow(/空/);
  });

  it("rejects code that never defines a component", () => {
    expect(() => renderSource("const n = 1;")).toThrow(/function App/);
  });

  it("reports a syntax error from the compiler", () => {
    expect(() => prepareReactSource("function App( {")).toThrow();
  });
});

describe("readReactPlay", () => {
  it("falls back to the sample and the code-card style defaults", () => {
    expect(readReactSource(undefined)).toBe(DEFAULT_REACT_SOURCE);
    expect(readReactPlay(undefined)).toMatchObject({
      theme: "dark",
      showConsole: true,
      consolePlacement: "bottom",
      showLess: false,
      less: "",
    });
  });

  it("keeps a saved theme, console switch, placement, and less", () => {
    const play = readReactPlay({
      reactPlay: {
        source: "function App(){ return null }",
        theme: "light",
        showConsole: false,
        consolePlacement: "right",
        showLess: true,
        less: ".title { color: red; }",
      },
    });
    expect(play.source).toContain("function App");
    expect(play.theme).toBe("light");
    expect(play.showConsole).toBe(false);
    expect(play.consolePlacement).toBe("right");
    expect(play.showLess).toBe(true);
    expect(play.less).toContain(".title");
  });

  it("keeps the less editor hidden unless the flag is true", () => {
    expect(readReactPlay({ reactPlay: { showLess: false } }).showLess).toBe(false);
    expect(readReactPlay({ reactPlay: {} }).showLess).toBe(false);
  });
});

describe("compileLess", () => {
  it("compiles variables and nesting into class selectors", async () => {
    const css = await compileLess(`
      @brand: #1677ff;
      .card {
        color: @brand;
        .title { font-weight: 600; }
        &:hover { opacity: 0.8; }
      }
    `);
    expect(css).toContain("color: #1677ff");
    expect(css).toContain(".card .title");
    expect(css).toContain(".card:hover");
  });

  it("returns empty css for blank input", async () => {
    expect(await compileLess("  \n")).toBe("");
  });

  it("rejects imports and plugins", async () => {
    await expect(compileLess('@import "theme.less";')).rejects.toThrow(/@import/);
    await expect(compileLess('@plugin "x";')).rejects.toThrow(/@plugin/);
  });

  it("reports a less syntax error with the line number", async () => {
    await expect(compileLess(".card { color: red")).rejects.toThrow(/Less 第/);
  });
});

describe("buildReactSandboxHtml", () => {
  it("inlines react, lodash and antd and does not let them close the script tag", () => {
    const html = buildReactSandboxHtml(
      "react</script>runtime",
      "dom-runtime",
      "lodash-runtime",
      "antd-runtime",
    );
    expect(html).toContain("dom-runtime");
    expect(html).toContain("lodash-runtime");
    expect(html).toContain("antd-runtime");
    expect(html).toContain("react<\\/script>runtime");
    expect(html).not.toContain("react</script>runtime");
    expect(html).toContain('id="root"');
    expect(html).toContain("fat-react-play");
    expect(html).toContain("createRoot");
    expect(html).toContain("fat-less");
    expect(html).toContain("data.css");
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((item) => item[1]);
    expect(scripts).toHaveLength(5);
    expect(() => new Function(scripts[4])).not.toThrow();
  });
});
