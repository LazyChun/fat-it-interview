import { code, type BaseCodeSamples } from "./codeSamples";

/**
 * 动态规划 4 道题的多语言参考实现。
 * Java 片段默认写在类里、标准库已导入；C++ 片段默认已有常用头文件和 using namespace std。
 */
export const DP_CODE: Record<string, BaseCodeSamples> = {
  "algo-knapsack": {
    js: code`
      // 0/1 背包，一维 dp：dp[c] 表示容量 c 内的最大价值
      function knapsack(weights, values, capacity) {
        const dp = new Array(capacity + 1).fill(0);
        for (let i = 0; i < weights.length; i++) {
          for (let c = capacity; c >= weights[i]; c--) { // 倒序，每件只用一次
            dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
          }
        }
        return dp[capacity];
      }
    `,
    ts: code`
      function knapsack(weights: number[], values: number[], capacity: number): number {
        const dp: number[] = new Array(capacity + 1).fill(0);
        for (let i = 0; i < weights.length; i++) {
          for (let c = capacity; c >= weights[i]; c--) {
            dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
          }
        }
        return dp[capacity];
      }
    `,
    java: code`
      static int knapsack(int[] w, int[] v, int capacity) {
          int[] dp = new int[capacity + 1];
          for (int i = 0; i < w.length; i++) {
              for (int c = capacity; c >= w[i]; c--) {  // 倒序，每件只用一次
                  dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]);
              }
          }
          return dp[capacity];
      }
    `,
    python: code`
      def knapsack(weights, values, capacity):
          dp = [0] * (capacity + 1)
          for w, v in zip(weights, values):
              for c in range(capacity, w - 1, -1):  # 倒序，每件只用一次
                  dp[c] = max(dp[c], dp[c - w] + v)
          return dp[capacity]
    `,
    cpp: code`
      int knapsack(const vector<int>& w, const vector<int>& v, int capacity) {
          vector<int> dp(capacity + 1, 0);
          for (size_t i = 0; i < w.size(); ++i) {
              for (int c = capacity; c >= w[i]; --c) {  // 倒序，每件只用一次
                  dp[c] = max(dp[c], dp[c - w[i]] + v[i]);
              }
          }
          return dp[capacity];
      }
    `,
  },

  "algo-kadane": {
    js: code`
      // a 非空；全是负数时返回最大的那个负数
      function maxSubArray(a) {
        let best = a[0], cur = a[0];
        for (let i = 1; i < a.length; i++) {
          cur = Math.max(a[i], cur + a[i]); // 前面是负的就从 a[i] 重新开始
          best = Math.max(best, cur);
        }
        return best;
      }
    `,
    ts: code`
      function maxSubArray(a: number[]): number {
        let best = a[0], cur = a[0];
        for (let i = 1; i < a.length; i++) {
          cur = Math.max(a[i], cur + a[i]);
          best = Math.max(best, cur);
        }
        return best;
      }
    `,
    java: code`
      static int maxSubArray(int[] a) {
          int best = a[0], cur = a[0];
          for (int i = 1; i < a.length; i++) {
              cur = Math.max(a[i], cur + a[i]);  // 前面是负的就重新开始
              best = Math.max(best, cur);
          }
          return best;
      }
    `,
    python: code`
      def max_sub_array(a):
          best = cur = a[0]
          for x in a[1:]:
              cur = max(x, cur + x)   # 前面是负的就从 x 重新开始
              best = max(best, cur)
          return best                 # 全负数时是最大的那个负数
    `,
    cpp: code`
      int maxSubArray(const vector<int>& a) {
          int best = a[0], cur = a[0];
          for (size_t i = 1; i < a.size(); ++i) {
              cur = max(a[i], cur + a[i]);
              best = max(best, cur);
          }
          return best;
      }
    `,
  },

  "algo-climb": {
    js: code`
      // dp[i] = dp[i-1] + dp[i-2]，滚动两个变量把空间压到 O(1)
      function climbStairs(n) {
        let prev = 1, curr = 1; // dp[0] = 1, dp[1] = 1
        for (let i = 2; i <= n; i++) {
          const next = prev + curr;
          prev = curr;
          curr = next;
        }
        return curr;
      }
    `,
    ts: code`
      function climbStairs(n: number): number {
        let prev = 1, curr = 1;
        for (let i = 2; i <= n; i++) {
          const next = prev + curr;
          prev = curr;
          curr = next;
        }
        return curr;
      }
    `,
    java: code`
      static long climbStairs(int n) {
          long prev = 1, curr = 1;     // dp[0] = 1, dp[1] = 1
          for (int i = 2; i <= n; i++) {
              long next = prev + curr;
              prev = curr;
              curr = next;
          }
          return curr;                 // 用 long，避免 n 大时溢出
      }
    `,
    python: code`
      def climb_stairs(n):
          prev = curr = 1             # dp[0] = 1, dp[1] = 1
          for _ in range(2, n + 1):
              prev, curr = curr, prev + curr
          return curr
    `,
    cpp: code`
      long long climbStairs(int n) {
          long long prev = 1, curr = 1;
          for (int i = 2; i <= n; ++i) {
              long long next = prev + curr;
              prev = curr;
              curr = next;
          }
          return curr;
      }
    `,
  },

  "algo-lcs": {
    js: code`
      function lcsLength(a, b) {
        const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
        return dp[a.length][b.length];
      }
    `,
    ts: code`
      function lcsLength(a: string, b: string): number {
        const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
          new Array<number>(b.length + 1).fill(0),
        );
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
        return dp[a.length][b.length];
      }
    `,
    java: code`
      static int lcsLength(String a, String b) {
          int[][] dp = new int[a.length() + 1][b.length() + 1];
          for (int i = 1; i <= a.length(); i++) {
              for (int j = 1; j <= b.length(); j++) {
                  if (a.charAt(i - 1) == b.charAt(j - 1)) {
                      dp[i][j] = dp[i - 1][j - 1] + 1;
                  } else {
                      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                  }
              }
          }
          return dp[a.length()][b.length()];
      }
    `,
    python: code`
      def lcs_length(a, b):
          dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
          for i in range(1, len(a) + 1):
              for j in range(1, len(b) + 1):
                  if a[i - 1] == b[j - 1]:
                      dp[i][j] = dp[i - 1][j - 1] + 1
                  else:
                      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
          return dp[len(a)][len(b)]
    `,
    cpp: code`
      int lcsLength(const string& a, const string& b) {
          vector<vector<int>> dp(a.size() + 1, vector<int>(b.size() + 1, 0));
          for (size_t i = 1; i <= a.size(); ++i) {
              for (size_t j = 1; j <= b.size(); ++j) {
                  if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
                  else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
              }
          }
          return dp[a.size()][b.size()];
      }
    `,
  },
};
