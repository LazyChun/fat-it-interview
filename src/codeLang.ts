import { isCodeLang, type CodeLang } from "./data/codeSamples";

/** 代码块语言偏好：切一次，所有题目、所有代码块同步。 */
const KEY = "fat-it-interview.codeLang.v1";
const DEFAULT_LANG: CodeLang = "js";

const listeners = new Set<() => void>();
let cache: CodeLang | null = null;

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function getCodeLang(): CodeLang {
  if (cache) return cache;
  const box = storage();
  if (!box) return DEFAULT_LANG;
  try {
    const saved: unknown = JSON.parse(box.getItem(KEY) || "null");
    cache = isCodeLang(saved) ? saved : DEFAULT_LANG;
  } catch {
    cache = DEFAULT_LANG;
  }
  return cache;
}

export function setCodeLang(lang: CodeLang): void {
  if (!isCodeLang(lang) || getCodeLang() === lang) return;
  cache = lang;
  const box = storage();
  if (box) {
    try {
      box.setItem(KEY, JSON.stringify(lang));
    } catch {
      /* 隐私模式等场景下写失败时只保留内存态 */
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeCodeLang(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
