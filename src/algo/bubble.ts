import { parseNums } from "./parse";
import type { AlgoDemo, BarFrame, BarRole } from "./types";

function snap(
  values: number[],
  roles: Record<number, BarRole>,
  caption: string,
): BarFrame {
  return { kind: "bars", values: [...values], roles: { ...roles }, caption };
}

export function runBubble(input: string): BarFrame[] {
  const a = parseNums(input);
  const frames: BarFrame[] = [];
  const sorted = new Set<number>();
  const withSorted = (roles: Record<number, BarRole>) => {
    const next = { ...roles };
    sorted.forEach((index) => {
      next[index] = "sorted";
    });
    return next;
  };
  frames.push(snap(a, {}, "初始序列。相邻元素比较，较大者向右冒泡。"));
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      frames.push(
        snap(
          a,
          withSorted({ [j]: "compare", [j + 1]: "compare" }),
          `比较下标 ${j} 与 ${j + 1}：${a[j]} 和 ${a[j + 1]}`,
        ),
      );
      if (a[j] > a[j + 1]) {
        const tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;
        frames.push(
          snap(
            a,
            withSorted({ [j]: "swap", [j + 1]: "swap" }),
            `逆序，交换后变为 ${a[j]}、${a[j + 1]}`,
          ),
        );
      }
    }
    sorted.add(n - 1 - i);
    frames.push(
      snap(
        a,
        withSorted({}),
        `第 ${i + 1} 趟结束，下标 ${n - 1 - i} 已就位`,
      ),
    );
  }
  if (n > 0) sorted.add(0);
  frames.push(snap(a, withSorted({}), "排序完成。稳定排序，最好 O(n)，最坏 O(n²)。"));
  return frames;
}

export const bubbleDemo: AlgoDemo = {
  id: "bubble",
  title: "冒泡排序",
  summary: "相邻比较并交换，每一趟把当前最大值沉到末尾。稳定，原地，平均 O(n²)。",
  inputHint: "用逗号分隔的数字，例如 5,1,4,2,8",
  defaultInput: "5,1,4,2,8",
  editable: true,
  run: runBubble,
};
