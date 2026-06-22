const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "src");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  content = content.replace(
    /(from\s+['"])(\.{1,2}\/[^'"]+)\.ts(['"])/g,
    "$1$2$3"
  );

  content = content.replace(
    /(import\s*\(\s*['"])(\.{1,2}\/[^'"]+)\.ts(['"]\s*\))/g,
    "$1$2$3"
  );

  fs.writeFileSync(filePath, content);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      processFile(fullPath);
    }
  }
}

walk(ROOT);

console.log("✅ Removed .ts extensions from relative imports.");