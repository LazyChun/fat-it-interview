const fs = require("fs");
const path = require("path");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, acc);
    else if (name.endsWith(".d.ts")) acc.push(file);
  }
  return acc;
}

const files = walk(path.resolve("node_modules/antd/es"));
const bytes = files.reduce((total, file) => total + fs.statSync(file).size, 0);
const imports = new Set();
const pattern = /from\s+['"]([^'"]+)['"]/g;
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  let match = pattern.exec(source);
  while (match) {
    if (!match[1].startsWith(".")) imports.add(match[1]);
    match = pattern.exec(source);
  }
}
console.log("files", files.length, "bytes", bytes);
console.log([...imports].sort().join("\n"));
