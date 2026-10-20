import { CATEGORIES, childrenOf, type CategoryNode } from "./data/categories";

/** 侧边菜单的排序与显隐。空数组表示沿用题库默认顺序、全部显示。 */
export interface MenuPrefs {
  order: string[];
  hidden: string[];
  childOrder: Record<string, string[]>;
  childHidden: string[];
}

const KEY = "fat-it-interview.menu.v1";

const listeners = new Set<() => void>();
let cache: MenuPrefs | null = null;

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

function blank(): MenuPrefs {
  return { order: [], hidden: [], childOrder: {}, childHidden: [] };
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function normalizeMenuPrefs(raw: unknown): MenuPrefs {
  if (!raw || typeof raw !== "object") return blank();
  const data = raw as Partial<MenuPrefs>;
  const childOrder: Record<string, string[]> = {};
  if (data.childOrder && typeof data.childOrder === "object") {
    for (const [key, value] of Object.entries(data.childOrder)) {
      childOrder[key] = stringList(value);
    }
  }
  return {
    order: stringList(data.order),
    hidden: stringList(data.hidden),
    childOrder,
    childHidden: stringList(data.childHidden),
  };
}

export function getMenuPrefs(): MenuPrefs {
  if (cache) return cache;
  const box = storage();
  if (!box) {
    cache = blank();
    return cache;
  }
  try {
    cache = normalizeMenuPrefs(JSON.parse(box.getItem(KEY) || "null"));
  } catch {
    cache = blank();
  }
  return cache;
}

function commit(next: MenuPrefs): void {
  cache = next;
  const box = storage();
  if (box) {
    try {
      box.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 隐私模式等场景下写失败时只保留内存态 */
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeMenuPrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function sortByOrder<T extends { id: string }>(
  items: readonly T[],
  order: readonly string[],
): T[] {
  if (order.length === 0) return [...items];
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((left, right) => {
    const leftRank = rank.get(left.id);
    const rightRank = rank.get(right.id);
    if (leftRank === undefined && rightRank === undefined) return 0;
    if (leftRank === undefined) return 1;
    if (rightRank === undefined) return -1;
    return leftRank - rightRank;
  });
}

/** 已保存顺序在前，目录里新增的 id 补在末尾，丢掉已不存在的 id。 */
export function catalogOrder(catalogIds: readonly string[], saved: readonly string[]): string[] {
  const known = new Set(catalogIds);
  const next = saved.filter((id) => known.has(id));
  const seen = new Set(next);
  for (const id of catalogIds) {
    if (!seen.has(id)) next.push(id);
  }
  return next;
}

export function moveId(ids: readonly string[], id: string, delta: -1 | 1): string[] {
  const index = ids.indexOf(id);
  if (index < 0) return [...ids];
  return placeId(ids, id, index + delta);
}

/** 把 id 插到 toIndex。越界或原位不动时返回原顺序的副本。 */
export function placeId(ids: readonly string[], id: string, toIndex: number): string[] {
  const from = ids.indexOf(id);
  if (from < 0 || toIndex < 0 || toIndex >= ids.length || from === toIndex) return [...ids];
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(toIndex, 0, item);
  return next;
}

/**
 * 拖拽过程中列表不挪动，按每一项的垂直中心决定松手后的下标。
 * centers 与 ids 对齐，缺测的项用 NaN。
 */
export function dropIndex(
  ids: readonly string[],
  dragId: string,
  pointerY: number,
  centers: readonly number[],
): number {
  const from = ids.indexOf(dragId);
  if (from < 0) return -1;
  let sawCenter = false;
  for (let index = 0; index < ids.length; index += 1) {
    if (index === from) continue;
    const center = centers[index];
    if (Number.isNaN(center)) continue;
    sawCenter = true;
    if (pointerY < center) return from < index ? index - 1 : index;
  }
  return sawCenter ? ids.length - 1 : from;
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function orderedCategories(prefs: MenuPrefs): CategoryNode[] {
  return sortByOrder(CATEGORIES, prefs.order);
}

export function orderedChildren(parentId: string, prefs: MenuPrefs): CategoryNode[] {
  return sortByOrder(childrenOf(parentId), prefs.childOrder[parentId] ?? []);
}

export function visibleCategories(prefs: MenuPrefs): CategoryNode[] {
  const hidden = new Set(prefs.hidden);
  return orderedCategories(prefs).filter((item) => !hidden.has(item.id));
}

export function visibleChildren(parentId: string, prefs: MenuPrefs): CategoryNode[] {
  const hidden = new Set(prefs.childHidden);
  return orderedChildren(parentId, prefs).filter((item) => !hidden.has(item.id));
}

export function isDefaultMenuPrefs(prefs: MenuPrefs): boolean {
  return (
    prefs.order.length === 0 &&
    prefs.hidden.length === 0 &&
    prefs.childHidden.length === 0 &&
    Object.keys(prefs.childOrder).length === 0
  );
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function toggleCategoryHidden(id: string): void {
  const current = getMenuPrefs();
  commit({ ...current, hidden: toggle(current.hidden, id) });
}

export function reorderCategory(id: string, toIndex: number): void {
  const current = getMenuPrefs();
  const order = catalogOrder(
    CATEGORIES.map((item) => item.id),
    current.order,
  );
  const next = placeId(order, id, toIndex);
  if (sameIds(order, next)) return;
  commit({ ...current, order: next });
}

export function moveCategory(id: string, delta: -1 | 1): void {
  const order = catalogOrder(
    CATEGORIES.map((item) => item.id),
    getMenuPrefs().order,
  );
  const index = order.indexOf(id);
  if (index < 0) return;
  reorderCategory(id, index + delta);
}

export function toggleChildHidden(id: string): void {
  const current = getMenuPrefs();
  commit({ ...current, childHidden: toggle(current.childHidden, id) });
}

export function reorderChild(parentId: string, id: string, toIndex: number): void {
  const current = getMenuPrefs();
  const order = catalogOrder(
    childrenOf(parentId).map((item) => item.id),
    current.childOrder[parentId] ?? [],
  );
  const next = placeId(order, id, toIndex);
  if (sameIds(order, next)) return;
  commit({
    ...current,
    childOrder: { ...current.childOrder, [parentId]: next },
  });
}

export function moveChild(parentId: string, id: string, delta: -1 | 1): void {
  const order = catalogOrder(
    childrenOf(parentId).map((item) => item.id),
    getMenuPrefs().childOrder[parentId] ?? [],
  );
  const index = order.indexOf(id);
  if (index < 0) return;
  reorderChild(parentId, id, index + delta);
}

export function resetMenuPrefs(): void {
  commit(blank());
}
