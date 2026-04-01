import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

const includedRoots = ["app", "src", "tests"];
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".mjs"]);

const forbiddenPatterns = [
  {
    name: "debugger statement",
    pattern: /\bdebugger\b/
  },
  {
    name: "console.log",
    pattern: /\bconsole\.log\s*\(/
  },
  {
    name: "console.info",
    pattern: /\bconsole\.info\s*\(/
  },
  {
    name: "console.debug",
    pattern: /\bconsole\.debug\s*\(/
  },
  {
    name: "focused test",
    pattern: /\b(?:describe|it|test)\.only\s*\(|\b(?:fdescribe|fit)\s*\(/
  }
];

function collectFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs.readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return collectFiles(entryPath);
    }

    if (!entry.isFile() || !allowedExtensions.has(path.extname(entry.name))) {
      return [];
    }

    return [entryPath];
  });
}

function getLineNumber(sourceText, matchIndex) {
  return sourceText.slice(0, matchIndex).split("\n").length;
}

const filesToCheck = includedRoots.flatMap((rootPath) =>
  collectFiles(path.join(projectRoot, rootPath))
);

const findings = filesToCheck.flatMap((filePath) => {
  const sourceText = fs.readFileSync(filePath, "utf8");

  return forbiddenPatterns.flatMap(({ name, pattern }) => {
    const match = pattern.exec(sourceText);

    if (!match || typeof match.index !== "number") {
      return [];
    }

    return [
      {
        filePath: path.relative(projectRoot, filePath),
        lineNumber: getLineNumber(sourceText, match.index),
        ruleName: name
      }
    ];
  });
});

if (findings.length > 0) {
  console.error("Lint hygiene check failed:");

  for (const finding of findings) {
    console.error(`- ${finding.filePath}:${finding.lineNumber} -> ${finding.ruleName}`);
  }

  process.exit(1);
}

console.log(`Lint hygiene check passed for ${filesToCheck.length} files.`);
