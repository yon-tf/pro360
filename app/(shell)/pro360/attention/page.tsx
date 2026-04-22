"use client";

import { Suspense, useMemo, useState, useDeferredValue } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/Tabs";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
} from "@/components/ui/solar-icons";
import { systemToast } from "@/lib/systemToast";
import {
  buildChatRows,
  buildAppointmentRows,
  buildProfessionalRows,
  buildPodRows,
  buildLearnRows,
  buildGigRows,
  buildSystemRows,
  ATTENTION_TAB_LABELS,
  type AttentionTabId,
  type AttentionRow,
} from "@/lib/attention-rows";
import { SeverityBadge } from "@/features/attention/components/SeverityBadge";

const ALL_TABS: AttentionTabId[] = ["chat", "appointments", "professional", "pod", "learn", "gig", "system"];
const PAGE_SIZE = 10;

export default function NeedsAttentionPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>}>
      <NeedsAttentionContent />
    </Suspense>
  );
}

function NeedsAttentionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AttentionTabId) || "chat";

  const allRows = useMemo(() => ({
    chat: buildChatRows(),
    appointments: buildAppointmentRows(),
    professional: buildProfessionalRows(),
    pod: buildPodRows(),
    learn: buildLearnRows(),
    gig: buildGigRows(),
    system: buildSystemRows(),
  }), []);

  const [activeTab, setActiveTab] = useState<AttentionTabId>(
    ALL_TABS.includes(initialTab) ? initialTab : "chat"
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const handleTabChange = (id: string) => {
    setActiveTab(id as AttentionTabId);
    setPage(1);
    setSearch("");
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const activeRows = allRows[activeTab];

  const filtered = useMemo(() => {
    if (!deferredSearch.trim()) return activeRows;
    const q = deferredSearch.toLowerCase();
    return activeRows.filter(
      (r) =>
        r.primaryLabel.toLowerCase().includes(q) ||
        r.secondaryLabel.toLowerCase().includes(q) ||
        r.ageLabel.toLowerCase().includes(q)
    );
  }, [activeRows, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleComingSoon = () => {
    systemToast.info("Coming soon", "This action is not yet available.");
  };

  const criticalCount = useMemo(
    () => Object.values(allRows).flat().filter((r) => r.severity === "critical").length,
    [allRows],
  );

  const tabHasUrgent = (tabId: AttentionTabId) =>
    allRows[tabId].some((r) => r.severity === "critical" || r.severity === "high");

  const tabItems = ALL_TABS.map((id) => ({
    id,
    label: `${ATTENTION_TAB_LABELS[id]} (${allRows[id].length})`,
    suffix: tabHasUrgent(id) ? (
      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
    ) : undefined,
  }));

  const totalItems = Object.values(allRows).reduce((s, r) => s + r.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
          <Link href="/pro360">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Needs attention
            <Badge variant="secondary" className="ml-1 rounded-full px-3 py-1 text-xxxs font-semibold">{totalItems}</Badge>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-1 rounded-full px-3 py-1 text-xxxs font-semibold">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {criticalCount} critical
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">All items requiring action across modules</p>
        </div>
      </div>

      {/* Tabs + content */}
      <Card>
        <CardHeader className="pb-2">
          <div className="space-y-3">
            <Tabs tabs={tabItems} activeId={activeTab} onChange={handleTabChange} />
            <div className="flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${ATTENTION_TAB_LABELS[activeTab].toLowerCase()} items…`}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {deferredSearch.trim()
                ? "No items match your search."
                : "No items in this category."}
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {paginated.map((row) => (
                  <AttentionItem key={row.id} row={row} onAction={handleComingSoon} />
                ))}
              </ul>

              {(totalPages > 1 || filtered.length > 0) && (
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-xs text-muted-foreground">
                    Showing {paginated.length} of {filtered.length} · sorted by severity
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="link" size="sm" className="text-xs h-7 px-0" asChild>
                      <Link href="/pro360">View dashboard →</Link>
                    </Button>
                    {totalPages > 1 && (
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
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AttentionItem({ row, onAction }: { row: AttentionRow; onAction: () => void }) {
  return (
    <li className="flex items-center gap-4 py-3">
      <SeverityBadge row={row} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{row.primaryLabel}</p>
        <p className="text-xs text-muted-foreground">{row.secondaryLabel}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{row.ageLabel}</span>
      <Button variant="outline" size="sm" className="shrink-0" onClick={onAction}>
        {row.actionLabel}
      </Button>
      {row.secondaryAction && (
        <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={onAction}>
          {row.secondaryAction.label}
        </Button>
      )}
    </li>
  );
}
