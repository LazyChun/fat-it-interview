import { code, type BaseCodeSamples } from "./codeSamples";

/**
 * 双指针 / 链表 / 树 / 图 共 9 道题的多语言参考实现。
 * grid 中 0 表示可走、1 表示墙；start、end 是 [行, 列]。
 * Java 片段默认写在类里、标准库已导入；C++ 片段按 C++17、默认已有常用头文件和 using namespace std。
 */
export const STRUCT_CODE: Record<string, BaseCodeSamples> = {
  "algo-two": {
    js: code`
      // a 已升序，返回两个数的下标；不存在返回 [-1, -1]
      function twoSum(a, target) {
        let lo = 0, hi = a.length - 1;
        while (lo < hi) {
          const sum = a[lo] + a[hi];
          if (sum === target) return [lo, hi];
          if (sum < target) lo++;  // 和偏小，只能增大左端
          else hi--;               // 和偏大，只能减小右端
        }
        return [-1, -1];
      }
    `,
    ts: code`
      function twoSum(a: number[], target: number): [number, number] {
        let lo = 0, hi = a.length - 1;
        while (lo < hi) {
          const sum = a[lo] + a[hi];
          if (sum === target) return [lo, hi];
          if (sum < target) lo++;
          else hi--;
        }
        return [-1, -1];
      }
    `,
    java: code`
      static int[] twoSum(int[] a, int target) {
          int lo = 0, hi = a.length - 1;
          while (lo < hi) {
              int sum = a[lo] + a[hi];
              if (sum == target) return new int[]{lo, hi};
              if (sum < target) lo++;
              else hi--;
          }
          return new int[]{-1, -1};
      }
    `,
    python: code`
      def two_sum(a, target):
          lo, hi = 0, len(a) - 1
          while lo < hi:
              s = a[lo] + a[hi]
              if s == target:
                  return [lo, hi]
              if s < target:      # 和偏小，只能增大左端
                  lo += 1
              else:               # 和偏大，只能减小右端
                  hi -= 1
          return [-1, -1]
    `,
    cpp: code`
      vector<int> twoSum(const vector<int>& a, int target) {
          int lo = 0, hi = (int) a.size() - 1;
          while (lo < hi) {
              int sum = a[lo] + a[hi];
              if (sum == target) return {lo, hi};
              if (sum < target) ++lo;
              else --hi;
          }
          return {-1, -1};
      }
    `,
  },

  "algo-window": {
    js: code`
      // 固定长度 k 的子数组最大和
      function maxWindowSum(a, k) {
        let sum = 0;
        for (let i = 0; i < k; i++) sum += a[i];
        let best = sum;
        for (let r = k; r < a.length; r++) {
          sum += a[r] - a[r - k];  // 纳入右端、丢掉左端，O(1) 更新
          best = Math.max(best, sum);
        }
        return best;
      }
    `,
    ts: code`
      function maxWindowSum(a: number[], k: number): number {
        let sum = 0;
        for (let i = 0; i < k; i++) sum += a[i];
        let best = sum;
        for (let r = k; r < a.length; r++) {
          sum += a[r] - a[r - k];
          best = Math.max(best, sum);
        }
        return best;
      }
    `,
    java: code`
      static int maxWindowSum(int[] a, int k) {
          int sum = 0;
          for (int i = 0; i < k; i++) sum += a[i];
          int best = sum;
          for (int r = k; r < a.length; r++) {
              sum += a[r] - a[r - k];   // 纳入右端、丢掉左端
              best = Math.max(best, sum);
          }
          return best;
      }
    `,
    python: code`
      def max_window_sum(a, k):
          window = sum(a[:k])
          best = window
          for r in range(k, len(a)):
              window += a[r] - a[r - k]   # O(1) 更新窗口和
              best = max(best, window)
          return best
    `,
    cpp: code`
      int maxWindowSum(const vector<int>& a, int k) {
          int sum = 0;
          for (int i = 0; i < k; ++i) sum += a[i];
          int best = sum;
          for (int r = k; r < (int) a.size(); ++r) {
              sum += a[r] - a[r - k];
              best = max(best, sum);
          }
          return best;
      }
    `,
  },

  "algo-zero": {
    js: code`
      function moveZeroes(a) {
        let w = 0;                          // W：下一个非 0 该写入的位置
        for (let r = 0; r < a.length; r++) { // R：扫描指针
          if (a[r] !== 0) {
            [a[w], a[r]] = [a[r], a[w]];   // 交换，0 自然堆到末尾
            w++;
          }
        }
        return a;
      }
    `,
    ts: code`
      function moveZeroes(a: number[]): number[] {
        let w = 0;
        for (let r = 0; r < a.length; r++) {
          if (a[r] !== 0) {
            [a[w], a[r]] = [a[r], a[w]];
            w++;
          }
        }
        return a;
      }
    `,
    java: code`
      static void moveZeroes(int[] a) {
          int w = 0;
          for (int r = 0; r < a.length; r++) {
              if (a[r] != 0) {
                  int t = a[w]; a[w] = a[r]; a[r] = t;
                  w++;
              }
          }
      }
    `,
    python: code`
      def move_zeroes(a):
          w = 0                          # W：下一个非 0 该写入的位置
          for r in range(len(a)):        # R：扫描指针
              if a[r] != 0:
                  a[w], a[r] = a[r], a[w]
                  w += 1
          return a
    `,
    cpp: code`
      void moveZeroes(vector<int>& a) {
          int w = 0;
          for (int r = 0; r < (int) a.size(); ++r) {
              if (a[r] != 0) swap(a[w++], a[r]);
          }
      }
    `,
  },

  "algo-bfs": {
    js: code`
      function shortestPath(grid, start, end) {
        const rows = grid.length, cols = grid[0].length;
        const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue = [[start[0], start[1], 0]];
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        seen[start[0]][start[1]] = true; // 入队时标记，不重复入队
        for (let head = 0; head < queue.length; head++) {
          const [r, c, dist] = queue[head];
          if (r === end[0] && c === end[1]) return dist; // 第一次到达就是最短
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
            if (grid[nr][nc] === 1 || seen[nr][nc]) continue;
            seen[nr][nc] = true;
            queue.push([nr, nc, dist + 1]);
          }
        }
        return -1;
      }
    `,
    ts: code`
      function shortestPath(grid: number[][], start: [number, number], end: [number, number]): number {
        const rows = grid.length, cols = grid[0].length;
        const seen: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue: Array<[number, number, number]> = [[start[0], start[1], 0]];
        const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        seen[start[0]][start[1]] = true;
        for (let head = 0; head < queue.length; head++) {
          const [r, c, dist] = queue[head];
          if (r === end[0] && c === end[1]) return dist;
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
            if (grid[nr][nc] === 1 || seen[nr][nc]) continue;
            seen[nr][nc] = true;
            queue.push([nr, nc, dist + 1]);
          }
        }
        return -1;
      }
    `,
    java: code`
      static int shortestPath(int[][] grid, int[] start, int[] end) {
          int rows = grid.length, cols = grid[0].length;
          boolean[][] seen = new boolean[rows][cols];
          Queue<int[]> queue = new ArrayDeque<>();
          int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
          queue.offer(new int[]{start[0], start[1], 0});
          seen[start[0]][start[1]] = true;   // 入队时标记
          while (!queue.isEmpty()) {
              int[] cur = queue.poll();
              if (cur[0] == end[0] && cur[1] == end[1]) return cur[2];
              for (int[] d : dirs) {
                  int nr = cur[0] + d[0], nc = cur[1] + d[1];
                  if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                  if (grid[nr][nc] == 1 || seen[nr][nc]) continue;
                  seen[nr][nc] = true;
                  queue.offer(new int[]{nr, nc, cur[2] + 1});
              }
          }
          return -1;
      }
    `,
    python: code`
      from collections import deque

      def shortest_path(grid, start, end):
          rows, cols = len(grid), len(grid[0])
          seen = [[False] * cols for _ in range(rows)]
          queue = deque([(start[0], start[1], 0)])
          seen[start[0]][start[1]] = True  # 入队时标记
          dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
          while queue:
              r, c, dist = queue.popleft()
              if (r, c) == tuple(end):      # 第一次到达就是最短
                  return dist
              for dr, dc in dirs:
                  nr, nc = r + dr, c + dc
                  if not (0 <= nr < rows and 0 <= nc < cols):
                      continue
                  if grid[nr][nc] == 1 or seen[nr][nc]:
                      continue
                  seen[nr][nc] = True
                  queue.append((nr, nc, dist + 1))
          return -1
    `,
    cpp: code`
      int shortestPath(const vector<vector<int>>& grid, pair<int, int> start, pair<int, int> end) {
          int rows = grid.size(), cols = grid[0].size();
          vector<vector<bool>> seen(rows, vector<bool>(cols, false));
          queue<array<int, 3>> q;
          int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
          q.push({start.first, start.second, 0});
          seen[start.first][start.second] = true;
          while (!q.empty()) {
              auto [r, c, dist] = q.front(); q.pop();
              if (r == end.first && c == end.second) return dist;
              for (auto& d : dirs) {
                  int nr = r + d[0], nc = c + d[1];
                  if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                  if (grid[nr][nc] == 1 || seen[nr][nc]) continue;
                  seen[nr][nc] = true;
                  q.push({nr, nc, dist + 1});
              }
          }
          return -1;
      }
    `,
  },

  "algo-dfs": {
    js: code`
      // DFS 只判断「能不能到」，第一次到达的路径不保证最短
      function dfsReach(grid, start, end) {
        const rows = grid.length, cols = grid[0].length;
        const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        function visit(r, c) {
          if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
          if (grid[r][c] === 1 || seen[r][c]) return false;
          seen[r][c] = true;                              // 进入时标记
          if (r === end[0] && c === end[1]) return true;
          for (const [dr, dc] of dirs) {
            if (visit(r + dr, c + dc)) return true;      // 沿着一条路钻到底
          }
          return false;                                  // 走不通就回溯
        }
        return visit(start[0], start[1]);
      }
    `,
    ts: code`
      function dfsReach(grid: number[][], start: [number, number], end: [number, number]): boolean {
        const rows = grid.length, cols = grid[0].length;
        const seen: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
        const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const visit = (r: number, c: number): boolean => {
          if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
          if (grid[r][c] === 1 || seen[r][c]) return false;
          seen[r][c] = true;
          if (r === end[0] && c === end[1]) return true;
          for (const [dr, dc] of dirs) {
            if (visit(r + dr, c + dc)) return true;
          }
          return false;
        };
        return visit(start[0], start[1]);
      }
    `,
    java: code`
      static boolean dfsReach(int[][] grid, int[] start, int[] end) {
          boolean[][] seen = new boolean[grid.length][grid[0].length];
          return visit(grid, end, seen, start[0], start[1]);
      }

      static boolean visit(int[][] grid, int[] end, boolean[][] seen, int r, int c) {
          if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return false;
          if (grid[r][c] == 1 || seen[r][c]) return false;
          seen[r][c] = true;                          // 进入时标记
          if (r == end[0] && c == end[1]) return true;
          int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
          for (int[] d : dirs) {
              if (visit(grid, end, seen, r + d[0], c + d[1])) return true;
          }
          return false;                                // 回溯
      }
    `,
    python: code`
      def dfs_reach(grid, start, end):
          rows, cols = len(grid), len(grid[0])
          seen = [[False] * cols for _ in range(rows)]
          dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]

          def visit(r, c):
              if not (0 <= r < rows and 0 <= c < cols):
                  return False
              if grid[r][c] == 1 or seen[r][c]:
                  return False
              seen[r][c] = True                  # 进入时标记
              if (r, c) == tuple(end):
                  return True                    # 只说明存在一条路
              return any(visit(r + dr, c + dc) for dr, dc in dirs)

          return visit(start[0], start[1])
    `,
    cpp: code`
      bool dfsReach(const vector<vector<int>>& grid, pair<int, int> start, pair<int, int> end) {
          int rows = grid.size(), cols = grid[0].size();
          vector<vector<bool>> seen(rows, vector<bool>(cols, false));
          int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
          function<bool(int, int)> visit = [&](int r, int c) {
              if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
              if (grid[r][c] == 1 || seen[r][c]) return false;
              seen[r][c] = true;                 // 进入时标记
              if (r == end.first && c == end.second) return true;
              for (auto& d : dirs) {
                  if (visit(r + d[0], c + d[1])) return true;
              }
              return false;                      // 回溯
          };
          return visit(start.first, start.second);
      }
    `,
  },

  "algo-list": {
    js: code`
      function ListNode(val, next = null) {
        this.val = val;
        this.next = next;
      }

      // O(1) 空间：prev / curr / next 三个指针
      function reverseList(head) {
        let prev = null, curr = head;
        while (curr) {
          const next = curr.next; // 先记住后继
          curr.next = prev;
          prev = curr;
          curr = next;
        }
        return prev;              // 新的头
      }
    `,
    ts: code`
      class ListNode {
        constructor(public val: number, public next: ListNode | null = null) {}
      }

      function reverseList(head: ListNode | null): ListNode | null {
        let prev: ListNode | null = null;
        let curr = head;
        while (curr) {
          const next = curr.next;
          curr.next = prev;
          prev = curr;
          curr = next;
        }
        return prev;
      }
    `,
    java: code`
      class ListNode {
          int val;
          ListNode next;
          ListNode(int val) { this.val = val; }
      }

      static ListNode reverseList(ListNode head) {
          ListNode prev = null, curr = head;
          while (curr != null) {
              ListNode next = curr.next;
              curr.next = prev;
              prev = curr;
              curr = next;
          }
          return prev;
      }
    `,
    python: code`
      class ListNode:
          def __init__(self, val=0, next=None):
              self.val, self.next = val, next

      def reverse_list(head):
          prev, curr = None, head
          while curr:
              nxt = curr.next     # 先记住后继
              curr.next = prev
              prev, curr = curr, nxt
          return prev             # 新的头
    `,
    cpp: code`
      struct ListNode {
          int val;
          ListNode* next;
          ListNode(int v) : val(v), next(nullptr) {}
      };

      ListNode* reverseList(ListNode* head) {
          ListNode* prev = nullptr;
          ListNode* curr = head;
          while (curr) {
              ListNode* next = curr->next;
              curr->next = prev;
              prev = curr;
              curr = next;
          }
          return prev;
      }
    `,
  },

  "algo-cycle": {
    js: code`
      function ListNode(val, next = null) {
        this.val = val;
        this.next = next;
      }

      function hasCycle(head) {
        let slow = head, fast = head;
        while (fast && fast.next) {
          slow = slow.next;        // 每次一步
          fast = fast.next.next;   // 每次两步，相对慢指针追近 1 格
          if (slow === fast) return true;
        }
        return false;              // 快指针走到 null，没有环
      }
    `,
    ts: code`
      class ListNode {
        constructor(public val: number, public next: ListNode | null = null) {}
      }

      function hasCycle(head: ListNode | null): boolean {
        let slow = head, fast = head;
        while (fast && fast.next) {
          slow = slow!.next;
          fast = fast.next.next;
          if (slow === fast) return true;
        }
        return false;
      }
    `,
    java: code`
      class ListNode {
          int val;
          ListNode next;
          ListNode(int val) { this.val = val; }
      }

      static boolean hasCycle(ListNode head) {
          ListNode slow = head, fast = head;
          while (fast != null && fast.next != null) {
              slow = slow.next;
              fast = fast.next.next;
              if (slow == fast) return true;
          }
          return false;
      }
    `,
    python: code`
      class ListNode:
          def __init__(self, val=0, next=None):
              self.val, self.next = val, next

      def has_cycle(head):
          slow = fast = head
          while fast and fast.next:
              slow = slow.next          # 每次一步
              fast = fast.next.next     # 每次两步
              if slow is fast:
                  return True
          return False
    `,
    cpp: code`
      struct ListNode {
          int val;
          ListNode* next;
          ListNode(int v) : val(v), next(nullptr) {}
      };

      bool hasCycle(ListNode* head) {
          ListNode* slow = head;
          ListNode* fast = head;
          while (fast && fast->next) {
              slow = slow->next;
              fast = fast->next->next;
              if (slow == fast) return true;
          }
          return false;
      }
    `,
  },

  "algo-inorder": {
    js: code`
      // 结点有 val / left / right
      function inorder(root) {
        const out = [], stack = [];
        let curr = root;
        while (curr || stack.length) {
          while (curr) {
            stack.push(curr);      // 栈里是还没访问的祖先
            curr = curr.left;
          }
          curr = stack.pop();
          out.push(curr.val);
          curr = curr.right;
        }
        return out;                // BST 的结果是递增序列
      }
    `,
    ts: code`
      interface TreeNode {
        val: number;
        left: TreeNode | null;
        right: TreeNode | null;
      }

      function inorder(root: TreeNode | null): number[] {
        const out: number[] = [], stack: TreeNode[] = [];
        let curr = root;
        while (curr || stack.length) {
          while (curr) {
            stack.push(curr);
            curr = curr.left;
          }
          curr = stack.pop()!;
          out.push(curr.val);
          curr = curr.right;
        }
        return out;
      }
    `,
    java: code`
      class TreeNode {
          int val;
          TreeNode left, right;
          TreeNode(int val) { this.val = val; }
      }

      static List<Integer> inorder(TreeNode root) {
          List<Integer> out = new ArrayList<>();
          Deque<TreeNode> stack = new ArrayDeque<>();
          TreeNode curr = root;
          while (curr != null || !stack.isEmpty()) {
              while (curr != null) {
                  stack.push(curr);  // 栈里是还没访问的祖先
                  curr = curr.left;
              }
              curr = stack.pop();
              out.add(curr.val);
              curr = curr.right;
          }
          return out;
      }
    `,
    python: code`
      def inorder(root):
          out, stack = [], []
          curr = root
          while curr or stack:
              while curr:
                  stack.append(curr)  # 栈里是还没访问的祖先
                  curr = curr.left
              curr = stack.pop()
              out.append(curr.val)
              curr = curr.right
          return out                  # BST 的结果是递增序列
    `,
    cpp: code`
      struct TreeNode {
          int val;
          TreeNode* left;
          TreeNode* right;
          TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
      };

      vector<int> inorder(TreeNode* root) {
          vector<int> out;
          vector<TreeNode*> stack;
          TreeNode* curr = root;
          while (curr || !stack.empty()) {
              while (curr) {
                  stack.push_back(curr);
                  curr = curr->left;
              }
              curr = stack.back(); stack.pop_back();
              out.push_back(curr->val);
              curr = curr->right;
          }
          return out;
      }
    `,
  },

  "algo-level": {
    js: code`
      // 结点有 val / left / right，按层分组输出
      function levelOrder(root) {
        if (!root) return [];
        const out = [], queue = [root];
        for (let head = 0; head < queue.length; ) {
          const size = queue.length - head; // 这一层的结点数，先记下来
          const level = [];
          for (let i = 0; i < size; i++) {
            const node = queue[head++];
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
          }
          out.push(level);
        }
        return out;
      }
    `,
    ts: code`
      interface TreeNode {
        val: number;
        left: TreeNode | null;
        right: TreeNode | null;
      }

      function levelOrder(root: TreeNode | null): number[][] {
        if (!root) return [];
        const out: number[][] = [], queue: TreeNode[] = [root];
        for (let head = 0; head < queue.length; ) {
          const size = queue.length - head;
          const level: number[] = [];
          for (let i = 0; i < size; i++) {
            const node = queue[head++];
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
          }
          out.push(level);
        }
        return out;
      }
    `,
    java: code`
      class TreeNode {
          int val;
          TreeNode left, right;
          TreeNode(int val) { this.val = val; }
      }

      static List<List<Integer>> levelOrder(TreeNode root) {
          List<List<Integer>> out = new ArrayList<>();
          if (root == null) return out;
          Queue<TreeNode> queue = new ArrayDeque<>();
          queue.offer(root);
          while (!queue.isEmpty()) {
              int size = queue.size();       // 这一层的结点数
              List<Integer> level = new ArrayList<>();
              for (int i = 0; i < size; i++) {
                  TreeNode node = queue.poll();
                  level.add(node.val);
                  if (node.left != null) queue.offer(node.left);
                  if (node.right != null) queue.offer(node.right);
              }
              out.add(level);
          }
          return out;
      }
    `,
    python: code`
      from collections import deque

      def level_order(root):
          if not root:
              return []
          out, queue = [], deque([root])
          while queue:
              level = []
              for _ in range(len(queue)):   # 先记下这一层的结点数
                  node = queue.popleft()
                  level.append(node.val)
                  if node.left:
                      queue.append(node.left)
                  if node.right:
                      queue.append(node.right)
              out.append(level)
          return out
    `,
    cpp: code`
      struct TreeNode {
          int val;
          TreeNode* left;
          TreeNode* right;
          TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
      };

      vector<vector<int>> levelOrder(TreeNode* root) {
          vector<vector<int>> out;
          if (!root) return out;
          queue<TreeNode*> q;
          q.push(root);
          while (!q.empty()) {
              int size = q.size();            // 先记下这一层的结点数
              vector<int> level;
              for (int i = 0; i < size; ++i) {
                  TreeNode* node = q.front(); q.pop();
                  level.push_back(node->val);
                  if (node->left) q.push(node->left);
                  if (node->right) q.push(node->right);
              }
              out.push_back(level);
          }
          return out;
      }
    `,
  },
};
