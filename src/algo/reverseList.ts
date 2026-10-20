import { parseNums } from "./parse";
import type { AlgoDemo, ListFrame, ListNode } from "./types";

export function orderOf(frame: ListFrame): number[] {
  const byId = new Map(frame.nodes.map((node) => [node.id, node]));
  const pointed = new Set(
    frame.nodes.map((node) => node.next).filter((id): id is string => !!id),
  );
  const head = frame.nodes.find((node) => !pointed.has(node.id));
  const values: number[] = [];
  const seen = new Set<string>();
  let cursor = head?.id ?? null;
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    const node = byId.get(cursor);
    if (!node) break;
    values.push(node.value);
    cursor = node.next;
  }
  return values;
}

export function runReverse(input: string): ListFrame[] {
  const nums = parseNums(input, { min: 2, max: 8 });
  const nodes: ListNode[] = nums.map((value, index) => ({
    id: `n${index}`,
    value,
    next: index + 1 < nums.length ? `n${index + 1}` : null,
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const frames: ListFrame[] = [];
  const shoot = (
    caption: string,
    roles: ListFrame["roles"],
  ) => {
    frames.push({
      kind: "list",
      nodes: nodes.map((node) => ({ ...node })),
      roles: { ...roles },
      caption,
    });
  };
  shoot("初始链表。三个指针：prev、curr、next。每步把 curr.next 指向 prev。", {
    [nodes[0].id]: "curr",
  });
  let prev: string | null = null;
  let curr: string | null = nodes[0]?.id ?? null;
  while (curr) {
    const node = byId.get(curr);
    if (!node) break;
    const next = node.next;
    node.next = prev;
    const roles: ListFrame["roles"] = { [curr]: "curr" };
    if (prev) roles[prev] = "prev";
    if (next) roles[next] = "next";
    shoot(
      `curr=${node.value} 的 next 改指向 ${prev ? byId.get(prev)?.value : "null"}`,
      roles,
    );
    prev = curr;
    curr = next;
  }
  shoot("反转完成，新的头结点是原来的尾结点。时间 O(n)，空间 O(1)。", {});
  return frames;
}

export const reverseListDemo: AlgoDemo = {
  id: "reverse-list",
  title: "反转链表",
  summary: "用 prev / curr / next 三个指针原地反转，不需要额外数组。",
  inputHint: "用逗号分隔的结点值，例如 1,2,3,4,5",
  defaultInput: "1,2,3,4,5",
  editable: true,
  run: runReverse,
};
