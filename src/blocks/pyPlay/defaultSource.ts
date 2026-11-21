/** 新卡片里的示例。用户改完后保存在 options.pyPlay.source。 */
export const DEFAULT_PY_SOURCE = `from collections import defaultdict

orders = [
    {"city": "北京", "amount": 120},
    {"city": "上海", "amount": 80},
    {"city": "北京", "amount": 40},
]

totals = defaultdict(int)
for row in orders:
    totals[row["city"]] += row["amount"]

print(dict(totals))
return dict(totals)
`;

export type PyPlayTheme = "dark" | "light";
export type PyPlayConsolePlacement = "bottom" | "right";

export interface PyPlayOptions {
  source: string;
  theme: PyPlayTheme;
  showConsole: boolean;
  consolePlacement: PyPlayConsolePlacement;
}

export const DEFAULT_PY_PLAY: PyPlayOptions = {
  source: DEFAULT_PY_SOURCE,
  theme: "dark",
  showConsole: true,
  consolePlacement: "bottom",
};

export function readPyPlay(config: unknown): PyPlayOptions {
  const raw =
    config && typeof config === "object"
      ? (config as { pyPlay?: Partial<PyPlayOptions> }).pyPlay
      : undefined;
  return {
    source: typeof raw?.source === "string" ? raw.source : DEFAULT_PY_SOURCE,
    theme: raw?.theme === "light" ? "light" : "dark",
    showConsole: raw?.showConsole !== false,
    consolePlacement: raw?.consolePlacement === "right" ? "right" : "bottom",
  };
}
