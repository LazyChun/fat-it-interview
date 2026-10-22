import { MAZE } from "./bfs";
import type { AlgoDemo, GridCell, GridFrame } from "./types";

function keyOf(r: number, c: number): string {
  return `${r},${c}`;
}

const WALLS = new Set(MAZE.walls.map(([r, c]) => keyOf(r, c)));

function cells(state: Map<string, GridCell["state"]>, path: Set<string>): GridCell[] {
  const result: GridCell[] = [];
  for (let r = 0; r < MAZE.rows; r++) {
    for (let c = 0; c < MAZE.cols; c++) {
      const key = keyOf(r, c);
      result.push({
        r,
        c,
        wall: WALLS.has(key),
        start: r === MAZE.start[0] && c === MAZE.start[1],
        end: r === MAZE.end[0] && c === MAZE.end[1],
        state: path.has(key) ? "path" : state.get(key) ?? "idle",
      });
    }
  }
  return result;
}

export function runDfs(): GridFrame[] {
  const frames: GridFrame[] = [];
  const state = new Map<string, GridCell["state"]>();
  const prev = new Map<string, string | null>();
  const startKey = keyOf(MAZE.start[0], MAZE.start[1]);
  const endKey = keyOf(MAZE.end[0], MAZE.end[1]);
  const stack: Array<[number, number]> = [[MAZE.start[0], MAZE.start[1]]];
  prev.set(startKey, null);
  state.set(startKey, "frontier");
  const push = (caption: string, path = new Set<string>()) => {
    frames.push({
      kind: "grid",
      rows: MAZE.rows,
      cols: MAZE.cols,
      cells: cells(state, path),
      caption,
    });
  };
  push("起点入栈。黄色是栈里还没展开的格子。DFS 会先沿一条路走到底。");
  const dirs: Array<[number, number]> = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  while (stack.length) {
    const [r, c] = stack.pop() as [number, number];
    const here = keyOf(r, c);
    state.set(here, "visited");
    push(`弹出 (${r}, ${c})，沿它继续深入。栈里还有 ${stack.length} 格`);
    if (here === endKey) {
      const path = new Set<string>();
      let cursor: string | null = here;
      while (cursor) {
        path.add(cursor);
        cursor = prev.get(cursor) ?? null;
      }
      push(
        `到达终点。这条路有 ${path.size} 个格子，它是先搜到的一条路，不一定最短。`,
        path,
      );
      return frames;
    }
    for (let i = dirs.length - 1; i >= 0; i--) {
      const [dr, dc] = dirs[i];
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= MAZE.rows || nc >= MAZE.cols) continue;
      const next = keyOf(nr, nc);
      if (WALLS.has(next) || prev.has(next)) continue;
      prev.set(next, here);
      state.set(next, "frontier");
      stack.push([nr, nc]);
    }
    push(`从 (${r}, ${c}) 把还没走过的邻居压栈，栈长度 ${stack.length}`);
  }
  push("终点不可达");
  return frames;
}

export const dfsDemo: AlgoDemo = {
  id: "dfs",
  title: "深度优先搜索",
  summary: "用栈沿一条路走到底再回溯。第一次走到终点只说明存在路径，不保证最短。",
  inputHint: "和广度优先同一张迷宫。S 是起点，E 是终点，深色格子是墙。",
  defaultInput: "",
  editable: false,
  run: () => runDfs(),
};
