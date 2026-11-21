/**
 * 和代码卡片的 Python 一样，交给宿主本机执行。
 * 接口是 app/codeBlock/run，不在浏览器里下载解释器。
 */

export interface PyLogLine {
  level: "log" | "info" | "warn" | "error" | "system";
  text: string;
}

export interface PyRunResult {
  ok: boolean;
  hasResult: boolean;
  result: unknown;
  error: string;
  logs: PyLogLine[];
}

export interface PyRunHandle {
  promise: Promise<PyRunResult>;
  cancel: () => void;
}

export interface HostCodeResp {
  isOk: boolean;
  message?: string;
  data?: {
    ok?: boolean;
    result?: unknown;
    logs?: unknown;
    error?: string;
  };
}

interface HostDollar {
  post<T>(url: string, body?: object): Promise<T>;
}

const LOG_LEVELS = new Set<PyLogLine["level"]>(["log", "info", "warn", "error", "system"]);

function readLog(raw: unknown): PyLogLine | null {
  if (!raw || typeof raw !== "object") return null;
  const level = (raw as { level?: unknown }).level;
  const text = (raw as { text?: unknown }).text;
  return {
    level: typeof level === "string" && LOG_LEVELS.has(level as PyLogLine["level"])
      ? (level as PyLogLine["level"])
      : "log",
    text: String(text ?? ""),
  };
}

export function toPyRunResult(resp: HostCodeResp | null | undefined): PyRunResult {
  if (!resp?.isOk || !resp.data) {
    return {
      ok: false,
      hasResult: false,
      result: null,
      error: resp?.message || "运行失败",
      logs: [],
    };
  }
  const logs = Array.isArray(resp.data.logs)
    ? resp.data.logs.map(readLog).filter((line): line is PyLogLine => line !== null)
    : [];
  return {
    ok: !!resp.data.ok,
    hasResult: !!resp.data.ok,
    result: resp.data.result ?? null,
    error: resp.data.error || "",
    logs,
  };
}

function hostPost(code: string): Promise<HostCodeResp> {
  const dollar = (window as Window & { $? : HostDollar }).$;
  if (!dollar?.post) {
    return Promise.resolve({ isOk: false, message: "运行接口不可用" });
  }
  return dollar.post<HostCodeResp>("app/codeBlock/run", {
    language: "python",
    code,
    params: {},
  });
}

export function runPython(code: string): PyRunHandle {
  let cancelled = false;
  const promise = hostPost(code)
    .then((resp) => {
      if (cancelled) {
        return { ok: false, hasResult: false, result: null, error: "cancelled", logs: [] };
      }
      return toPyRunResult(resp);
    })
    .catch((error: unknown) => {
      if (cancelled) {
        return { ok: false, hasResult: false, result: null, error: "cancelled", logs: [] };
      }
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, hasResult: false, result: null, error: message || "运行失败", logs: [] };
    });
  return {
    promise,
    cancel: () => {
      cancelled = true;
    },
  };
}
