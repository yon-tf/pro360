import type { ReactNode } from "react";
import { DocsSidebar } from "@/features/docs/components/DocsSidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-10">
      <div className="mb-6 border-b border-border/70 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Documentation
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Pro360 Product Docs
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Product behavior, module workflows, and design language references for Clinical Ops.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DocsSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
