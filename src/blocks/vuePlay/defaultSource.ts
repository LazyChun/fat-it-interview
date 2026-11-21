/** 新卡片里的示例。用户改完后保存在 options.vuePlay.source。 */
export const DEFAULT_VUE_SOURCE = `<script setup>
import { ref } from "vue";

const count = ref(0);

function onClick() {
  count.value += 1;
  console.log("count", count.value);
}
</script>

<template>
  <div>
    <h3 class="title">Vue 预览</h3>
    <button class="action" @click="onClick">点击 {{ count }}</button>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 12px;
}
.action {
  color: #fff;
  background: #42b883;
  border: 0;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}
</style>
`;

export type VuePlayTheme = "dark" | "light";
export type VuePlayConsolePlacement = "bottom" | "right";

export interface VuePlayOptions {
  source: string;
  theme: VuePlayTheme;
  showConsole: boolean;
  consolePlacement: VuePlayConsolePlacement;
  /** 为 true 时才显示 Less 编辑器。已保存的样式在关闭编辑器后仍然生效。 */
  showLess: boolean;
  less: string;
}

export const DEFAULT_VUE_PLAY: VuePlayOptions = {
  source: DEFAULT_VUE_SOURCE,
  theme: "dark",
  showConsole: true,
  consolePlacement: "bottom",
  showLess: false,
  less: "",
};

export function readVuePlay(config: unknown): VuePlayOptions {
  const raw =
    config && typeof config === "object"
      ? (config as { vuePlay?: Partial<VuePlayOptions> }).vuePlay
      : undefined;
  return {
    source: typeof raw?.source === "string" ? raw.source : DEFAULT_VUE_SOURCE,
    theme: raw?.theme === "light" ? "light" : "dark",
    showConsole: raw?.showConsole !== false,
    consolePlacement: raw?.consolePlacement === "right" ? "right" : "bottom",
    showLess: raw?.showLess === true,
    less: typeof raw?.less === "string" ? raw.less : "",
  };
}
