const KEY = "fat-it-interview.progress.v1";

export interface ProgressState {
  mastered: string[];
  review: string[];
  practiceMode: boolean;
  lastQuestionId?: string;
}

const EMPTY: ProgressState = {
  mastered: [],
  review: [],
  practiceMode: true,
};

const listeners = new Set<() => void>();
let cache: ProgressState | null = null;

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

function normalize(raw: unknown): ProgressState {
  if (!raw || typeof raw !== "object") return { ...EMPTY, mastered: [], review: [] };
  const data = raw as Partial<ProgressState>;
  return {
    mastered: Array.isArray(data.mastered)
      ? data.mastered.filter((id) => typeof id === "string")
      : [],
    review: Array.isArray(data.review)
      ? data.review.filter((id) => typeof id === "string")
      : [],
    practiceMode: data.practiceMode !== false,
    lastQuestionId:
      typeof data.lastQuestionId === "string" ? data.lastQuestionId : undefined,
  };
}

export function getProgress(): ProgressState {
  if (cache) return cache;
  const box = storage();
  if (!box) {
    cache = { ...EMPTY, mastered: [], review: [] };
    return cache;
  }
  try {
    cache = normalize(JSON.parse(box.getItem(KEY) || "null"));
  } catch {
    cache = { ...EMPTY, mastered: [], review: [] };
  }
  return cache;
}

function commit(next: ProgressState): void {
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

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isMastered(id: string): boolean {
  return getProgress().mastered.includes(id);
}

export function isReview(id: string): boolean {
  return getProgress().review.includes(id);
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function toggleMastered(id: string): void {
  const current = getProgress();
  commit({ ...current, mastered: toggle(current.mastered, id) });
}

export function toggleReview(id: string): void {
  const current = getProgress();
  commit({ ...current, review: toggle(current.review, id) });
}

export function setPracticeMode(practiceMode: boolean): void {
  commit({ ...getProgress(), practiceMode });
}

export function rememberQuestion(id: string): void {
  const current = getProgress();
  if (current.lastQuestionId === id) return;
  commit({ ...current, lastQuestionId: id });
}
