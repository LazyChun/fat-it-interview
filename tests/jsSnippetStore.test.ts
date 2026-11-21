import { beforeEach, describe, expect, it } from "vitest";
import {
  JS_SNIPPET_CONFIG_KEY,
  commitSnippet,
  loadSnippet,
  resetSnippetStorageQueueForTests,
  type SnippetConfigApi,
} from "../src/blocks/jsPlay/snippetStorage";
import {
  JS_SNIPPET_HISTORY_LIMIT,
  activeSource,
  appendSave,
  applyRevision,
  clearSavedSource,
  emptySnippetFile,
  executionOf,
  isJavaScriptLang,
  parseSnippetFile,
  removeRevision,
} from "../src/blocks/jsPlay/snippetStore";

function memoryConfig(initial: Record<string, unknown> = {}): {
  api: SnippetConfigApi;
  read: () => Record<string, unknown>;
} {
  let data = { ...initial };
  return {
    read: () => data,
    api: {
      async get<T>() {
        return data as T;
      },
      async set<T>(config: T, options?: { merge?: boolean }) {
        const incoming = (config ?? {}) as Record<string, unknown>;
        data = options?.merge === false ? { ...incoming } : { ...data, ...incoming };
        return data as T;
      },
    },
  };
}

describe("javascript snippet history", () => {
  beforeEach(() => {
    resetSnippetStorageQueueForTests();
  });

  it("treats js and javascript as runnable", () => {
    expect(isJavaScriptLang("js")).toBe(true);
    expect(isJavaScriptLang("JavaScript")).toBe(true);
    expect(isJavaScriptLang("ts")).toBe(true);
    expect(isJavaScriptLang("python")).toBe(false);
    expect(executionOf("tsx")).toBe("react");
    expect(executionOf("vue")).toBe("vue");
    expect(executionOf("typescript")).toBe("js");
    expect(executionOf("css")).toBeNull();
  });

  it("saves a revision, restores it, then drops it", () => {
    const first = appendSave(emptySnippetFile(), "fe-event-loop#1", "console.log(1)", 10, "r1");
    expect(first.added).toBe(true);
    const second = appendSave(first.file, "fe-event-loop#1", "console.log(2)", 20, "r2");
    expect(second.file.snippets["fe-event-loop#1"].history.map((item) => item.id)).toEqual([
      "r2",
      "r1",
    ]);
    expect(activeSource(second.file.snippets["fe-event-loop#1"], "default")).toBe("console.log(2)");

    const duplicated = appendSave(second.file, "fe-event-loop#1", "console.log(2)", 30, "r3");
    expect(duplicated.added).toBe(false);
    expect(duplicated.file.snippets["fe-event-loop#1"].history).toHaveLength(2);

    const restored = applyRevision(second.file, "fe-event-loop#1", "r1");
    expect(restored.snippets["fe-event-loop#1"].source).toBe("console.log(1)");
    expect(restored.snippets["fe-event-loop#1"].history).toHaveLength(2);

    const removed = removeRevision(restored, "fe-event-loop#1", "r2");
    expect(removed.snippets["fe-event-loop#1"].history.map((item) => item.id)).toEqual(["r1"]);
    expect(removed.snippets["fe-event-loop#1"].source).toBe("console.log(1)");
  });

  it("clears the saved source and keeps history so the card can return to the question", () => {
    const saved = appendSave(emptySnippetFile(), "q", "edited", 1, "r1").file;
    const cleared = clearSavedSource(saved, "q");
    expect(cleared.snippets.q.source).toBeUndefined();
    expect(activeSource(cleared.snippets.q, "console.log(1)")).toBe("console.log(1)");
    expect(cleared.snippets.q.history).toHaveLength(1);
    expect(saved.snippets.q.source).toBe("edited");
  });

  it("drops the oldest revision after the history limit", () => {
    let file = emptySnippetFile();
    for (let index = 0; index < JS_SNIPPET_HISTORY_LIMIT + 1; index += 1) {
      file = appendSave(file, "q", `line ${index}`, index, `id-${index}`).file;
    }
    const history = file.snippets.q.history;
    expect(history).toHaveLength(JS_SNIPPET_HISTORY_LIMIT);
    expect(history[0].id).toBe(`id-${JS_SNIPPET_HISTORY_LIMIT}`);
    expect(history.some((item) => item.id === "id-0")).toBe(false);
  });

  it("ignores broken history rows when reading a saved file", () => {
    const file = parseSnippetFile({
      snippets: {
        "q#1": {
          source: "ok",
          history: [
            { id: "good", savedAt: 5, source: "ok" },
            { id: "", savedAt: 4, source: "x" },
            { savedAt: 3, source: "x" },
            "nope",
          ],
        },
        blank: { history: [] },
      },
    });
    expect(file.snippets["q#1"].history).toEqual([{ id: "good", savedAt: 5, source: "ok" }]);
    expect(file.snippets.blank).toBeUndefined();
  });

  it("writes each snippet onto disk without dropping the other or unrelated config", async () => {
    const box = memoryConfig({ theme: "dark" });
    await Promise.all([
      commitSnippet(box.api, "a", (file) => appendSave(file, "a", "A", 1, "a1").file),
      commitSnippet(box.api, "b", (file) => appendSave(file, "b", "B", 2, "b1").file),
    ]);
    expect(box.read().theme).toBe("dark");
    const stored = parseSnippetFile(box.read()[JS_SNIPPET_CONFIG_KEY]);
    expect(stored.snippets.a.source).toBe("A");
    expect(stored.snippets.b.source).toBe("B");
    expect((await loadSnippet(box.api, "a")).history[0].id).toBe("a1");
  });

  it("leaves the previous file in place when the disk write fails", async () => {
    const box = memoryConfig();
    await commitSnippet(box.api, "a", (file) => appendSave(file, "a", "A", 1, "a1").file);
    box.api.set = async () => {
      throw new Error("disk");
    };
    await expect(
      commitSnippet(box.api, "a", (file) => appendSave(file, "a", "B", 2, "a2").file),
    ).rejects.toThrow("disk");
    expect((await loadSnippet(box.api, "a")).source).toBe("A");
  });
});
