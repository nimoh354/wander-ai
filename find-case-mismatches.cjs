#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(process.cwd(), process.argv[2] || "src");
const extensions = [".js", ".jsx", ".ts", ".tsx"];
const importRegex = /(?:import\s+(?:[^'"]*?\s+from\s+)?|require\()\s*['"](\.[^'"]+)['"]/g;

let issuesFound = 0;
let filesScanned = 0;

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else if (extensions.includes(path.extname(entry.name))) {
      callback(fullPath);
    }
  }
}

function resolveImportCandidates(importPath) {
  if (path.extname(importPath)) return [importPath];
  return extensions.map((ext) => importPath + ext).concat(
    extensions.map((ext) => path.join(importPath, "index" + ext))
  );
}

function checkCase(baseDir, importPath, fromFile) {
  const candidates = resolveImportCandidates(importPath);
  for (const candidate of candidates) {
    const absTarget = path.resolve(baseDir, candidate);
    const targetDir = path.dirname(absTarget);
    const targetBase = path.basename(absTarget);
    if (!fs.existsSync(targetDir)) continue;
    const actualEntries = fs.readdirSync(targetDir);
    if (actualEntries.includes(targetBase)) return null;
    const caseInsensitiveMatch = actualEntries.find(
      (e) => e.toLowerCase() === targetBase.toLowerCase()
    );
    if (caseInsensitiveMatch) {
      return {
        fromFile,
        importPath,
        expected: candidate,
        actualOnDisk: path.join(path.dirname(importPath), caseInsensitiveMatch),
      };
    }
  }
  return null;
}

walk(srcDir, (filePath) => {
  filesScanned++;
  const content = fs.readFileSync(filePath, "utf8");
  const fileDir = path.dirname(filePath);
  let match;
  importRegex.lastIndex = 0;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const issue = checkCase(fileDir, importPath, path.relative(process.cwd(), filePath));
    if (issue) {
      issuesFound++;
      console.log(`\n⚠️  Case mismatch in: ${issue.fromFile}`);
      console.log(`   imports:      "${issue.importPath}"`);
      console.log(`   actual file:  "${issue.actualOnDisk}"`);
    }
  }
});

console.log(`\nScanned ${filesScanned} files.`);
if (issuesFound === 0) {
  console.log("✅ No case mismatches found.");
} else {
  console.log(`❌ Found ${issuesFound} case mismatch(es) above. Fix the import or rename the file (use "git mv" to rename) so casing matches exactly.`);
  process.exitCode = 1;
}