/** 沙箱执行前的检查。Python 源码原样运行，不改写 import。 */
const EMPTY_SOURCE = "代码是空的";

export function preparePySource(source: string): string {
  if (!source.trim()) {
    throw new Error(EMPTY_SOURCE);
  }
  return source;
}
