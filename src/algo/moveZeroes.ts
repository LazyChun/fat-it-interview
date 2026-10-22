import { parseNums } from "./parse";
import type { AlgoDemo, ArrayFrame } from "./types";

export function runMoveZeroes(input: string): ArrayFrame[] {
  const a = parseNums(input, { min: 1, max: 12 });
  const frames: ArrayFrame[] = [];
  const shoot = (read: number, write: number, caption: string) => {
    const pointers = [
      { index: write, label: "W", color: "#1677ff" },
      { index: read, label: "R", color: "#fa8c16" },
    ].filter((pointer) => pointer.index >= 0 && pointer.index < a.length);
    frames.push({
      kind: "array",
      values: [...a],
      pointers,
      caption,
    });
  };
  frames.push({
    kind: "array",
    values: [...a],
    pointers: [],
    caption: "把非 0 按原顺序挪到前面。W 是下一个非 0 该放的位置，R 负责扫描。",
  });
  let write = 0;
  for (let read = 0; read < a.length; read++) {
    if (a[read] !== 0) {
      if (read !== write) {
        shoot(read, write, `a[${read}]=${a[read]} 不是 0，和 W=${write} 交换`);
        const tmp = a[read];
        a[read] = a[write];
        a[write] = tmp;
        shoot(read, write, `交换后 ${a[write]} 就位，W 前进`);
      } else {
        shoot(read, write, `a[${read}]=${a[read]} 已经在 W 上，W 前进`);
      }
      write += 1;
    } else {
      shoot(read, write, `a[${read}] 是 0，只推进 R`);
    }
  }
  const marks: Record<number, "hit"> = {};
  for (let i = 0; i < write; i++) marks[i] = "hit";
  frames.push({
    kind: "array",
    values: [...a],
    pointers: [],
    marks: write > 0 ? marks : undefined,
    caption: `完成。前 ${write} 个是原顺序的非 0，后面都是 0。`,
  });
  return frames;
}

export const moveZeroesDemo: AlgoDemo = {
  id: "move-zeroes",
  title: "移动零",
  summary: "写指针停在下一个非 0 的位置，读指针遇到非 0 就交换。原地，非 0 的相对顺序不变。",
  inputHint: "用逗号分隔的数字，例如 0,1,0,3,12",
  defaultInput: "0,1,0,3,12",
  editable: true,
  run: runMoveZeroes,
};
