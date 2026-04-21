import { readFileSync } from "fs";
import path from "path";

type TokenRow = {
  semanticKey: string;
  tokenExpr: string;
  cssVar: `--${string}` | null;
  lightValue: string | null;
  darkValue: string | null;
};

type TokenGroup = {
  groupKey: string;
  label: string;
  rows: TokenRow[];
};

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function findBlockContent(haystack: string, startIndex: number): string | null {
  const openIndex = haystack.indexOf("{", startIndex);
  if (openIndex === -1) return null;

  let depth = 0;
  for (let i = openIndex; i < haystack.length; i++) {
    const ch = haystack[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) return haystack.slice(openIndex + 1, i);
  }
  return null;
}

function findNamedBlock(css: string, selector: RegExp): string | null {
  const match = selector.exec(css);
  if (!match) return null;
  return findBlockContent(css, match.index);
}

function parseCssCustomProps(block: string | null): Record<string, string> {
  if (!block) return {};
  const out: Record<string, string> = {};
  const re = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  for (const m of block.matchAll(re)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

function extractCssVar(tokenExpr: string): `--${string}` | null {
  const m = tokenExpr.match(/var\((--[a-zA-Z0-9-_]+)\)/);
  return (m?.[1] as `--${string}` | undefined) ?? null;
}

function flattenStringLeaves(prefix: string, value: unknown, out: Array<{ key: string; value: string }>) {
  if (typeof value === "string") {
    out.push({ key: prefix, value });
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    flattenStringLeaves(`${prefix}.${k}`, v, out);
  }
}

function groupLabel(groupKey: string): string {
  switch (groupKey) {
    case "color.bg":
      return "Background";
    case "color.text":
      return "Text";
    case "color.border":
      return "Border";
    case "color.action":
      return "Action";
    case "color.status":
      return "Status";
    default:
      return groupKey;
  }
}

export function getDesignLanguageColorTokenGroups(): TokenGroup[] {
  const tokensPath = path.join(process.cwd(), "design-system", "tokens.json");
  const globalsPath = path.join(process.cwd(), "app", "globals.css");

  const tokensRaw = safeRead(tokensPath);
  const globalsRaw = safeRead(globalsPath);

  if (!tokensRaw || !globalsRaw) return [];

  const parsed = JSON.parse(tokensRaw) as { color?: unknown };
  const colorTokens = parsed.color ?? {};

  const baseLayer = findNamedBlock(globalsRaw, /@layer\s+base\s*/);
  const rootBlock = findNamedBlock(baseLayer ?? globalsRaw, /:root\s*/);
  const darkBlock = findNamedBlock(baseLayer ?? globalsRaw, /\.dark\s*/);

  const lightVars = parseCssCustomProps(rootBlock);
  const darkVars = parseCssCustomProps(darkBlock);

  const leaves: Array<{ key: string; value: string }> = [];
  flattenStringLeaves("color", colorTokens, leaves);

  const rows: TokenRow[] = leaves.map(({ key, value }) => {
    const cssVar = extractCssVar(value);
    const lightValue = cssVar ? lightVars[cssVar] ?? null : null;
    const darkValue = cssVar ? darkVars[cssVar] ?? null : null;
    return {
      semanticKey: key,
      tokenExpr: value,
      cssVar,
      lightValue: lightValue ?? (cssVar ? "(missing)" : null),
      darkValue: darkValue ?? (cssVar ? (lightValue ? "(inherits)" : "(inherits)") : null),
    };
  });

  const byGroup = new Map<string, TokenRow[]>();
  for (const row of rows) {
    const parts = row.semanticKey.split(".");
    const groupKey = parts.slice(0, 2).join(".");
    if (!byGroup.has(groupKey)) byGroup.set(groupKey, []);
    byGroup.get(groupKey)!.push(row);
  }

  const groupOrder = ["color.bg", "color.text", "color.border", "color.action", "color.status"];
  const groups: TokenGroup[] = [];
  for (const groupKey of groupOrder) {
    const groupRows = byGroup.get(groupKey);
    if (!groupRows?.length) continue;
    groups.push({
      groupKey,
      label: groupLabel(groupKey),
      rows: groupRows,
    });
  }

  return groups;
}

