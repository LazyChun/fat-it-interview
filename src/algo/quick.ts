import { parseNums } from "./parse";
import type { AlgoDemo, BarFrame, BarRole } from "./types";

function snap(
  values: number[],
  roles: Record<number, BarRole>,
  caption: string,
): BarFrame {
  return { kind: "bars", values: [...values], roles: { ...roles }, caption };
}

export function runQuick(input: string): BarFrame[] {
  const a = parseNums(input);
  const frames: BarFrame[] = [];
  const placed = new Set<number>();
  const paint = (roles: Record<number, BarRole>) => {
    const next = { ...roles };
    placed.forEach((index) => {
      next[index] = "sorted";
    });
    return next;
  };
  frames.push(snap(a, {}, "初始序列。选区间末尾为枢轴，做 Lomuto 分区。"));

  const partition = (lo: number, hi: number): number => {
    const pivot = a[hi];
    const range: Record<number, BarRole> = {};
    for (let k = lo; k <= hi; k++) range[k] = "range";
    range[hi] = "pivot";
    frames.push(
      snap(a, paint(range), `分区 [${lo}, ${hi}]，枢轴 a[${hi}]=${pivot}`),
    );
    let i = lo;
    for (let j = lo; j < hi; j++) {
      frames.push(
        snap(
          a,
          paint({ ...range, [hi]: "pivot", [j]: "compare", [i]: "active" }),
          `j=${j} 的值 ${a[j]} 与枢轴 ${pivot} 比较，i=${i}`,
        ),
      );
      if (a[j] <= pivot) {
        if (i !== j) {
          const tmp = a[i];
          a[i] = a[j];
          a[j] = tmp;
          frames.push(
            snap(
              a,
              paint({ [hi]: "pivot", [i]: "swap", [j]: "swap" }),
              `${a[i]} 不大于枢轴，换到 i 的位置`,
            ),
          );
        }
        i += 1;
      }
    }
    if (i !== hi) {
      const tmp = a[i];
      a[i] = a[hi];
      a[hi] = tmp;
    }
    frames.push(snap(a, paint({ [i]: "pivot" }), `枢轴 ${a[i]} 归位到下标 ${i}`));
    return i;
  };

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      placed.add(lo);
      return;
    }
    const mid = partition(lo, hi);
    placed.add(mid);
    sort(lo, mid - 1);
    sort(mid + 1, hi);
  };

  sort(0, a.length - 1);
  const done: Record<number, BarRole> = {};
  a.forEach((_, index) => {
    done[index] = "sorted";
  });
  frames.push(
    snap(a, done, "排序完成。平均 O(n log n)，最坏 O(n²)，不稳定。"),
  );
  return frames;
}

export const quickDemo: AlgoDemo = {
  id: "quick",
  title: "快速排序",
  summary: "分区把枢轴放到最终位置，再递归左右两侧。平均 O(n log n)，不稳定。",
  inputHint: "用逗号分隔的数字，例如 6,3,8,1,5,2",
  defaultInput: "6,3,8,1,5,2",
  editable: true,
  run: runQuick,
};
