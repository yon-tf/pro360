import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const DEFAULT_DIRS = ["app", "components", "features", "lib"];
const CLASS_TOKEN_RE = /[A-Za-z0-9:_/.\-\[\]]+/g;
const SHADOW_ALLOW = new Set(["shadow-none", "shadow-sm", "shadow-card", "shadow-panel"]);
const SPACING_HALF_STEP_RE =
  /^(?:-?(?:p[trblxy]?|m[trblxy]?|gap[xy]?|space-[xy]|inset[trblxy]?))-(?:\d+)\.5$/;

function parseArgs(argv) {
  return {
    includeDocs: argv.includes("--include-docs"),
    warnOnly: argv.includes("--warn-only"),
  };
}

function isSkippableDir(name) {
  return (
    name === "node_modules" ||
    name === ".next" ||
    name === ".git" ||
    name === "artifacts" ||
    name === "dist" ||
    name === "build"
  );
}

function* walkFiles(absDir) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(absDir, ent.name);
    if (ent.isDirectory()) {
      if (isSkippableDir(ent.name)) continue;
      yield* walkFiles(abs);
      continue;
    }
    if (!ent.isFile()) continue;
    yield abs;
  }
}

function shouldScanFile(absPath) {
  const rel = path.relative(ROOT, absPath);
  if (rel.startsWith("node_modules/") || rel.startsWith(".next/") || rel.startsWith("artifacts/")) return false;

  const ext = path.extname(rel);
  return [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".md", ".mdx", ".css"].includes(ext);
}

function readLines(absPath) {
  const txt = fs.readFileSync(absPath, "utf8");
  return txt.split(/\r?\n/);
}

function relPath(absPath) {
  return path.relative(ROOT, absPath);
}

function main() {
  const { includeDocs, warnOnly } = parseArgs(process.argv.slice(2));
  const scanDirs = includeDocs ? [...DEFAULT_DIRS, "docs"] : DEFAULT_DIRS;

  const rules = [
    {
      id: "tailwind-palette",
      re: /\b(?:bg|text|border|ring|fill|stroke)-(?:amber|emerald|violet|red|slate|zinc|green|sky)-(?:50|100|200|300|400|500|600|700|800|900)\b/g,
      message: "Tailwind palette class (use semantic tokens)",
    },
    {
      id: "hex-literal",
      re: /#[0-9a-fA-F]{3,8}\b/g,
      message: "Hex literal (use tokens; allow only in globals token source)",
      allow: (rel) => rel === "app/globals.css",
    },
    {
      id: "typography-arbitrary",
      re: /\b(?:text-\[[0-9.]+(?:px|rem)\]|tracking-\[|leading-\[)/g,
      message: "Typography arbitrary value (use semantic typography utilities)",
    },
    {
      id: "token-arbitrary-color",
      re: /\b(?:bg|text|border|ring|fill|stroke)-\[hsl\(var\(--/g,
      message: "Token-arbitrary color class (use semantic Tailwind color utilities)",
    },
    {
      id: "spacing-radius-shadow-arbitrary",
      re: /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space|rounded|shadow)-\[[^\]]+\]/g,
      message: "Spacing/radius/shadow arbitrary value (use Tailwind scale or semantic radius/shadow tokens)",
      allow: (_rel, line) =>
        line.includes("rounded-[inherit]") ||
        line.includes("[--radix-") ||
        line.includes("var(--radix-") ||
        line.includes("calc("),
    },
  ];

  const violations = [];

  for (const dir of scanDirs) {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) continue;

    for (const absFile of walkFiles(absDir)) {
      if (!shouldScanFile(absFile)) continue;
      const rel = relPath(absFile);
      const lines = readLines(absFile);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Token-level checks for class strings and @apply usage (more precise than line regexes).
        if (
          (line.includes(".5") || line.includes("shadow")) &&
          (line.includes("@apply") || line.includes("\"") || line.includes("'") || line.includes("`"))
        ) {
          const tokens = line.match(CLASS_TOKEN_RE) ?? [];
          for (const rawToken of tokens) {
            const token = rawToken.startsWith("!") ? rawToken.slice(1) : rawToken;
            const base = token.split(":").at(-1);
            if (!base) continue;

            if (SPACING_HALF_STEP_RE.test(base)) {
              violations.push({
                rel,
                lineNo: i + 1,
                rule: "spacing-half-step",
                message: "Half-step spacing utility (use 4px grid; no *.5 spacing)",
                snippet: line.trim().slice(0, 220),
              });
              continue;
            }

            if (base === "shadow") {
              violations.push({
                rel,
                lineNo: i + 1,
                rule: "shadow-non-semantic",
                message: "Non-semantic shadow (use shadow-none|shadow-sm|shadow-card|shadow-panel)",
                snippet: line.trim().slice(0, 220),
              });
              continue;
            }

            if (base.startsWith("shadow-") && !SHADOW_ALLOW.has(base)) {
              violations.push({
                rel,
                lineNo: i + 1,
                rule: "shadow-non-semantic",
                message: "Non-semantic shadow (use shadow-none|shadow-sm|shadow-card|shadow-panel)",
                snippet: line.trim().slice(0, 220),
              });
            }
          }
        }

        for (const rule of rules) {
          rule.re.lastIndex = 0;
          if (!rule.re.test(line)) continue;
          if (rule.allow && rule.allow(rel, line)) continue;
          violations.push({
            rel,
            lineNo: i + 1,
            rule: rule.id,
            message: rule.message,
            snippet: line.trim().slice(0, 220),
          });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`guard-design: ${violations.length} violation(s) found:\n`);
    for (const v of violations) {
      console.error(`${v.rel}:${v.lineNo} [${v.rule}] ${v.message}\n  ${v.snippet}\n`);
    }
    if (warnOnly) {
      console.error("guard-design: WARN-ONLY mode (not failing build).");
      process.exitCode = 0;
      return;
    }
    process.exitCode = 1;
    return;
  }

  console.log("guard-design: OK (no violations).");
}

main();
