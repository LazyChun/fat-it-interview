/**
 * 把用户写下的 React 代码编成可在沙箱里 new Function 的函数体。
 * 函数参数是 React、ReactDOM，返回一个组件（function App 或 export default）。
 */
import { transform } from "sucrase";

const EMPTY_SOURCE = "代码是空的";
const MISSING_COMPONENT =
  "请定义 function App()，或用 export default 导出一个组件";

const IMPORT_FROM =
  /import\s*(type\s+)?([\s\S]*?)\s*from\s*(['"])([^'"]+)\3\s*;?/g;

const SUPPORTED_IMPORT =
  '预览里可以 import "react"、"react-dom"、"lodash" 和 "antd"';

function runtimeOf(spec: string): string | undefined {
  if (spec === "react" || spec === "react/jsx-runtime" || spec === "react/jsx-dev-runtime") {
    return "React";
  }
  if (spec === "react-dom" || spec === "react-dom/client") {
    return "ReactDOM";
  }
  if (spec === "lodash" || spec === "lodash-es") {
    return "_";
  }
  if (spec === "antd") {
    return "antd";
  }
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
    lines.push(`const { ${names} } = ${runtime};`);
  }
  return lines.length ? `${lines.join("\n")}\n` : "";
}

function rewriteModuleImports(source: string): string {
  return source.replace(
    IMPORT_FROM,
    (all, typeOnly: string | undefined, clause: string, _quote: string, spec: string) => {
      if (typeOnly) return "";
      if (spec.startsWith("lodash/")) {
        return rewriteLodashPath(spec, clause);
      }
      const runtime = runtimeOf(spec);
      if (!runtime) {
        throw new Error(`${SUPPORTED_IMPORT}，不能引入「${spec}」`);
      }
      return rewriteImportClause(clause, runtime);
    },
  );
}

function hasComponent(source: string): boolean {
  return (
    /\bfunction\s+App\b/.test(source) ||
    /\bclass\s+App\b/.test(source) ||
    /\b(?:const|let|var)\s+App\b/.test(source) ||
    /\bexport\s+default\b/.test(source)
  );
}

function firstCodeLine(source: string): string {
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      continue;
    }
    return trimmed;
  }
  return "";
}

function ensureComponent(source: string): string {
  if (hasComponent(source)) return source;
  if (firstCodeLine(source).startsWith("<")) {
    return `function App() {\n  return (\n${source}\n  );\n}`;
  }
  return source;
}

function stripExports(code: string): string {
  const next = code
    .replace(/export\s+default\s+/g, "__defaultExport = ")
    .replace(/export\s+(async\s+function|function|class|const|let|var)\s+/g, "$1 ")
    .replace(/export\s*\{[^}]*\}\s*;?/g, "");
  return `var __defaultExport;\n${next}`;
}

export function prepareReactSource(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) {
    throw new Error(EMPTY_SOURCE);
  }
  const rewritten = ensureComponent(rewriteModuleImports(source));
  let compiled = "";
  try {
    compiled = transform(rewritten, {
      transforms: ["typescript", "jsx"],
      jsxRuntime: "classic",
      jsxPragma: "React.createElement",
      jsxFragmentPragma: "React.Fragment",
      production: true,
      disableESTransforms: true,
      filePath: "App.tsx",
    }).code;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message);
  }
  const body = stripExports(compiled).trim();
  if (/\bimport\s*(?:type\b|["'*{]|[A-Za-z_$])/.test(body)) {
    throw new Error(SUPPORTED_IMPORT);
  }
  return `${body}\nif (typeof __defaultExport === "function") return __defaultExport;\nif (typeof App === "function") return App;\nthrow new Error(${JSON.stringify(MISSING_COMPONENT)});`;
}
