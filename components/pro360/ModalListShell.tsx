"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "@/components/ui/solar-icons";

const PAGE_SIZE = 5;

interface ModalListShellProps<T> {
  items: T[];
  searchFn: (item: T, query: string) => boolean;
  renderItem: (item: T, index: number) => ReactNode;
  searchPlaceholder?: string;
  total?: { label: string; value: string };
  emptyMessage?: string;
}

export function ModalListShell<T>({
  items,
  searchFn,
  renderItem,
  searchPlaceholder = "Search…",
  total,
  emptyMessage = "No results found.",
}: ModalListShellProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = search
    ? items.filter((item) => searchFn(item, search.toLowerCase()))
    : items;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-8 pl-8 text-sm"
        />
      </div>

      {paginated.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {paginated.map((item, i) => renderItem(item, (safePage - 1) * PAGE_SIZE + i))}
        </div>
      )}

      {total && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold text-foreground">{total.label}</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">{total.value}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-xs text-muted-foreground">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""} · Page {safePage} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
