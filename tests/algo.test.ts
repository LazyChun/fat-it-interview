import { describe, expect, it } from "vitest";
import { runBfs, MAZE } from "../src/algo/bfs";
import { runBinary } from "../src/algo/binarySearch";
import { runBubble } from "../src/algo/bubble";
import { runInorder } from "../src/algo/inorder";
import { runKnapsack } from "../src/algo/knapsack";
import { runMerge } from "../src/algo/merge";
import { runQuick } from "../src/algo/quick";
import { orderOf, runReverse } from "../src/algo/reverseList";
import { runSlidingWindow } from "../src/algo/slidingWindow";
import { runTwoPointers } from "../src/algo/twoPointers";
import type { BarFrame, GridFrame } from "../src/algo/types";

function sortedValues(frame: BarFrame): number[] {
  return [...frame.values].sort((a, b) => a - b);
}

describe("sorting demos", () => {
  it("finishes in non-decreasing order", () => {
    for (const run of [runBubble, runQuick, runMerge]) {
      for (const input of ["5,1,4,2,8", "3,1,2,1", "-1,3,0"]) {
        const frames = run(input);
        const last = frames[frames.length - 1] as BarFrame;
        expect(last.kind).toBe("bars");
        expect(last.values).toEqual(sortedValues(last));
      }
    }
  });
});

describe("search and pointers", () => {
  it("finds a target with binary search", () => {
    const frames = runBinary("1,3,5,7,9,11 | 7");
    expect(frames.some((frame) => frame.caption.includes("命中"))).toBe(true);
    const missed = runBinary("1,3,5 | 4");
    expect(missed[missed.length - 1].caption).toContain("没有找到");
  });

  it("finds a pair with two pointers", () => {
    const frames = runTwoPointers("1,2,4,7,11,15 | 15");
    const hit = frames.find((frame) => frame.kind === "array" && frame.marks);
    expect(hit?.caption).toContain("4");
    expect(hit?.caption).toContain("11");
  });

  it("reports the max window sum", () => {
    const frames = runSlidingWindow("2,1,5,1,3,2 | 3");
    expect(frames[frames.length - 1].caption).toContain("9");
  });
});

describe("structures", () => {
  it("reverses a linked list", () => {
    const frames = runReverse("1,2,3,4,5");
    expect(orderOf(frames[frames.length - 1])).toEqual([5, 4, 3, 2, 1]);
  });

  it("fills the knapsack optimum", () => {
    const classic = runKnapsack("4 | 1,3,4 | 15,20,30");
    const small = runKnapsack("5 | 2,3 | 3,4");
    expect(classic[classic.length - 1].caption).toContain("35");
    expect(small[small.length - 1].caption).toContain("7");
  });

  it("walks the tree in order", () => {
    const frames = runInorder();
    expect(frames[frames.length - 1].kind).toBe("tree");
    if (frames[frames.length - 1].kind === "tree") {
      expect(frames[frames.length - 1].output).toEqual([1, 2, 3, 4, 5, 6, 7]);
    }
  });

  it("bfs path matches an independent search", () => {
    const frames = runBfs();
    const last = frames[frames.length - 1] as GridFrame;
    const path = last.cells.filter((cell) => cell.state === "path");
    expect(path.some((cell) => cell.start)).toBe(true);
    expect(path.some((cell) => cell.end)).toBe(true);
    expect(path.length).toBe(shortest() + 1);
  });
});

function shortest(): number {
  const walls = new Set(MAZE.walls.map(([r, c]) => `${r},${c}`));
  const queue: Array<[number, number, number]> = [[MAZE.start[0], MAZE.start[1], 0]];
  const seen = new Set([`${MAZE.start[0]},${MAZE.start[1]}`]);
  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  while (queue.length) {
    const [r, c, dist] = queue.shift() as [number, number, number];
    if (r === MAZE.end[0] && c === MAZE.end[1]) return dist;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nc < 0 || nr >= MAZE.rows || nc >= MAZE.cols) continue;
      if (walls.has(key) || seen.has(key)) continue;
      seen.add(key);
      queue.push([nr, nc, dist + 1]);
    }
  }
  throw new Error("maze has no path");
}
