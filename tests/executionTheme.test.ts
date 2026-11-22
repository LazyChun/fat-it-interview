import { describe, expect, it } from "vitest";
import {
  readExecutionConsolePlacement,
  readExecutionDisplayMode,
  readExecutionTheme,
} from "../src/executionTheme";

describe("execution block prefs", () => {
  it("defaults to light and only accepts dark as the other choice", () => {
    expect(readExecutionTheme(null)).toBe("light");
    expect(readExecutionTheme("")).toBe("light");
    expect(readExecutionTheme("light")).toBe("light");
    expect(readExecutionTheme("dark")).toBe("dark");
    expect(readExecutionTheme("blue")).toBe("light");
  });

  it("defaults the console to the bottom and only accepts the right side as the other choice", () => {
    expect(readExecutionConsolePlacement(null)).toBe("bottom");
    expect(readExecutionConsolePlacement("bottom")).toBe("bottom");
    expect(readExecutionConsolePlacement("right")).toBe("right");
    expect(readExecutionConsolePlacement("left")).toBe("bottom");
  });

  it("defaults code samples to the read-only view and only accepts the execution block as the other choice", () => {
    expect(readExecutionDisplayMode(null)).toBe("code");
    expect(readExecutionDisplayMode("")).toBe("code");
    expect(readExecutionDisplayMode("code")).toBe("code");
    expect(readExecutionDisplayMode("block")).toBe("block");
    expect(readExecutionDisplayMode("card")).toBe("code");
  });
});
