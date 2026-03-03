"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { DOCS_SECTIONS } from "@/app/docs/constants";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto border border-border/60 bg-card/70 p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Documentation
      </p>
      <nav
        className="ml-1 space-y-0.5 border-l border-border/80 pl-2"
        aria-label="Docs sections"
      >
        {DOCS_SECTIONS.map((item) => {
          const href = `/docs/${item.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.slug}
              href={href}
              className={clsx(
                "-ml-[9px] block border-l-2 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-l-primary bg-primary/5 font-medium text-foreground"
                  : "border-l-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

