import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import * as Vue from "vue";
import lodash from "lodash";
import { describe, expect, it } from "vitest";
import { DEFAULT_VUE_SOURCE, readVuePlay } from "../src/blocks/vuePlay/defaultSource";
import { prepareVueSource } from "../src/blocks/vuePlay/prepare";
import { buildVueSandboxHtml } from "../src/blocks/vuePlay/sandboxHtml";

async function renderHtml(source: string, props?: Record<string, unknown>): Promise<string> {
  const prepared = await prepareVueSource(source);
  const component = new Function("Vue", "_", prepared.code)(Vue, lodash) as object;
  return renderToString(createSSRApp(component, props));
}

describe("prepareVueSource", () => {
  it("renders the default single file component", async () => {
    const prepared = await prepareVueSource(DEFAULT_VUE_SOURCE);
    expect(prepared.code).not.toMatch(/\bimport\b/);
    expect(prepared.code).toContain("__scopeId");
    expect(prepared.css).toContain(".action[data-v-fatvue]");
    expect(prepared.css).toContain("#42b883");
    const html = await renderHtml(DEFAULT_VUE_SOURCE);
    expect(html).toContain("Vue 预览");
    expect(html).toContain("点击");
    expect(html).toContain("data-v-fatvue");
  });

  it("inlines script setup refs and keeps vue imports on the runtime", async () => {
    const html = await renderHtml(`
      <script setup lang="ts">
      import { ref } from "vue";
      const count = ref<number>(2);
      </script>
      <template><span>{{ count }}</span></template>
    `);
    expect(html).toContain(">2<");
  });

  it("renders an options api component", async () => {
    const html = await renderHtml(`
      <template><p>{{ msg }}</p></template>
      <script>
      export default { data() { return { msg: "hi" }; } };
      </script>
    `);
    expect(html).toContain("hi");
  });

  it("renders a template without a script", async () => {
    const html = await renderHtml("<p>你好</p>");
    expect(html).toContain("你好");
  });

  it("renders a module that export defaults a component", async () => {
    const html = await renderHtml(`
      import { h, ref } from "vue";
      export default {
        setup() {
          const count = ref(1);
          return () => h("span", null, String(count.value));
        },
      };
    `);
    expect(html).toContain(">1<");
  });

  it("rewrites ant-design-vue imports onto the sandbox global", async () => {
    const prepared = await prepareVueSource(`
      import { Button } from "ant-design-vue";
      import { Input } from "antd";
      export default {
        components: { Button, Input },
        setup() {
          return { Button, Input };
        },
      };
    `);
    expect(prepared.code).not.toMatch(/\bimport\b/);
    expect(prepared.code).toContain("const { Button } = antd");
    expect(prepared.code).toContain("const { Input } = antd");
  });

  it("rewrites lodash imports onto the sandbox global", async () => {
    const prepared = await prepareVueSource(`
      import debounce from "lodash/debounce";
      import { join } from "lodash";
      export default {
        setup() {
          return { label: join(["a", "b"], debounce ? "-" : "") };
        },
      };
    `);
    expect(prepared.code).not.toMatch(/\bimport\b/);
    expect(prepared.code).toContain("const debounce = _.debounce");
    expect(prepared.code).toContain("const { join } = _");
  });

  it("passes defineProps into the template", async () => {
    const html = await renderHtml(
      `
      <script setup lang="ts">
      defineProps<{ title: string }>();
      </script>
      <template><h3>{{ title }}</h3></template>
    `,
      { title: "题目" },
    );
    expect(html).toContain("题目");
  });

  it("compiles scoped less inside the component", async () => {
    const prepared = await prepareVueSource(`
      <template><h3 class="title">Vue</h3></template>
      <style lang="less" scoped>
      @brand: #42b883;
      .title { color: @brand; }
      </style>
    `);
    expect(prepared.css).toContain("color: #42b883");
    expect(prepared.css).toContain(".title[data-v-fatvue]");
  });

  it("rejects packages the preview does not ship", async () => {
    await expect(prepareVueSource(`import x from "dayjs"\nexport default { setup() { return { x } } }`)).rejects.toThrow(
      /dayjs/,
    );
  });

  it("rejects jsx scripts and css modules", async () => {
    await expect(
      prepareVueSource(`<script lang="jsx">export default {}</script>\n<template><i/></template>`),
    ).rejects.toThrow(/jsx/);
    await expect(
      prepareVueSource(`<template><i/></template>\n<style module>.a{color:red}</style>`),
    ).rejects.toThrow(/CSS Modules/);
  });

  it("rejects style imports", async () => {
    await expect(
      prepareVueSource(`<template><i/></template>\n<style>@import "x.css";</style>`),
    ).rejects.toThrow(/@import/);
  });

  it("rejects empty code and code that never defines a component", async () => {
    await expect(prepareVueSource("  \n")).rejects.toThrow(/空/);
    const prepared = await prepareVueSource("const n = 1;");
    expect(() => new Function("Vue", "_", prepared.code)({}, {})).toThrow(/export default/);
  });

  it("reports a template syntax error", async () => {
    await expect(prepareVueSource(`<template><button @click="("></button></template>`)).rejects.toThrow();
  });
});

describe("readVuePlay", () => {
  it("falls back to the sample and the code-card style defaults", () => {
    expect(readVuePlay(undefined)).toMatchObject({
      source: DEFAULT_VUE_SOURCE,
      theme: "dark",
      showConsole: true,
      consolePlacement: "bottom",
      showLess: false,
      less: "",
    });
  });

  it("keeps a saved theme, console switch, placement, and less", () => {
    const play = readVuePlay({
      vuePlay: {
        source: "<template><i/></template>",
        theme: "light",
        showConsole: false,
        consolePlacement: "right",
        showLess: true,
        less: ".title { color: red; }",
      },
    });
    expect(play.source).toContain("<template>");
    expect(play.theme).toBe("light");
    expect(play.showConsole).toBe(false);
    expect(play.consolePlacement).toBe("right");
    expect(play.showLess).toBe(true);
    expect(play.less).toContain(".title");
  });
});

describe("buildVueSandboxHtml", () => {
  it("inlines vue, lodash and ant-design-vue and does not let them close the script tag", () => {
    const html = buildVueSandboxHtml("vue</script>runtime", "lodash-runtime", "antd</script>runtime");
    expect(html).toContain("lodash-runtime");
    expect(html).toContain("antd<\\/script>runtime");
    expect(html).toContain("vue<\\/script>runtime");
    expect(html).not.toContain("vue</script>runtime");
    expect(html).not.toContain("antd</script>runtime");
    expect(html).toContain('id="root"');
    expect(html).toContain("fat-vue-play");
    expect(html).toContain("createApp");
    expect(html).toContain("ConfigProvider");
    expect(html).toContain("antdLocale");
    expect(html).toContain("fat-less");
    expect(html).toContain("data.css");
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((item) => item[1]);
    expect(scripts).toHaveLength(4);
    expect(() => new Function(scripts[3])).not.toThrow();
  });
});
