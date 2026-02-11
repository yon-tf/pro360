"use client";

import { clsx } from "clsx";

export type TabItem = { id: string; label: string };

export function Tabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={clsx(
                "relative pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {/* Untitled UI underline: 2px bar on active */}
              <span
                className={clsx(
                  "absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors",
                  isActive ? "bg-primary" : "bg-transparent"
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
