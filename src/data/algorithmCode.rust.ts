import { code } from "./codeSamples";

/**
 * 21 道算法题的 Rust 参考实现，key 与题目 id 一致。
 * 按 Rust 2021、只依赖标准库；片段里的类型定义各自独立，可直接粘进一个文件试跑。
 */
export const RUST_CODE: Record<string, string> = {
  "algo-bubble": code`
      fn bubble_sort(a: &[i32]) -> Vec<i32> {
          let mut arr = a.to_vec();
          if arr.len() < 2 {
              return arr;
          }
          for i in 0..arr.len() - 1 {
              let mut swapped = false;
              for j in 0..arr.len() - 1 - i {
                  if arr[j] > arr[j + 1] {
                      arr.swap(j, j + 1);
                      swapped = true;
                  }
              }
              if !swapped { // 一趟没交换，说明已经有序
                  break;
              }
          }
          arr
      }
    `,

  "algo-quick": code`
      fn quick_sort(a: &mut [i32]) {
          fn sort(a: &mut [i32], lo: isize, hi: isize) {
              if lo >= hi {
                  return;
              }
              let p = lo + (hi - lo) / 2; // 工程里换成随机枢轴
              a.swap(p as usize, hi as usize);
              let pivot = a[hi as usize];
              let mut i = lo;
              for j in lo..hi {
                  if a[j as usize] < pivot {
                      a.swap(i as usize, j as usize);
                      i += 1;
                  }
              }
              a.swap(i as usize, hi as usize); // 枢轴落到最终位置
              sort(a, lo, i - 1);
              sort(a, i + 1, hi);
          }
          if !a.is_empty() {
              sort(a, 0, a.len() as isize - 1);
          }
      }
    `,

  "algo-merge": code`
      fn merge_sort(a: &[i32]) -> Vec<i32> {
          if a.len() <= 1 {
              return a.to_vec();
          }
          let mid = a.len() / 2;
          let left = merge_sort(&a[..mid]);
          let right = merge_sort(&a[mid..]);
          let mut out = Vec::with_capacity(a.len()); // 辅助空间 O(n)
          let (mut i, mut j) = (0, 0);
          while i < left.len() && j < right.len() {
              if left[i] <= right[j] { // 相等先取左段，稳定
                  out.push(left[i]);
                  i += 1;
              } else {
                  out.push(right[j]);
                  j += 1;
              }
          }
          out.extend_from_slice(&left[i..]);
          out.extend_from_slice(&right[j..]);
          out
      }
    `,

  "algo-binary": code`
      fn binary_search(a: &[i32], target: i32) -> isize {
          let (mut lo, mut hi) = (0isize, a.len() as isize - 1); // 闭区间 [lo, hi]
          while lo <= hi {
              let mid = lo + (hi - lo) / 2; // 避免大下标相加溢出
              if a[mid as usize] == target {
                  return mid;
              }
              if a[mid as usize] < target {
                  lo = mid + 1;
              } else {
                  hi = mid - 1;
              }
          }
          -1
      }
    `,

  "algo-selection": code`
      fn selection_sort(a: &mut [i32]) {
          for i in 0..a.len().saturating_sub(1) {
              let mut m = i;
              for j in i + 1..a.len() {
                  if a[j] < a[m] {
                      m = j;
                  }
              }
              a.swap(i, m); // 每趟最多交换一次
          }
      }
    `,

  "algo-insertion": code`
      fn insertion_sort(a: &mut [i32]) {
          for i in 1..a.len() {
              let key = a[i];
              let mut j = i as isize - 1;
              while j >= 0 && a[j as usize] > key { // 相等不挪，保持稳定
                  a[(j + 1) as usize] = a[j as usize];
                  j -= 1;
              }
              a[(j + 1) as usize] = key;
          }
      }
    `,

  "algo-heap": code`
      fn sift_down(a: &mut [i32], start: usize, end: usize) {
          let mut root = start;
          while 2 * root + 1 < end {
              let mut child = 2 * root + 1;
              if child + 1 < end && a[child + 1] > a[child] {
                  child += 1;
              }
              if a[root] >= a[child] {
                  return;
              }
              a.swap(root, child);
              root = child;
          }
      }

      fn heap_sort(a: &mut [i32]) {
          let n = a.len();
          if n < 2 {
              return;
          }
          for i in (0..n / 2).rev() { // 建堆 O(n)
              sift_down(a, i, n);
          }
          for end in (1..n).rev() {
              a.swap(0, end); // 堆顶换到末尾
              sift_down(a, 0, end);
          }
      }
    `,

  "algo-lower": code`
      fn lower_bound(a: &[i32], target: i32) -> usize {
          let (mut lo, mut hi) = (0usize, a.len()); // 半开区间 [lo, hi)
          while lo < hi {
              let mid = lo + (hi - lo) / 2;
              if a[mid] < target {
                  lo = mid + 1;
              } else { // 相等也往左收
                  hi = mid;
              }
          }
          lo // 第一个 >= target 的位置
      }
    `,

  "algo-two": code`
      // a 已升序，返回两个数的下标
      fn two_sum(a: &[i32], target: i32) -> (isize, isize) {
          let mut lo = 0usize;
          let mut hi = match a.len().checked_sub(1) {
              Some(h) => h,
              None => return (-1, -1),
          };
          while lo < hi {
              let sum = a[lo] + a[hi];
              if sum == target {
                  return (lo as isize, hi as isize);
              }
              if sum < target { // 和偏小，只能增大左端
                  lo += 1;
              } else { // 和偏大，只能减小右端
                  hi -= 1;
              }
          }
          (-1, -1)
      }
    `,

  "algo-window": code`
      fn max_window_sum(a: &[i32], k: usize) -> i32 {
          let mut sum: i32 = a[..k].iter().sum();
          let mut best = sum;
          for r in k..a.len() {
              sum += a[r] - a[r - k]; // 纳入右端、丢掉左端，O(1)
              best = best.max(sum);
          }
          best
      }
    `,

  "algo-zero": code`
      fn move_zeroes(a: &mut [i32]) {
          let mut w = 0; // W：下一个非 0 该写入的位置
          for r in 0..a.len() { // R：扫描指针
              if a[r] != 0 {
                  a.swap(w, r); // 交换，0 自然堆到末尾
                  w += 1;
              }
          }
      }
    `,

  "algo-bfs": code`
      // grid 里 0 可走、1 是墙；start / end 是 (行, 列)
      fn shortest_path(grid: &[Vec<i32>], start: (usize, usize), end: (usize, usize)) -> i32 {
          let rows = grid.len();
          let cols = grid[0].len();
          let mut seen = vec![vec![false; cols]; rows];
          let mut queue = vec![(start.0, start.1, 0i32)];
          let mut head = 0;
          seen[start.0][start.1] = true; // 入队时标记
          let dirs: [(i32, i32); 4] = [(1, 0), (-1, 0), (0, 1), (0, -1)];
          while head < queue.len() {
              let (r, c, dist) = queue[head];
              head += 1;
              if (r, c) == end {
                  return dist; // 第一次到达就是最短
              }
              for (dr, dc) in dirs {
                  let nr = r as i32 + dr;
                  let nc = c as i32 + dc;
                  if nr < 0 || nc < 0 || nr >= rows as i32 || nc >= cols as i32 {
                      continue;
                  }
                  let (nr, nc) = (nr as usize, nc as usize);
                  if grid[nr][nc] == 1 || seen[nr][nc] {
                      continue;
                  }
                  seen[nr][nc] = true;
                  queue.push((nr, nc, dist + 1));
              }
          }
          -1
      }
    `,

  "algo-dfs": code`
      // DFS 只判断能不能到，第一次到达的路径不保证最短
      fn dfs_reach(grid: &[Vec<i32>], start: (usize, usize), end: (usize, usize)) -> bool {
          let mut seen = vec![vec![false; grid[0].len()]; grid.len()];
          visit(grid, end, &mut seen, start.0 as i32, start.1 as i32)
      }

      fn visit(grid: &[Vec<i32>], end: (usize, usize), seen: &mut Vec<Vec<bool>>, r: i32, c: i32) -> bool {
          let rows = grid.len() as i32;
          let cols = grid[0].len() as i32;
          if r < 0 || c < 0 || r >= rows || c >= cols {
              return false;
          }
          let (ur, uc) = (r as usize, c as usize);
          if grid[ur][uc] == 1 || seen[ur][uc] {
              return false;
          }
          seen[ur][uc] = true; // 进入时标记
          if (ur, uc) == end {
              return true;
          }
          for (dr, dc) in [(1, 0), (-1, 0), (0, 1), (0, -1)] {
              if visit(grid, end, seen, r + dr, c + dc) { // 沿一条路钻到底
                  return true;
              }
          }
          false // 回溯
      }
    `,

  "algo-list": code`
      struct ListNode {
          val: i32,
          next: Option<Box<ListNode>>,
      }

      // O(1) 空间：取出后继后逐个改指向
      fn reverse_list(mut head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
          let mut prev = None;
          while let Some(mut node) = head {
              head = node.next.take(); // 先记住后继
              node.next = prev;
              prev = Some(node);
          }
          prev // 新的头
      }
    `,

  "algo-cycle": code`
      use std::cell::RefCell;
      use std::rc::Rc;

      type Link = Option<Rc<RefCell<ListNode>>>;

      struct ListNode {
          val: i32,
          next: Link,
      }

      // 共享所有权用 Rc<RefCell>，指针相等即同一结点
      fn has_cycle(head: Link) -> bool {
          let mut slow = head.clone();
          let mut fast = head;
          loop {
              slow = slow.and_then(|n| n.borrow().next.clone()); // 每次一步
              fast = fast
                  .and_then(|n| n.borrow().next.clone())
                  .and_then(|n| n.borrow().next.clone()); // 每次两步
              match (&slow, &fast) {
                  (Some(s), Some(f)) if Rc::ptr_eq(s, f) => return true,
                  (Some(_), Some(_)) => {}
                  _ => return false, // 快指针走到链尾，没有环
              }
          }
      }
    `,

  "algo-inorder": code`
      struct TreeNode {
          val: i32,
          left: Option<Box<TreeNode>>,
          right: Option<Box<TreeNode>>,
      }

      fn inorder(root: Option<&TreeNode>) -> Vec<i32> {
          let mut out = Vec::new();
          let mut stack: Vec<&TreeNode> = Vec::new();
          let mut curr = root;
          while curr.is_some() || !stack.is_empty() {
              while let Some(node) = curr {
                  stack.push(node); // 栈里是还没访问的祖先
                  curr = node.left.as_deref();
              }
              let node = stack.pop().unwrap();
              out.push(node.val);
              curr = node.right.as_deref();
          }
          out // BST 的结果是递增序列
      }
    `,

  "algo-level": code`
      struct TreeNode {
          val: i32,
          left: Option<Box<TreeNode>>,
          right: Option<Box<TreeNode>>,
      }

      fn level_order(root: Option<&TreeNode>) -> Vec<Vec<i32>> {
          let root = match root {
              Some(r) => r,
              None => return Vec::new(),
          };
          let mut out = Vec::new();
          let mut queue: Vec<&TreeNode> = vec![root];
          let mut head = 0;
          while head < queue.len() {
              let size = queue.len() - head; // 先记下这一层的结点数
              let mut level = Vec::with_capacity(size);
              for _ in 0..size {
                  let node = queue[head];
                  head += 1;
                  level.push(node.val);
                  if let Some(left) = node.left.as_deref() {
                      queue.push(left);
                  }
                  if let Some(right) = node.right.as_deref() {
                      queue.push(right);
                  }
              }
              out.push(level);
          }
          out
      }
    `,

  "algo-knapsack": code`
      fn knapsack(w: &[i32], v: &[i32], capacity: usize) -> i32 {
          let mut dp = vec![0; capacity + 1];
          for i in 0..w.len() {
              let weight = w[i] as usize;
              for c in (weight..=capacity).rev() { // 倒序，每件只用一次
                  dp[c] = dp[c].max(dp[c - weight] + v[i]);
              }
          }
          dp[capacity]
      }
    `,

  "algo-kadane": code`
      // a 非空；全是负数时返回最大的那个负数
      fn max_sub_array(a: &[i32]) -> i32 {
          let (mut best, mut cur) = (a[0], a[0]);
          for &x in &a[1..] {
              cur = x.max(cur + x); // 前面是负的就从 x 重新开始
              best = best.max(cur);
          }
          best
      }
    `,

  "algo-climb": code`
      // dp[i] = dp[i-1] + dp[i-2]，只滚动两个变量
      fn climb_stairs(n: usize) -> u64 {
          let (mut prev, mut curr) = (1u64, 1u64); // dp[0] = 1, dp[1] = 1
          for _ in 2..=n {
              let next = prev + curr;
              prev = curr;
              curr = next;
          }
          curr
      }
    `,

  "algo-lcs": code`
      fn lcs_length(a: &str, b: &str) -> usize {
          let (x, y) = (a.as_bytes(), b.as_bytes()); // 按字节，示例是 ASCII
          let mut dp = vec![vec![0usize; y.len() + 1]; x.len() + 1];
          for i in 1..=x.len() {
              for j in 1..=y.len() {
                  if x[i - 1] == y[j - 1] {
                      dp[i][j] = dp[i - 1][j - 1] + 1;
                  } else {
                      dp[i][j] = dp[i - 1][j].max(dp[i][j - 1]);
                  }
              }
          }
          dp[x.len()][y.len()]
      }
    `,
};
