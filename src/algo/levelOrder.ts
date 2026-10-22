import { TREE_NODES, TREE_ROOT } from "./inorder";
import type { AlgoDemo, TreeFrame } from "./types";

const BY_ID = new Map(TREE_NODES.map((node) => [node.id, node]));

export function runLevelOrder(): TreeFrame[] {
  const frames: TreeFrame[] = [];
  const queue: string[] = [TREE_ROOT];
  const output: number[] = [];
  const done = new Set<string>();
  const shoot = (caption: string, visit?: string) => {
    const roles: TreeFrame["roles"] = {};
    done.forEach((id) => {
      roles[id] = "done";
    });
    queue.forEach((id) => {
      if (!roles[id]) roles[id] = "queue";
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
  shoot("层序遍历用队列。根结点先入队，出队时再把它的孩子排到队尾。");
  while (queue.length) {
    const id = queue.shift() as string;
    const node = BY_ID.get(id);
    if (!node) break;
    output.push(node.value);
    done.add(id);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
    const kids = [node.left, node.right]
      .map((child) => (child ? BY_ID.get(child)?.value : undefined))
      .filter((value) => value !== undefined);
    shoot(
      kids.length
        ? `访问 ${node.value}，孩子 ${kids.join("、")} 入队。输出 [${output.join(", ")}]`
        : `访问 ${node.value}，它没有孩子。输出 [${output.join(", ")}]`,
      id,
    );
  }
  shoot(`层序结束：${output.join(", ")}`);
  return frames;
}

export const levelOrderDemo: AlgoDemo = {
  id: "level-order",
  title: "二叉树层序遍历",
  summary: "队列保证先入队的先访问，顺序是从上到下、从左到右。",
  inputHint: "固定演示和中序同一棵树：4 为根，左 2、右 6。",
  defaultInput: "",
  editable: false,
  run: () => runLevelOrder(),
};
