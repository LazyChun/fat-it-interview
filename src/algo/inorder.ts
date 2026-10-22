import type { AlgoDemo, TreeFrame, TreeNode } from "./types";

export const TREE_ROOT = "n4";

export const TREE_NODES: TreeNode[] = [
  { id: "n4", value: 4, left: "n2", right: "n6" },
  { id: "n2", value: 2, left: "n1", right: "n3" },
  { id: "n6", value: 6, left: "n5", right: "n7" },
  { id: "n1", value: 1 },
  { id: "n3", value: 3 },
  { id: "n5", value: 5 },
  { id: "n7", value: 7 },
];

const BY_ID = new Map(TREE_NODES.map((node) => [node.id, node]));

export function runInorder(): TreeFrame[] {
  const frames: TreeFrame[] = [];
  const stack: string[] = [];
  const output: number[] = [];
  const done = new Set<string>();
  const shoot = (caption: string, visit?: string) => {
    const roles: TreeFrame["roles"] = {};
    done.forEach((id) => {
      roles[id] = "done";
    });
    stack.forEach((id) => {
      if (!roles[id]) roles[id] = "stack";
    });
    if (visit) roles[visit] = "visit";
    frames.push({
      kind: "tree",
      nodes: TREE_NODES,
      root: TREE_ROOT,
      roles,
      output: [...output],
      caption,
    });
  };
  let curr: string | undefined = "n4";
  shoot("中序遍历：左 → 根 → 右。先把左链压栈。");
  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);
      shoot(`结点 ${BY_ID.get(curr)?.value} 入栈`, curr);
      curr = BY_ID.get(curr)?.left;
    }
    const id = stack.pop() as string;
    const node = BY_ID.get(id);
    if (!node) break;
    output.push(node.value);
    done.add(id);
    shoot(`访问 ${node.value}，输出 [${output.join(", ")}]`, id);
    curr = node.right;
  }
  shoot(`遍历结束，中序序列 ${output.join(", ")}`);
  return frames;
}

export const inorderDemo: AlgoDemo = {
  id: "inorder",
  title: "二叉树中序遍历",
  summary: "迭代版用栈模拟递归。二叉搜索树的中序结果是有序序列。",
  inputHint: "固定演示一棵二叉搜索树：4 为根，左 2、右 6。",
  defaultInput: "",
  editable: false,
  run: () => runInorder(),
};
