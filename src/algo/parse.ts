export interface ParseOpts {
  min?: number;
  max?: number;
  /** 要求正整数 */
  positive?: boolean;
}

export function parseNums(input: string, opts?: ParseOpts): number[] {
  const min = opts?.min ?? 2;
  const max = opts?.max ?? 12;
  const tokens = input
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (tokens.length < min) {
    throw new Error(`至少需要 ${min} 个数字`);
  }
  if (tokens.length > max) {
    throw new Error(`为便于演示，最多 ${max} 个数字`);
  }
  const nums = tokens.map((token) => Number(token));
  if (nums.some((n) => !Number.isFinite(n))) {
    throw new Error("包含无法解析的数字");
  }
  if (
    opts?.positive &&
    nums.some((n) => !Number.isInteger(n) || n < 1)
  ) {
    throw new Error("请填写正整数");
  }
  return nums;
}

/** 「数字列表 | 目标值」 */
export function parsePair(input: string): { nums: number[]; extra: number } {
  const parts = input.split("|").map((s) => s.trim());
  if (parts.length < 2 || !parts[1]) {
    throw new Error("格式：数字列表 | 目标值，例如 1,3,5,7 | 5");
  }
  const nums = parseNums(parts[0], { min: 1 });
  const extra = Number(parts[1]);
  if (!Number.isFinite(extra)) {
    throw new Error("竖线右侧不是数字");
  }
  return { nums, extra };
}
