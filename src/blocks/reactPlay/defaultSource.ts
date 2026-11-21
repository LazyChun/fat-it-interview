/** 新卡片里的示例。用户改完后保存在 options.reactPlay.source。 */
export const DEFAULT_REACT_SOURCE = `function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h3 style={{ margin: "0 0 12px" }}>React 预览</h3>
      <button
        onClick={() => {
          const next = count + 1;
          setCount(next);
          console.log("count", next);
        }}
      >
        点击 {count}
      </button>
    </div>
  );
}
`;

export type ReactPlayTheme = "dark" | "light";
export type ReactPlayConsolePlacement = "bottom" | "right";

export interface ReactPlayOptions {
  source: string;
  theme: ReactPlayTheme;
  showConsole: boolean;
  consolePlacement: ReactPlayConsolePlacement;
  /** 为 true 时才显示 Less 编辑器。已保存的样式在关闭编辑器后仍然生效。 */
  showLess: boolean;
  less: string;
}

export const DEFAULT_REACT_PLAY: ReactPlayOptions = {
  source: DEFAULT_REACT_SOURCE,
  theme: "dark",
  showConsole: true,
  consolePlacement: "bottom",
  showLess: false,
  less: "",
};

export function readReactPlay(config: unknown): ReactPlayOptions {
  const raw =
    config && typeof config === "object"
      ? (config as { reactPlay?: Partial<ReactPlayOptions> }).reactPlay
      : undefined;
  return {
    source: typeof raw?.source === "string" ? raw.source : DEFAULT_REACT_SOURCE,
    theme: raw?.theme === "light" ? "light" : "dark",
    showConsole: raw?.showConsole !== false,
    consolePlacement: raw?.consolePlacement === "right" ? "right" : "bottom",
    showLess: raw?.showLess === true,
    less: typeof raw?.less === "string" ? raw.less : "",
  };
}

export function readReactSource(config: unknown): string {
  return readReactPlay(config).source;
}
