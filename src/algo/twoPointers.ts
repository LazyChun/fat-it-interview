import { parsePair } from "./parse";
import type { AlgoDemo, ArrayFrame, ArrayPointer } from "./types";

export function runTwoPointers(input: string): ArrayFrame[] {
  const { nums, extra: target } = parsePair(input);
  const a = [...nums].sort((x, y) => x - y);
  const frames: ArrayFrame[] = [];
  const frame = (
    left: number,
    right: number,
    caption: string,
    hit = false,
  ): ArrayFrame => {
    const pointers: ArrayPointer[] = [
      { index: left, label: "L", color: "#1677ff" },
      { index: right, label: "R", color: "#fa8c16" },
    ];
    return {
      kind: "array",
      values: a,
      pointers,
      marks: hit ? { [left]: "hit", [right]: "hit" } : undefined,
      caption,
    };
  };
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    caption: `有序数组上找两数之和为 ${target}。左指针取较小值，右指针取较大值。`,
  });
  let left = 0;
  let right = a.length - 1;
  while (left < right) {
    const sum = a[left] + a[right];
    if (sum === target) {
      frames.push(
        frame(
          left,
          right,
          `命中：${a[left]} + ${a[right]} = ${target}`,
          true,
        ),
      );
      return frames;
    }
    if (sum < target) {
      frames.push(
        frame(
          left,
          right,
          `${a[left]} + ${a[right]} = ${sum} < ${target}，左指针右移`,
        ),
      );
      left += 1;
    } else {
      frames.push(
        frame(
          left,
          right,
          `${a[left]} + ${a[right]} = ${sum} > ${target}，右指针左移`,
        ),
      );
      right -= 1;
    }
  }
  frames.push({
    kind: "array",
    values: a,
    pointers: [],
    caption: `没有找到和为 ${target} 的一对`,
  });
  return frames;
}

export const twoPointersDemo: AlgoDemo = {
  id: "two-pointers",
  title: "双指针",
  summary: "有序数组上从两端向中间夹逼，找两数之和。一次扫描 O(n)。",
  inputHint: "数字列表 | 目标和，例如 1,2,4,7,11,15 | 15",
  defaultInput: "1,2,4,7,11,15 | 15",
  editable: true,
  run: runTwoPointers,
};
