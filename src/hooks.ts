import { useEffect, useReducer } from "react";
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import { subscribeProgress } from "./progress";

export function useTick(): number {
  const [tick, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => subscribeProgress(() => bump()), []);
  return tick;
}

export function useRouteTick(sdk: FatNotesPluginSDK): number {
  const [tick, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const sub = sdk.router.onChange(() => bump());
    return () => sub.dispose();
  }, [sdk]);
  return tick;
}
