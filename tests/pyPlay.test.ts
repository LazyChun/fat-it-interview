import { describe, expect, it } from "vitest";
import { DEFAULT_PY_SOURCE, readPyPlay } from "../src/blocks/pyPlay/defaultSource";
import { preparePySource } from "../src/blocks/pyPlay/prepare";
import { toPyRunResult } from "../src/blocks/pyPlay/runSandbox";

describe("preparePySource", () => {
  it("keeps Python source unchanged", () => {
    const source = "import os\nprint(os.name)\n";
    expect(preparePySource(source)).toBe(source);
  });

  it("rejects an empty file", () => {
    expect(() => preparePySource("  \n")).toThrow(/空/);
  });
});

describe("toPyRunResult", () => {
  it("keeps print logs and the return value from the host", () => {
    const result = toPyRunResult({
      isOk: true,
      data: {
        ok: true,
        result: { 北京: 160, 上海: 80 },
        logs: [{ level: "log", text: "{'北京': 160, '上海': 80}" }],
        error: "",
      },
    });
    expect(result.ok).toBe(true);
    expect(result.hasResult).toBe(true);
    expect(result.result).toEqual({ 北京: 160, 上海: 80 });
    expect(result.logs).toEqual([{ level: "log", text: "{'北京': 160, '上海': 80}" }]);
  });

  it("surfaces a host error", () => {
    const result = toPyRunResult({
      isOk: true,
      data: { ok: false, result: {}, logs: [], error: "timeout" },
    });
    expect(result).toMatchObject({ ok: false, error: "timeout", hasResult: false });
  });

  it("reports a missing interface", () => {
    expect(toPyRunResult({ isOk: false, message: "运行接口不可用" }).error).toBe("运行接口不可用");
  });
});

describe("readPyPlay", () => {
  it("falls back to the sample and the code-card style defaults", () => {
    expect(readPyPlay(undefined)).toMatchObject({
      source: DEFAULT_PY_SOURCE,
      theme: "dark",
      showConsole: true,
      consolePlacement: "bottom",
    });
    expect(DEFAULT_PY_SOURCE).toContain("return dict(totals)");
  });

  it("keeps a saved theme and console placement", () => {
    const play = readPyPlay({
      pyPlay: {
        source: "print(1)\n",
        theme: "light",
        showConsole: false,
        consolePlacement: "right",
      },
    });
    expect(play).toMatchObject({
      source: "print(1)\n",
      theme: "light",
      showConsole: false,
      consolePlacement: "right",
    });
  });
});
