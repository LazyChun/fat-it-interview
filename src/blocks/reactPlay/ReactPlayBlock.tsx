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
import { compileLess } from "./compileLess";
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

const LESS_EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  ...EDITOR_OPTIONS,
  placeholder: "用 className 引用。例如 .title { color: #1677ff; }",
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

function writeEditor(editor: monaco.editor.IStandaloneCodeEditor | null, source: string): void {
  const model = editor?.getModel();
  if (!editor || !model || model.isDisposed() || model.getValue() === source) return;
  // setValue 会把光标冲到第 1 行。外部覆盖时把原来的视口和光标放回去。
  const view = editor.saveViewState();
  model.setValue(source);
  if (view) editor.restoreViewState(view);
}

function attachEditorModel(
  editor: monaco.editor.IStandaloneCodeEditor,
  monacoNs: Monaco,
  uri: monaco.Uri,
  language: string,
  source: string,
): void {
  const existing = monacoNs.editor.getModel(uri);
  const model =
    existing && !existing.isDisposed()
      ? existing
      : monacoNs.editor.createModel(source, language, uri);
  if (model.getValue() !== source) model.setValue(source);
  const previous = editor.getModel();
  if (previous !== model) {
    editor.setModel(model);
    if (previous && !previous.isDisposed()) previous.dispose();
  }
}

function stackPanes(panes: React.ReactNode[], sizes: string[]): React.ReactNode {
  if (panes.length <= 1) return panes[0] ?? null;
  return (
    <Splitter orientation="vertical" style={{ height: "100%" }}>
      {panes.map((pane, index) => (
        <Splitter.Panel key={index} defaultSize={sizes[index] || "32%"} min="16%">
          {pane}
        </Splitter.Panel>
      ))}
    </Splitter>
  );
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
  const savedLess = play.less;
  const [draft, setDraft] = useState(savedSource);
  const [lessDraft, setLessDraft] = useState(savedLess);
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
  const lessEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const readyRef = useRef(false);
  const runIdRef = useRef(0);
  const pendingRef = useRef<{ code: string; css: string } | null>(null);
  const itemRef = useRef(item);
  const draftRef = useRef(draft);
  const lessDraftRef = useRef(lessDraft);
  const seenSavedRef = useRef(savedSource);
  const seenLessRef = useRef(savedLess);
  const saveTimer = useRef<number | undefined>(undefined);
  const runningTimer = useRef<number | undefined>(undefined);
  const blockId = String(item?.id || "");
  itemRef.current = item;
  draftRef.current = draft;
  lessDraftRef.current = lessDraft;

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

  const publish = (id: number, code: string, css: string) => {
    if (runIdRef.current !== id) return;
    if (!readyRef.current || !iframeRef.current?.contentWindow) {
      pendingRef.current = { code, css };
      return;
    }
    pendingRef.current = null;
    postToFrame({ kind: "render", id, code, css });
  };

  const run = () => {
    const id = runIdRef.current + 1;
    runIdRef.current = id;
    const source = draftRef.current;
    const lessSource = lessDraftRef.current;
    let code = "";
    try {
      code = prepareReactSource(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      pendingRef.current = null;
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
    void compileLess(lessSource)
      .then((css) => {
        publish(id, code, css);
      })
      .catch((error: unknown) => {
        if (runIdRef.current !== id) return;
        const message = error instanceof Error ? error.message : String(error);
        pendingRef.current = null;
        if (runningTimer.current) window.clearTimeout(runningTimer.current);
        setRunning(false);
        setErrorText(message);
        setLines([{ level: "error", text: message }]);
      });
  };
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    const next = readReactPlay(config);
    seenSavedRef.current = next.source;
    seenLessRef.current = next.less;
    setDraft(next.source);
    setLessDraft(next.less);
    draftRef.current = next.source;
    lessDraftRef.current = next.less;
    writeEditor(editorRef.current, next.source);
    writeEditor(lessEditorRef.current, next.less);
    runRef.current();
  }, [blockId]);

  useEffect(() => {
    if (savedSource === seenSavedRef.current) return;
    seenSavedRef.current = savedSource;
    if (savedSource === draftRef.current) return;
    setDraft(savedSource);
    draftRef.current = savedSource;
    writeEditor(editorRef.current, savedSource);
    const relayout = () => editorRef.current?.layout();
    relayout();
    window.requestAnimationFrame(relayout);
  }, [savedSource]);

  useEffect(() => {
    if (savedLess === seenLessRef.current) return;
    seenLessRef.current = savedLess;
    if (savedLess === lessDraftRef.current) return;
    setLessDraft(savedLess);
    lessDraftRef.current = savedLess;
    writeEditor(lessEditorRef.current, savedLess);
    const relayout = () => lessEditorRef.current?.layout();
    relayout();
    window.requestAnimationFrame(relayout);
  }, [savedLess]);

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
    const pending = pendingRef.current;
    if (pending) {
      pendingRef.current = null;
      postToFrame({
        kind: "render",
        id: runIdRef.current,
        code: pending.code,
        css: pending.css,
      });
      return;
    }
    runRef.current();
  };

  const persist = () => {
    const source = draftRef.current;
    const lessSource = lessDraftRef.current;
    const current = itemRef.current;
    if (!current) return;
    const prev = readReactPlay(current.options);
    if (prev.source === source && prev.less === lessSource) return;
    const nextPlay = { ...prev, source, less: lessSource };
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

  const runFromEditor = () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      persistRef.current();
    }
    runRef.current();
  };

  // 编辑器是内容的来源。先写入 ref，避免同一轮渲染用旧草稿把光标覆盖掉。
  const handleChange = useCallback((value: string | undefined) => {
    const next = value ?? "";
    draftRef.current = next;
    setDraft(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persistRef.current(), 300);
  }, []);

  const handleLessChange = useCallback((value: string | undefined) => {
    const next = value ?? "";
    lessDraftRef.current = next;
    setLessDraft(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persistRef.current(), 300);
  }, []);

  const handleRun = () => {
    runFromEditor();
  };

  const editorFileUri = (monacoNs: Monaco, extension: string) => {
    const safeId = (blockId || "draft").replace(/[^\w-]/g, "_");
    const surface = inConfig ? "config" : "board";
    return monacoNs.Uri.parse(`file:///react-play/${safeId}/${surface}.${extension}`);
  };

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoNs: Monaco) => {
    editorRef.current = editor;
    try {
      configureReactPlayMonaco(monacoNs);
      attachEditorModel(
        editor,
        monacoNs,
        editorFileUri(monacoNs, "tsx"),
        "typescript",
        draftRef.current,
      );
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
      runFromEditor();
    });
  };

  const handleLessMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoNs: Monaco) => {
    lessEditorRef.current = editor;
    try {
      attachEditorModel(
        editor,
        monacoNs,
        editorFileUri(monacoNs, "less"),
        "less",
        lessDraftRef.current,
      );
    } catch (error) {
      console.error(error);
    }
    editor.onDidDispose(() => {
      if (lessEditorRef.current === editor) lessEditorRef.current = null;
    });
    const relayout = () => editor.layout();
    relayout();
    window.requestAnimationFrame(relayout);
    editor.addCommand(monacoNs.KeyMod.CtrlCmd | monacoNs.KeyCode.Enter, () => {
      runFromEditor();
    });
  };

  const editorClass =
    play.theme === "light"
      ? "fat-react-play-editor fat-react-play-editor-light"
      : "fat-react-play-editor";
  const codePane = (
    <div className="fat-react-play-pane">
      <div className="fat-react-play-label">代码</div>
      <div className={editorClass}>
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
  const lessPane = (
    <div className="fat-react-play-pane">
      <div className="fat-react-play-label">Less</div>
      <div className={editorClass}>
        <Editor
          height="100%"
          language="less"
          theme={play.theme === "dark" ? "vs-dark" : "vs"}
          defaultValue={lessDraft}
          onChange={handleLessChange}
          onMount={handleLessMount}
          options={LESS_EDITOR_OPTIONS}
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
  const consoleOnRight = play.showConsole && play.consolePlacement === "right";
  const consoleAtBottom = play.showConsole && !consoleOnRight;
  const leftPanes = [codePane, ...(play.showLess ? [lessPane] : []), ...(consoleAtBottom ? [consolePane] : [])];
  const rightPanes = [pagePane, ...(consoleOnRight ? [consolePane] : [])];
  const leftSizes =
    play.showLess && consoleAtBottom ? ["48%", "28%", "24%"] : play.showLess ? ["58%", "42%"] : ["68%", "32%"];
  const rightSizes = ["68%", "32%"];
  const layoutKey = `${play.showConsole ? "console" : "plain"}-${play.consolePlacement}-${play.showLess ? "less" : "noless"}`;
  const body = (
    <Splitter key={layoutKey} orientation="horizontal" style={{ height: "100%" }}>
      <Splitter.Panel defaultSize="56%" min="28%">
        {stackPanes(leftPanes, leftSizes)}
      </Splitter.Panel>
      <Splitter.Panel defaultSize="44%" min="22%">
        {stackPanes(rightPanes, rightSizes)}
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
            {play.showLess
              ? "定义 function App()，或 export default 一个组件。Ctrl+Enter 运行。Less 编译后用 className 挂到组件上。"
              : "定义 function App()，或 export default 一个组件。Ctrl+Enter 运行。import 和调用时会有补全。"}
          </span>
        </div>
        <div className="fat-react-play-body">{body}</div>
      </div>
    </ConfigProvider>
  );
};

export default ReactPlayBlock;
