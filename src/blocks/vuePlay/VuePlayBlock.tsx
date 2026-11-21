import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Button, ConfigProvider, Splitter, theme as antdTheme } from "antd";
import type { BlockRenderProps, FatNotesPluginSDK } from "fat-notes-sdk";
import vueUmd from "fat-vue-umd";
import lodashUmd from "fat-lodash-umd";
import antdUmd from "fat-antd-vue-sandbox";
import { shouldAdoptSavedText } from "../editorDraftSync";
import { compileLess } from "../reactPlay/compileLess";
import { readVuePlay } from "./defaultSource";
import { prepareVueSource } from "./prepare";
import { VUE_PLAY_MESSAGE, buildVueSandboxHtml } from "./sandboxHtml";
import "./VuePlayBlock.css";

loader.config({ monaco });

const SANDBOX_HTML = buildVueSandboxHtml(vueUmd, lodashUmd, antdUmd);

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
  placeholder: "额外的全局样式。组件 <style> 仍然生效。例如 .title { color: #42b883; }",
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
  if (level === "info") return "fat-vue-play-log-info";
  if (level === "warn") return "fat-vue-play-log-warn";
  if (level === "error") return "fat-vue-play-log-error";
  if (level === "system") return "fat-vue-play-log-system";
  return "";
}

const VuePlayBlock: React.FC<{ sdk: FatNotesPluginSDK } & BlockRenderProps> = ({
  sdk,
  config,
  item,
  inConfig,
}) => {
  const dispatch = useHostDispatch(sdk);
  const play = readVuePlay(config);
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
  // 配置抽屉预览有防抖，刚提交的文本会晚一拍回来。记下提交内容，避免回声覆盖新输入。
  const persistedSourceRef = useRef(savedSource);
  const persistedLessRef = useRef(savedLess);
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
    iframeRef.current?.contentWindow?.postMessage({ type: VUE_PLAY_MESSAGE, ...payload }, "*");
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
    setErrorText("");
    setLines([{ level: "system", text: "正在渲染…" }]);
    setRunning(true);
    if (runningTimer.current) window.clearTimeout(runningTimer.current);
    runningTimer.current = window.setTimeout(() => {
      if (runIdRef.current !== id) return;
      setRunning(false);
    }, 8000);
    void prepareVueSource(source)
      .then(async (prepared) => {
        const extra = await compileLess(lessSource);
        return { prepared, extra };
      })
      .then(({ prepared, extra }) => {
        if (runIdRef.current !== id) return;
        publish(id, prepared.code, `${prepared.css}\n${extra}`);
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
    const next = readVuePlay(config);
    seenSavedRef.current = next.source;
    seenLessRef.current = next.less;
    persistedSourceRef.current = next.source;
    persistedLessRef.current = next.less;
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
    if (!shouldAdoptSavedText(savedSource, draftRef.current, persistedSourceRef.current)) return;
    setDraft(savedSource);
    draftRef.current = savedSource;
    persistedSourceRef.current = savedSource;
    writeEditor(editorRef.current, savedSource);
    const relayout = () => editorRef.current?.layout();
    relayout();
    window.requestAnimationFrame(relayout);
  }, [savedSource]);

  useEffect(() => {
    if (savedLess === seenLessRef.current) return;
    seenLessRef.current = savedLess;
    if (!shouldAdoptSavedText(savedLess, lessDraftRef.current, persistedLessRef.current)) return;
    setLessDraft(savedLess);
    lessDraftRef.current = savedLess;
    persistedLessRef.current = savedLess;
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
      if (!data || data.type !== VUE_PLAY_MESSAGE) return;
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
    const prev = readVuePlay(current.options);
    if (prev.source === source && prev.less === lessSource) return;
    persistedSourceRef.current = source;
    persistedLessRef.current = lessSource;
    const nextPlay = { ...prev, source, less: lessSource };
    const options = {
      ...(current.options || {}),
      vuePlay: nextPlay,
    };
    try {
      if (inConfig) {
        dispatch({
          type: "blockEdit/onUpdateEditBlock",
          payload: { path: "options.vuePlay", value: nextPlay },
        });
        return;
      }
      dispatch({
        type: "board/onUpdateBlock",
        payload: { ...current, options },
      });
    } catch (error) {
      console.warn("[fat-it-interview] 保存 Vue 代码失败", error);
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

  const editorFileUri = (monacoNs: Monaco, extension: string) => {
    const safeId = (blockId || "draft").replace(/[^\w-]/g, "_");
    const surface = inConfig ? "config" : "board";
    return monacoNs.Uri.parse(`file:///vue-play/${safeId}/${surface}.${extension}`);
  };

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoNs: Monaco) => {
    editorRef.current = editor;
    try {
      attachEditorModel(editor, monacoNs, editorFileUri(monacoNs, "vue"), "html", draftRef.current);
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
    play.theme === "light" ? "fat-vue-play-editor fat-vue-play-editor-light" : "fat-vue-play-editor";
  const codePane = (
    <div className="fat-vue-play-pane">
      <div className="fat-vue-play-label">代码</div>
      <div className={editorClass}>
        <Editor
          height="100%"
          language="html"
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
    <div className="fat-vue-play-pane">
      <div className="fat-vue-play-label">Less</div>
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
    <div className="fat-vue-play-pane">
      <div className="fat-vue-play-label">
        <span>控制台</span>
        <button type="button" className="fat-vue-play-clear" onClick={() => setLines([])}>
          清空
        </button>
      </div>
      <pre
        className={
          play.theme === "light"
            ? "fat-vue-play-console fat-vue-play-console-light"
            : "fat-vue-play-console"
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
    <div className="fat-vue-play-pane">
      <div className="fat-vue-play-label">页面</div>
      <div className="fat-vue-play-preview">
        {frameHtml ? (
          <iframe
            ref={iframeRef}
            title="Vue 页面"
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            srcDoc={frameHtml}
            onLoad={handleIframeLoad}
            className="fat-vue-play-frame"
          />
        ) : null}
        {errorText ? <pre className="fat-vue-play-banner">{errorText}</pre> : null}
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
      <div className="fat-vue-play">
        <div className="fat-vue-play-toolbar">
          <Button size="small" type="primary" loading={running} onClick={runFromEditor}>
            运行
          </Button>
          <span className="fat-vue-play-hint">
            {play.showLess
              ? "写 <script setup> 和 <template>，或 export default。Ctrl+Enter 运行。Less 和 <style> 一起进预览页。"
              : "写 <script setup> 和 <template>，或 export default。Ctrl+Enter 运行。可以 import vue、lodash 和 ant-design-vue。"}
          </span>
        </div>
        <div className="fat-vue-play-body">{body}</div>
      </div>
    </ConfigProvider>
  );
};

export default VuePlayBlock;
