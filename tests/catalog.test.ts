import { describe, expect, it } from "vitest";
import { DEMOS, getDemo } from "../src/algo/registry";
import { childrenOf, CATEGORIES } from "../src/data/categories";
import { QUESTIONS, dailyQuestion, getQuestion, questionsForNode, topicOf } from "../src/data/questions";
import type { CategoryId } from "../src/data/types";

const CATEGORY_IDS = new Set(CATEGORIES.map((item) => item.id));

describe("question bank", () => {
  it("has a unique id and a real category for every question", () => {
    const ids = new Set<string>();
    expect(QUESTIONS.length).toBe(277);
    for (const question of QUESTIONS) {
      expect(ids.has(question.id)).toBe(false);
      ids.add(question.id);
      expect(CATEGORY_IDS.has(question.category)).toBe(true);
      expect(question.title.trim().length).toBeGreaterThan(0);
      expect(question.prompt.trim().length).toBeGreaterThan(0);
      expect(question.parts.length).toBeGreaterThan(0);
      expect(question.tags.length).toBeGreaterThan(0);
      const topicId = topicOf(question);
      const topic = childrenOf(question.category).find((node) => node.id === topicId);
      expect(topic?.parentId).toBe(question.category);
    }
  });

  it("gives Web 前端 the requested child topics", () => {
    expect(childrenOf("frontend").map((node) => node.title)).toEqual([
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Redux",
      "Zustand",
      "Vue",
      "Webpack",
      "浏览器",
      "TypeScript",
      "性能优化",
      "手写题",
      "工程化",
      "Web 安全",
      "AI 工程",
    ]);
    for (const child of childrenOf("frontend")) {
      expect(questionsForNode(child.id).length).toBeGreaterThan(0);
    }
  });

  it("covers every category with at least 8 questions", () => {
    for (const category of CATEGORIES) {
      const count = QUESTIONS.filter((item) => item.category === category.id).length;
      expect(count).toBeGreaterThanOrEqual(8);
    }
  });

  it("only references demos that exist", () => {
    const demoIds = new Set(DEMOS.map((demo) => demo.id));
    const linked = QUESTIONS.filter((item) => item.demoId);
    expect(linked.length).toBe(DEMOS.length);
    for (const question of linked) {
      expect(demoIds.has(question.demoId ?? "")).toBe(true);
      expect(question.category).toBe("algorithm" satisfies CategoryId);
    }
  });

  it("keeps the daily question stable for a given date", () => {
    const day = new Date(2026, 9, 20);
    expect(dailyQuestion(day).id).toBe(dailyQuestion(day).id);
    expect(getQuestion(dailyQuestion(day).id)).not.toBeNull();
  });
});

describe("demo registry", () => {
  it("runs every default input without throwing", () => {
    for (const demo of DEMOS) {
      const frames = demo.run(demo.defaultInput);
      expect(frames.length).toBeGreaterThan(1);
      expect(frames[0].caption.length).toBeGreaterThan(0);
      expect(getDemo(demo.id)?.title).toBe(demo.title);
    }
  });
});
