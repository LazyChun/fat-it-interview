/**
 * 把用户写的 Less 编成预览页能直接插入的 CSS。
 * 用 Less 的核心编译器，不带 Node 的 fs，也不在加载时读 window。
 */
import createLess from "less/lib/less/index.js";
import createDefaultOptions from "less/lib/less/default-options.js";

const less = createLess();
less.options = createDefaultOptions();

// 核心入口不带插件加载器。预览拒绝 @plugin，这里只满足编译器的构造调用。
class EmptyPluginLoader {
  less: unknown;

  constructor(api: unknown) {
    this.less = api;
  }
}

less.PluginLoader = EmptyPluginLoader;

const BLOCKED_AT_RULE = /@(import|plugin)\b/i;

function formatLessError(error: unknown): string {
  if (error && typeof error === "object") {
    const detail = error as { message?: unknown; line?: unknown };
    const message = typeof detail.message === "string" ? detail.message.trim() : "";
    const line = typeof detail.line === "number" ? detail.line : 0;
    if (message) {
      return line > 0 ? `Less 第 ${line} 行：${message}` : `Less：${message}`;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Less 编译失败";
}

export async function compileLess(source: string): Promise<string> {
  const trimmed = source.trim();
  if (!trimmed) return "";
  if (BLOCKED_AT_RULE.test(trimmed)) {
    throw new Error("预览里的 Less 不支持 @import 和 @plugin");
  }
  try {
    const result = await less.render(trimmed, {
      filename: "play.less",
      javascriptEnabled: false,
    });
    return result.css;
  } catch (error) {
    throw new Error(formatLessError(error));
  }
}
