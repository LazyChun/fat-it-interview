import { DP_CODE } from "./algorithmCode.dp";
import { GO_CODE } from "./algorithmCode.go";
import { RUST_CODE } from "./algorithmCode.rust";
import { SORT_CODE } from "./algorithmCode.sort";
import { STRUCT_CODE } from "./algorithmCode.struct";
import type { BaseCodeSamples, CodeSamples } from "./codeSamples";

/**
 * 题目 id → 七种语言参考实现。
 * 前五种按题型拆在三个文件，Go / Rust 按语言各一份，这里汇总并校验齐全。
 */
const BASE: Record<string, BaseCodeSamples> = {
  ...SORT_CODE,
  ...STRUCT_CODE,
  ...DP_CODE,
};

function mergeSamples(): Record<string, CodeSamples> {
  const all: Record<string, CodeSamples> = {};
  for (const [id, samples] of Object.entries(BASE)) {
    const go = GO_CODE[id];
    const rust = RUST_CODE[id];
    if (!go || !rust) {
      throw new Error(`缺少 Go / Rust 代码示例：${id}`);
    }
    all[id] = { ...samples, go, rust };
  }
  // 多出来的 key 说明题目被删了或者 id 写错，早一点暴露
  for (const id of new Set([...Object.keys(GO_CODE), ...Object.keys(RUST_CODE)])) {
    if (!all[id]) {
      throw new Error(`代码示例对应的题目不存在：${id}`);
    }
  }
  return all;
}

export const ALGORITHM_CODE: Record<string, CodeSamples> = mergeSamples();
