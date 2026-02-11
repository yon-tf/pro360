import { readFileSync } from "fs";
import path from "path";
import { MarkdownContent } from "@/components/MarkdownContent";

export default function DocsPage() {
  const filePath = path.join(process.cwd(), "docs", "PRO360_PITCH_PLAN.md");
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    content = "# Documentation\n\nPlan document could not be loaded.";
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="rounded-xl bg-card p-6 shadow-card">
        <MarkdownContent content={content} />
      </div>
    </div>
  );
}
