"use client";

import { useEffect, useMemo, useState } from "react";
import mermaid from "mermaid";

let mermaidInitialized = false;

function ensureMermaidInitialized() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "neutral",
  });
  mermaidInitialized = true;
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState("");
  const [hasError, setHasError] = useState(false);
  const id = useMemo(
    () => `mermaid-${Math.random().toString(36).slice(2, 10)}`,
    []
  );

  useEffect(() => {
    let mounted = true;

    async function render() {
      try {
        ensureMermaidInitialized();
        const result = await mermaid.render(id, chart);
        if (!mounted) return;
        setSvg(result.svg);
        setHasError(false);
      } catch {
        if (!mounted) return;
        setHasError(true);
        setSvg("");
      }
    }

    render();
    return () => {
      mounted = false;
    };
  }, [chart, id]);

  if (hasError) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-xs">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border border-border bg-card p-4 [&_svg]:h-auto [&_svg]:min-w-[720px] [&_svg]:max-w-none [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

