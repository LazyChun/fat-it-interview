import type { AlgoDemo, GridCell, GridFrame } from "./types";

export const MAZE = {
  rows: 5,
  cols: 6,
  walls: [
    [0, 3],
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 2],
  ] as Array<[number, number]>,
  start: [0, 0] as [number, number],
  end: [3, 5] as [number, number],
};

function keyOf(r: number, c: number): string {
  return `${r},${c}`;
}

const WALLS = new Set(MAZE.walls.map(([r, c]) => keyOf(r, c)));

function buildCells(
  state: Map<string, GridCell["state"]>,
  path: Set<string>,
): GridCell[] {
  const cells: GridCell[] = [];
  for (let r = 0; r < MAZE.rows; r++) {
    for (let c = 0; c < MAZE.cols; c++) {
      const key = keyOf(r, c);
      cells.push({
        r,
        c,
        wall: WALLS.has(key),
        start: r === MAZE.start[0] && c === MAZE.start[1],
        end: r === MAZE.end[0] && c === MAZE.end[1],
        state: path.has(key) ? "path" : state.get(key) ?? "idle",
      });
    }
  }
  return cells;
}

export function runBfs(): GridFrame[] {
  const frames: GridFrame[] = [];
  const state = new Map<string, GridCell["state"]>();
  const prev = new Map<string, string | null>();
  const startKey = keyOf(MAZE.start[0], MAZE.start[1]);
  const endKey = keyOf(MAZE.end[0], MAZE.end[1]);
  const queue: Array<[number, number]> = [[MAZE.start[0], MAZE.start[1]]];
  prev.set(startKey, null);
  state.set(startKey, "frontier");
  const push = (caption: string, path = new Set<string>()) => {
    frames.push({
      kind: "grid",
      rows: MAZE.rows,
      cols: MAZE.cols,
      cells: buildCells(state, path),
      caption,
    });
  };
  push("起点入队。黄色是队列中的格子，蓝色是已经出队的格子。");
  const dirs: Array<[number, number]> = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  while (queue.length) {
    const [r, c] = queue.shift() as [number, number];
    const here = keyOf(r, c);
    state.set(here, "visited");
    push(`出队 (${r}, ${c})，队列还剩 ${queue.length} 格`);
    if (here === endKey) {
      const path = new Set<string>();
      let cursor: string | null = here;
      while (cursor) {
        path.add(cursor);
        cursor = prev.get(cursor) ?? null;
      }
      push(
        `到达终点。最短路径包含 ${path.size} 个格子（BFS 按层扩展，先到的一定最短）。`,
        path,
      );
      return frames;
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= MAZE.rows || nc >= MAZE.cols) continue;
      const next = keyOf(nr, nc);
      if (WALLS.has(next) || prev.has(next)) continue;
      prev.set(next, here);
      state.set(next, "frontier");
      queue.push([nr, nc]);
    }
    push(`从 (${r}, ${c}) 向四邻扩展，队列长度 ${queue.length}`);
  }
  push("终点不可达");
  return frames;
}

export const bfsDemo: AlgoDemo = {
  id: "bfs",
  title: "广度优先搜索",
  summary: "按层扩展无权图，第一次走到终点就是最短路径。队列保证先入先出。",
  inputHint: "这是一张固定迷宫，S 是起点，E 是终点，深色格子是墙。",
  defaultInput: "",
  editable: false,
  run: () => runBfs(),
};
