import type { AlgoDemo, ArrayFrame } from "./types";

export function runClimb(input: string): ArrayFrame[] {
  const n = Number(input.trim());
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    throw new Error("台阶数请填 1 到 12 的整数");
  }
  const dp = [1];
  const frames: ArrayFrame[] = [
    {
      kind: "array",
      values: [...dp],
      pointers: [{ index: 0, label: "0", color: "#1677ff" }],
      caption: "dp[i] 是爬到第 i 阶的方法数。0 阶有 1 种：一步也不爬。",
    },
  ];
  dp.push(1);
  frames.push({
    kind: "array",
    values: [...dp],
    pointers: [{ index: 1, label: "1", color: "#1677ff" }],
    marks: { 1: "hit" },
    caption: "1 阶只有一种爬法：一次爬 1 步。dp[1] = 1",
  });
  for (let i = 2; i <= n; i++) {
    const next = dp[i - 1] + dp[i - 2];
    dp.push(next);
    frames.push({
      kind: "array",
      values: [...dp],
      pointers: [
        { index: i - 2, label: "-2", color: "#722ed1" },
        { index: i - 1, label: "-1", color: "#fa8c16" },
        { index: i, label: "i", color: "#1677ff" },
      ],
      marks: { [i]: "hit" },
      caption: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${next}`,
    });
  }
  frames.push({
    kind: "array",
    values: [...dp],
    pointers: [{ index: n, label: "n", color: "#1677ff" }],
    marks: { [n]: "hit" },
    caption: `爬到第 ${n} 阶一共 ${dp[n]} 种方法`,
  });
  return frames;
}

export const climbDemo: AlgoDemo = {
  id: "climb",
  title: "爬楼梯",
  summary: "最后一步从 n−1 爬 1 阶，或从 n−2 爬 2 阶。dp[n] = dp[n−1] + dp[n−2]。",
  inputHint: "台阶数，1 到 12，例如 5",
  defaultInput: "5",
  editable: true,
  run: runClimb,
};
