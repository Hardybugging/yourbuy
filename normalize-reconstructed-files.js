const fs = require("fs");
const path = require("path");

const roots = ["yourbuy-backend", "yourbuy-frontend"];
const extraFiles = ["docker-compose.yml", ".gitignore"];
const skipDirs = new Set(["node_modules", ".git", "dist", ".next"]);

const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(filePath);
    } else {
      files.push(filePath);
    }
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) walk(root);
}

for (const file of extraFiles) {
  if (fs.existsSync(file)) files.push(file);
}

let changed = 0;

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const trimmed = source.trim();

  if (trimmed.length < 2 || trimmed[0] !== '"' || trimmed[trimmed.length - 1] !== '"') {
    continue;
  }

  let decoded;
  try {
    decoded = JSON.parse(trimmed);
  } catch {
    decoded = trimmed
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }

  if (typeof decoded === "string" && decoded !== source) {
    fs.writeFileSync(file, decoded, "utf8");
    changed += 1;
  }
}

console.log(`normalized ${changed} files`);
