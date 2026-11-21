/**
 * 把题目 JavaScript 卡片的当前内容和历史写进宿主插件配置。
 * 宿主按插件做顶层浅合并，整份 jsSnippetPlays 一起替换，并串行读写，避免两次保存互相覆盖。
 */
import type { FatNotesPluginSDK } from "fat-notes-sdk";
import {
  parseSnippetFile,
  recordOf,
  type JsSnippetFile,
  type JsSnippetRecord,
} from "./snippetStore";

export const JS_SNIPPET_CONFIG_KEY = "jsSnippetPlays";

export interface SnippetConfigApi {
  get<T = Record<string, unknown>>(): Promise<T>;
  set<T = Record<string, unknown>>(
    config: T,
    options?: { merge?: boolean },
  ): Promise<T>;
}

let pending: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = pending.then(task, task);
  pending = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readFile(config: SnippetConfigApi): Promise<JsSnippetFile> {
  const data = await config.get<Record<string, unknown>>();
  return parseSnippetFile(data?.[JS_SNIPPET_CONFIG_KEY]);
}

export async function loadSnippet(
  config: SnippetConfigApi,
  id: string,
): Promise<JsSnippetRecord> {
  return enqueue(async () => recordOf(await readFile(config), id));
}

export async function commitSnippet(
  config: SnippetConfigApi,
  id: string,
  mutate: (file: JsSnippetFile) => JsSnippetFile,
): Promise<JsSnippetRecord> {
  return enqueue(async () => {
    const current = await readFile(config);
    const next = mutate(current);
    await config.set({ [JS_SNIPPET_CONFIG_KEY]: next }, { merge: true });
    return recordOf(next, id);
  });
}

export function resetSnippetStorageQueueForTests(): void {
  pending = Promise.resolve();
}

export function snippetConfigOf(sdk: FatNotesPluginSDK): SnippetConfigApi {
  return sdk.config;
}
