import type { Question } from "./types";

export const algorithmQuestions: Question[] = [
  {
    id: "algo-bubble",
    category: "algorithm",
    title: "冒泡排序",
    difficulty: "easy",
    tags: ["排序", "复杂度"],
    prompt: "说出冒泡排序的过程、复杂度和稳定性。什么情况下它能提前结束？",
    parts: [
      {
        type: "p",
        text: "从左到右比较相邻元素，逆序就交换，一趟下来当前最大值到达末尾。下一趟不再看已经就位的后缀。",
      },
      {
        type: "list",
        items: [
          "最坏和平均都是 O(n²)，每趟至少要扫描剩余区间。",
          "最好是 O(n)：某一趟没有发生交换，说明已经有序，可以结束。",
          "稳定：相等元素不交换，相对顺序不变。",
          "原地排序，额外空间 O(1)。教学价值高于工程价值，数据量大时不用它。",
        ],
      },
    ],
    followUps: ["稳定排序为什么在按多关键字排序时有用？"],
    demoId: "bubble",
  },
  {
    id: "algo-quick",
    category: "algorithm",
    title: "快速排序",
    difficulty: "medium",
    tags: ["排序", "分治"],
    prompt: "分区在做什么？为什么最坏是 O(n²)，工程里怎么避免？",
    parts: [
      {
        type: "list",
        items: [
          "选一个枢轴，分区后它左边都不大于它，右边都不小于它，枢轴落在最终位置。",
          "然后递归左右两侧。平均划分比较均衡时是 O(n log n)。",
          "每次枢轴都是当前最值时，退化成 O(n²)，例如已经有序还总选一端。",
          "随机选枢轴或三数取中能显著降低退化概率。",
          "不稳定。原地，递归栈平均 O(log n)，最坏 O(n)。",
        ],
      },
    ],
    followUps: ["快速选择（第 K 大）和快排的分区是什么关系？"],
    demoId: "quick",
  },
  {
    id: "algo-merge",
    category: "algorithm",
    title: "归并排序",
    difficulty: "medium",
    tags: ["排序", "分治"],
    prompt: "归并排序为什么时间稳定是 O(n log n)？它付出了什么代价？",
    parts: [
      {
        type: "list",
        items: [
          "把数组拆到长度为 1，再把两个有序段合并成一个有序段。",
          "每一层合并的总工作量是 O(n)，一共 log n 层，所以最好最坏都是 O(n log n)。",
          "合并需要辅助数组，空间 O(n)。这是相对快排的主要代价。",
          "相等元素先取左段，所以稳定。",
          "链表排序也很适合归并，因为合并不需要随机访问。",
        ],
      },
    ],
    followUps: ["外部排序为什么常用归并的思想？"],
    demoId: "merge",
  },
  {
    id: "algo-binary",
    category: "algorithm",
    title: "二分查找",
    difficulty: "medium",
    tags: ["查找", "二分"],
    prompt: "二分的前提是什么？循环不变量怎么写才不容易死循环？",
    parts: [
      {
        type: "list",
        items: [
          "随机访问的序列必须按查找关键字有序。链表不适合，因为走到中点已经是 O(n)。",
          "闭区间写法：while (lo <= hi)，mid = lo + (hi - lo) / 2，命中返回，否则收缩到 mid 的一侧，且不包含 mid。",
          "用 (lo + hi) / 2 在极大下标上可能溢出，写成 lo + (hi - lo) / 2。",
          "找边界时想清楚：循环结束时 lo 指向第一个大于等于目标的位置，还是插入点。",
          "时间 O(log n)，空间 O(1)。",
        ],
      },
    ],
    followUps: ["旋转有序数组还能二分吗？"],
    demoId: "binary",
  },
  {
    id: "algo-two",
    category: "algorithm",
    title: "对撞双指针",
    difficulty: "easy",
    tags: ["双指针", "数组"],
    prompt: "有序数组里找两数之和，为什么可以从两端往中间走？",
    parts: [
      {
        type: "list",
        items: [
          "左指针在较小的一端，右指针在较大的一端。",
          "和偏小，只能增大左端；和偏大，只能减小右端。每一步都排除一格，不会漏掉答案。",
          "时间 O(n)，要求数组有序。无序数组可以先排序再做，总时间 O(n log n)，或者用哈希表换 O(n) 时间和 O(n) 空间。",
          "同一类手法还用在盛水容器、三数之和（先排序，固定一个数再对撞）。",
        ],
      },
    ],
    followUps: ["快慢指针判断链表是否有环，和这种对撞指针是一回事吗？"],
    demoId: "two-pointers",
  },
  {
    id: "algo-window",
    category: "algorithm",
    title: "滑动窗口",
    difficulty: "medium",
    tags: ["滑动窗口", "数组"],
    prompt: "长度为 k 的子数组最大和，为什么不用每次重新求和？窗口什么时候该变长、变短？",
    parts: [
      {
        type: "list",
        items: [
          "固定窗口：右端纳入新元素，左端丢掉离开的元素，和的更新是 O(1)，总时间 O(n)。",
          "可变窗口：右端扩张，直到满足条件；再从左端收缩，直到刚好不满足。用来做最小覆盖子串、最长无重复子串。",
          "能滑动的前提是「丢掉左边不会让后面的判断推倒重来」。有负数时固定窗口最大和仍然可以滑，但「和至少为 S 的最短子数组」就不能简单收缩。",
          "暴力是 O(n·k) 或 O(n²)。窗口把重复计算去掉。",
        ],
      },
    ],
    followUps: ["最长无重复子串，窗口里用什么结构记录出现过的字符？"],
    demoId: "sliding-window",
  },
  {
    id: "algo-bfs",
    category: "algorithm",
    title: "广度优先搜索",
    difficulty: "medium",
    tags: ["图", "BFS"],
    prompt: "为什么无权图里 BFS 第一次到达终点就是最短路径？DFS 为什么不行？",
    parts: [
      {
        type: "list",
        items: [
          "BFS 用队列，按距离从近到远扩展。第 k 层的格子，都是走 k 步能到的。",
          "第一次走到终点时，没有更短的走法，因为更短的层已经全部出队过了。",
          "DFS 会先钻到一条路径的尽头，第一次走到终点只说明「存在一条路」，不说明最短。",
          "要还原路径，就在入队时记下每个格子是从谁走来的，最后倒着追回起点。",
          "网格图四方向或八方向要先说清楚。已经入队的格子不要重复入队，否则队列会爆炸。",
        ],
      },
    ],
    followUps: ["边带权且权值非负时，最短路该换成什么算法？"],
    demoId: "bfs",
  },
  {
    id: "algo-list",
    category: "algorithm",
    title: "反转链表",
    difficulty: "easy",
    tags: ["链表"],
    prompt: "如何用 O(1) 空间反转单链表？迭代时三个指针分别指什么？",
    parts: [
      {
        type: "list",
        items: [
          "prev 一开始是 null，curr 是头。循环里先记住 next，再把 curr.next 指向 prev，然后 prev 和 curr 一起前进。",
          "循环结束时 prev 是新的头。原来的头结点 next 变成 null，成为新的尾。",
          "时间 O(n)，空间 O(1)。递归写法空间是 O(n) 栈。",
          "面试常接着问：反转区间 [m, n]、K 个一组反转。局部反转时要记住区间前驱。",
        ],
      },
      {
        type: "code",
        lang: "java",
        code: "ListNode prev = null, curr = head;\nwhile (curr != null) {\n  ListNode next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}\nreturn prev;",
      },
    ],
    followUps: ["如何判断链表有环，并找到环的入口？"],
    demoId: "reverse-list",
  },
  {
    id: "algo-knapsack",
    category: "algorithm",
    title: "0/1 背包",
    difficulty: "hard",
    tags: ["动态规划"],
    prompt: "0/1 背包的状态怎么定义？为什么一维数组要倒序枚举容量？",
    parts: [
      {
        type: "list",
        items: [
          "dp[i][c] 表示只看前 i 件物品、容量不超过 c 的最大价值。",
          "转移：不选第 i 件就是 dp[i-1][c]；容量够才可以选，dp[i-1][c-w] + v。取较大者。",
          "每件物品只能选一次，所以选的时候必须用上一行的状态。",
          "压成一维数组时，容量要从大到小枚举，否则同一件物品会在这一轮被使用多次，变成完全背包。",
          "时间 O(n·容量)，空间可以压到 O(容量)。容量很大而物品很少时，这个复杂度可能不可接受。",
        ],
      },
    ],
    followUps: ["完全背包和 0/1 背包的循环方向为什么相反？"],
    demoId: "knapsack",
  },
  {
    id: "algo-inorder",
    category: "algorithm",
    title: "二叉树的中序遍历",
    difficulty: "medium",
    tags: ["树", "遍历"],
    prompt: "中序遍历的顺序是什么？迭代版本栈里存的是什么？二叉搜索树的中序有什么性质？",
    parts: [
      {
        type: "list",
        items: [
          "中序是左子树、根、右子树。前序是根左右，后序是左右根。",
          "迭代：一直向左把结点压栈，弹栈时访问，再转向右孩子。栈里是还没访问的祖先。",
          "二叉搜索树的中序结果是递增序列。校验 BST 可以在中序过程中检查是否严格大于前驱。",
          "递归版空间是树高。完全退化的链是 O(n)。",
          "Morris 遍历可以把空间降到 O(1)，面试里知道名字即可，先把栈版本写对。",
        ],
      },
    ],
    followUps: ["层序遍历和这三种 DFS 顺序分别用什么数据结构？"],
    demoId: "inorder",
  },
];
