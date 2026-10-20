export type BarRole =
  | "compare"
  | "swap"
  | "pivot"
  | "sorted"
  | "active"
  | "range";

export interface BarFrame {
  kind: "bars";
  values: number[];
  roles: Record<number, BarRole>;
  caption: string;
}

export interface ArrayPointer {
  index: number;
  label: string;
  color: string;
}

export interface ArrayFrame {
  kind: "array";
  values: number[];
  pointers: ArrayPointer[];
  marks?: Record<number, "hit" | "window" | "miss">;
  caption: string;
}

export interface GridCell {
  r: number;
  c: number;
  wall: boolean;
  start: boolean;
  end: boolean;
  state: "idle" | "frontier" | "visited" | "path";
}

export interface GridFrame {
  kind: "grid";
  rows: number;
  cols: number;
  cells: GridCell[];
  caption: string;
}

export interface ListNode {
  id: string;
  value: number;
  next: string | null;
}

export interface ListFrame {
  kind: "list";
  nodes: ListNode[];
  roles: Record<string, "prev" | "curr" | "next">;
  caption: string;
}

export interface MatrixFrame {
  kind: "matrix";
  rowLabels: string[];
  colLabels: string[];
  cells: number[][];
  active?: [number, number];
  caption: string;
}

export interface TreeNode {
  id: string;
  value: number;
  left?: string;
  right?: string;
}

export interface TreeFrame {
  kind: "tree";
  nodes: TreeNode[];
  root: string;
  roles: Record<string, "stack" | "visit" | "done">;
  output: number[];
  caption: string;
}

export type DemoFrame =
  | BarFrame
  | ArrayFrame
  | GridFrame
  | ListFrame
  | MatrixFrame
  | TreeFrame;

export interface AlgoDemo {
  id: string;
  title: string;
  summary: string;
  inputHint: string;
  defaultInput: string;
  editable: boolean;
  run(input: string): DemoFrame[];
}

export const BAR_COLOR: Record<BarRole | "default", string> = {
  default: "#597ef7",
  compare: "#faad14",
  swap: "#ff4d4f",
  pivot: "#722ed1",
  sorted: "#52c41a",
  active: "#13c2c2",
  range: "#91caff",
};
