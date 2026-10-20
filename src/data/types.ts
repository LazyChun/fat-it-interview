export type Difficulty = "easy" | "medium" | "hard";

export type CategoryId =
  | "frontend"
  | "java"
  | "backend"
  | "ops"
  | "algorithm"
  | "database"
  | "network"
  | "os";

export type AnswerPart =
  | { type: "h"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; lang: string; code: string };

export interface Question {
  id: string;
  category: CategoryId;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  /** 面试官的问法 */
  prompt: string;
  parts: AnswerPart[];
  followUps?: string[];
  /** 对应 src/algo 里的演示 id */
  demoId?: string;
}

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; color: string }
> = {
  easy: { label: "简单", color: "green" },
  medium: { label: "中等", color: "gold" },
  hard: { label: "困难", color: "red" },
};
