import { parsePair } from "./parse";
import type { AlgoDemo, ArrayFrame } from "./types";

const LO = "#1677ff";
const MID = "#722ed1";
const HI = "#fa8c16";

export function runBinary(input: string): ArrayFrame[] {
  const { nums, extra: target } = parsePair(input);
  const a = [...nums].sort((x, y) => x - y);
  const frames: ArrayFrame[] = [];
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    caption: `数组已按升序排列，查找 ${target}`,
  });
  let lo = 0;
  let hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const pointers = [
      { index: lo, label: "lo", color: LO },
      { index: mid, label: "mid", color: MID },
      { index: hi, label: "hi", color: HI },
    ];
    if (a[mid] === target) {
      frames.push({
        kind: "array",
        values: a,
        pointers,
        marks: { [mid]: "hit" },
        caption: `a[${mid}]=${a[mid]}，命中目标 ${target}`,
      });
      return frames;
    }
    if (a[mid] < target) {
      frames.push({
        kind: "array",
        values: a,
        pointers,
        caption: `a[${mid}]=${a[mid]} < ${target}，舍弃左半，lo = ${mid + 1}`,
      });
      lo = mid + 1;
    } else {
      frames.push({
        kind: "array",
        values: a,
        pointers,
        caption: `a[${mid}]=${a[mid]} > ${target}，舍弃右半，hi = ${mid - 1}`,
      });
      hi = mid - 1;
    }
  }
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    caption: `没有找到 ${target}`,
  });
  return frames;
}

export const binaryDemo: AlgoDemo = {
  id: "binary",
  title: "二分查找",
  summary: "每次用中点把有序区间砍半。比较 O(log n) 次，数组必须有序。",
  inputHint: "数字列表 | 目标值，例如 1,3,5,7,9,11 | 7",
  defaultInput: "1,3,5,7,9,11 | 7",
  editable: true,
  run: runBinary,
};
