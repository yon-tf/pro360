"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MermaidDiagram } from "@/components/MermaidDiagram";

const docStyles = `
  .doc-content h1 { font-size: clamp(2rem, 3vw, 2.5rem); line-height: 1.15; font-weight: 650; margin-top: 0; margin-bottom: 1rem; letter-spacing: -0.02em; }
  .doc-content h2 { font-size: 1.5rem; line-height: 1.25; font-weight: 600; margin-top: 2.25rem; margin-bottom: 0.9rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.5rem; }
  .doc-content h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.6rem; }
  .doc-content p { margin-bottom: 0.95rem; line-height: 1.7; max-width: 78ch; }
  .doc-content ul, .doc-content ol { margin-bottom: 1rem; padding-left: 1.3rem; max-width: 78ch; }
  .doc-content li { margin-bottom: 0.35rem; }
  .doc-content table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 1rem 0 1.25rem; border: 1px solid hsl(var(--border)); border-radius: 10px; overflow: hidden; }
  .doc-content thead th { background: hsl(var(--muted) / 0.55); font-size: 0.78rem; letter-spacing: 0.05em; text-transform: uppercase; color: hsl(var(--muted-foreground)); font-weight: 600; }
  .doc-content th, .doc-content td { border-bottom: 1px solid hsl(var(--border)); padding: 0.65rem 0.8rem; vertical-align: top; text-align: left; }
  .doc-content tr:last-child td { border-bottom: 0; }
  .doc-content img { width: 100%; max-width: 920px; border: 1px dashed hsl(var(--border)); border-radius: 12px; background: hsl(var(--muted) / 0.35); padding: 0.25rem; margin: 0.75rem 0 1rem; }
  .doc-content code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.875em; }
  .doc-content pre { background: hsl(var(--muted) / 0.5); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
  .doc-content pre code { background: none; padding: 0; }
  .doc-content details.doc-code { margin: 0.75rem 0 1rem; border: 1px solid hsl(var(--border)); border-radius: 10px; background: hsl(var(--muted) / 0.25); overflow: hidden; }
  .doc-content details.doc-code > summary { list-style: none; cursor: pointer; padding: 0.6rem 0.85rem; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: hsl(var(--muted-foreground)); border-bottom: 1px solid hsl(var(--border)); }
  .doc-content details.doc-code > summary::-webkit-details-marker { display: none; }
  .doc-content details.doc-code[open] > summary { background: hsl(var(--muted) / 0.45); color: hsl(var(--foreground)); }
  .doc-content details.doc-code pre { margin: 0; border: 0; border-radius: 0; background: transparent; }
  .doc-content strong { font-weight: 600; }
  .doc-content hr { border: 0; border-top: 1px solid hsl(var(--border)); margin: 2rem 0; }
  .doc-content a { color: hsl(var(--primary)); text-decoration: underline; }

  .doc-content details.doc-journey { margin: 0.75rem 0 0.5rem; border: 1px solid hsl(var(--border)); border-radius: 10px; overflow: hidden; }
  .doc-content details.doc-journey > summary { list-style: none; cursor: pointer; padding: 0.75rem 1rem; font-size: 1.05rem; font-weight: 600; color: hsl(var(--foreground)); background: hsl(var(--muted) / 0.3); transition: background 0.15s; display: flex; align-items: center; gap: 0.5rem; }
  .doc-content details.doc-journey > summary:hover { background: hsl(var(--muted) / 0.55); }
  .doc-content details.doc-journey > summary::-webkit-details-marker { display: none; }
  .doc-content details.doc-journey > summary::before { content: '▸'; font-size: 0.85em; color: hsl(var(--muted-foreground)); transition: transform 0.15s; display: inline-block; }
  .doc-content details.doc-journey[open] > summary::before { transform: rotate(90deg); }
  .doc-content details.doc-journey[open] > summary { background: hsl(var(--muted) / 0.5); border-bottom: 1px solid hsl(var(--border)); }
  .doc-content details.doc-journey > .doc-journey-body { padding: 0.5rem 1rem 0.75rem; }
  .doc-content details.doc-journey > .doc-journey-body > h3 { margin-top: 0.5rem; }

  .doc-content details.doc-scenario { margin: 0.5rem 0; border: 1px solid hsl(var(--border) / 0.6); border-radius: 8px; overflow: hidden; }
  .doc-content details.doc-scenario > summary { list-style: none; cursor: pointer; padding: 0.55rem 0.85rem; font-size: 0.9rem; font-weight: 600; color: hsl(var(--foreground) / 0.85); background: hsl(var(--muted) / 0.15); transition: background 0.15s; display: flex; align-items: center; gap: 0.45rem; }
  .doc-content details.doc-scenario > summary:hover { background: hsl(var(--muted) / 0.35); }
  .doc-content details.doc-scenario > summary::-webkit-details-marker { display: none; }
  .doc-content details.doc-scenario > summary::before { content: '▸'; font-size: 0.75em; color: hsl(var(--muted-foreground)); transition: transform 0.15s; display: inline-block; }
  .doc-content details.doc-scenario[open] > summary::before { transform: rotate(90deg); }
  .doc-content details.doc-scenario[open] > summary { background: hsl(var(--muted) / 0.3); border-bottom: 1px solid hsl(var(--border) / 0.5); }
  .doc-content details.doc-scenario > .doc-scenario-body { padding: 0.35rem 0.85rem 0.5rem; }
  .doc-content details.doc-scenario > .doc-scenario-body > ol { margin-top: 0.5rem; }
`;

/**
 * Wraps Journey (h3) and Scenario (bold-only paragraph) sections inside
 * the "## User flow" block into nested <details> accordions.
 * Sections outside "## User flow" are left untouched.
 */
function wrapFlowAccordions(md: string): string {
  const userFlowH2 = /^## User flow\s*$/m;
  const h2Start = md.search(userFlowH2);
  if (h2Start === -1) return md;

  const afterH2 = md.indexOf("\n", h2Start);
  if (afterH2 === -1) return md;

  const nextH2 = md.indexOf("\n## ", afterH2 + 1);
  const flowBlock =
    nextH2 === -1 ? md.slice(afterH2 + 1) : md.slice(afterH2 + 1, nextH2);
  const rest = nextH2 === -1 ? "" : md.slice(nextH2);

  const lines = flowBlock.split("\n");
  const out: string[] = [];
  let inJourney = false;
  let inScenario = false;

  function closeScenario() {
    if (inScenario) {
      out.push("</div></details>");
      inScenario = false;
    }
  }

  function closeJourney() {
    closeScenario();
    if (inJourney) {
      out.push("</div></details>");
      inJourney = false;
    }
  }

  for (const line of lines) {
    const journeyMatch = line.match(/^### (.+)/);
    const scenarioMatch = line.match(/^\*\*(.+)\*\*\s*$/);

    if (journeyMatch) {
      closeJourney();
      const title = journeyMatch[1];
      out.push(
        `<details class="doc-journey"><summary>${title}</summary><div class="doc-journey-body">`,
      );
      inJourney = true;
    } else if (scenarioMatch && inJourney) {
      closeScenario();
      const title = scenarioMatch[1];
      out.push(
        `<details class="doc-scenario"><summary>${title}</summary><div class="doc-scenario-body">`,
      );
      inScenario = true;
    } else {
      out.push(line);
    }
  }

  closeJourney();

  return md.slice(0, afterH2 + 1) + out.join("\n") + rest;
}

export function MarkdownContent({ content }: { content: string }) {
  const processed = wrapFlowAccordions(content);

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match?.[1];
      const value = String(children).replace(/\n$/, "");

      if (language === "mermaid") {
        return <MermaidDiagram chart={value} />;
      }

      if (!match) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      return (
        <details className="doc-code">
          <summary>View code</summary>
          <pre>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </details>
      );
    },
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: docStyles }} />
      <div className="doc-content text-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {processed}
        </ReactMarkdown>
      </div>
    </>
  );
}
