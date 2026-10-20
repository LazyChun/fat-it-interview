import { bfsDemo } from "./bfs";
import { binaryDemo } from "./binarySearch";
import { bubbleDemo } from "./bubble";
import { inorderDemo } from "./inorder";
import { knapsackDemo } from "./knapsack";
import { mergeDemo } from "./merge";
import { quickDemo } from "./quick";
import { reverseListDemo } from "./reverseList";
import { slidingWindowDemo } from "./slidingWindow";
import { twoPointersDemo } from "./twoPointers";
import type { AlgoDemo } from "./types";

export const DEMOS: AlgoDemo[] = [
  bubbleDemo,
  quickDemo,
  mergeDemo,
  binaryDemo,
  twoPointersDemo,
  slidingWindowDemo,
  bfsDemo,
  reverseListDemo,
  knapsackDemo,
  inorderDemo,
];

const byId = new Map(DEMOS.map((demo) => [demo.id, demo]));

export function getDemo(id: string): AlgoDemo | null {
  return byId.get(id) ?? null;
}
