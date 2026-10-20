import { parseNums } from "./parse";
import type { AlgoDemo, BarFrame, BarRole } from "./types";

function snap(
  values: number[],
  roles: Record<number, BarRole>,
  caption: string,
): BarFrame {
  return { kind: "bars", values: [...values], roles: { ...roles }, caption };
}

export function runMerge(input: string): BarFrame[] {
  const a = parseNums(input);
  const frames: BarFrame[] = [];
  frames.push(snap(a, {}, "初始序列。先拆到长度为 1，再两两合并。"));

  const sort = (lo: number, hi: number) => {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    const range: Record<number, BarRole> = {};
    for (let k = lo; k < hi; k++) range[k] = "range";
    frames.push(snap(a, range, `拆分 [${lo}, ${hi})，中点 ${mid}`));
    sort(lo, mid);
    sort(mid, hi);
    const tmp: number[] = [];
    let i = lo;
    let j = mid;
    while (i < mid && j < hi) {
      if (a[i] <= a[j]) tmp.push(a[i++]);
      else tmp.push(a[j++]);
    }
    while (i < mid) tmp.push(a[i++]);
    while (j < hi) tmp.push(a[j++]);
    for (let k = 0; k < tmp.length; k++) a[lo + k] = tmp[k];
    const merged: Record<number, BarRole> = {};
    for (let k = lo; k < hi; k++) merged[k] = "sorted";
    frames.push(
      snap(a, merged, `合并 [${lo}, ${hi})，结果 ${tmp.join(", ")}`),
    );
  };

  sort(0, a.length);
  const done: Record<number, BarRole> = {};
  a.forEach((_, index) => {
    done[index] = "sorted";
  });
  frames.push(snap(a, done, "归并完成。稳定，时间 O(n log n)，需要 O(n) 额外空间。"));
  return frames;
}

export const mergeDemo: AlgoDemo = {
  id: "merge",
  title: "归并排序",
  summary: "分治拆开再按顺序合并。稳定，时间始终 O(n log n)，空间 O(n)。",
  inputHint: "用逗号分隔的数字，例如 8,3,6,1,5,2,7,4",
  defaultInput: "8,3,6,1,5,2,7,4",
  editable: true,
  run: runMerge,
};
