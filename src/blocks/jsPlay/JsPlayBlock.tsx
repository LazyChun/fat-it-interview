import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Button, ConfigProvider, Splitter, theme as antdTheme } from "antd";
import type { BlockRenderProps, FatNotesPluginSDK } from "fat-notes-sdk";
import lodashUmd from "fat-lodash-umd";
import { shouldAdoptSavedText } from "../editorDraftSync";
import { readJsPlay } from "./defaultSource";
import { configureJsPlayMonaco } from "./editorTypes";
import { prepareJsSource } from "./prepare";
import { runJavaScript, type JsLogLine } from "./runSandbox";
import "./JsPlayBlock.css";

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
  source: string,
): void {
  const existing = monacoNs.editor.getModel(uri);
  const model =
    existing && !existing.isDisposed()
      ? existing
      : monacoNs.editor.createModel(source, "javascript", uri);
  if (model.getValue() !== source) model.setValue(source);
  const previous = editor.getModel();
  if (previous !== model) {
    editor.setModel(model);
    if (previous && !previous.isDisposed()) previous.dispose();
  }
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

const JsPlayBlock: React.FC<{ sdk: FatNotesPluginSDK } & BlockRenderProps> = ({
  sdk,
  config,
  item,
  inConfig,
}) => {
  const dispatch = useHostDispatch(sdk);
  const play = readJsPlay(config);
  const savedSource = play.source;
  const [draft, setDraft] = useState(savedSource);
  const [lines, setLines] = useState<JsLogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [hostTheme, setHostTheme] = useState(() => {
    try {
      return sdk.ui.theme.get();
    } catch {
      return "light";
    }
  });
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const itemRef = useRef(item);
  const draftRef = useRef(draft);
  const seenSavedRef = useRef(savedSource);
  const persistedSourceRef = useRef(savedSource);
  const saveTimer = useRef<number | undefined>(undefined);
  const runToken = useRef(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const blockId = String(item?.id || "");
  itemRef.current = item;
  draftRef.current = draft;

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
      cancelRef.current?.();
    };
  }, []);

  const run = () => {
    const source = draftRef.current;
    if (!source.trim()) {
      cancelRef.current?.();
      cancelRef.current = null;
      runToken.current += 1;
      setRunning(false);
      setLines([{ level: "error", text: "代码是空的" }]);
      return;
    }
    let code = "";
    try {
      code = prepareJsSource(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      cancelRef.current?.();
      cancelRef.current = null;
      runToken.current += 1;
      setRunning(false);
      setLines([{ level: "error", text: message }]);
      return;
    }
    cancelRef.current?.();
    const token = runToken.current + 1;
    runToken.current = token;
    setRunning(true);
    setLines([{ level: "system", text: "开始运行 JavaScript" }]);
    const handle = runJavaScript(code, lodashUmd, (line) => {
      if (runToken.current !== token) return;
      setLines((prev) => prev.concat(line));
    });
    cancelRef.current = handle.cancel;
    void handle.promise.then((result) => {
      if (runToken.current !== token || result.error === "cancelled") return;
      setRunning(false);
      if (!result.ok) {
        const text =
          result.error === "timeout" ? "运行超时" : result.error || "运行失败";
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
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    const next = readJsPlay(config);
    seenSavedRef.current = next.source;
    persistedSourceRef.current = next.source;
    setDraft(next.source);
    draftRef.current = next.source;
    writeEditor(editorRef.current, next.source);
    runRef.current();
    return () => cancelRef.current?.();
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

  const persist = () => {
    const source = draftRef.current;
    const current = itemRef.current;
    if (!current) return;
    const prev = readJsPlay(current.options);
    if (prev.source === source) return;
    persistedSourceRef.current = source;
    const nextPlay = { ...prev, source };
    const options = {
      ...(current.options || {}),
      jsPlay: nextPlay,
    };
    try {
      if (inConfig) {
        dispatch({
          type: "blockEdit/onUpdateEditBlock",
          payload: { path: "options.jsPlay", value: nextPlay },
        });
        return;
      }
      dispatch({
        type: "board/onUpdateBlock",
        payload: { ...current, options },
      });
    } catch (error) {
      console.warn("[fat-it-interview] 保存 JavaScript 代码失败", error);
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

  const editorFileUri = (monacoNs: Monaco) => {
    const safeId = (blockId || "draft").replace(/[^\w-]/g, "_");
    const surface = inConfig ? "config" : "board";
    return monacoNs.Uri.parse(`file:///js-play/${safeId}/${surface}.js`);
  };

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoNs: Monaco) => {
    editorRef.current = editor;
    try {
      configureJsPlayMonaco(monacoNs);
      attachEditorModel(editor, monacoNs, editorFileUri(monacoNs), draftRef.current);
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

  const editorClass =
    play.theme === "light" ? "fat-js-play-editor fat-js-play-editor-light" : "fat-js-play-editor";
  const codePane = (
    <div className="fat-js-play-pane">
      <div className="fat-js-play-label">代码</div>
      <div className={editorClass}>
        <Editor
          height="100%"
          language="javascript"
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
    <div className="fat-js-play-pane">
      <div className="fat-js-play-label">
        <span>控制台</span>
        <button type="button" className="fat-js-play-clear" onClick={() => setLines([])}>
          清空
        </button>
      </div>
      <pre
        className={
          play.theme === "light"
            ? "fat-js-play-console fat-js-play-console-light"
            : "fat-js-play-console"
        }
      >
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
  const body = play.showConsole ? (
    <Splitter
      key={play.consolePlacement}
      orientation={play.consolePlacement === "right" ? "horizontal" : "vertical"}
      style={{ height: "100%" }}
    >
      <Splitter.Panel defaultSize="68%" min="20%">
        {codePane}
      </Splitter.Panel>
      <Splitter.Panel defaultSize="32%" min="16%">
        {consolePane}
      </Splitter.Panel>
    </Splitter>
  ) : (
    codePane
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="fat-js-play">
        <div className="fat-js-play-toolbar">
          <Button size="small" type="primary" loading={running} onClick={runFromEditor}>
            运行
          </Button>
          <span className="fat-js-play-hint">
            import {"{ groupBy }"} from "lodash"，或直接使用 _。return 的值显示在控制台。Ctrl+Enter 运行。
          </span>
        </div>
        <div className="fat-js-play-body">{body}</div>
      </div>
    </ConfigProvider>
  );
};

export default JsPlayBlock;
