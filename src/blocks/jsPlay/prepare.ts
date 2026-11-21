/**
 * 把用户写下的 JavaScript 编成沙箱里 new Function("_", "console", code) 能执行的函数体。
 * lodash 的 import / require 改写成对参数 _ 的引用。return 的值就是运行结果。
 */
import { transform } from "sucrase";

const EMPTY_SOURCE = "代码是空的";
const SUPPORTED = '可以 import "lodash"，或直接使用全局 _';

const IMPORT_FROM =
  /import\s*(type\s+)?([\s\S]*?)\s*from\s*(['"])([^'"]+)\3\s*;?/g;

function assertLodash(spec: string): "root" | string {
  if (spec === "lodash" || spec === "lodash-es") return "root";
  if (spec.startsWith("lodash/") || spec.startsWith("lodash-es/")) {
    const method = spec.replace(/^lodash(?:-es)?\//, "").replace(/\.js$/, "");
    if (!method || method.includes("/") || !/^[A-Za-z_$][\w$]*$/.test(method)) {
      const example = method.split("/")[0] || "debounce";
      throw new Error(`「${spec}」只支持默认导入，例如 import ${example} from "${spec}"`);
    }
    return method;
  }
  throw new Error(`${SUPPORTED}，不能引入「${spec}」`);
}

function rewriteLodashPath(spec: string, clause: string): string {
  const method = assertLodash(spec);
  const local = clause.replace(/\s+/g, " ").trim();
  if (method === "root" || !/^[A-Za-z_$][\w$]*$/.test(local)) {
    const name = method === "root" ? "debounce" : method;
    throw new Error(`「${spec}」只支持默认导入，例如 import ${name} from "${spec}"`);
  }
  return `const ${local} = _.${method};\n`;
}

function rewriteImportClause(clause: string, runtime: string): string {
  const body = clause.replace(/\s+/g, " ").trim();
  const named = body.match(/\{([^}]*)\}/);
  const rawNames = named?.[1]?.replace(/\s+/g, " ").trim();
  const names = rawNames
    ?.split(",")
    .map((part) => part.trim())
    .filter((part) => part && !/^type\s+/.test(part))
    .join(", ");
  const withoutNamed = body.replace(/\{[^}]*\}/g, " ").replace(/,/g, " ").trim();
  const lines: string[] = [];
  const star = withoutNamed.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/);
  if (star && star[1] !== runtime) {
    lines.push(`const ${star[1]} = ${runtime};`);
  } else if (/^[A-Za-z_$][\w$]*$/.test(withoutNamed) && withoutNamed !== runtime) {
    lines.push(`const ${withoutNamed} = ${runtime};`);
  }
  if (names) {
    lines.push(`const { ${names} } = ${runtime};`);
  }
  return lines.length ? `${lines.join("\n")}\n` : "";
}

function rewriteModuleImports(source: string): string {
  const dynamic = source.replace(
    /import\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
    (_all, _quote: string, spec: string) => {
      const kind = assertLodash(spec);
      return kind === "root" ? "Promise.resolve(_)" : `Promise.resolve(_.${kind})`;
    },
  );
  const sideEffect = dynamic.replace(
    /import\s*(['"])([^'"]+)\1\s*;?/g,
    (_all, _quote: string, spec: string) => {
      assertLodash(spec);
      return "";
    },
  );
  IMPORT_FROM.lastIndex = 0;
  const from = sideEffect.replace(
    IMPORT_FROM,
    (_all, typeOnly: string | undefined, clause: string, _quote: string, spec: string) => {
      if (typeOnly) {
        assertLodash(spec);
        return "";
      }
      if (spec.startsWith("lodash/") || spec.startsWith("lodash-es/")) {
        return rewriteLodashPath(spec, clause);
      }
      assertLodash(spec);
      return rewriteImportClause(clause, "_");
    },
  );
  return from.replace(
    /require\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
    (_all, _quote: string, spec: string) => {
      const kind = assertLodash(spec);
      return kind === "root" ? "_" : `_.${kind}`;
    },
  );
}

function stripExports(code: string): string {
  const next = code
    .replace(/export\s+default\s+/g, "__fatDefault = ")
    .replace(/export\s+(async\s+function|function|class|const|let|var)\s+/g, "$1 ")
    .replace(/export\s*\{[^}]*\}\s*;?/g, "");
  return `var __fatDefault;\n${next}`;
}

function compile(source: string): string {
  return transform(source, {
    transforms: ["typescript"],
    disableESTransforms: true,
    production: true,
    filePath: "main.ts",
  }).code;
}

/** 顶层 await 才需要包进 async。函数内部的 await 保持原样，输出顺序才和裸脚本一致。 */
function hasTopLevelAwait(source: string): boolean {
  let depth = 0;
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      i += 1;
      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }
        if (source[i] === ch) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      const next = source.indexOf("\n", i);
      i = next < 0 ? source.length : next + 1;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const next = source.indexOf("*/", i + 2);
      i = next < 0 ? source.length : next + 2;
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") depth = Math.max(0, depth - 1);
    else if (
      depth === 0 &&
      source.startsWith("await", i) &&
      !/[A-Za-z0-9_$]/.test(source[i - 1] ?? "") &&
      !/[A-Za-z0-9_$]/.test(source[i + 5] ?? "")
    ) {
      return true;
    }
    i += 1;
  }
  return false;
}

export function prepareJsSource(source: string): string {
  if (!source.trim()) {
    throw new Error(EMPTY_SOURCE);
  }
  const rewritten = stripExports(rewriteModuleImports(source));
  const wrapped = hasTopLevelAwait(rewritten)
    ? `"use strict";\nasync function __fatJsPlayRun() {\n${rewritten}\n}\nreturn __fatJsPlayRun();\n`
    : `"use strict";\n${rewritten}\n`;
  let compiled = "";
  try {
    compiled = compile(wrapped);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message);
  }
  const body = compiled.trim();
  if (
    /\bimport\s*(?:type\b|["'*{(]|[A-Za-z_$])/.test(body) ||
    /\brequire\s*\(/.test(body) ||
    /\bimport\s*\./.test(body)
  ) {
    throw new Error(SUPPORTED);
  }
  return body;
}
