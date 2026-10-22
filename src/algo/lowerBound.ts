import { parsePair } from "./parse";
import type { AlgoDemo, ArrayFrame, ArrayPointer } from "./types";

const LO = "#1677ff";
const MID = "#722ed1";
const HI = "#fa8c16";

export function runLowerBound(input: string): ArrayFrame[] {
  const { nums, extra: target } = parsePair(input);
  const a = [...nums].sort((x, y) => x - y);
  const frames: ArrayFrame[] = [];
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    caption: `升序数组里找第一个大于等于 ${target} 的位置。相等时继续往左收。`,
  });
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const pointers: ArrayPointer[] = [
      { index: lo, label: "lo", color: LO },
      { index: mid, label: "mid", color: MID },
    ];
    if (hi < a.length) pointers.push({ index: hi, label: "hi", color: HI });
    if (a[mid] < target) {
      frames.push({
        kind: "array",
        values: a,
        pointers,
        caption: `a[${mid}]=${a[mid]} < ${target}，左边界在右侧，lo = ${mid + 1}`,
      });
      lo = mid + 1;
    } else {
      frames.push({
        kind: "array",
        values: a,
        pointers,
        caption: `a[${mid}]=${a[mid]} ≥ ${target}，hi 收到 ${mid}，相等也往左收`,
      });
      hi = mid;
    }
  }
  const hit = lo < a.length && a[lo] === target;
  frames.push({
    kind: "array",
    values: a,
    pointers: lo < a.length ? [{ index: lo, label: "lo", color: LO }] : [],
    marks: hit ? { [lo]: "hit" } : undefined,
    caption: hit
      ? `左边界下标 ${lo}，a[${lo}]=${a[lo]} 等于目标`
      : `没有等于 ${target} 的元素，插入点是 ${lo}`,
  });
  return frames;
}

export const lowerBoundDemo: AlgoDemo = {
  id: "lower-bound",
  title: "二分左边界",
  summary: "半开区间里，a[mid] 小于目标才右移 lo，否则把 hi 收到 mid。结束时 lo 是第一个大于等于目标的位置。",
  inputHint: "数字列表 | 目标值，例如 1,2,2,2,3 | 2",
  defaultInput: "1,2,2,2,3 | 2",
  editable: true,
  run: runLowerBound,
};
