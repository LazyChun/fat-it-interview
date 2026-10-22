import { parseNums } from "./parse";
import type { AlgoDemo, ArrayFrame } from "./types";

function span(left: number, right: number, best: boolean): Record<number, "hit" | "window"> {
  const marks: Record<number, "hit" | "window"> = {};
  for (let i = left; i <= right; i++) marks[i] = best ? "hit" : "window";
  return marks;
}

export function runKadane(input: string): ArrayFrame[] {
  const a = parseNums(input, { min: 1 });
  const frames: ArrayFrame[] = [];
  let best = a[0];
  let cur = a[0];
  let bestL = 0;
  let bestR = 0;
  let curL = 0;
  frames.push({
    kind: "array",
    values: a,
    pointers: [{ index: 0, label: "i", color: "#1677ff" }],
    marks: span(0, 0, true),
    caption: `从 a[0]=${a[0]} 开始。当前和 ${cur}，目前最大 ${best}`,
  });
  for (let i = 1; i < a.length; i++) {
    if (cur + a[i] < a[i]) {
      cur = a[i];
      curL = i;
      frames.push({
        kind: "array",
        values: a,
        pointers: [{ index: i, label: "i", color: "#1677ff" }],
        marks: span(i, i, false),
        caption: `前面的和已经是负数，从 ${a[i]} 重新开始，当前和 ${cur}`,
      });
    } else {
      cur += a[i];
      frames.push({
        kind: "array",
        values: a,
        pointers: [
          { index: curL, label: "L", color: "#1677ff" },
          { index: i, label: "R", color: "#fa8c16" },
        ],
        marks: span(curL, i, false),
        caption: `接上 ${a[i]}，区间 [${curL}, ${i}] 的和是 ${cur}`,
      });
    }
    if (cur > best) {
      best = cur;
      bestL = curL;
      bestR = i;
    }
  }
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    marks: span(bestL, bestR, true),
    caption: `最大子数组和是 ${best}，区间 [${bestL}, ${bestR}]`,
  });
  return frames;
}

export const kadaneDemo: AlgoDemo = {
  id: "kadane",
  title: "最大子数组和",
  summary: "以当前位置结尾的最大和，要么自己重新开始，要么接上前一段。一遍扫描 O(n)。",
  inputHint: "用逗号分隔的数字，例如 -2,1,-3,4,-1,2,1,-5,4",
  defaultInput: "-2,1,-3,4,-1,2,1,-5,4",
  editable: true,
  run: runKadane,
};
