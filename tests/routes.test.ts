import { describe, expect, it } from "vitest";
import { getQuestion } from "../src/data/questions";
import {
  categoryPath,
  homePath,
  parseRoute,
  questionPath,
  scopedQuestionPath,
} from "../src/routes";

describe("routes", () => {
  it("parses home, category and question paths", () => {
    expect(parseRoute(homePath()).kind).toBe("home");
    expect(parseRoute(categoryPath("fe-react"))).toEqual({
      kind: "category",
      categoryId: "fe-react",
    });
    expect(parseRoute(scopedQuestionPath("fe-react", "fe-fiber"))).toEqual({
      kind: "category",
      categoryId: "fe-react",
      questionId: "fe-fiber",
    });
    const question = getQuestion("fe-event-loop");
    expect(question).not.toBeNull();
    expect(parseRoute(questionPath("fe-event-loop"))).toEqual({
      kind: "question",
      questionId: "fe-event-loop",
    });
    expect(parseRoute("/tools/json").kind).toBe("foreign");
    expect(parseRoute(categoryPath("nope")).kind).toBe("foreign");
    expect(parseRoute(questionPath("missing")).kind).toBe("foreign");
  });
});
