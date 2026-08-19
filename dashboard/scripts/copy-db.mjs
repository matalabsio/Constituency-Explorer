#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const destDir = path.resolve(process.cwd(), "data");
const dest = path.join(destDir, "kurupam.db");
const sources = [
  path.resolve(process.cwd(), "..", "data", "kurupam.db"),
  dest,
];

fs.mkdirSync(destDir, { recursive: true });

const source = sources.find((file) => fs.existsSync(file));
if (!source) {
  console.warn("No kurupam.db found. Kurupam pages will show empty until a database is bundled.");
  process.exit(0);
}

if (path.resolve(source) !== path.resolve(dest)) {
  fs.copyFileSync(source, dest);
  console.log(`Copied ${source} -> ${dest}`);
} else {
  console.log(`Using bundled database at ${dest}`);
}
