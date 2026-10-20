import { useEffect, useReducer, useState } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
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

export function useRouteTick(sdk: FatNotesPluginSDK): number {
  const [tick, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const sub = sdk.router.onChange(() => bump());
    return () => sub.dispose();
  }, [sdk]);
  return tick;
}
