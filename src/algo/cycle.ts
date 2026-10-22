import { parseNums } from "./parse";
import type { AlgoDemo, ListFrame, ListNode } from "./types";

function nodeAt(
  byId: Map<string, ListNode>,
  id: string | null,
): ListNode | undefined {
  return id ? byId.get(id) : undefined;
}

function parseCycle(input: string): { nums: number[]; cycle: number | null } {
  const parts = input.split("|").map((part) => part.trim());
  const nums = parseNums(parts[0] || input, { min: 2, max: 8 });
  if (parts.length < 2 || parts[1] === "" || parts[1] === "-1") {
    return { nums, cycle: null };
  }
  const cycle = Number(parts[1]);
  if (!Number.isInteger(cycle) || cycle < 0 || cycle >= nums.length) {
    throw new Error("环的入口是结点下标，要落在范围内；没有环就不要写竖线");
  }
  return { nums, cycle };
}

export function runCycle(input: string): ListFrame[] {
  const { nums, cycle } = parseCycle(input);
  const nodes: ListNode[] = nums.map((value, index) => ({
    id: `n${index}`,
    value,
    next: index + 1 < nums.length ? `n${index + 1}` : null,
  }));
  if (cycle !== null) nodes[nodes.length - 1].next = `n${cycle}`;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const frames: ListFrame[] = [];
  const shoot = (caption: string, roles: ListFrame["roles"]) => {
    frames.push({
      kind: "list",
      nodes: nodes.map((node) => ({ ...node })),
      roles: { ...roles },
      caption,
    });
  };
  const head = nodes[0].id;
  let slow: string | null = head;
  let fast: string | null = head;
  shoot(
    cycle === null
      ? "没有环。慢指针每次一步，快指针每次两步，快指针会先走到 null。"
      : `尾结点指回下标 ${cycle}。慢指针一步，快指针两步，有环就一定会相遇。`,
    { [head]: "slow" },
  );
  let guard = 0;
  while (guard++ < nums.length * 3) {
    const slowNode = nodeAt(byId, slow);
    const fastNode = nodeAt(byId, fast);
    const fastNext = fastNode?.next ?? null;
    if (!slowNode || !fastNext) {
      shoot("快指针走到尽头，链表没有环。", slow ? { [slow]: "slow" } : {});
      return frames;
    }
    slow = slowNode.next;
    fast = byId.get(fastNext)?.next ?? null;
    if (!slow || !fast) {
      shoot("快指针走到尽头，链表没有环。", {});
      return frames;
    }
    if (slow === fast) {
      shoot(`两个指针在 ${byId.get(slow)?.value} 相遇，链表有环。`, { [slow]: "meet" });
      return frames;
    }
    shoot(
      `慢指针到 ${byId.get(slow)?.value}，快指针到 ${byId.get(fast)?.value}`,
      { [slow]: "slow", [fast]: "fast" },
    );
  }
  shoot("步数超出预期，请缩短链表后再演示。", {});
  return frames;
}

export const cycleDemo: AlgoDemo = {
  id: "cycle",
  title: "环形链表",
  summary: "Floyd 判圈：慢指针一步、快指针两步。有环则一定在环内相遇，没环则快指针先到 null。",
  inputHint: "结点值 | 环入口下标。没有环就只写结点值，例如 1,2,3,4,5 | 2",
  defaultInput: "1,2,3,4,5 | 2",
  editable: true,
  run: runCycle,
};
