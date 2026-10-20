import { getCategory } from "./data/categories";
import { getQuestion } from "./data/questions";

export const ROUTE_PREFIX = "/it-interview";

export function homePath(): string {
  return ROUTE_PREFIX;
}

export function categoryPath(categoryId: string): string {
  return `${ROUTE_PREFIX}/c/${categoryId}`;
}

export function questionPath(questionId: string): string {
  return `${ROUTE_PREFIX}/q/${questionId}`;
}

export function scopedQuestionPath(nodeId: string, questionId: string): string {
  return `${categoryPath(nodeId)}/q/${questionId}`;
}

export type InterviewRoute =
  | { kind: "home" }
  | { kind: "category"; categoryId: string; questionId?: string }
  | { kind: "question"; questionId: string }
  | { kind: "foreign" };

export function parseRoute(path: string): InterviewRoute {
  if (!path) return { kind: "foreign" };
  if (path === ROUTE_PREFIX || path === `${ROUTE_PREFIX}/`) {
    return { kind: "home" };
  }
  if (path.startsWith(`${ROUTE_PREFIX}/c/`)) {
    const rest = path.slice(`${ROUTE_PREFIX}/c/`.length);
    const [categoryId, questionMark, questionId] = rest.split("/");
    if (!getCategory(categoryId)) return { kind: "foreign" };
    if (!questionMark) return { kind: "category", categoryId };
    if (questionMark === "q" && questionId && getQuestion(questionId)) {
      return { kind: "category", categoryId, questionId };
    }
    return { kind: "foreign" };
  }
  if (path.startsWith(`${ROUTE_PREFIX}/q/`)) {
    const questionId = path.slice(`${ROUTE_PREFIX}/q/`.length);
    return getQuestion(questionId)
      ? { kind: "question", questionId }
      : { kind: "foreign" };
  }
  return { kind: "foreign" };
}
