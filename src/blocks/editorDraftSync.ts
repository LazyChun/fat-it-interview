/**
 * 外部回写的文本是否应该覆盖编辑器。
 *
 * 配置抽屉里的预览对整张卡片做了防抖。编辑器保存之后，上一拍的代码会晚一点送回来。
 * 这段文本如果就是刚提交的内容，而编辑器里已经又输入了字符，覆盖会把新字符删掉。
 */
export function shouldAdoptSavedText(
  incoming: string,
  draft: string,
  lastPersisted: string,
): boolean {
  if (incoming === draft) return false;
  if (incoming === lastPersisted) return false;
  return true;
}
