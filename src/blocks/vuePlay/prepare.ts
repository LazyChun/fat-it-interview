/**
 * 把用户写下的 Vue 3 代码编成可在沙箱里 new Function 的函数体。
 * 函数参数是 Vue 和 lodash。ant-design-vue 用沙箱里的全局 antd。返回一个组件对象或函数。
 * 单文件组件在这里编译；<script setup> 的模板会内联进 setup。
 */
import {
  compileScript,
  compileStyle,
  compileTemplate,
  parse,
  rewriteDefault,
  type SFCDescriptor,
} from "@vue/compiler-sfc";
import { transform } from "sucrase";
import { compileLess } from "../reactPlay/compileLess";

const EMPTY_SOURCE = "代码是空的";
const MISSING_COMPONENT = "请用 <script setup> 或 export default 导出一个组件";
const SUPPORTED_IMPORT = '预览里可以 import "vue"、"lodash" 和 "ant-design-vue"';
const FILENAME = "App.vue";
const SCOPE_ID = "fatvue";
const SCOPE_ATTR = "data-v-fatvue";

const IMPORT_FROM = /import\s*(type\s+)?([\s\S]*?)\s*from\s*(['"])([^'"]+)\3\s*;?/g;
const BLOCKED_AT_RULE = /@(import|plugin)\b/i;
const SFC_TAG = /^[ \t]*<(template|script|style)\b/im;

const TYPE_FS = {
  fileExists: () => false,
  readFile: () => undefined,
};

interface PreparedVue {
  code: string;
  css: string;
}

interface FinishOptions {
  scoped: boolean;
  attachRender: boolean;
}

function runtimeOf(spec: string): string | undefined {
  if (
    spec === "vue" ||
    spec === "@vue/runtime-dom" ||
    spec === "@vue/runtime-core" ||
    spec === "@vue/shared"
  ) {
    return "Vue";
  }
  if (spec === "lodash" || spec === "lodash-es") return "_";
  if (spec === "ant-design-vue" || spec === "antd") return "antd";
  return undefined;
}

function rewriteLodashPath(spec: string, clause: string): string {
  const method = spec.slice("lodash/".length).replace(/\.js$/, "");
  const local = clause.replace(/\s+/g, " ").trim();
  if (method.includes("/") || !/^[A-Za-z_$][\w$]*$/.test(method) || !/^[A-Za-z_$][\w$]*$/.test(local)) {
    throw new Error(`「${spec}」只支持默认导入，例如 import ${method.split("/")[0]} from "${spec}"`);
  }
  return `const ${local} = _.${method};\n`;
}

function toDestructure(names: string): string {
  return names
    .split(",")
    .map((part) => part.trim().replace(/^type\s+/, ""))
    .filter((part) => part.length > 0)
    .map((part) => {
      const alias = part.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
      return alias ? `${alias[1]}: ${alias[2]}` : part;
    })
    .join(", ");
}

function rewriteImportClause(clause: string, runtime: string): string {
  const body = clause.replace(/\s+/g, " ").trim();
  const named = body.match(/\{([^}]*)\}/);
  const names = named?.[1]?.replace(/\btype\s+/g, "").replace(/\s+/g, " ").trim();
  const withoutNamed = body.replace(/\{[^}]*\}/g, " ").replace(/,/g, " ").trim();
  const lines: string[] = [];
  const star = withoutNamed.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/);
  if (star && star[1] !== runtime) {
    lines.push(`const ${star[1]} = ${runtime};`);
  } else if (/^[A-Za-z_$][\w$]*$/.test(withoutNamed) && withoutNamed !== runtime) {
    lines.push(`const ${withoutNamed} = ${runtime};`);
  }
  if (names) {
    const destructure = toDestructure(names);
    if (destructure) lines.push(`const { ${destructure} } = ${runtime};`);
  }
  return lines.length ? `${lines.join("\n")}\n` : "";
}

function rewriteModuleImports(source: string): string {
  return source.replace(
    IMPORT_FROM,
    (_all, typeOnly: string | undefined, clause: string, _quote: string, spec: string) => {
      if (typeOnly) return "";
      if (spec.startsWith("lodash/")) return rewriteLodashPath(spec, clause);
      const runtime = runtimeOf(spec);
      if (!runtime) {
        throw new Error(`${SUPPORTED_IMPORT}，不能引入「${spec}」`);
      }
      return rewriteImportClause(clause, runtime);
    },
  );
}

function formatCompilerError(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error.trim();
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message || "").trim();
    if (message) return message;
  }
  return "编译失败";
}

function stripTypes(source: string): string {
  try {
    return transform(source, {
      transforms: ["typescript"],
      disableESTransforms: true,
      production: true,
      filePath: "App.ts",
    }).code;
  } catch (error) {
    throw new Error(formatCompilerError(error));
  }
}

function exposeDefault(code: string): string {
  if (!/\bexport\s+default\b/.test(code)) {
    return `var __defaultExport;\n${code}`;
  }
  try {
    return rewriteDefault(code, "__defaultExport");
  } catch {
    return `var __defaultExport;\n${code.replace(/export\s+default\s+/g, "__defaultExport = ")}`;
  }
}

function stripNamedExports(code: string): string {
  return code
    .replace(/export\s+(async\s+function|function|class|const|let|var)\s+/g, "$1 ")
    .replace(/export\s*\{[^}]*\}\s*;?/g, "");
}

function finish(source: string, options: FinishOptions): string {
  const compiled = stripNamedExports(exposeDefault(rewriteModuleImports(stripTypes(source))));
  if (/\bimport\s*(?:type\b|["'*{]|[A-Za-z_$])/.test(compiled)) {
    throw new Error(SUPPORTED_IMPORT);
  }
  const attach = options.attachRender
    ? `if (typeof render === "function" && __defaultExport && typeof __defaultExport === "object" && !__defaultExport.render) __defaultExport.render = render;\n`
    : "";
  const scope = options.scoped ? `__defaultExport.__scopeId = ${JSON.stringify(SCOPE_ATTR)};\n` : "";
  return `${compiled}
if (
  __defaultExport == null ||
  (typeof __defaultExport !== "object" && typeof __defaultExport !== "function")
) {
  if (typeof App === "function" || (typeof App === "object" && App)) __defaultExport = App;
  else throw new Error(${JSON.stringify(MISSING_COMPONENT)});
}
${attach}${scope}return __defaultExport;`;
}

function assertScriptLang(lang: string | undefined): void {
  if (!lang) return;
  if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript") return;
  throw new Error(`预览脚本只支持 js 和 ts，不能使用 ${lang}`);
}

function compileTemplateBlock(descriptor: SFCDescriptor): string {
  const template = descriptor.template;
  if (!template) return "";
  if (template.src) throw new Error("预览不支持 src 引用外部文件");
  if (template.lang && template.lang !== "html") {
    throw new Error(`预览模板只支持 html，不能使用 ${template.lang}`);
  }
  const result = compileTemplate({
    source: template.content,
    filename: FILENAME,
    id: SCOPE_ID,
    scoped: descriptor.styles.some((style) => style.scoped),
    isProd: true,
  });
  if (result.errors.length) throw new Error(formatCompilerError(result.errors[0]));
  return result.code;
}

async function compileSfcStyles(descriptor: SFCDescriptor): Promise<{ css: string; scoped: boolean }> {
  let css = "";
  let scoped = false;
  for (const style of descriptor.styles) {
    if (style.module) throw new Error("预览不支持 CSS Modules");
    if (style.src) throw new Error("预览不支持 src 引用外部文件");
    const lang = style.lang || "css";
    if (lang !== "css" && lang !== "less") {
      throw new Error(`预览样式只支持 css 和 less，不能使用 ${lang}`);
    }
    const content = style.content || "";
    if (!content.trim()) continue;
    if (BLOCKED_AT_RULE.test(content)) {
      throw new Error("预览里的样式不支持 @import 和 @plugin");
    }
    const plain = lang === "less" ? await compileLess(content) : content;
    const result = compileStyle({
      source: plain,
      filename: FILENAME,
      id: SCOPE_ID,
      scoped: Boolean(style.scoped),
      isProd: true,
    });
    if (result.errors.length) throw new Error(formatCompilerError(result.errors[0]));
    if (style.scoped) scoped = true;
    css += `${result.code}\n`;
  }
  return { css, scoped };
}

async function prepareSfc(source: string): Promise<PreparedVue> {
  const parsed = parse(source, { filename: FILENAME, sourceMap: false });
  if (parsed.errors.length) throw new Error(formatCompilerError(parsed.errors[0]));
  const descriptor = parsed.descriptor;
  if (descriptor.script?.src || descriptor.scriptSetup?.src || descriptor.template?.src) {
    throw new Error("预览不支持 src 引用外部文件");
  }
  assertScriptLang(descriptor.script?.lang);
  assertScriptLang(descriptor.scriptSetup?.lang);
  if (!descriptor.template && !descriptor.script && !descriptor.scriptSetup) {
    throw new Error(MISSING_COMPONENT);
  }

  const { css, scoped } = await compileSfcStyles(descriptor);
  let code = "";
  let attachRender = false;
  if (descriptor.script || descriptor.scriptSetup) {
    try {
      code = compileScript(descriptor, {
        id: SCOPE_ID,
        isProd: true,
        sourceMap: false,
        fs: TYPE_FS,
        inlineTemplate: Boolean(descriptor.scriptSetup && descriptor.template),
        templateOptions: {
          filename: FILENAME,
          id: SCOPE_ID,
          isProd: true,
        },
      }).content;
    } catch (error) {
      throw new Error(formatCompilerError(error));
    }
  }
  if (descriptor.template && !descriptor.scriptSetup) {
    const templateCode = compileTemplateBlock(descriptor);
    code = `${code}\n${templateCode}`;
    if (!descriptor.script) code += `\nexport default { render };\n`;
    attachRender = true;
  }
  return { code: finish(code, { scoped, attachRender }), css };
}

export async function prepareVueSource(source: string): Promise<PreparedVue> {
  const trimmed = source.trim();
  if (!trimmed) throw new Error(EMPTY_SOURCE);
  if (SFC_TAG.test(source)) return prepareSfc(source);
  if (trimmed.startsWith("<")) return prepareSfc(`<template>\n${source}\n</template>\n`);
  return { code: finish(source, { scoped: false, attachRender: false }), css: "" };
}
