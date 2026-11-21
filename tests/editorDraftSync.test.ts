import { describe, expect, it } from "vitest";
import { shouldAdoptSavedText } from "../src/blocks/editorDraftSync";

describe("shouldAdoptSavedText", () => {
  it("keeps the editor when the drawer echoes the text just saved", () => {
    const saved = "const name = 'B'";
    const typed = "const name = 'Bu'";
    expect(shouldAdoptSavedText(saved, typed, saved)).toBe(false);
  });

  it("does nothing when the echo already matches the editor", () => {
    const text = "const name = 'Bu'";
    expect(shouldAdoptSavedText(text, text, text)).toBe(false);
  });

  it("adopts a source that did not come from this editor", () => {
    expect(shouldAdoptSavedText("reset()", "const name = 'Bu'", "const name = 'B'")).toBe(true);
  });
});
