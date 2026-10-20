import { algorithmQuestions } from "./algorithm";
import { backendQuestions } from "./backend";
import { childrenOf, getCategory } from "./categories";
import { databaseQuestions } from "./database";
import { frontendExtraQuestions } from "./frontend-extra";
import { frontendQuestions } from "./frontend";
import { javaQuestions } from "./java";
import { networkQuestions } from "./network";
import { osQuestions } from "./os";
import { opsQuestions } from "./ops";
import { TOPIC_OF } from "./topics";
import type { Question } from "./types";

export const QUESTIONS: Question[] = [
  ...frontendQuestions,
  ...frontendExtraQuestions,
  ...javaQuestions,
  ...backendQuestions,
  ...opsQuestions,
  ...algorithmQuestions,
  ...databaseQuestions,
  ...networkQuestions,
  ...osQuestions,
];

const byId = new Map<string, Question>();
for (const question of QUESTIONS) {
  if (byId.has(question.id)) {
    throw new Error(`重复的题目 id：${question.id}`);
  }
  byId.set(question.id, question);
}

export function getQuestion(id: string): Question | null {
  return byId.get(id) ?? null;
}

export function topicOf(question: Question): string {
  return TOPIC_OF[question.id] ?? question.category;
}

export function questionsByCategory(categoryId: string): Question[] {
  return questionsForNode(categoryId);
}

/** 父级返回其下全部题目，子级只返回挂在该节点上的题目。 */
export function questionsForNode(nodeId: string): Question[] {
  const node = getCategory(nodeId);
  if (!node) return [];
  if (node.parentId) {
    return QUESTIONS.filter((question) => topicOf(question) === nodeId);
  }
  const childIds = childrenOf(nodeId).map((child) => child.id);
  const grouped = childIds.flatMap((id) =>
    QUESTIONS.filter((question) => topicOf(question) === id),
  );
  const rest = QUESTIONS.filter(
    (question) => question.category === nodeId && !childIds.includes(topicOf(question)),
  );
  return [...grouped, ...rest];
}

export function neighbors(
  id: string,
  scopeId?: string,
): { prev: Question | null; next: Question | null } {
  const question = byId.get(id);
  if (!question) return { prev: null, next: null };
  const list = scopeId ? questionsForNode(scopeId) : questionsByCategory(question.category);
  const index = list.findIndex((item) => item.id === id);
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  };
}

/** 按本地日期稳定抽一道题，同一天打开结果不变。 */
export function dailyQuestion(now = new Date()): Question {
  const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 33 + key.charCodeAt(i)) >>> 0;
  }
  return QUESTIONS[hash % QUESTIONS.length];
}
