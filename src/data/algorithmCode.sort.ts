import { code, type BaseCodeSamples } from "./codeSamples";

/**
 * 排序与查找 8 道题的多语言参考实现。
 * Java 片段默认写在类里、标准库已导入；C++ 片段默认已有常用头文件和 using namespace std。
 */
export const SORT_CODE: Record<string, BaseCodeSamples> = {
  "algo-bubble": {
    js: code`
      function bubbleSort(a) {
        const arr = a.slice();
        for (let i = 0; i < arr.length - 1; i++) {
          let swapped = false;
          for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              swapped = true;
            }
          }
          if (!swapped) break; // 一趟没交换，说明已经有序
        }
        return arr;
      }
    `,
    ts: code`
      function bubbleSort(a: number[]): number[] {
        const arr = [...a];
        let swapped = true;
        for (let i = 0; i < arr.length - 1 && swapped; i++) {
          swapped = false;
          for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              swapped = true;
            }
          }
        }
        return arr;
      }
    `,
    java: code`
      static int[] bubbleSort(int[] a) {
          int[] arr = a.clone();
          for (int i = 0; i < arr.length - 1; i++) {
              boolean swapped = false;
              for (int j = 0; j < arr.length - 1 - i; j++) {
                  if (arr[j] > arr[j + 1]) {
                      int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
                      swapped = true;
                  }
              }
              if (!swapped) break; // 一趟没交换，说明已经有序
          }
          return arr;
      }
    `,
    python: code`
      def bubble_sort(a):
          arr = a[:]
          for i in range(len(arr) - 1):
              swapped = False
              for j in range(len(arr) - 1 - i):
                  if arr[j] > arr[j + 1]:
                      arr[j], arr[j + 1] = arr[j + 1], arr[j]
                      swapped = True
              if not swapped:      # 一趟没交换，说明已经有序
                  break
          return arr
    `,
    cpp: code`
      vector<int> bubbleSort(vector<int> a) {
          for (size_t i = 0; i + 1 < a.size(); ++i) {
              bool swapped = false;
              for (size_t j = 0; j + 1 < a.size() - i; ++j) {
                  if (a[j] > a[j + 1]) {
                      swap(a[j], a[j + 1]);
                      swapped = true;
                  }
              }
              if (!swapped) break; // 一趟没交换，说明已经有序
          }
          return a;
      }
    `,
  },

  "algo-quick": {
    js: code`
      function quickSort(a, lo = 0, hi = a.length - 1) {
        if (lo >= hi) return a;
        const p = lo + Math.floor(Math.random() * (hi - lo + 1));
        [a[p], a[hi]] = [a[hi], a[p]]; // 随机枢轴，避免有序输入退化
        const pivot = a[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) {
          if (a[j] < pivot) {
            [a[i], a[j]] = [a[j], a[i]];
            i++;
          }
        }
        [a[i], a[hi]] = [a[hi], a[i]]; // 枢轴落到最终位置
        quickSort(a, lo, i - 1);
        quickSort(a, i + 1, hi);
        return a;
      }
    `,
    ts: code`
      function quickSort(a: number[], lo = 0, hi = a.length - 1): number[] {
        if (lo >= hi) return a;
        const p = lo + Math.floor(Math.random() * (hi - lo + 1));
        [a[p], a[hi]] = [a[hi], a[p]];
        const pivot = a[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) {
          if (a[j] < pivot) {
            [a[i], a[j]] = [a[j], a[i]];
            i++;
          }
        }
        [a[i], a[hi]] = [a[hi], a[i]];
        quickSort(a, lo, i - 1);
        quickSort(a, i + 1, hi);
        return a;
      }
    `,
    java: code`
      static void quickSort(int[] a, int lo, int hi) {
          if (lo >= hi) return;
          int p = lo + (int) (Math.random() * (hi - lo + 1));
          swap(a, p, hi);                    // 随机枢轴
          int pivot = a[hi], i = lo;
          for (int j = lo; j < hi; j++) {
              if (a[j] < pivot) swap(a, i++, j);
          }
          swap(a, i, hi);
          quickSort(a, lo, i - 1);
          quickSort(a, i + 1, hi);
      }

      static void swap(int[] a, int i, int j) {
          int t = a[i]; a[i] = a[j]; a[j] = t;
      }
    `,
    python: code`
      import random

      def quick_sort(a, lo=0, hi=None):
          if hi is None:
              hi = len(a) - 1
          if lo >= hi:
              return a
          p = random.randint(lo, hi)      # 随机枢轴
          a[p], a[hi] = a[hi], a[p]
          pivot, i = a[hi], lo
          for j in range(lo, hi):
              if a[j] < pivot:
                  a[i], a[j] = a[j], a[i]
                  i += 1
          a[i], a[hi] = a[hi], a[i]
          quick_sort(a, lo, i - 1)
          quick_sort(a, i + 1, hi)
          return a
    `,
    cpp: code`
      void quickSort(vector<int>& a, int lo, int hi) {
          if (lo >= hi) return;
          int p = lo + rand() % (hi - lo + 1);
          swap(a[p], a[hi]);               // 随机枢轴
          int pivot = a[hi], i = lo;
          for (int j = lo; j < hi; ++j) {
              if (a[j] < pivot) swap(a[i++], a[j]);
          }
          swap(a[i], a[hi]);
          quickSort(a, lo, i - 1);
          quickSort(a, i + 1, hi);
      }
    `,
  },

  "algo-merge": {
    js: code`
      function mergeSort(a) {
        if (a.length <= 1) return a.slice();
        const mid = a.length >> 1;
        const left = mergeSort(a.slice(0, mid));
        const right = mergeSort(a.slice(mid));
        const out = [];
        let i = 0, j = 0;
        while (i < left.length && j < right.length) {
          out.push(left[i] <= right[j] ? left[i++] : right[j++]); // 相等先取左，稳定
        }
        return out.concat(left.slice(i), right.slice(j));         // 辅助空间 O(n)
      }
    `,
    ts: code`
      function mergeSort(a: number[]): number[] {
        if (a.length <= 1) return [...a];
        const mid = a.length >> 1;
        const left = mergeSort(a.slice(0, mid));
        const right = mergeSort(a.slice(mid));
        const out: number[] = [];
        let i = 0, j = 0;
        while (i < left.length && j < right.length) {
          out.push(left[i] <= right[j] ? left[i++] : right[j++]);
        }
        return out.concat(left.slice(i), right.slice(j));
      }
    `,
    java: code`
      static int[] mergeSort(int[] a) {
          if (a.length <= 1) return a.clone();
          int mid = a.length / 2;
          int[] left = mergeSort(Arrays.copyOfRange(a, 0, mid));
          int[] right = mergeSort(Arrays.copyOfRange(a, mid, a.length));
          int[] out = new int[a.length];
          int i = 0, j = 0, k = 0;
          while (i < left.length && j < right.length) {
              out[k++] = left[i] <= right[j] ? left[i++] : right[j++];
          }
          while (i < left.length) out[k++] = left[i++];
          while (j < right.length) out[k++] = right[j++];
          return out;
      }
    `,
    python: code`
      def merge_sort(a):
          if len(a) <= 1:
              return a[:]
          mid = len(a) // 2
          left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
          out, i, j = [], 0, 0
          while i < len(left) and j < len(right):
              if left[i] <= right[j]:   # 相等先取左，稳定
                  out.append(left[i]); i += 1
              else:
                  out.append(right[j]); j += 1
          return out + left[i:] + right[j:]
    `,
    cpp: code`
      vector<int> mergeSort(const vector<int>& a) {
          if (a.size() <= 1) return a;
          size_t mid = a.size() / 2;
          vector<int> left = mergeSort(vector<int>(a.begin(), a.begin() + mid));
          vector<int> right = mergeSort(vector<int>(a.begin() + mid, a.end()));
          vector<int> out;
          out.reserve(a.size());
          size_t i = 0, j = 0;
          while (i < left.size() && j < right.size()) {
              out.push_back(left[i] <= right[j] ? left[i++] : right[j++]);
          }
          out.insert(out.end(), left.begin() + i, left.end());
          out.insert(out.end(), right.begin() + j, right.end());
          return out;
      }
    `,
  },

  "algo-binary": {
    js: code`
      function binarySearch(a, target) {
        let lo = 0, hi = a.length - 1;      // 闭区间 [lo, hi]
        while (lo <= hi) {
          const mid = lo + ((hi - lo) >> 1); // 避免大下标相加溢出
          if (a[mid] === target) return mid;
          if (a[mid] < target) lo = mid + 1;
          else hi = mid - 1;                // 收缩时不包含 mid
        }
        return -1;
      }
    `,
    ts: code`
      function binarySearch(a: number[], target: number): number {
        let lo = 0, hi = a.length - 1;
        while (lo <= hi) {
          const mid = lo + ((hi - lo) >> 1);
          if (a[mid] === target) return mid;
          if (a[mid] < target) lo = mid + 1;
          else hi = mid - 1;
        }
        return -1;
      }
    `,
    java: code`
      static int binarySearch(int[] a, int target) {
          int lo = 0, hi = a.length - 1;
          while (lo <= hi) {
              int mid = lo + (hi - lo) / 2;  // 避免 lo + hi 溢出
              if (a[mid] == target) return mid;
              if (a[mid] < target) lo = mid + 1;
              else hi = mid - 1;
          }
          return -1;
      }
    `,
    python: code`
      def binary_search(a, target):
          lo, hi = 0, len(a) - 1          # 闭区间 [lo, hi]
          while lo <= hi:
              mid = lo + (hi - lo) // 2
              if a[mid] == target:
                  return mid
              if a[mid] < target:
                  lo = mid + 1
              else:
                  hi = mid - 1
          return -1
    `,
    cpp: code`
      int binarySearch(const vector<int>& a, int target) {
          int lo = 0, hi = (int) a.size() - 1;
          while (lo <= hi) {
              int mid = lo + (hi - lo) / 2; // 避免 lo + hi 溢出
              if (a[mid] == target) return mid;
              if (a[mid] < target) lo = mid + 1;
              else hi = mid - 1;
          }
          return -1;
      }
    `,
  },

  "algo-selection": {
    js: code`
      function selectionSort(a) {
        for (let i = 0; i < a.length - 1; i++) {
          let min = i;
          for (let j = i + 1; j < a.length; j++) {
            if (a[j] < a[min]) min = j;
          }
          [a[i], a[min]] = [a[min], a[i]]; // 每趟最多交换一次
        }
        return a;                          // 比较次数与输入顺序无关
      }
    `,
    ts: code`
      function selectionSort(a: number[]): number[] {
        for (let i = 0; i < a.length - 1; i++) {
          let min = i;
          for (let j = i + 1; j < a.length; j++) {
            if (a[j] < a[min]) min = j;
          }
          [a[i], a[min]] = [a[min], a[i]];
        }
        return a;
      }
    `,
    java: code`
      static void selectionSort(int[] a) {
          for (int i = 0; i < a.length - 1; i++) {
              int min = i;
              for (int j = i + 1; j < a.length; j++) {
                  if (a[j] < a[min]) min = j;
              }
              int t = a[i]; a[i] = a[min]; a[min] = t;
          }
      }
    `,
    python: code`
      def selection_sort(a):
          for i in range(len(a) - 1):
              m = i
              for j in range(i + 1, len(a)):
                  if a[j] < a[m]:
                      m = j
              a[i], a[m] = a[m], a[i]    # 每趟最多交换一次
          return a
    `,
    cpp: code`
      void selectionSort(vector<int>& a) {
          for (size_t i = 0; i + 1 < a.size(); ++i) {
              size_t min = i;
              for (size_t j = i + 1; j < a.size(); ++j) {
                  if (a[j] < a[min]) min = j;
              }
              swap(a[i], a[min]);
          }
      }
    `,
  },

  "algo-insertion": {
    js: code`
      function insertionSort(a) {
        for (let i = 1; i < a.length; i++) {
          const key = a[i];
          let j = i - 1;
          while (j >= 0 && a[j] > key) { // 相等不挪，保持稳定
            a[j + 1] = a[j];
            j--;
          }
          a[j + 1] = key;
        }
        return a;
      }
    `,
    ts: code`
      function insertionSort(a: number[]): number[] {
        for (let i = 1; i < a.length; i++) {
          const key = a[i];
          let j = i - 1;
          while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
          }
          a[j + 1] = key;
        }
        return a;
      }
    `,
    java: code`
      static void insertionSort(int[] a) {
          for (int i = 1; i < a.length; i++) {
              int key = a[i], j = i - 1;
              while (j >= 0 && a[j] > key) {
                  a[j + 1] = a[j];
                  j--;
              }
              a[j + 1] = key;
          }
      }
    `,
    python: code`
      def insertion_sort(a):
          for i in range(1, len(a)):
              key, j = a[i], i - 1
              while j >= 0 and a[j] > key:   # 相等不挪，保持稳定
                  a[j + 1] = a[j]
                  j -= 1
              a[j + 1] = key
          return a
    `,
    cpp: code`
      void insertionSort(vector<int>& a) {
          for (size_t i = 1; i < a.size(); ++i) {
              int key = a[i];
              int j = (int) i - 1;
              while (j >= 0 && a[j] > key) {
                  a[j + 1] = a[j];
                  --j;
              }
              a[j + 1] = key;
          }
      }
    `,
  },

  "algo-heap": {
    js: code`
      function heapSort(a) {
        const n = a.length;
        function siftDown(start, end) {
          let root = start;
          while (2 * root + 1 < end) {
            let child = 2 * root + 1;                  // 左孩子
            if (child + 1 < end && a[child + 1] > a[child]) child++;
            if (a[root] >= a[child]) return;
            [a[root], a[child]] = [a[child], a[root]];
            root = child;
          }
        }
        for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n); // 建堆 O(n)
        for (let end = n - 1; end > 0; end--) {
          [a[0], a[end]] = [a[end], a[0]];           // 堆顶换到末尾
          siftDown(0, end);
        }
        return a;
      }
    `,
    ts: code`
      function heapSort(a: number[]): number[] {
        const n = a.length;
        const siftDown = (start: number, end: number): void => {
          let root = start;
          while (2 * root + 1 < end) {
            let child = 2 * root + 1;
            if (child + 1 < end && a[child + 1] > a[child]) child++;
            if (a[root] >= a[child]) return;
            [a[root], a[child]] = [a[child], a[root]];
            root = child;
          }
        };
        for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n);
        for (let end = n - 1; end > 0; end--) {
          [a[0], a[end]] = [a[end], a[0]];
          siftDown(0, end);
        }
        return a;
      }
    `,
    java: code`
      static void heapSort(int[] a) {
          for (int i = a.length / 2 - 1; i >= 0; i--) siftDown(a, i, a.length);
          for (int end = a.length - 1; end > 0; end--) {
              int t = a[0]; a[0] = a[end]; a[end] = t;
              siftDown(a, 0, end);
          }
      }

      static void siftDown(int[] a, int start, int end) {
          int root = start;
          while (2 * root + 1 < end) {
              int child = 2 * root + 1;
              if (child + 1 < end && a[child + 1] > a[child]) child++;
              if (a[root] >= a[child]) return;
              int t = a[root]; a[root] = a[child]; a[child] = t;
              root = child;
          }
      }
    `,
    python: code`
      def heap_sort(a):
          def sift_down(start, end):
              root = start
              while 2 * root + 1 < end:
                  child = 2 * root + 1
                  if child + 1 < end and a[child + 1] > a[child]:
                      child += 1
                  if a[root] >= a[child]:
                      return
                  a[root], a[child] = a[child], a[root]
                  root = child

          for i in range(len(a) // 2 - 1, -1, -1):  # 建堆 O(n)
              sift_down(i, len(a))
          for end in range(len(a) - 1, 0, -1):
              a[0], a[end] = a[end], a[0]
              sift_down(0, end)
          return a
    `,
    cpp: code`
      void siftDown(vector<int>& a, int start, int end) {
          int root = start;
          while (2 * root + 1 < end) {
              int child = 2 * root + 1;
              if (child + 1 < end && a[child + 1] > a[child]) ++child;
              if (a[root] >= a[child]) return;
              swap(a[root], a[child]);
              root = child;
          }
      }

      void heapSort(vector<int>& a) {
          for (int i = (int) a.size() / 2 - 1; i >= 0; --i) siftDown(a, i, a.size());
          for (int end = (int) a.size() - 1; end > 0; --end) {
              swap(a[0], a[end]);
              siftDown(a, 0, end);
          }
      }
    `,
  },

  "algo-lower": {
    js: code`
      function lowerBound(a, target) {
        let lo = 0, hi = a.length;          // 半开区间 [lo, hi)
        while (lo < hi) {
          const mid = lo + ((hi - lo) >> 1);
          if (a[mid] < target) lo = mid + 1;
          else hi = mid;                     // 相等也往左收
        }
        return lo;                          // 第一个 >= target 的下标 / 插入点
      }
    `,
    ts: code`
      function lowerBound(a: number[], target: number): number {
        let lo = 0, hi = a.length;
        while (lo < hi) {
          const mid = lo + ((hi - lo) >> 1);
          if (a[mid] < target) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }
    `,
    java: code`
      static int lowerBound(int[] a, int target) {
          int lo = 0, hi = a.length;         // [lo, hi)
          while (lo < hi) {
              int mid = lo + (hi - lo) / 2;
              if (a[mid] < target) lo = mid + 1;
              else hi = mid;
          }
          return lo;                         // 第一个 >= target 的位置
      }
    `,
    python: code`
      def lower_bound(a, target):
          lo, hi = 0, len(a)               # 半开区间 [lo, hi)
          while lo < hi:
              mid = lo + (hi - lo) // 2
              if a[mid] < target:
                  lo = mid + 1
              else:                         # 相等也往左收
                  hi = mid
          return lo                         # 第一个 >= target 的下标 / 插入点
    `,
    cpp: code`
      int lowerBound(const vector<int>& a, int target) {
          int lo = 0, hi = (int) a.size();  // [lo, hi)
          while (lo < hi) {
              int mid = lo + (hi - lo) / 2;
              if (a[mid] < target) lo = mid + 1;
              else hi = mid;
          }
          return lo;
      }
    `,
  },
};
