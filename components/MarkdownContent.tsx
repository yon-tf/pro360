"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const docStyles = `
  .doc-content h1 { font-size: 1.75rem; font-weight: 600; margin-top: 0; margin-bottom: 1rem; }
  .doc-content h2 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.25rem; }
  .doc-content h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
  .doc-content p { margin-bottom: 0.75rem; line-height: 1.6; }
  .doc-content ul, .doc-content ol { margin-bottom: 0.75rem; padding-left: 1.5rem; }
  .doc-content li { margin-bottom: 0.25rem; }
  .doc-content code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.875em; }
  .doc-content pre { background: hsl(var(--muted) / 0.5); border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 1rem; overflow-x-auto; margin-bottom: 1rem; }
  .doc-content pre code { background: none; padding: 0; }
  .doc-content strong { font-weight: 600; }
  .doc-content hr { border: 0; border-top: 1px solid hsl(var(--border)); margin: 1.5rem 0; }
  .doc-content a { color: hsl(var(--primary)); text-decoration: underline; }
`;

export function MarkdownContent({ content }: { content: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: docStyles }} />
      <div className="doc-content text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </>
  );
}
