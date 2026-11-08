import { code } from "./codeSamples";

/**
 * 21 道算法题的 Go 参考实现，key 与题目 id 一致。
 * 片段是包内代码，省略 package 声明；只用到标准库，quickSort 需要 math/rand。
 */
export const GO_CODE: Record<string, string> = {
  "algo-bubble": code`
      func bubbleSort(a []int) []int {
          arr := append([]int(nil), a...)
          for i := 0; i < len(arr)-1; i++ {
              swapped := false
              for j := 0; j < len(arr)-1-i; j++ {
                  if arr[j] > arr[j+1] {
                      arr[j], arr[j+1] = arr[j+1], arr[j]
                      swapped = true
                  }
              }
              if !swapped { // 一趟没交换，说明已经有序
                  break
              }
          }
          return arr
      }
    `,

  "algo-quick": code`
      import "math/rand"

      func quickSort(a []int, lo, hi int) {
          if lo >= hi {
              return
          }
          p := lo + rand.Intn(hi-lo+1)
          a[p], a[hi] = a[hi], a[p] // 随机枢轴，避免有序输入退化
          pivot := a[hi]
          i := lo
          for j := lo; j < hi; j++ {
              if a[j] < pivot {
                  a[i], a[j] = a[j], a[i]
                  i++
              }
          }
          a[i], a[hi] = a[hi], a[i] // 枢轴落到最终位置
          quickSort(a, lo, i-1)
          quickSort(a, i+1, hi)
      }
    `,

  "algo-merge": code`
      func mergeSort(a []int) []int {
          if len(a) <= 1 {
              return append([]int(nil), a...)
          }
          mid := len(a) / 2
          left, right := mergeSort(a[:mid]), mergeSort(a[mid:])
          out := make([]int, 0, len(a)) // 辅助空间 O(n)
          i, j := 0, 0
          for i < len(left) && j < len(right) {
              if left[i] <= right[j] { // 相等先取左段，稳定
                  out = append(out, left[i])
                  i++
              } else {
                  out = append(out, right[j])
                  j++
              }
          }
          out = append(out, left[i:]...)
          out = append(out, right[j:]...)
          return out
      }
    `,

  "algo-binary": code`
      func binarySearch(a []int, target int) int {
          lo, hi := 0, len(a)-1 // 闭区间 [lo, hi]
          for lo <= hi {
              mid := lo + (hi-lo)/2 // 避免大下标相加溢出
              if a[mid] == target {
                  return mid
              }
              if a[mid] < target {
                  lo = mid + 1
              } else {
                  hi = mid - 1
              }
          }
          return -1
      }
    `,

  "algo-selection": code`
      func selectionSort(a []int) {
          for i := 0; i < len(a)-1; i++ {
              m := i
              for j := i + 1; j < len(a); j++ {
                  if a[j] < a[m] {
                      m = j
                  }
              }
              a[i], a[m] = a[m], a[i] // 每趟最多交换一次
          }
      }
    `,

  "algo-insertion": code`
      func insertionSort(a []int) {
          for i := 1; i < len(a); i++ {
              key := a[i]
              j := i - 1
              for j >= 0 && a[j] > key { // 相等不挪，保持稳定
                  a[j+1] = a[j]
                  j--
              }
              a[j+1] = key
          }
      }
    `,

  "algo-heap": code`
      func siftDown(a []int, start, end int) {
          root := start
          for 2*root+1 < end {
              child := 2*root + 1
              if child+1 < end && a[child+1] > a[child] {
                  child++
              }
              if a[root] >= a[child] {
                  return
              }
              a[root], a[child] = a[child], a[root]
              root = child
          }
      }

      func heapSort(a []int) {
          for i := len(a)/2 - 1; i >= 0; i-- { // 建堆 O(n)
              siftDown(a, i, len(a))
          }
          for end := len(a) - 1; end > 0; end-- {
              a[0], a[end] = a[end], a[0] // 堆顶换到末尾
              siftDown(a, 0, end)
          }
      }
    `,

  "algo-lower": code`
      func lowerBound(a []int, target int) int {
          lo, hi := 0, len(a) // 半开区间 [lo, hi)
          for lo < hi {
              mid := lo + (hi-lo)/2
              if a[mid] < target {
                  lo = mid + 1
              } else { // 相等也往左收
                  hi = mid
              }
          }
          return lo // 第一个 >= target 的位置
      }
    `,

  "algo-two": code`
      // a 已升序，返回两个数的下标
      func twoSum(a []int, target int) (int, int) {
          lo, hi := 0, len(a)-1
          for lo < hi {
              sum := a[lo] + a[hi]
              if sum == target {
                  return lo, hi
              }
              if sum < target { // 和偏小，只能增大左端
                  lo++
              } else { // 和偏大，只能减小右端
                  hi--
              }
          }
          return -1, -1
      }
    `,

  "algo-window": code`
      func maxWindowSum(a []int, k int) int {
          sum := 0
          for i := 0; i < k; i++ {
              sum += a[i]
          }
          best := sum
          for r := k; r < len(a); r++ {
              sum += a[r] - a[r-k] // 纳入右端、丢掉左端，O(1)
              if sum > best {
                  best = sum
              }
          }
          return best
      }
    `,

  "algo-zero": code`
      func moveZeroes(a []int) {
          w := 0 // W：下一个非 0 该写入的位置
          for r := 0; r < len(a); r++ { // R：扫描指针
              if a[r] != 0 {
                  a[w], a[r] = a[r], a[w] // 交换，0 自然堆到末尾
                  w++
              }
          }
      }
    `,

  "algo-bfs": code`
      type cell struct{ r, c, dist int }

      func shortestPath(grid [][]int, start, end [2]int) int {
          rows, cols := len(grid), len(grid[0])
          seen := make([][]bool, rows)
          for i := range seen {
              seen[i] = make([]bool, cols)
          }
          queue := []cell{{start[0], start[1], 0}}
          seen[start[0]][start[1]] = true // 入队时标记
          dirs := [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
          for head := 0; head < len(queue); head++ {
              cur := queue[head]
              if cur.r == end[0] && cur.c == end[1] {
                  return cur.dist // 第一次到达就是最短
              }
              for _, d := range dirs {
                  nr, nc := cur.r+d[0], cur.c+d[1]
                  if nr < 0 || nc < 0 || nr >= rows || nc >= cols {
                      continue
                  }
                  if grid[nr][nc] == 1 || seen[nr][nc] {
                      continue
                  }
                  seen[nr][nc] = true
                  queue = append(queue, cell{nr, nc, cur.dist + 1})
              }
          }
          return -1
      }
    `,

  "algo-dfs": code`
      // DFS 只判断能不能到，第一次到达的路径不保证最短
      func dfsReach(grid [][]int, start, end [2]int) bool {
          rows, cols := len(grid), len(grid[0])
          seen := make([][]bool, rows)
          for i := range seen {
              seen[i] = make([]bool, cols)
          }
          dirs := [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
          var visit func(r, c int) bool
          visit = func(r, c int) bool {
              if r < 0 || c < 0 || r >= rows || c >= cols {
                  return false
              }
              if grid[r][c] == 1 || seen[r][c] {
                  return false
              }
              seen[r][c] = true // 进入时标记
              if r == end[0] && c == end[1] {
                  return true
              }
              for _, d := range dirs {
                  if visit(r+d[0], c+d[1]) { // 沿一条路钻到底
                      return true
                  }
              }
              return false // 回溯
          }
          return visit(start[0], start[1])
      }
    `,

  "algo-list": code`
      type ListNode struct {
          val  int
          next *ListNode
      }

      // O(1) 空间：prev / curr / next 三个指针
      func reverseList(head *ListNode) *ListNode {
          var prev *ListNode
          curr := head
          for curr != nil {
              next := curr.next // 先记住后继
              curr.next = prev
              prev = curr
              curr = next
          }
          return prev // 新的头
      }
    `,

  "algo-cycle": code`
      type ListNode struct {
          val  int
          next *ListNode
      }

      func hasCycle(head *ListNode) bool {
          slow, fast := head, head
          for fast != nil && fast.next != nil {
              slow = slow.next        // 每次一步
              fast = fast.next.next   // 每次两步，追近 1 格
              if slow == fast {
                  return true
              }
          }
          return false // 快指针走到 nil，没有环
      }
    `,

  "algo-inorder": code`
      type TreeNode struct {
          val         int
          left, right *TreeNode
      }

      func inorder(root *TreeNode) []int {
          out := []int{}
          stack := []*TreeNode{}
          curr := root
          for curr != nil || len(stack) > 0 {
              for curr != nil {
                  stack = append(stack, curr) // 栈里是还没访问的祖先
                  curr = curr.left
              }
              curr = stack[len(stack)-1]
              stack = stack[:len(stack)-1]
              out = append(out, curr.val)
              curr = curr.right
          }
          return out // BST 的结果是递增序列
      }
    `,

  "algo-level": code`
      type TreeNode struct {
          val         int
          left, right *TreeNode
      }

      func levelOrder(root *TreeNode) [][]int {
          out := [][]int{}
          if root == nil {
              return out
          }
          queue := []*TreeNode{root}
          for head := 0; head < len(queue); {
              size := len(queue) - head // 先记下这一层的结点数
              level := make([]int, 0, size)
              for i := 0; i < size; i++ {
                  node := queue[head]
                  head++
                  level = append(level, node.val)
                  if node.left != nil {
                      queue = append(queue, node.left)
                  }
                  if node.right != nil {
                      queue = append(queue, node.right)
                  }
              }
              out = append(out, level)
          }
          return out
      }
    `,

  "algo-knapsack": code`
      func knapsack(w, v []int, capacity int) int {
          dp := make([]int, capacity+1)
          for i := 0; i < len(w); i++ {
              for c := capacity; c >= w[i]; c-- { // 倒序，每件只用一次
                  if candidate := dp[c-w[i]] + v[i]; candidate > dp[c] {
                      dp[c] = candidate
                  }
              }
          }
          return dp[capacity]
      }
    `,

  "algo-kadane": code`
      // a 非空；全是负数时返回最大的那个负数
      func maxSubArray(a []int) int {
          best, cur := a[0], a[0]
          for _, x := range a[1:] {
              if cur+x > x { // 前面是负的就从 x 重新开始
                  cur += x
              } else {
                  cur = x
              }
              if cur > best {
                  best = cur
              }
          }
          return best
      }
    `,

  "algo-climb": code`
      // dp[i] = dp[i-1] + dp[i-2]，只滚动两个变量
      func climbStairs(n int) int64 {
          var prev, curr int64 = 1, 1 // dp[0] = 1, dp[1] = 1
          for i := 2; i <= n; i++ {
              prev, curr = curr, prev+curr
          }
          return curr
      }
    `,

  "algo-lcs": code`
      func lcsLength(a, b string) int {
          dp := make([][]int, len(a)+1)
          for i := range dp {
              dp[i] = make([]int, len(b)+1)
          }
          for i := 1; i <= len(a); i++ {
              for j := 1; j <= len(b); j++ {
                  if a[i-1] == b[j-1] {
                      dp[i][j] = dp[i-1][j-1] + 1
                  } else if dp[i-1][j] > dp[i][j-1] {
                      dp[i][j] = dp[i-1][j]
                  } else {
                      dp[i][j] = dp[i][j-1]
                  }
              }
          }
          return dp[len(a)][len(b)]
      }
    `,
};
