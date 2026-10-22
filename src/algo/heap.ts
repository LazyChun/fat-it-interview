import { parseNums } from "./parse";
import type { AlgoDemo, BarFrame, BarRole } from "./types";

export function runHeap(input: string): BarFrame[] {
  const a = parseNums(input);
  const frames: BarFrame[] = [];
  const sorted = new Set<number>();
  const shoot = (roles: Record<number, BarRole>, caption: string) => {
    const next = { ...roles };
    sorted.forEach((index) => {
      next[index] = "sorted";
    });
    frames.push({ kind: "bars", values: [...a], roles: next, caption });
  };

  const heapify = (n: number, i: number) => {
    let largest = i;
    const left = i * 2 + 1;
    const right = i * 2 + 2;
    const roles: Record<number, BarRole> = { [i]: "pivot" };
    if (left < n) roles[left] = "compare";
    if (right < n) roles[right] = "compare";
    if (left < n && a[left] > a[largest]) largest = left;
    if (right < n && a[right] > a[largest]) largest = right;
    const kids = [left, right].filter((index) => index < n);
    shoot(
      roles,
      kids.length
        ? `下标 ${i} 的 ${a[i]} 与孩子 ${kids.map((index) => a[index]).join("、")} 比较`
        : `下标 ${i} 的 ${a[i]} 没有孩子`,
    );
    if (largest !== i) {
      const tmp = a[i];
      a[i] = a[largest];
      a[largest] = tmp;
      shoot(
        { [i]: "swap", [largest]: "swap" },
        `孩子更大，交换后下标 ${i} 是 ${a[i]}`,
      );
      heapify(n, largest);
    }
  };

  shoot({}, "初始序列。先建成大根堆：父结点不小于孩子，堆顶是最大值。");
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {
    heapify(a.length, i);
  }
  shoot({ 0: "pivot" }, `建堆完成，堆顶是 ${a[0]}`);
  for (let end = a.length - 1; end > 0; end--) {
    const top = a[0];
    const tmp = a[0];
    a[0] = a[end];
    a[end] = tmp;
    sorted.add(end);
    shoot({ 0: "active" }, `堆顶 ${top} 换到下标 ${end}，这一位已经就位`);
    heapify(end, 0);
  }
  if (a.length > 0) sorted.add(0);
  shoot({}, "堆排序完成。不稳定，最好最坏都是 O(n log n)，可以原地完成。");
  return frames;
}

export const heapDemo: AlgoDemo = {
  id: "heap",
  title: "堆排序",
  summary: "建成大根堆后，反复把堆顶换到末尾再下沉。时间 O(n log n)，额外空间 O(1)。",
  inputHint: "用逗号分隔的数字，例如 4,10,3,5,1",
  defaultInput: "4,10,3,5,1",
  editable: true,
  run: runHeap,
};
