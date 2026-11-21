import { useEffect, useReducer, useState } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { getCodeLang, subscribeCodeLang } from "./codeLang";
import type { CodeLang } from "./data/codeSamples";
import {
  getExecutionConsolePlacement,
  getExecutionTheme,
  subscribeExecutionConsolePlacement,
  subscribeExecutionTheme,
  type ExecutionConsolePlacement,
  type ExecutionTheme,
} from "./executionTheme";
import { getMenuPrefs, subscribeMenuPrefs, type MenuPrefs } from "./menuPrefs";
import { subscribeProgress } from "./progress";

export function useTick(): number {
  const [tick, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => subscribeProgress(() => bump()), []);
  return tick;
}

export function useMenuPrefs(): MenuPrefs {
  const [prefs, setPrefs] = useState<MenuPrefs>(() => getMenuPrefs());
  useEffect(() => subscribeMenuPrefs(() => setPrefs(getMenuPrefs())), []);
  return prefs;
}

/** 当前代码块语言，任意一处切换后所有代码块同步刷新。 */
export function useCodeLang(): CodeLang {
  const [lang, setLang] = useState<CodeLang>(() => getCodeLang());
  useEffect(() => subscribeCodeLang(() => setLang(getCodeLang())), []);
  return lang;
}

/** 执行块深浅色。菜单里改一次，已经打开的执行块一起变。 */
export function useExecutionTheme(): ExecutionTheme {
  const [theme, setTheme] = useState<ExecutionTheme>(() => getExecutionTheme());
  useEffect(() => subscribeExecutionTheme(() => setTheme(getExecutionTheme())), []);
  return theme;
}

/** 执行块控制台在下方还是右侧。 */
export function useExecutionConsolePlacement(): ExecutionConsolePlacement {
  const [placement, setPlacement] = useState<ExecutionConsolePlacement>(() =>
    getExecutionConsolePlacement(),
  );
  useEffect(
    () => subscribeExecutionConsolePlacement(() => setPlacement(getExecutionConsolePlacement())),
    [],
  );
  return placement;
}

export function useRouteTick(sdk: FatNotesPluginSDK): number {
  const [tick, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const sub = sdk.router.onChange(() => bump());
    return () => sub.dispose();
  }, [sdk]);
  return tick;
}
