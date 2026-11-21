/** 新卡片里的示例。用户改完后保存在 options.jsPlay.source。 */
export const DEFAULT_JS_SOURCE = `import { groupBy, sumBy } from "lodash";

const orders = [
  { city: "北京", amount: 120 },
  { city: "上海", amount: 80 },
  { city: "北京", amount: 40 },
];

const byCity = groupBy(orders, "city");
const totals = _.mapValues(byCity, (rows) => sumBy(rows, "amount"));

console.log(totals);
return totals;
`;

export type JsPlayTheme = "dark" | "light";
export type JsPlayConsolePlacement = "bottom" | "right";

export interface JsPlayOptions {
  source: string;
  theme: JsPlayTheme;
  showConsole: boolean;
  consolePlacement: JsPlayConsolePlacement;
}

export const DEFAULT_JS_PLAY: JsPlayOptions = {
  source: DEFAULT_JS_SOURCE,
  theme: "dark",
  showConsole: true,
  consolePlacement: "bottom",
};

export function readJsPlay(config: unknown): JsPlayOptions {
  const raw =
    config && typeof config === "object"
      ? (config as { jsPlay?: Partial<JsPlayOptions> }).jsPlay
      : undefined;
  return {
    source: typeof raw?.source === "string" ? raw.source : DEFAULT_JS_SOURCE,
    theme: raw?.theme === "light" ? "light" : "dark",
    showConsole: raw?.showConsole !== false,
    consolePlacement: raw?.consolePlacement === "right" ? "right" : "bottom",
  };
}
