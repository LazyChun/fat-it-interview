import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { runBfs } from "../src/algo/bfs";
import { runBubble } from "../src/algo/bubble";
import { runInorder } from "../src/algo/inorder";
import { runKnapsack } from "../src/algo/knapsack";
import { FrameView } from "../src/components/visuals";
import type { DemoFrame } from "../src/algo/types";

function html(frame: DemoFrame): string {
  return renderToStaticMarkup(<FrameView frame={frame} />);
}

describe("demo frames render", () => {
  it("draws bars, a maze, a dp table and a tree", () => {
    const bars = runBubble("5,1,4,2");
    const barsHtml = html(bars[0]);
    expect(barsHtml).toContain(">5<");
    expect(barsHtml).toContain(">1<");

    const maze = runBfs();
    const mazeHtml = html(maze[0]);
    expect(mazeHtml).toContain("S");
    expect(mazeHtml).toContain("E");

    const table = runKnapsack("4 | 1,3,4 | 15,20,30");
    expect(html(table[table.length - 1])).toContain("35");

    const tree = runInorder();
    const last = tree[tree.length - 1];
    expect(html(last)).toContain("1，2，3，4，5，6，7");
  });
});
