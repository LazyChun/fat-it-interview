import { parseNums } from "./parse";
import type { AlgoDemo, BarFrame, BarRole } from "./types";

function snap(
  values: number[],
  roles: Record<number, BarRole>,
  caption: string,
): BarFrame {
  return { kind: "bars", values: [...values], roles: { ...roles }, caption };
}

export function runInsertion(input: string): BarFrame[] {
  const a = parseNums(input);
  const frames: BarFrame[] = [];
  const prefix = (end: number, extra: Record<number, BarRole> = {}) => {
    const roles: Record<number, BarRole> = { ...extra };
    for (let i = 0; i <= end; i++) {
      if (roles[i] === undefined) roles[i] = "sorted";
    }
    return roles;
  };
  frames.push(
    snap(a, prefix(0), "下标 0 单独看成已排序区间。后面的元素逐个插进来。"),
  );
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    frames.push(
      snap(
        a,
        prefix(i - 1, { [i]: "active" }),
        `取出 a[${i}]=${key}，准备插入左侧有序区间`,
      ),
    );
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      const moving = a[j];
      frames.push(
        snap(
          a,
          prefix(i - 1, { [j]: "compare", [j + 1]: "active" }),
          `${moving} > ${key}，把它右移一格`,
        ),
      );
      a[j + 1] = moving;
      j -= 1;
      frames.push(
        snap(
          a,
          prefix(i - 1, { [j + 1]: "active" }),
          `${moving} 已右移，空位来到下标 ${j + 1}`,
        ),
      );
    }
    a[j + 1] = key;
    frames.push(
      snap(
        a,
        prefix(i, { [j + 1]: "swap" }),
        `${key} 插入下标 ${j + 1}。前 ${i + 1} 个已经有序`,
      ),
    );
  }
  frames.push(
    snap(
      a,
      prefix(a.length - 1),
      "插入排序完成。稳定，最好 O(n)，最坏 O(n²)，适合基本有序的小数组。",
    ),
  );
  return frames;
}

export const insertionDemo: AlgoDemo = {
  id: "insertion",
  title: "插入排序",
  summary: "维护左侧有序区间，把下一个元素插入到正确位置。基本有序时接近 O(n)。",
  inputHint: "用逗号分隔的数字，例如 5,1,4,2,8",
  defaultInput: "5,1,4,2,8",
  editable: true,
  run: runInsertion,
};
