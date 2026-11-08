/**
 * 算法题代码示例的语言定义。
 * 题目数据、代码块 tab、复制答案、全局偏好共用同一套语言 id。
 */

export const CODE_LANGS = [
  "js",
  "ts",
  "java",
  "python",
  "cpp",
  "go",
  "rust",
] as const;

export type CodeLang = (typeof CODE_LANGS)[number];

/** 一道题的多语言示例。算法题要求七种语言齐全。 */
export type CodeSamples = Record<CodeLang, string>;

/** 按题型文件维护的前五种语言；Go / Rust 在各自的补充文件里。 */
export type BaseCodeSamples = Omit<CodeSamples, "go" | "rust">;

export interface CodeLangMeta {
  /** tab 上的短名 */
  short: string;
  /** 代码块标题、复制答案里的完整名 */
  label: string;
  /** monaco 语言 id，需要与 webpack 的 MonacoWebpackPlugin languages 对齐 */
  monaco: string;
  /** 复制答案时 markdown 代码围栏的名字 */
  fence: string;
}

export const CODE_LANG_META: Record<CodeLang, CodeLangMeta> = {
  js: { short: "JS", label: "JavaScript", monaco: "javascript", fence: "js" },
  ts: { short: "TS", label: "TypeScript", monaco: "typescript", fence: "ts" },
  java: { short: "Java", label: "Java", monaco: "java", fence: "java" },
  python: { short: "Python", label: "Python", monaco: "python", fence: "python" },
  cpp: { short: "C++", label: "C++", monaco: "cpp", fence: "cpp" },
  go: { short: "Go", label: "Go", monaco: "go", fence: "go" },
  rust: { short: "Rust", label: "Rust", monaco: "rust", fence: "rust" },
};

export function isCodeLang(value: unknown): value is CodeLang {
  return (
    typeof value === "string" &&
    (CODE_LANGS as readonly string[]).includes(value)
  );
}

/** 题目里实际提供了示例的语言，按固定顺序返回。 */
export function availableLangs(samples: Partial<CodeSamples>): CodeLang[] {
  return CODE_LANGS.filter((lang) => {
    const value = samples[lang];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/** 偏好语言没有示例时，按 CODE_LANGS 顺序回退到第一种可用语言。 */
export function pickSample(
  samples: Partial<CodeSamples>,
  preferred: CodeLang,
): { lang: CodeLang; code: string } | null {
  const order: CodeLang[] = [
    preferred,
    ...CODE_LANGS.filter((lang) => lang !== preferred),
  ];
  for (const lang of order) {
    const value = samples[lang];
    if (typeof value === "string" && value.trim().length > 0) {
      return { lang, code: value };
    }
  }
  return null;
}

/**
 * 代码块用标签模板书写，自动去掉公共缩进，避免源码缩进进入答案。
 * 示例代码里不要写 ${...} 或反引号，标签模板会把它们当成插值语法。
 */
export function code(text: TemplateStringsArray): string {
  const lines = text.raw
    .join("")
    .replace(/^\n/, "")
    .replace(/\s+$/, "")
    .split("\n");
  const filled = lines.filter((line) => line.trim().length > 0);
  const indent = filled.length
    ? Math.min(...filled.map((line) => /^[ \t]*/.exec(line)?.[0].length ?? 0))
    : 0;
  return lines.map((line) => line.slice(indent)).join("\n");
}
