import { describe, expect, it } from "vitest";
import { prepareJsSource } from "../src/blocks/jsPlay/prepare";
import { executionOf } from "../src/blocks/jsPlay/snippetStore";
import { prepareReactSource } from "../src/blocks/reactPlay/prepare";
import { prepareVueSource } from "../src/blocks/vuePlay/prepare";
import { QUESTIONS, getQuestion } from "../src/data/questions";
import type { Question } from "../src/data/types";

async function runJs(question: Question): Promise<string[]> {
  const part = question.parts.find((item) => item.type === "code" && item.lang === "js");
  if (!part || part.type !== "code") throw new Error("missing js");
  const logs: string[] = [];
  const consoleMock = {
    log: (...args: unknown[]) => logs.push(args.map((item) => String(item)).join(" ")),
  };
  await new Function("_", "console", prepareJsSource(part.code))({}, consoleMock);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return logs;
}

describe("answer snippets that can be executed", () => {
  it("compiles javascript, react and vue samples", async () => {
    const failures: string[] = [];
    for (const question of QUESTIONS) {
      for (const part of question.parts) {
        if (part.type !== "code") continue;
        const kind = executionOf(part.lang);
        if (!kind) continue;
        try {
          if (kind === "js") prepareJsSource(part.code);
          else if (kind === "react") prepareReactSource(part.code);
          else await prepareVueSource(part.code);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("可以 import")) continue;
          failures.push(`${question.id} [${part.lang}] ${message.split("\n")[0]}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("prints the classic async order", async () => {
    const question = getQuestion("fe-js-async-order");
    expect(question).not.toBeNull();
    const logs = await runJs(question as Question);
    expect(logs).toEqual([
      "script start",
      "async2 end",
      "promise",
      "script end",
      "async1 end",
      "promise1",
      "promise2",
      "setTimeout",
    ]);
  });
});
