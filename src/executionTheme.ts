/**
 * 题目里执行块的外观：深浅色和控制台位置。记在本机，和宿主主题无关。
 */

export type ExecutionTheme = "light" | "dark";
export type ExecutionConsolePlacement = "bottom" | "right";

const THEME_KEY = "fat-it-interview.executionTheme.v1";
const PLACEMENT_KEY = "fat-it-interview.executionConsole.v1";
const DEFAULT_THEME: ExecutionTheme = "light";
const DEFAULT_PLACEMENT: ExecutionConsolePlacement = "bottom";

const themeListeners = new Set<() => void>();
const placementListeners = new Set<() => void>();
let themeCache: ExecutionTheme | null = null;
let placementCache: ExecutionConsolePlacement | null = null;

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function readExecutionTheme(raw: string | null): ExecutionTheme {
  return raw === "dark" ? "dark" : DEFAULT_THEME;
}

export function readExecutionConsolePlacement(raw: string | null): ExecutionConsolePlacement {
  return raw === "right" ? "right" : DEFAULT_PLACEMENT;
}

export function getExecutionTheme(): ExecutionTheme {
  if (themeCache) return themeCache;
  const box = storage();
  themeCache = readExecutionTheme(box ? box.getItem(THEME_KEY) : null);
  return themeCache;
}

export function setExecutionTheme(theme: ExecutionTheme): void {
  if (theme !== "dark" && theme !== "light") return;
  if (getExecutionTheme() === theme) return;
  themeCache = theme;
  const box = storage();
  if (box) {
    try {
      box.setItem(THEME_KEY, theme);
    } catch {
      /* 隐私模式等场景下写失败时只保留内存态 */
    }
  }
  themeListeners.forEach((listener) => listener());
}

export function subscribeExecutionTheme(listener: () => void): () => void {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

export function getExecutionConsolePlacement(): ExecutionConsolePlacement {
  if (placementCache) return placementCache;
  const box = storage();
  placementCache = readExecutionConsolePlacement(box ? box.getItem(PLACEMENT_KEY) : null);
  return placementCache;
}

export function setExecutionConsolePlacement(placement: ExecutionConsolePlacement): void {
  if (placement !== "bottom" && placement !== "right") return;
  if (getExecutionConsolePlacement() === placement) return;
  placementCache = placement;
  const box = storage();
  if (box) {
    try {
      box.setItem(PLACEMENT_KEY, placement);
    } catch {
      /* 隐私模式等场景下写失败时只保留内存态 */
    }
  }
  placementListeners.forEach((listener) => listener());
}

export function subscribeExecutionConsolePlacement(listener: () => void): () => void {
  placementListeners.add(listener);
  return () => placementListeners.delete(listener);
}

const editorThemeResets = new Set<() => void>();

/** 执行块卸下后，让页面上其它只读代码块把自己的主题设回去。 */
export function subscribeEditorThemeReset(listener: () => void): () => void {
  editorThemeResets.add(listener);
  return () => editorThemeResets.delete(listener);
}

export function resetEditorThemeOwners(): void {
  editorThemeResets.forEach((listener) => listener());
}
