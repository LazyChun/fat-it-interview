/**
 * 题目里 JavaScript 卡片的保存记录。
 * 纯数据：当前内容、历史、恢复默认、删除。落盘由 snippetStorage 负责。
 */

export const JS_SNIPPET_HISTORY_LIMIT = 30;

const JAVASCRIPT_LANGS = new Set(["js", "javascript", "jsx", "mjs", "cjs"]);

export interface JsSnippetRevision {
  id: string;
  savedAt: number;
  source: string;
}

export interface JsSnippetRecord {
  /** 最近一次明确留下的源码。缺省时编辑器使用题目里的默认代码。 */
  source?: string;
  history: JsSnippetRevision[];
}

export interface JsSnippetFile {
  snippets: Record<string, JsSnippetRecord>;
}

export function isJavaScriptLang(lang: string | null | undefined): boolean {
  return JAVASCRIPT_LANGS.has((lang ?? "").toLowerCase());
}

export function emptySnippetFile(): JsSnippetFile {
  return { snippets: {} };
}

function parseRevision(raw: unknown): JsSnippetRevision | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<JsSnippetRevision>;
  if (typeof item.id !== "string" || item.id.length === 0) return null;
  if (typeof item.source !== "string") return null;
  if (typeof item.savedAt !== "number" || !Number.isFinite(item.savedAt)) return null;
  return { id: item.id, savedAt: item.savedAt, source: item.source };
}

export function parseSnippetFile(raw: unknown): JsSnippetFile {
  const snippets: Record<string, JsSnippetRecord> = {};
  const box =
    raw && typeof raw === "object" ? (raw as { snippets?: unknown }).snippets : undefined;
  if (!box || typeof box !== "object") return { snippets };
  for (const [id, value] of Object.entries(box)) {
    if (!id || !value || typeof value !== "object") continue;
    const record = value as { source?: unknown; history?: unknown };
    const history = Array.isArray(record.history)
      ? record.history
          .map(parseRevision)
          .filter((item): item is JsSnippetRevision => item !== null)
          .slice(0, JS_SNIPPET_HISTORY_LIMIT)
      : [];
    const source = typeof record.source === "string" ? record.source : undefined;
    if (source === undefined && history.length === 0) continue;
    snippets[id] = source === undefined ? { history } : { source, history };
  }
  return { snippets };
}

export function recordOf(file: JsSnippetFile, id: string): JsSnippetRecord {
  const record = file.snippets[id];
  if (!record) return { history: [] };
  return {
    source: record.source,
    history: record.history.map((item) => ({ ...item })),
  };
}

/** 卡片打开时该显示的源码。没有保存过就用题目默认代码。 */
export function activeSource(record: JsSnippetRecord, fallback: string): string {
  return typeof record.source === "string" ? record.source : fallback;
}

export function appendSave(
  file: JsSnippetFile,
  id: string,
  source: string,
  savedAt: number,
  revisionId: string,
): { file: JsSnippetFile; added: boolean } {
  const record = recordOf(file, id);
  const latest = record.history[0];
  const added = !latest || latest.source !== source;
  const history = added
    ? [{ id: revisionId, savedAt, source }, ...record.history].slice(0, JS_SNIPPET_HISTORY_LIMIT)
    : record.history;
  return {
    added,
    file: {
      snippets: {
        ...file.snippets,
        [id]: { source, history },
      },
    },
  };
}

/** 去掉当前保存，历史仍留着。下次打开卡片时回到题目默认代码。 */
export function clearSavedSource(file: JsSnippetFile, id: string): JsSnippetFile {
  const record = file.snippets[id];
  if (!record) return file;
  const snippets = { ...file.snippets };
  if (record.history.length === 0) {
    delete snippets[id];
  } else {
    snippets[id] = { history: record.history.map((item) => ({ ...item })) };
  }
  return { snippets };
}

export function applyRevision(
  file: JsSnippetFile,
  id: string,
  revisionId: string,
): JsSnippetFile {
  const record = file.snippets[id];
  const revision = record?.history.find((item) => item.id === revisionId);
  if (!record || !revision) return file;
  return {
    snippets: {
      ...file.snippets,
      [id]: {
        source: revision.source,
        history: record.history.map((item) => ({ ...item })),
      },
    },
  };
}

export function removeRevision(
  file: JsSnippetFile,
  id: string,
  revisionId: string,
): JsSnippetFile {
  const record = file.snippets[id];
  if (!record) return file;
  const history = record.history.filter((item) => item.id !== revisionId);
  const snippets = { ...file.snippets };
  if (history.length === 0 && record.source === undefined) {
    delete snippets[id];
  } else {
    snippets[id] =
      record.source === undefined ? { history } : { source: record.source, history };
  }
  return { snippets };
}

export function createRevisionId(now = Date.now()): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${now.toString(36)}-${rand}`;
}
