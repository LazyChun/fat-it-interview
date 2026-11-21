/**
 * 在不带同源权限的 iframe 里跑用户 JavaScript。
 * 每次运行都是新的 iframe，超时后拆掉页面，避免死循环占住上一次的沙箱。
 */
import { buildJsSandboxHtml, JS_PLAY_MESSAGE } from "./sandboxHtml";

export interface JsLogLine {
  level: "log" | "info" | "warn" | "error" | "system";
  text: string;
}

export interface JsRunResult {
  ok: boolean;
  hasResult: boolean;
  result: unknown;
  error: string;
}

export interface JsRunHandle {
  promise: Promise<JsRunResult>;
  cancel: () => void;
}

const RUN_TIMEOUT_MS = 15000;

export function runJavaScript(
  code: string,
  lodashUmd: string,
  onLog?: (line: JsLogLine) => void,
): JsRunHandle {
  let cancel = () => undefined;
  const promise = new Promise<JsRunResult>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.display = "none";
    const runId = 1;
    let settled = false;
    const finish = (result: JsRunResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      iframe.remove();
      resolve(result);
    };
    const timer = window.setTimeout(() => {
      finish({ ok: false, hasResult: false, result: null, error: "timeout" });
    }, RUN_TIMEOUT_MS);
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data as {
        type?: string;
        kind?: string;
        id?: number;
        level?: JsLogLine["level"];
        text?: string;
        ok?: boolean;
        hasResult?: boolean;
        result?: unknown;
        error?: string;
      };
      if (!data || data.type !== JS_PLAY_MESSAGE || data.id !== runId) return;
      if (data.kind === "log") {
        onLog?.({
          level: data.level || "log",
          text: String(data.text || ""),
        });
        return;
      }
      if (data.kind === "done") {
        finish({
          ok: !!data.ok,
          hasResult: !!data.hasResult,
          result: data.result ?? null,
          error: String(data.error || ""),
        });
      }
    };
    cancel = () => {
      finish({ ok: false, hasResult: false, result: null, error: "cancelled" });
    };
    window.addEventListener("message", onMessage);
    iframe.srcdoc = buildJsSandboxHtml(lodashUmd);
    iframe.onload = () => {
      iframe.contentWindow?.postMessage(
        { type: JS_PLAY_MESSAGE, kind: "run", id: runId, code },
        "*",
      );
    };
    document.body.appendChild(iframe);
  });
  return { promise, cancel };
}
