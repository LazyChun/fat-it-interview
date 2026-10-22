import { bfsDemo } from "./bfs";
import { binaryDemo } from "./binarySearch";
import { bubbleDemo } from "./bubble";
import { climbDemo } from "./climb";
import { cycleDemo } from "./cycle";
import { dfsDemo } from "./dfs";
import { heapDemo } from "./heap";
import { inorderDemo } from "./inorder";
import { insertionDemo } from "./insertion";
import { kadaneDemo } from "./kadane";
import { knapsackDemo } from "./knapsack";
import { lcsDemo } from "./lcs";
import { levelOrderDemo } from "./levelOrder";
import { lowerBoundDemo } from "./lowerBound";
import { mergeDemo } from "./merge";
import { moveZeroesDemo } from "./moveZeroes";
import { quickDemo } from "./quick";
import { reverseListDemo } from "./reverseList";
import { selectionDemo } from "./selection";
import { slidingWindowDemo } from "./slidingWindow";
import { twoPointersDemo } from "./twoPointers";
import type { AlgoDemo } from "./types";

export const DEMOS: AlgoDemo[] = [
  bubbleDemo,
  selectionDemo,
  insertionDemo,
  quickDemo,
  mergeDemo,
  heapDemo,
  binaryDemo,
  lowerBoundDemo,
  twoPointersDemo,
  slidingWindowDemo,
  moveZeroesDemo,
  bfsDemo,
  dfsDemo,
  reverseListDemo,
  cycleDemo,
  knapsackDemo,
  climbDemo,
  kadaneDemo,
  lcsDemo,
  inorderDemo,
  levelOrderDemo,
];

const byId = new Map(DEMOS.map((demo) => [demo.id, demo]));

export function getDemo(id: string): AlgoDemo | null {
  return byId.get(id) ?? null;
}
