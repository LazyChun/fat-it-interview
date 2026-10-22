import { parseNums } from "./parse";
import type { AlgoDemo, BarFrame, BarRole } from "./types";

function snap(
  values: number[],
  roles: Record<number, BarRole>,
  caption: string,
): BarFrame {
  return { kind: "bars", values: [...values], roles: { ...roles }, caption };
}

export function runSelection(input: string): BarFrame[] {
  const a = parseNums(input);
  const frames: BarFrame[] = [];
  const sorted = new Set<number>();
  const shoot = (roles: Record<number, BarRole>, caption: string) => {
    const next = { ...roles };
    sorted.forEach((index) => {
      next[index] = "sorted";
    });
    frames.push(snap(a, next, caption));
  };
  shoot({}, "初始序列。每一趟在未排序区间里选出最小值，放到区间开头。");
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      shoot(
        { [min]: "active", [j]: "compare" },
        `未排序起点 ${i}，当前最小是 a[${min}]=${a[min]}，正在看 a[${j}]=${a[j]}`,
      );
      if (a[j] < a[min]) {
        min = j;
        shoot({ [min]: "active" }, `发现更小的 ${a[min]}，记在下标 ${min}`);
      }
    }
    if (min !== i) {
      const tmp = a[i];
      a[i] = a[min];
      a[min] = tmp;
      shoot({ [i]: "swap", [min]: "swap" }, `把 ${a[i]} 换到下标 ${i}`);
    }
    sorted.add(i);
    shoot({}, `下标 ${i} 就位，值为 ${a[i]}`);
  }
  if (n > 0) sorted.add(n - 1);
  shoot({}, "选择排序完成。不稳定，比较次数始终 Θ(n²)，交换最多 n−1 次。");
  return frames;
}

export const selectionDemo: AlgoDemo = {
  id: "selection",
  title: "选择排序",
  summary: "每趟选出未排序区间的最小值放到开头。比较次数固定，交换很少，不稳定。",
  inputHint: "用逗号分隔的数字，例如 5,1,4,2,8",
  defaultInput: "5,1,4,2,8",
  editable: true,
  run: runSelection,
};
