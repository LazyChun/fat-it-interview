import { parsePair } from "./parse";
import type { AlgoDemo, ArrayFrame } from "./types";

export function runSlidingWindow(input: string): ArrayFrame[] {
  const { nums, extra } = parsePair(input);
  if (!Number.isInteger(extra) || extra < 1 || extra > nums.length) {
    throw new Error("窗口长度 k 需要是 1 到数组长度之间的整数");
  }
  const k = extra;
  const a = [...nums];
  const frames: ArrayFrame[] = [];
  const marks = (left: number): Record<number, "window"> => {
    const next: Record<number, "window"> = {};
    for (let i = left; i < left + k; i++) next[i] = "window";
    return next;
  };
  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];
  let best = sum;
  let bestLeft = 0;
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    marks: marks(0),
    caption: `窗口 [0, ${k - 1}] 的和是 ${sum}`,
  });
  for (let right = k; right < a.length; right++) {
    const left = right - k + 1;
    sum += a[right] - a[right - k];
    if (sum > best) {
      best = sum;
      bestLeft = left;
    }
    frames.push({
      kind: "array",
      values: a,
      pointers: [
        { index: left, label: "L", color: "#1677ff" },
        { index: right, label: "R", color: "#fa8c16" },
      ],
      marks: marks(left),
      caption: `窗口 [${left}, ${right}] 的和是 ${sum}，当前最大 ${best}`,
    });
  }
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    marks: marks(bestLeft),
    caption: `长度为 ${k} 的最大子数组和是 ${best}，起点下标 ${bestLeft}`,
  });
  return frames;
}

export const slidingWindowDemo: AlgoDemo = {
  id: "sliding-window",
  title: "滑动窗口",
  summary: "固定窗口向右滑一格：加上新元素，减去离开的元素。求窗口最大和是 O(n)。",
  inputHint: "数字列表 | 窗口长度，例如 2,1,5,1,3,2 | 3",
  defaultInput: "2,1,5,1,3,2 | 3",
  editable: true,
  run: runSlidingWindow,
};
