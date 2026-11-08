# fat-it-interview

给 FatNotes 用的 IT 面试题库插件。题目和参考答案都在前端里，算法题可以逐步播放。不带 Python 后端。

## 题库

- Web 前端、Java、后端、运维、算法、数据库、计算机网络、操作系统
- 练习模式先隐藏答案，可以标记掌握和复习。记录写在本机 `localStorage`
- 左侧搜索能跨分类找题，宿主全局搜索也能直达

## 算法演示

冒泡、选择、插入、快排、归并、堆排、二分与左边界、双指针、滑动窗口、移动零、BFS、DFS、反转链表、判环、0/1 背包、爬楼梯、最大子数组和、最长公共子序列、中序与层序。可以改输入、单步、调速度。

## 代码示例

算法分类的 21 道题都带 JavaScript / TypeScript / Java / Python / C++ / Go / Rust 七种参考实现。答案末尾的代码块头部可以直接切换语言，练习页按钮行还有全局「代码语言」切换：切一次，所有题目同步生效，选择记在本机 `localStorage`。复制代码块、复制答案都只复制当前选中的语言。

前五种语言按题型放在 `src/data/algorithmCode.{sort,struct,dp}.ts`，Go / Rust 各自一份 `algorithmCode.go.ts` / `algorithmCode.rust.ts`，由 `algorithmCode.ts` 汇总并校验题目齐全；语言定义、顺序和缺失兜底在 `src/data/codeSamples.ts`。Monaco 的语言列表里注册了 `cpp` / `go` / `rust`，三者都有语法高亮。Java 片段默认写在类里、标准库已导入；C++ 片段按 C++17、默认已有常用头文件和 `using namespace std`；Go 片段只用到标准库，Rust 片段按 Rust 2021、只依赖标准库。

## 在 FatNotes 里的位置

和 `fat-tools` 一样走宿主的插件贡献点：

- 活动栏「IT 面试」
- 主侧边栏：分类和搜索
- 工作台整页：总览和做题
- 仪表盘卡片：「今日面试题」「算法演示」（分类「其他」，不占用查询配置）
- 本插件页激活时请求隐藏右侧次侧栏和底部面板

`plugin.json` 的 `id` / `mfName` 要和宿主加载的 Module Federation 名称一致。当前 id 是 `7e2c9a14-6b58-4f3d-a1e0-9c8d4b7f2a61`。

## 开发

```bash
npm install
npm test
npm run typecheck
npm run build
```

开发模式把宿主里的 `devPath` 指到本目录的 `dist`（`remoteEntry.js` 在这里，`plugin.json` 在上一级）。改完源码后重新构建，宿主会按文件时间重新加载。
