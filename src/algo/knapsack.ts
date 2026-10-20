import { parseNums } from "./parse";
import type { AlgoDemo, MatrixFrame } from "./types";

export function runKnapsack(input: string): MatrixFrame[] {
  const parts = input.split("|").map((s) => s.trim());
  if (parts.length < 3) {
    throw new Error("格式：容量 | 重量 | 价值，例如 4 | 1,3,4 | 15,20,30");
  }
  const cap = Number(parts[0]);
  if (!Number.isInteger(cap) || cap < 1 || cap > 12) {
    throw new Error("容量请填 1 到 12 的整数");
  }
  const weights = parseNums(parts[1], { min: 1, max: 6, positive: true });
  const values = parseNums(parts[2], { min: 1, max: 6 });
  if (values.some((n) => !Number.isInteger(n) || n < 0)) {
    throw new Error("价值请填非负整数");
  }
  if (weights.length !== values.length) {
    throw new Error("重量和价值的个数要一致");
  }
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array<number>(cap + 1).fill(0));
  const rowLabels = [
    "不选",
    ...weights.map((w, i) => `#${i + 1} 重${w}/值${values[i]}`),
  ];
  const colLabels = Array.from({ length: cap + 1 }, (_, i) => String(i));
  const frames: MatrixFrame[] = [];
  const push = (row: number, col: number, caption: string) => {
    frames.push({
      kind: "matrix",
      rowLabels,
      colLabels,
      cells: dp.map((line) => [...line]),
      active: [row, col],
      caption,
    });
  };
  push(0, 0, "dp[i][c]：只考虑前 i 件物品、容量不超过 c 时的最大价值");
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let c = 0; c <= cap; c++) {
      let best = dp[i - 1][c];
      let how = "不选这件";
      if (c >= w) {
        const take = dp[i - 1][c - w] + v;
        if (take > best) {
          best = take;
          how = `选这件，${dp[i - 1][c - w]} + ${v}`;
        }
      }
      dp[i][c] = best;
      push(i, c, `物品 ${i}（重 ${w} 价值 ${v}），容量 ${c}：${how} → ${best}`);
    }
  }
  push(n, cap, `最优价值 ${dp[n][cap]}`);
  return frames;
}

export const knapsackDemo: AlgoDemo = {
  id: "knapsack",
  title: "0/1 背包",
  summary: "每件物品选或不选。dp[i][c] = max(不选, 选了之后的剩余容量价值)。",
  inputHint: "容量 | 重量列表 | 价值列表，例如 4 | 1,3,4 | 15,20,30",
  defaultInput: "4 | 1,3,4 | 15,20,30",
  editable: true,
  run: runKnapsack,
};
