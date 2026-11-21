/**
 * 题目答案里的执行块：可编辑、可运行，保存后留在本机历史里。
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Button, ConfigProvider, Popconfirm, Splitter, theme as antdTheme } from "antd";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import lodashUmd from "fat-lodash-umd";
import reactUmd from "fat-react-umd";
import reactDomUmd from "fat-react-dom-umd";
import antdUmd from "fat-antd-sandbox";
import vueUmd from "fat-vue-umd";
import antdVueUmd from "fat-antd-vue-sandbox";
import { useExecutionConsolePlacement, useExecutionTheme } from "../../hooks";
import { resetEditorThemeOwners } from "../../executionTheme";
import { configureJsPlayMonaco } from "./editorTypes";
import { prepareJsSource } from "./prepare";
import { runJavaScript, type JsLogLine } from "./runSandbox";
import { prepareReactSource } from "../reactPlay/prepare";
import { REACT_PLAY_MESSAGE, buildReactSandboxHtml } from "../reactPlay/sandboxHtml";
import { prepareVueSource } from "../vuePlay/prepare";
import { VUE_PLAY_MESSAGE, buildVueSandboxHtml } from "../vuePlay/sandboxHtml";
import {
  activeSource,
  appendSave,
  applyRevision,
  clearSavedSource,
  createRevisionId,
  removeRevision,
  type JsSnippetRevision,
  type SnippetRuntime,
} from "./snippetStore";
import { commitSnippet, loadSnippet, snippetConfigOf } from "./snippetStorage";
import "./JsPlayBlock.css";
import "./JsSnippetCard.css";

loader.config({ monaco });

const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  wordWrap: "on",
  tabSize: 2,
  automaticLayout: true,
  fixedOverflowWidgets: true,
  quickSuggestions: { other: true, comments: false, strings: false },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: "on",
  parameterHints: { enabled: true },
  wordBasedSuggestions: "currentDocument",
  tabCompletion: "on",
  padding: { top: 8 },
};

function writeEditor(editor: monaco.editor.IStandaloneCodeEditor | null, source: string): void {
  const model = editor?.getModel();
  if (!editor || !model || model.isDisposed() || model.getValue() === source) return;
  editor.setScrollTop(0);
  model.setValue(source);
}

function logClassName(level: JsLogLine["level"]): string {
  if (level === "info") return "fat-js-play-log-info";
  if (level === "warn") return "fat-js-play-log-warn";
  if (level === "error") return "fat-js-play-log-error";
  if (level === "system") return "fat-js-play-log-system";
  return "";
}

function formatResult(value: unknown): string {
  try {
    const text = JSON.stringify(value, null, 2);
    return text === undefined ? String(value) : text;
  } catch {
    return String(value);
  }
}

function formatSavedAt(savedAt: number): string {
  const date = new Date(savedAt);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function previewSource(source: string): string {
  const line = source
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.length > 0);
  const text = line || "空代码";
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

interface JsSnippetCardProps {
  sdk: FatNotesPluginSDK;
  snippetId: string;
  defaultSource: string;
  onShowCode: () => void;
  /** js 走控制台，react / vue 多一块页面预览 */
  runtime?: SnippetRuntime;
  editorLanguage?: string;
}

const REACT_SANDBOX = buildReactSandboxHtml(reactUmd, reactDomUmd, lodashUmd, antdUmd);
const VUE_SANDBOX = buildVueSandboxHtml(vueUmd, lodashUmd, antdVueUmd);

const JsSnippetCard: React.FC<JsSnippetCardProps> = ({
  sdk,
  snippetId,
  defaultSource,
  onShowCode,
  runtime = "js",
  editorLanguage = "javascript",
}) => {
  const { token } = antdTheme.useToken();
  const executionTheme = useExecutionTheme();
  const consolePlacement = useExecutionConsolePlacement();
  const dark = executionTheme === "dark";
  const [draft, setDraft] = useState(defaultSource);
  const [persisted, setPersisted] = useState(defaultSource);
  const [history, setHistory] = useState<JsSnippetRevision[]>([]);
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lines, setLines] = useState<JsLogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const frameReady = useRef(false);
  const pendingRender = useRef<{ id: number; code: string; css: string } | null>(null);
  const draftRef = useRef(draft);
  const runToken = useRef(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const preview = runtime !== "js";
  const previewMessage = runtime === "vue" ? VUE_PLAY_MESSAGE : REACT_PLAY_MESSAGE;
  draftRef.current = draft;
  const dirty = draft !== persisted;

  const applyText = (source: string) => {
    draftRef.current = source;
    setDraft(source);
    writeEditor(editorRef.current, source);
  };

  const failRun = (message: string) => {
    cancelRef.current?.();
    cancelRef.current = null;
    runToken.current += 1;
    setRunning(false);
    setLines([{ level: "error", text: message }]);
  };

  const postPreview = (id: number, code: string, css: string) => {
    const frame = iframeRef.current?.contentWindow;
    if (!frameReady.current || !frame) {
      pendingRender.current = { id, code, css };
      return;
    }
    frame.postMessage({ type: previewMessage, kind: "render", id, code, css }, "*");
  };

  const runJs = (source: string) => {
    let code = "";
    try {
      code = prepareJsSource(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failRun(message);
      return;
    }
    cancelRef.current?.();
    const tokenId = runToken.current + 1;
    runToken.current = tokenId;
    setRunning(true);
    setLines([{ level: "system", text: "开始运行 JavaScript" }]);
    const handle = runJavaScript(code, lodashUmd, (line) => {
      if (runToken.current !== tokenId) return;
      setLines((prev) => prev.concat(line));
    });
    cancelRef.current = handle.cancel;
    void handle.promise.then((result) => {
      if (runToken.current !== tokenId || result.error === "cancelled") return;
      setRunning(false);
      if (!result.ok) {
        const text = result.error === "timeout" ? "运行超时" : result.error || "运行失败";
        setLines((prev) => prev.concat({ level: "error", text }));
        return;
      }
      const done: JsLogLine[] = [];
      if (result.hasResult) {
        done.push({ level: "info", text: formatResult(result.result) });
      }
      done.push({ level: "system", text: "运行完成" });
      setLines((prev) => prev.concat(done));
    });
  };

  const runPreview = async (source: string) => {
    cancelRef.current?.();
    cancelRef.current = null;
    const tokenId = runToken.current + 1;
    runToken.current = tokenId;
    setRunning(true);
    setLines([{ level: "system", text: runtime === "vue" ? "正在渲染 Vue" : "正在渲染 React" }]);
    try {
      const prepared =
        runtime === "vue" ? await prepareVueSource(source) : { code: prepareReactSource(source), css: "" };
      if (runToken.current !== tokenId) return;
      postPreview(tokenId, prepared.code, prepared.css);
    } catch (error) {
      if (runToken.current !== tokenId) return;
      const message = error instanceof Error ? error.message : String(error);
      setRunning(false);
      setLines([{ level: "error", text: message }]);
    }
  };

  const run = () => {
    const source = draftRef.current;
    if (!source.trim()) {
      failRun("代码是空的");
      return;
    }
    if (runtime === "js") {
      runJs(source);
      return;
    }
    void runPreview(source);
  };
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setHistoryOpen(false);
    setLines([]);
    void loadSnippet(snippetConfigOf(sdk), snippetId)
      .then((record) => {
        if (cancelled) return;
        const source = activeSource(record, defaultSource);
        draftRef.current = source;
        setDraft(source);
        setPersisted(source);
        setHistory(record.history);
        setPhase("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn("[fat-it-interview] 读取 JavaScript 保存记录失败", error);
        sdk.ui.toast.error("读取保存记录失败，先显示题目里的代码");
        draftRef.current = defaultSource;
        setDraft(defaultSource);
        setPersisted(defaultSource);
        setHistory([]);
        setPhase("ready");
      });
    return () => {
      cancelled = true;
      cancelRef.current?.();
    };
  }, [sdk, snippetId, defaultSource]);

  const save = async () => {
    if (phase !== "ready" || busy) return;
    const source = draftRef.current;
    setBusy(true);
    try {
      let added = false;
      const record = await commitSnippet(snippetConfigOf(sdk), snippetId, (file) => {
        const result = appendSave(file, snippetId, source, Date.now(), createRevisionId());
        added = result.added;
        return result.file;
      });
      setHistory(record.history);
      setPersisted(activeSource(record, defaultSource));
      if (added) {
        setHistoryOpen(true);
        sdk.ui.toast.success("已保存");
      } else {
        sdk.ui.toast.info("和最近一条历史相同，没有新增记录");
      }
    } catch (error) {
      console.warn("[fat-it-interview] 保存 JavaScript 代码失败", error);
      sdk.ui.toast.error("保存失败");
    } finally {
      setBusy(false);
    }
  };

  const restoreDefault = async () => {
    if (phase !== "ready" || busy) return;
    if (draftRef.current === defaultSource && persisted === defaultSource) {
      sdk.ui.toast.info("当前就是默认内容");
      return;
    }
    setBusy(true);
    try {
      const record = await commitSnippet(snippetConfigOf(sdk), snippetId, (file) =>
        clearSavedSource(file, snippetId),
      );
      applyText(defaultSource);
      setPersisted(defaultSource);
      setHistory(record.history);
      sdk.ui.toast.success("已恢复默认内容");
    } catch (error) {
      console.warn("[fat-it-interview] 恢复默认 JavaScript 失败", error);
      sdk.ui.toast.error("恢复默认内容失败");
    } finally {
      setBusy(false);
    }
  };

  const restoreRevision = async (revision: JsSnippetRevision) => {
    if (busy) return;
    setBusy(true);
    try {
      const record = await commitSnippet(snippetConfigOf(sdk), snippetId, (file) =>
        applyRevision(file, snippetId, revision.id),
      );
      const source = activeSource(record, revision.source);
      applyText(source);
      setPersisted(source);
      setHistory(record.history);
      sdk.ui.toast.success("已恢复这条历史");
    } catch (error) {
      console.warn("[fat-it-interview] 恢复 JavaScript 历史失败", error);
      sdk.ui.toast.error("恢复历史失败");
    } finally {
      setBusy(false);
    }
  };

  const deleteRevision = async (revisionId: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const record = await commitSnippet(snippetConfigOf(sdk), snippetId, (file) =>
        removeRevision(file, snippetId, revisionId),
      );
      setHistory(record.history);
      sdk.ui.toast.success("已删除这条历史");
    } catch (error) {
      console.warn("[fat-it-interview] 删除 JavaScript 历史失败", error);
      sdk.ui.toast.error("删除历史失败");
    } finally {
      setBusy(false);
    }
  };

  const handleChange = useCallback((value: string | undefined) => {
    const next = value ?? "";
    draftRef.current = next;
    setDraft(next);
  }, []);

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoNs: Monaco) => {
    editorRef.current = editor;
    try {
      configureJsPlayMonaco(monacoNs);
    } catch (error) {
      console.error(error);
    }
    editor.onDidDispose(() => {
      if (editorRef.current === editor) editorRef.current = null;
    });
    editor.addCommand(monacoNs.KeyMod.CtrlCmd | monacoNs.KeyCode.Enter, () => {
      runRef.current();
    });
  };

  useEffect(() => {
    return () => resetEditorThemeOwners();
  }, []);

  useEffect(() => {
    if (!preview) return;
    frameReady.current = false;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as {
        type?: string;
        kind?: string;
        id?: number;
        level?: JsLogLine["level"];
        text?: string;
        ok?: boolean;
        error?: string;
      };
      if (!data || data.type !== previewMessage) return;
      if (data.id && data.id !== runToken.current) return;
      if (data.kind === "log") {
        setLines((prev) => prev.concat({ level: data.level || "log", text: String(data.text || "") }));
        return;
      }
      if (data.kind === "done") {
        setRunning(false);
        if (data.ok) {
          setLines((prev) => prev.concat({ level: "system", text: "已渲染" }));
          return;
        }
        setLines((prev) => prev.concat({ level: "error", text: String(data.error || "渲染失败") }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      frameReady.current = false;
      window.removeEventListener("message", onMessage);
    };
  }, [preview, previewMessage, snippetId]);

  const handleFrameLoad = () => {
    frameReady.current = true;
    const pending = pendingRender.current;
    if (!pending || pending.id !== runToken.current) return;
    pendingRender.current = null;
    iframeRef.current?.contentWindow?.postMessage(
      { type: previewMessage, kind: "render", id: pending.id, code: pending.code, css: pending.css },
      "*",
    );
  };

  const editorClass = dark ? "fat-js-play-editor" : "fat-js-play-editor fat-js-play-editor-light";
  const consoleClass = dark ? "fat-js-play-console" : "fat-js-play-console fat-js-play-console-light";
  const codePane = (
    <div className="fat-js-play-pane">
      <div className="fat-js-play-label">代码</div>
      <div className={editorClass}>
        <Editor
          key={snippetId}
          height="100%"
          language={editorLanguage}
          theme={dark ? "vs-dark" : "vs"}
          defaultValue={draft}
          onChange={handleChange}
          onMount={handleMount}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
  const consolePane = (
    <div className="fat-js-play-pane">
      <div className="fat-js-play-label">
        <span>控制台</span>
        <button type="button" className="fat-js-play-clear" onClick={() => setLines([])}>
          清空
        </button>
      </div>
      <pre className={consoleClass}>
        {lines.length === 0
          ? "运行后在这里查看输出"
          : lines.map((line, index) => (
              <div key={`${index}-${line.text}`} className={logClassName(line.level)}>
                {line.text}
              </div>
            ))}
      </pre>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div
        className={preview ? "fat-js-snippet fat-js-snippet-preview" : "fat-js-snippet"}
        style={{
          background: dark ? "#1e1e1e" : token.colorBgLayout,
          color: dark ? "rgba(255,255,255,0.88)" : undefined,
        }}
      >
      <div className="fat-js-snippet-toolbar">
        <Button size="small" type="primary" loading={running} disabled={phase !== "ready"} onClick={run}>
          运行
        </Button>
        <Button
          size="small"
          type={dirty ? "primary" : "default"}
          loading={busy}
          disabled={phase !== "ready"}
          onClick={() => void save()}
        >
          保存
        </Button>
        <Button size="small" disabled={phase !== "ready" || busy} onClick={() => void restoreDefault()}>
          恢复默认
        </Button>
        <Button
          size="small"
          type={historyOpen ? "primary" : "default"}
          disabled={phase !== "ready"}
          onClick={() => setHistoryOpen((open) => !open)}
        >
          {history.length > 0 ? `历史 ${history.length}` : "历史"}
        </Button>
        {dirty ? (
          <Popconfirm
            title="还有未保存的修改，回到代码后会丢掉"
            okText="回到代码"
            cancelText="留下"
            onConfirm={onShowCode}
          >
            <Button size="small">代码</Button>
          </Popconfirm>
        ) : (
          <Button size="small" onClick={onShowCode}>
            代码
          </Button>
        )}
        <span className="fat-js-snippet-hint">
          {runtime === "vue"
            ? "Ctrl+Enter 渲染。可写 script setup 和 template。保存写入本机。"
            : runtime === "react"
              ? "Ctrl+Enter 渲染。写 function App 或 export default。保存写入本机。"
              : "Ctrl+Enter 运行。保存写入本机，可在历史里恢复或删除。"}
        </span>
      </div>
      {historyOpen ? (
        <div className="fat-js-snippet-history">
          {history.length === 0 ? (
            <div className="fat-js-snippet-history-empty">还没有保存记录</div>
          ) : (
            history.map((item) => {
              const active = item.source === draft;
              return (
                <div
                  key={item.id}
                  className={
                    active
                      ? "fat-js-snippet-history-row fat-js-snippet-history-row-active"
                      : "fat-js-snippet-history-row"
                  }
                >
                  <button
                    type="button"
                    className="fat-js-snippet-history-main"
                    title={item.source}
                    onClick={() => void restoreRevision(item)}
                  >
                    <span className="fat-js-snippet-history-time">{formatSavedAt(item.savedAt)}</span>
                    <span className="fat-js-snippet-history-preview">{previewSource(item.source)}</span>
                  </button>
                  <Popconfirm
                    title="删除这条历史记录？"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => deleteRevision(item.id)}
                  >
                    <Button size="small" type="text" danger disabled={busy}>
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              );
            })
          )}
        </div>
      ) : null}
      {phase === "loading" ? (
        <div className="fat-js-snippet-loading">正在读取已保存的代码</div>
      ) : (
        <div className="fat-js-play-body">
          {preview ? (
            <Splitter orientation="vertical" style={{ height: "100%" }}>
              <Splitter.Panel defaultSize="46%" min="18%">
                {codePane}
              </Splitter.Panel>
              <Splitter.Panel defaultSize="54%" min="22%">
                <Splitter orientation="horizontal" style={{ height: "100%" }}>
                  <Splitter.Panel defaultSize="58%" min="20%">
                    <div className="fat-js-play-pane">
                      <div className="fat-js-play-label">页面</div>
                      <iframe
                        className="fat-js-snippet-frame"
                        title={runtime === "vue" ? "Vue 预览" : "React 预览"}
                        sandbox="allow-scripts"
                        srcDoc={runtime === "vue" ? VUE_SANDBOX : REACT_SANDBOX}
                        ref={iframeRef}
                        onLoad={handleFrameLoad}
                      />
                    </div>
                  </Splitter.Panel>
                  <Splitter.Panel defaultSize="42%" min="16%">
                    {consolePane}
                  </Splitter.Panel>
                </Splitter>
              </Splitter.Panel>
            </Splitter>
          ) : (
            <Splitter
              key={consolePlacement}
              orientation={consolePlacement === "right" ? "horizontal" : "vertical"}
              style={{ height: "100%" }}
            >
              <Splitter.Panel defaultSize="68%" min="20%">
                {codePane}
              </Splitter.Panel>
              <Splitter.Panel defaultSize="32%" min="16%">
                {consolePane}
              </Splitter.Panel>
            </Splitter>
          )}
        </div>
      )}
      </div>
    </ConfigProvider>
  );
};

export default JsSnippetCard;
