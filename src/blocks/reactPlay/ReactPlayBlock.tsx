import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Button, ConfigProvider, Splitter, theme as antdTheme } from "antd";
import type { BlockRenderProps, FatNotesPluginSDK } from "fat-notes-sdk";
import reactUmd from "fat-react-umd";
import reactDomUmd from "fat-react-dom-umd";
import lodashUmd from "fat-lodash-umd";
import antdUmd from "fat-antd-sandbox";
import { readReactPlay } from "./defaultSource";
import { configureReactPlayMonaco } from "./editorTypes";
import { prepareReactSource } from "./prepare";
import { REACT_PLAY_MESSAGE, buildReactSandboxHtml } from "./sandboxHtml";
import "./ReactPlayBlock.css";

loader.config({ monaco });

const SANDBOX_HTML = buildReactSandboxHtml(reactUmd, reactDomUmd, lodashUmd, antdUmd);

// 选项对象必须稳定。每次渲染换一个新对象，monaco-react 会 updateOptions，
// 回车确认补全时视图重算，光标会落到别的行上。
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

interface PlayLog {
  level: "log" | "info" | "warn" | "error" | "system";
  text: string;
}

interface HostDispatch {
  (action: { type: string; payload: unknown }): void;
}

function useHostDispatch(sdk: FatNotesPluginSDK): HostDispatch {
  const hook = sdk.remoteComponents.FlowEditCommon.useAppDispatch as () => HostDispatch;
  return hook();
}

function logClassName(level: PlayLog["level"]): string {
  if (level === "info") return "fat-react-play-log-info";
  if (level === "warn") return "fat-react-play-log-warn";
  if (level === "error") return "fat-react-play-log-error";
  if (level === "system") return "fat-react-play-log-system";
  return "";
}

const ReactPlayBlock: React.FC<{ sdk: FatNotesPluginSDK } & BlockRenderProps> = ({
  sdk,
  config,
  item,
  inConfig,
}) => {
  const dispatch = useHostDispatch(sdk);
  const play = readReactPlay(config);
  const savedSource = play.source;
  const [draft, setDraft] = useState(savedSource);
  const [lines, setLines] = useState<PlayLog[]>([]);
  const [errorText, setErrorText] = useState("");
  const [running, setRunning] = useState(false);
  const [frameHtml, setFrameHtml] = useState("");
  const [hostTheme, setHostTheme] = useState(() => {
    try {
      return sdk.ui.theme.get();
    } catch {
      return "light";
    }
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const readyRef = useRef(false);
  const runIdRef = useRef(0);
  const pendingCodeRef = useRef<string | null>(null);
  const itemRef = useRef(item);
  const draftRef = useRef(draft);
  const savedRef = useRef(savedSource);
  const seenSavedRef = useRef(savedSource);
  const saveTimer = useRef<number | undefined>(undefined);
  const runningTimer = useRef<number | undefined>(undefined);
  const blockId = String(item?.id || "");
  itemRef.current = item;
  draftRef.current = draft;
  savedRef.current = savedSource;

  const themeConfig = useMemo(
    () => ({
      algorithm: hostTheme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: { fontSize: 13 },
    }),
    [hostTheme],
  );

  useEffect(() => {
    let disposed = false;
    const sub = sdk.ui.theme.onChange((next) => {
      if (!disposed) setHostTheme(next);
    });
    return () => {
      disposed = true;
      sub.dispose();
    };
  }, [sdk]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (runningTimer.current) window.clearTimeout(runningTimer.current);
    };
  }, []);

  const postToFrame = (payload: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: REACT_PLAY_MESSAGE, ...payload },
      "*",
    );
  };

  const run = (source: string) => {
    const id = runIdRef.current + 1;
    runIdRef.current = id;
    let code = "";
    try {
      code = prepareReactSource(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      pendingCodeRef.current = null;
      setRunning(false);
      setErrorText(message);
      setLines([{ level: "error", text: message }]);
      return;
    }
    setErrorText("");
    setLines([{ level: "system", text: "正在渲染…" }]);
    setRunning(true);
    if (runningTimer.current) window.clearTimeout(runningTimer.current);
    runningTimer.current = window.setTimeout(() => {
      if (runIdRef.current !== id) return;
      setRunning(false);
    }, 8000);
    if (!readyRef.current || !iframeRef.current?.contentWindow) {
      pendingCodeRef.current = code;
      return;
    }
    pendingCodeRef.current = null;
    postToFrame({ kind: "render", id, code });
  };
  const runRef = useRef(run);
  runRef.current = run;

  const writeEditor = (source: string) => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!editor || !model || model.isDisposed() || model.getValue() === source) return;
    // setValue 会把光标冲到第 1 行。外部覆盖时把原来的视口和光标放回去。
    const view = editor.saveViewState();
    model.setValue(source);
    if (view) editor.restoreViewState(view);
  };

  useEffect(() => {
    const next = readReactPlay(config).source;
    seenSavedRef.current = next;
    setDraft(next);
    draftRef.current = next;
    writeEditor(next);
    runRef.current(next);
  }, [blockId]);

  useEffect(() => {
    if (savedSource === seenSavedRef.current) return;
    seenSavedRef.current = savedSource;
    if (savedSource === draftRef.current) return;
    setDraft(savedSource);
    draftRef.current = savedSource;
    writeEditor(savedSource);
    const relayout = () => editorRef.current?.layout();
    relayout();
    window.requestAnimationFrame(relayout);
  }, [savedSource]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as {
        type?: string;
        kind?: string;
        id?: number;
        level?: PlayLog["level"];
        text?: string;
        ok?: boolean;
        error?: string;
      };
      if (!data || data.type !== REACT_PLAY_MESSAGE) return;
      if (data.id && data.id !== runIdRef.current) return;
      if (data.kind === "log") {
        const level = data.level || "log";
        setLines((prev) => prev.concat({ level, text: String(data.text || "") }));
        return;
      }
      if (data.kind === "done") {
        setRunning(false);
        if (data.ok) {
          setErrorText("");
          setLines((prev) => prev.concat({ level: "system", text: "已渲染" }));
          return;
        }
        const message = String(data.error || "渲染失败");
        setErrorText(message);
        setLines((prev) => prev.concat({ level: "error", text: message }));
      }
    };
    window.addEventListener("message", onMessage);
    setFrameHtml(SANDBOX_HTML);
    return () => {
      readyRef.current = false;
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const handleIframeLoad = () => {
    readyRef.current = true;
    const pending = pendingCodeRef.current;
    if (pending != null) {
      pendingCodeRef.current = null;
      postToFrame({
        kind: "render",
        id: runIdRef.current,
        code: pending,
      });
      return;
    }
    runRef.current(draftRef.current);
  };

  const persist = (source: string) => {
    if (source === savedRef.current) return;
    const current = itemRef.current;
    if (!current) return;
    const nextPlay = { ...readReactPlay(current.options), source };
    const options = {
      ...(current.options || {}),
      reactPlay: nextPlay,
    };
    try {
      if (inConfig) {
        dispatch({
          type: "blockEdit/onUpdateEditBlock",
          payload: { path: "options.reactPlay", value: nextPlay },
        });
        return;
      }
      dispatch({
        type: "board/onUpdateBlock",
        payload: { ...current, options },
      });
    } catch (error) {
      console.warn("[fat-it-interview] 保存 React 代码失败", error);
    }
  };

  const persistRef = useRef(persist);
  persistRef.current = persist;

  // 编辑器是内容的来源。先写入 ref，避免同一轮渲染用旧草稿把光标覆盖掉。
  const handleChange = useCallback((value: string | undefined) => {
    const next = value ?? "";
    draftRef.current = next;
    setDraft(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persistRef.current(next), 300);
  }, []);

  const handleRun = () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      persist(draftRef.current);
    }
    run(draftRef.current);
  };

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoNs: Monaco) => {
    editorRef.current = editor;
    try {
      configureReactPlayMonaco(monacoNs);
      const safeId = (blockId || "draft").replace(/[^\w-]/g, "_");
      const surface = inConfig ? "config" : "board";
      const uri = monacoNs.Uri.parse(`file:///react-play/${safeId}/${surface}.tsx`);
      const existing = monacoNs.editor.getModel(uri);
      const source = draftRef.current;
      const model =
        existing && !existing.isDisposed()
          ? existing
          : monacoNs.editor.createModel(source, "typescript", uri);
      if (model.getValue() !== source) model.setValue(source);
      const previous = editor.getModel();
      if (previous !== model) {
        editor.setModel(model);
        if (previous && !previous.isDisposed()) previous.dispose();
      }
    } catch (error) {
      console.error(error);
    }
    editor.onDidDispose(() => {
      if (editorRef.current === editor) editorRef.current = null;
    });
    const relayout = () => editor.layout();
    relayout();
    window.requestAnimationFrame(relayout);
    editor.addCommand(monacoNs.KeyMod.CtrlCmd | monacoNs.KeyCode.Enter, () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        persist(draftRef.current);
      }
      runRef.current(draftRef.current);
    });
  };

  const codePane = (
    <div className="fat-react-play-pane">
      <div className="fat-react-play-label">代码</div>
      <div
        className={
          play.theme === "light"
            ? "fat-react-play-editor fat-react-play-editor-light"
            : "fat-react-play-editor"
        }
      >
        <Editor
          height="100%"
          language="typescript"
          theme={play.theme === "dark" ? "vs-dark" : "vs"}
          defaultValue={draft}
          onChange={handleChange}
          onMount={handleMount}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
  const consolePane = (
    <div className="fat-react-play-pane">
      <div className="fat-react-play-label">
        <span>控制台</span>
        <button type="button" className="fat-react-play-clear" onClick={() => setLines([])}>
          清空
        </button>
      </div>
      <pre
        className={
          play.theme === "light"
            ? "fat-react-play-console fat-react-play-console-light"
            : "fat-react-play-console"
        }
      >
        {lines.length === 0
          ? "console.log 会显示在这里"
          : lines.map((line, index) => (
              <div key={`${index}-${line.text}`} className={logClassName(line.level)}>
                {line.text}
              </div>
            ))}
      </pre>
    </div>
  );
  const pagePane = (
    <div className="fat-react-play-pane">
      <div className="fat-react-play-label">页面</div>
      <div className="fat-react-play-preview">
        {frameHtml ? (
          <iframe
            ref={iframeRef}
            title="React 页面"
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            srcDoc={frameHtml}
            onLoad={handleIframeLoad}
            className="fat-react-play-frame"
          />
        ) : null}
        {errorText ? <pre className="fat-react-play-banner">{errorText}</pre> : null}
      </div>
    </div>
  );
  const layoutKey = `${play.showConsole ? "console" : "plain"}-${play.consolePlacement}`;
  const body = !play.showConsole ? (
    <Splitter key={layoutKey} orientation="horizontal" style={{ height: "100%" }}>
      <Splitter.Panel defaultSize="56%" min="28%">
        {codePane}
      </Splitter.Panel>
      <Splitter.Panel defaultSize="44%" min="22%">
        {pagePane}
      </Splitter.Panel>
    </Splitter>
  ) : play.consolePlacement === "right" ? (
    <Splitter key={layoutKey} orientation="horizontal" style={{ height: "100%" }}>
      <Splitter.Panel defaultSize="56%" min="28%">
        {codePane}
      </Splitter.Panel>
      <Splitter.Panel defaultSize="44%" min="22%">
        <Splitter orientation="vertical" style={{ height: "100%" }}>
          <Splitter.Panel defaultSize="68%" min="30%">
            {pagePane}
          </Splitter.Panel>
          <Splitter.Panel defaultSize="32%" min="16%">
            {consolePane}
          </Splitter.Panel>
        </Splitter>
      </Splitter.Panel>
    </Splitter>
  ) : (
    <Splitter key={layoutKey} orientation="horizontal" style={{ height: "100%" }}>
      <Splitter.Panel defaultSize="56%" min="28%">
        <Splitter orientation="vertical" style={{ height: "100%" }}>
          <Splitter.Panel defaultSize="68%" min="24%">
            {codePane}
          </Splitter.Panel>
          <Splitter.Panel defaultSize="32%" min="16%">
            {consolePane}
          </Splitter.Panel>
        </Splitter>
      </Splitter.Panel>
      <Splitter.Panel defaultSize="44%" min="22%">
        {pagePane}
      </Splitter.Panel>
    </Splitter>
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="fat-react-play">
        <div className="fat-react-play-toolbar">
          <Button size="small" type="primary" loading={running} onClick={handleRun}>
            运行
          </Button>
          <span className="fat-react-play-hint">
            定义 function App()，或 export default 一个组件。Ctrl+Enter 运行。import 和调用时会有补全。
          </span>
        </div>
        <div className="fat-react-play-body">{body}</div>
      </div>
    </ConfigProvider>
  );
};

export default ReactPlayBlock;
