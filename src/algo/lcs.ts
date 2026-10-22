import type { AlgoDemo, MatrixFrame } from "./types";

function parseTexts(input: string): [string, string] {
  const parts = input.split("|").map((part) => part.trim());
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error("格式：字符串 | 字符串，例如 ace | abcde");
  }
  const clean = (text: string) => text.replace(/\s+/g, "");
  const a = clean(parts[0]);
  const b = clean(parts[1]);
  if (!a || !b) throw new Error("竖线两边都至少要有 1 个字符");
  if (a.length > 7 || b.length > 7) {
    throw new Error("为便于演示，每边最多 7 个字符");
  }
  return [a, b];
}

function oneLcs(a: string, b: string, dp: number[][]): string {
  const chars: string[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      chars.push(a[i - 1]);
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return chars.reverse().join("");
}

export function runLcs(input: string): MatrixFrame[] {
  const [a, b] = parseTexts(input);
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  const rowLabels = ["∅", ...a.split("")];
  const colLabels = ["∅", ...b.split("")];
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
  push(0, 0, `dp[i][j]：a 的前 i 个字符「${a}」和 b 的前 j 个字符「${b}」的最长公共子序列长度`);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        push(i, j, `「${a[i - 1]}」相同，dp[${i}][${j}] = ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}`);
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        push(
          i,
          j,
          `「${a[i - 1]}」和「${b[j - 1]}」不同，取上或左的较大者 ${dp[i][j]}`,
        );
      }
    }
  }
  const text = oneLcs(a, b, dp);
  push(
    a.length,
    b.length,
    text
      ? `最长公共子序列长度 ${dp[a.length][b.length]}，例如 ${text}`
      : "最长公共子序列长度 0",
  );
  return frames;
}

export const lcsDemo: AlgoDemo = {
  id: "lcs",
  title: "最长公共子序列",
  summary: "字符相同就沿对角线加一，不同就丢掉其中一个当前字符。子序列不要求连续。",
  inputHint: "字符串 | 字符串，例如 ace | abcde",
  defaultInput: "ace | abcde",
  editable: true,
  run: runLcs,
};
