/**
 * 把 react、react-dom、lodash、antd 的类型交给 Monaco，
 * 这样预览里写 import 和调用时能弹出补全。
 */
import type { Monaco } from "@monaco-editor/react";
import { editorLibs } from "./generated/editorLibs";

let registered = false;

export function configureReactPlayMonaco(monacoNs: Monaco): void {
  const typescript = monacoNs.languages.typescript;
  if (!typescript?.typescriptDefaults) return;
  const defaults = typescript.typescriptDefaults;
  try {
    defaults.setCompilerOptions({
      target: typescript.ScriptTarget.ESNext,
      jsx: typescript.JsxEmit.React,
      module: typescript.ModuleKind.ESNext,
      moduleResolution: typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    });
    if (registered) return;
    registered = true;
    for (const lib of editorLibs) {
      defaults.addExtraLib(lib.content, lib.path);
    }
  } catch (error) {
    registered = false;
    console.error(error);
  }
}
