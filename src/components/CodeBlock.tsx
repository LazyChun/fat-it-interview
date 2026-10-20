import React, { useCallback, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Button, theme as antdTheme } from "antd";
import type { CSSProperties } from "react";

/*
 * 使用本地打包的 monaco-editor（配合 monaco-editor-webpack-plugin 提供 worker），
 * 不走 @monaco-editor/react 默认的 CDN loader，保证离线可用。
 */
import * as monaco from "monaco-editor";

loader.config({ monaco });

const LINE_HEIGHT = 20;
const V_PADDING = 10;

/** 展示用语言名映射 */
const LANG_LABELS: Record<string, string> = {
  js: "JavaScript",
  jsx: "JSX",
  javascript: "JavaScript",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  css: "CSS",
  html: "HTML",
  xml: "XML",
  json: "JSON",
  java: "Java",
  python: "Python",
  py: "Python",
  sql: "SQL",
  shell: "Shell",
  bash: "Shell",
  sh: "Shell",
  http: "HTTP",
};

/*
 * 数据里的语言名 → monaco 语言 id。
 * monaco 没有 "tsx" 语言（typescript 只注册了 ts/typescript 别名），
 * 直接传未知 id 会导致整块退化为纯文本、没有高亮。
 */
const MONACO_LANGS: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  javascript: "javascript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  html: "html",
  xml: "xml",
  css: "css",
  less: "less",
  scss: "scss",
  json: "json",
  java: "java",
  python: "python",
  py: "python",
  sql: "sql",
  shell: "shell",
  bash: "shell",
  sh: "shell",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
  go: "go",
  c: "c",
  cpp: "cpp",
};

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  domReadOnly: true,
  fontSize: 12.5,
  lineHeight: LINE_HEIGHT,
  wordWrap: "on",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  scrollBeyondLastColumn: 2,
  lineNumbers: "on",
  lineNumbersMinChars: 2,
  glyphMargin: false,
  folding: true,
  renderLineHighlight: "none",
  contextmenu: false,
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  wordBasedSuggestions: "off",
  occurrencesHighlight: "off",
  selectionHighlight: false,
  codeLens: false,
  hover: { enabled: false },
  parameterHints: { enabled: false },
  links: false,
  matchBrackets: "never",
  cursorBlinking: "solid",
  stickyScroll: { enabled: false },
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  // 代码里含中文注释，关闭非 ASCII 字符高亮提示框
  unicodeHighlight: {
    ambiguousCharacters: false,
    invisibleCharacters: false,
    nonBasicASCII: false,
  },
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
    alwaysConsumeMouseWheel: false,
    useShadows: false,
  },
  padding: { top: V_PADDING, bottom: V_PADDING },
  automaticLayout: true,
};

function defineDisplayThemes(monaco: Monaco) {
  const transparent = {
    "editor.background": "#00000000",
    "editorGutter.background": "#00000000",
    "editorLineNumber.foreground": "#8a919f",
    "editorLineNumber.activeForeground": "#57606a",
    "editor.lineHighlightBackground": "#00000000",
  };
  monaco.editor.defineTheme("fn-code-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
      { token: "string", foreground: "0a7d33" },
    ],
    colors: {
      ...transparent,
      "editorLineNumber.activeForeground": "#24292f",
    },
  });
  monaco.editor.defineTheme("fn-code-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "string", foreground: "7ee787" },
    ],
    colors: {
      ...transparent,
      "editorLineNumber.foreground": "#6e7681",
      "editorLineNumber.activeForeground": "#c9d1d9",
    },
  });
}

/** 关闭 TS/JS 语义/语法校验，避免答案代码被标记错误波浪线 */
function turnOffValidation(monaco: Monaco) {
  const opts = {
    noSemanticValidation: true,
    noSyntaxValidation: true,
    noSuggestionDiagnostics: true,
  };
  try {
    monaco.languages.typescript?.typescriptDefaults?.setDiagnosticsOptions(
      opts,
    );
    monaco.languages.typescript?.javascriptDefaults?.setDiagnosticsOptions(
      opts,
    );
  } catch {
    /* 语言未启用时忽略 */
  }
}

function isDarkBg(color: string | undefined): boolean {
  if (!color) return false;
  const m = /^#([0-9a-f]{3,8})$/i.exec(color.trim());
  if (!m) return false;
  let hex = m[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length < 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // 相对亮度（Rec. 709）
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const CopyIcon = ({ style }: { style?: CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden
  >
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ style }: { style?: CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface CodeBlockProps {
  lang: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ lang, code }) => {
  const { token } = antdTheme.useToken();
  const dark = isDarkBg(token.colorBgBase);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  // 初始高度按行数估算，避免 Monaco 加载完成后高度跳变
  const [height, setHeight] = useState(
    () => Math.max(code.split("\n").length, 1) * LINE_HEIGHT + V_PADDING * 2,
  );

  const label = LANG_LABELS[lang?.toLowerCase()] ?? (lang || "").toUpperCase();
  const monacoLang = MONACO_LANGS[lang?.toLowerCase()] ?? (lang || "plaintext");

  const handleBeforeMount = useCallback((mon: Monaco) => {
    defineDisplayThemes(mon);
    turnOffValidation(mon);
  }, []);

  const handleMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
    setHeight(ed.getContentHeight());
    ed.onDidContentSizeChange((e) => setHeight(e.contentHeight));
  }, []);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(code);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1600);
  }, [code]);

  React.useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const headerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      padding: "4px 8px 4px 12px",
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    }),
    [token.colorBorderSecondary],
  );

  const labelStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.4,
      color: token.colorTextTertiary,
      userSelect: "none",
    }),
    [token.colorTextTertiary],
  );

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: "hidden",
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgLayout,
      }}
    >
      <div style={headerStyle}>
        <span style={labelStyle}>{label}</span>
        <Button
          size="small"
          type="text"
          onClick={handleCopy}
          icon={copied ? <CheckIcon /> : <CopyIcon />}
          style={copied ? { color: token.colorSuccess } : undefined}
        >
          {copied ? "已复制" : "复制"}
        </Button>
      </div>
      <Editor
        height={height}
        language={monacoLang}
        value={code}
        theme={dark ? "fn-code-dark" : "fn-code-light"}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={EDITOR_OPTIONS}
        loading={null}
      />
    </div>
  );
};

export default CodeBlock;
