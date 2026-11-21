/**
 * 给 React 预览的 Monaco 准备类型：react、react-dom、lodash，以及一份精简的 antd 声明。
 * 写到 src/blocks/reactPlay/generated/editorLibs.ts，编辑器启动时注册成 extra lib。
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const outFile = path.join(root, "src/blocks/reactPlay/generated/editorLibs.ts");

const COMMON_PROPS = [
  ["children", "React.ReactNode"],
  ["className", "string"],
  ["style", "React.CSSProperties"],
  ["id", "string"],
  ["disabled", "boolean"],
  ["onClick", "React.MouseEventHandler<HTMLElement>"],
];

const SKIP_STATIC = new Set([
  "prototype",
  "length",
  "name",
  "arguments",
  "caller",
  "call",
  "apply",
  "bind",
  "toString",
  "valueOf",
]);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function ident(name) {
  return /^[A-Za-z_$][\w$]*$/.test(name);
}

function documentation(checker, symbol) {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).replace(/\s+/g, " ").trim();
  if (!text) return "";
  const line = text.replace(/\*\//g, "* /").slice(0, 160);
  return `/** ${line} */\n`;
}

function declaredInUi(symbol) {
  const declarations = symbol.getDeclarations() || [];
  return declarations.some((declaration) => {
    const file = declaration.getSourceFile().fileName.replace(/\\/g, "/");
    return file.includes("/antd/") || file.includes("/@rc-component/") || file.includes("/rc-");
  });
}

function printType(checker, type, location) {
  let text = checker.typeToString(
    type,
    location,
    ts.TypeFormatFlags.NoTruncation |
      ts.TypeFormatFlags.UseStructuralFallback |
      ts.TypeFormatFlags.InTypeAlias |
      ts.TypeFormatFlags.WriteArrowStyleSignature |
      ts.TypeFormatFlags.OmitThisParameter |
      ts.TypeFormatFlags.AllowUniqueESSymbolType,
  );
  text = text.replace(/\s+/g, " ").trim();
  text = text.replace(/import\("[^"]*\/react\/[^"]*"\)\./g, "React.");
  text = text.replace(/import\("[^"]*react\.d\.ts"\)\./g, "React.");
  text = text.replace(/import\("[^"]+"\)\./g, "");
  if (
    !text ||
    text.length > 220 ||
    text.includes("import(") ||
    text.includes("...") ||
    text.includes("unique symbol") ||
    /[{}]/.test(text)
  ) {
    return "any";
  }
  return text;
}

function unwrap(type) {
  if (!type.isUnion || !type.isUnion()) return type;
  const parts = type.types.filter(
    (part) => (part.flags & ts.TypeFlags.Undefined) === 0 && (part.flags & ts.TypeFlags.Null) === 0,
  );
  if (parts.length === 0) return type;
  if (parts.length === 1) return unwrap(parts[0]);
  return parts.slice().sort((left, right) => right.getProperties().length - left.getProperties().length)[0];
}

function callSignature(type) {
  const direct = type.getCallSignatures();
  if (direct.length) return direct[0];
  if (type.isIntersection && type.isIntersection()) {
    for (const part of type.types) {
      const signatures = part.getCallSignatures();
      if (signatures.length) return signatures[0];
    }
  }
  return undefined;
}

function isComponentProps(type) {
  const objectType = unwrap(type);
  const names = new Set(objectType.getProperties().map((property) => property.getName()));
  if (names.has("className") || names.has("children") || names.has("prefixCls")) return true;
  return objectType.getProperties().filter(declaredInUi).length >= 3;
}

function emitProps(checker, type, location, used) {
  const objectType = unwrap(type);
  const lines = [];
  for (const property of objectType.getProperties()) {
    const name = property.getName();
    if (!ident(name) || used.has(name) || SKIP_STATIC.has(name)) continue;
    if (!declaredInUi(property)) continue;
    const declaration = (property.getDeclarations() || [])[0] || location;
    const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration);
    const optional = (property.flags & ts.SymbolFlags.Optional) !== 0;
    lines.push(
      `${documentation(checker, property)}  ${name}${optional ? "?" : ""}: ${printType(checker, propertyType, declaration)};`,
    );
    used.add(name);
  }
  return lines;
}

function emitStatics(checker, type, location) {
  const lines = [];
  for (const property of type.getProperties()) {
    const name = property.getName();
    if (!ident(name) || SKIP_STATIC.has(name)) continue;
    if (!declaredInUi(property)) continue;
    const declaration = (property.getDeclarations() || [])[0] || location;
    const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration);
    if (callSignature(propertyType) && isComponentProps(callSignature(propertyType).getParameters()[0]
      ? checker.getTypeOfSymbolAtLocation(
          callSignature(propertyType).getParameters()[0],
          callSignature(propertyType).getParameters()[0].valueDeclaration || declaration,
        )
      : propertyType)) {
      lines.push(`  ${name}: React.FC<Record<string, any>>;`);
      continue;
    }
    const signatures = propertyType.getCallSignatures();
    if (signatures.length) {
      lines.push(`  ${name}: (...args: any[]) => any;`);
      continue;
    }
    lines.push(`  ${name}: ${printType(checker, propertyType, declaration)};`);
  }
  return lines;
}

function buildAntd() {
  const entry = path.join(root, "node_modules/antd/es/index.d.ts");
  const options = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    jsx: ts.JsxEmit.React,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    skipLibCheck: true,
    strict: false,
  };
  const program = ts.createProgram([entry], options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  if (!source || !source.symbol) {
    throw new Error("antd 类型入口没有模块符号");
  }
  const moduleSymbol = checker.getMergedSymbol(source.symbol);
  const chunks = [];
  const emitted = new Set();
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const name = exported.getName();
    if (!ident(name) || emitted.has(name)) continue;
    const resolved =
      (exported.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(exported) : exported;
    if (
      (resolved.flags & ts.SymbolFlags.Value) === 0 &&
      (resolved.flags &
        (ts.SymbolFlags.Type |
          ts.SymbolFlags.Interface |
          ts.SymbolFlags.TypeAlias |
          ts.SymbolFlags.TypeParameter)) !==
        0
    ) {
      chunks.push(`export type ${name} = any;`);
      emitted.add(name);
      continue;
    }
    const declaration = (exported.getDeclarations() || [])[0] || source;
    const type = checker.getTypeOfSymbolAtLocation(exported, declaration);
    const signature = callSignature(type);
    const firstParameter = signature && signature.getParameters()[0];
    const parameterType = firstParameter
      ? checker.getTypeOfSymbolAtLocation(firstParameter, firstParameter.valueDeclaration || declaration)
      : undefined;
    if (signature && parameterType && isComponentProps(parameterType)) {
      const propsName = `${name}Props`;
      const used = new Set();
      const own = emitProps(checker, parameterType, declaration, used);
      const common = COMMON_PROPS.filter(([prop]) => !used.has(prop)).map(
        ([prop, propType]) => `  ${prop}?: ${propType};`,
      );
      const statics = emitStatics(checker, type, declaration).filter((line) => !line.startsWith(`  ${name}`));
      const staticName = statics.length ? `${name}Statics` : "";
      chunks.push(
        `export interface ${propsName} {\n${own.concat(common).join("\n")}\n}`,
      );
      if (staticName) {
        chunks.push(`export interface ${staticName} {\n${statics.join("\n")}\n}`);
      }
      const component = `React.ForwardRefExoticComponent<${propsName} & React.RefAttributes<HTMLElement>>`;
      chunks.push(
        `export const ${name}: ${component}${staticName ? ` & ${staticName}` : ""};`,
      );
      emitted.add(name);
      continue;
    }
    if ((exported.flags & ts.SymbolFlags.Type) !== 0 && (exported.flags & ts.SymbolFlags.Value) === 0) {
      chunks.push(`export type ${name} = any;`);
      emitted.add(name);
      continue;
    }
    const flags = type.getFlags();
    if (flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral | ts.TypeFlags.Number | ts.TypeFlags.Boolean)) {
      chunks.push(`export const ${name}: ${printType(checker, type, declaration)};`);
      emitted.add(name);
      continue;
    }
    const properties = type.getProperties().filter((property) => ident(property.getName()) && !SKIP_STATIC.has(property.getName()));
    if (properties.length > 0 && properties.length <= 40) {
      const fields = properties.slice(0, 40).map((property) => {
        const propertyDeclaration = (property.getDeclarations() || [])[0] || declaration;
        const propertyType = checker.getTypeOfSymbolAtLocation(property, propertyDeclaration);
        if (propertyType.getCallSignatures().length) return `  ${property.getName()}: (...args: any[]) => any;`;
        return `  ${property.getName()}: ${printType(checker, propertyType, propertyDeclaration)};`;
      });
      chunks.push(`export const ${name}: {\n${fields.join("\n")}\n};`);
      emitted.add(name);
      continue;
    }
    chunks.push(`export const ${name}: any;`);
    emitted.add(name);
  }
  return `declare module "antd" {\n  import React = require("react");\n  ${chunks.join("\n  ")}\n}\n`;
}

function editorLibs() {
  const react = read("node_modules/@types/react/index.d.ts").replace(
    '/// <reference path="global.d.ts" />\r\n',
    "",
  ).replace('/// <reference path="global.d.ts" />\n', "");
  const libs = [
    { path: "file:///node_modules/@types/react/index.d.ts", content: react },
    { path: "file:///node_modules/@types/prop-types/index.d.ts", content: read("node_modules/@types/prop-types/index.d.ts") },
    {
      path: "file:///node_modules/csstype/index.d.ts",
      content: [
        "export interface Properties<TLength = string | number, TTime = string> {",
        "  [property: string]: any;",
        "}",
        "export interface PropertiesHyphen<TLength = string | number, TTime = string> {",
        "  [property: string]: any;",
        "}",
        "",
      ].join("\n"),
    },
    { path: "file:///node_modules/@types/react-dom/index.d.ts", content: read("node_modules/@types/react-dom/index.d.ts") },
    { path: "file:///node_modules/@types/react-dom/client.d.ts", content: read("node_modules/@types/react-dom/client.d.ts") },
    { path: "file:///node_modules/@types/lodash/index.d.ts", content: read("node_modules/@types/lodash/index.d.ts") },
  ];
  const commonDir = path.join(root, "node_modules/@types/lodash/common");
  for (const name of fs.readdirSync(commonDir)) {
    if (!name.endsWith(".d.ts")) continue;
    libs.push({
      path: `file:///node_modules/@types/lodash/common/${name}`,
      content: read(`node_modules/@types/lodash/common/${name}`),
    });
  }
  libs.push({ path: "file:///antd-editor.d.ts", content: buildAntd() });
  return libs;
}

function writeLibs(libs) {
  const body = libs
    .map((lib) => `  { path: ${JSON.stringify(lib.path)}, content: ${JSON.stringify(lib.content)} }`)
    .join(",\n");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(
    outFile,
    `/* 由 scripts/buildEditorLibs.js 生成，给 React 预览编辑器做导入和调用补全。 */\nexport const editorLibs: { path: string; content: string }[] = [\n${body}\n];\n`,
  );
}

function virtualPath(filePath) {
  const marker = "file:///";
  if (!filePath.startsWith(marker)) return "";
  return filePath.slice(marker.length);
}

function validate(libs) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fat-editor-types-"));
  try {
    for (const lib of libs) {
      const relative = virtualPath(lib.path);
      if (!relative) continue;
      const file = path.join(dir, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, lib.content);
    }
    fs.writeFileSync(
      path.join(dir, "sample.tsx"),
      [
        'import React, { useState } from "react";',
        'import _ from "lodash";',
        'import { Button, message } from "antd";',
        "export function App() {",
        "  const [count, setCount] = useState(0);",
        "  const max = _.max([12, 34]);",
        "  message.success(String(max));",
        "  return (",
        "    <Button type=\"primary\" onClick={() => setCount(count + 1)}>",
        "      {count}",
        "    </Button>",
        "  );",
        "}",
        "",
      ].join("\n"),
    );
    fs.writeFileSync(
      path.join(dir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2019",
            module: "ESNext",
            moduleResolution: "node",
            jsx: "react",
            strict: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
            noEmit: true,
            lib: ["ES2019", "DOM", "DOM.Iterable"],
            types: [],
          },
          files: ["sample.tsx", "antd-editor.d.ts"],
        },
        null,
        2,
      ),
    );
    execFileSync(process.execPath, [path.join(root, "node_modules/typescript/lib/tsc.js"), "-p", dir, "--pretty", "false"], {
      stdio: "inherit",
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function main() {
  const libs = editorLibs();
  writeLibs(libs);
  validate(libs);
  const bytes = fs.statSync(outFile).size;
  console.log(`[fat-it-interview] editor libs ${outFile} (${bytes} bytes)`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
