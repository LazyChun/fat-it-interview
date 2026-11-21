/**
 * 把 lodash 的类型交给 Monaco，这样 import 和全局 _ 会有补全。
 */
import type { Monaco } from "@monaco-editor/react";
import { editorLibs } from "../reactPlay/generated/editorLibs";

let registered = false;

const LODASH_GLOBAL = `declare const _: _.LoDashStatic;\n`;

export function configureJsPlayMonaco(monacoNs: Monaco): void {
  const typescript = monacoNs.languages.typescript;
  if (!typescript?.javascriptDefaults) return;
  const defaults = typescript.javascriptDefaults;
  try {
    defaults.setCompilerOptions({
      target: typescript.ScriptTarget.ESNext,
      module: typescript.ModuleKind.ESNext,
      moduleResolution: typescript.ModuleResolutionKind.NodeJs,
      lib: ["esnext", "dom"],
      allowJs: true,
      checkJs: false,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      noEmit: true,
    });
    if (registered) return;
    registered = true;
    for (const lib of editorLibs) {
      if (!lib.path.includes("@types/lodash/")) continue;
      defaults.addExtraLib(lib.content, lib.path);
    }
    defaults.addExtraLib(LODASH_GLOBAL, "file:///js-play/lodash-global.d.ts");
  } catch (error) {
    registered = false;
    console.error(error);
  }
}
