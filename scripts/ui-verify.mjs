import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = process.env.UI_VERIFY_BASE_URL ?? "http://localhost:3000";
const outRoot =
  process.env.UI_VERIFY_OUT_DIR ??
  path.resolve(__dirname, "..", "artifacts", "ui-verify");

const routes = [
  "/pro360",
  "/pro360/attention",
  "/payout",
  "/appointments",
];

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
    d.getHours(),
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function safeName(route) {
  return route.replaceAll("/", "_").replace(/^_/, "") || "root";
}

async function screenshotRoute({ browser, theme, route, outDir }) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme === "dark" ? "dark" : "light",
  });
  const page = await context.newPage();

  // ThemeProvider reads localStorage["pro360-theme"] after mount; set early and give it time to settle.
  await page.addInitScript((t) => {
    localStorage.setItem("pro360-theme", t);
  }, theme);

  const url = new URL(route, baseUrl).toString();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Best-effort ensure theme applied.
  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  if (theme === "dark" && !hasDarkClass) {
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);
  }

  const filePath = path.join(outDir, `${safeName(route)}__${theme}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  await context.close();
  return filePath;
}

async function main() {
  const runDir = path.join(outRoot, timestamp());
  fs.mkdirSync(runDir, { recursive: true });

  const browser = await chromium.launch();
  const outputs = [];

  try {
    for (const route of routes) {
      for (const theme of ["light", "dark"]) {
        // eslint-disable-next-line no-console
        console.log(`Capture ${theme}: ${route}`);
        outputs.push(
          await screenshotRoute({ browser, theme, route, outDir: runDir }),
        );
      }
    }
  } finally {
    await browser.close();
  }

  // eslint-disable-next-line no-console
  console.log("\nSaved screenshots:");
  for (const p of outputs) {
    // eslint-disable-next-line no-console
    console.log(p);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

