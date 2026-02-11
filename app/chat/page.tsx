"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, Suspense } from "react";
import {
  viewOnlyThreads,
  interactiveThreads,
  threadMessages,
  threadMetadataByThreadId,
  chatProfessionals,
  type Message,
  type ChatThread,
} from "@/lib/mock/chat";
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_NAMES_VISIBLE = 2;
const VIEW_ONLY_VISIBLE_DEFAULT = 5;

type ChatCategory = "all" | "view-only" | "interactive";

export type Annotation = {
  id: string;
  messageId: string;
  text: string;
  label: string;
  author: string;
  date: string;
};

function ParticipantChip({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {count} {count === 1 ? "member" : "members"}
    </span>
  );
}

function ParticipantNames({
  participants,
  expanded,
  onToggle,
  className,
}: {
  participants: { name: string; role?: string }[];
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const total = participants.length;
  const visible = expanded ? participants : participants.slice(0, MAX_NAMES_VISIBLE);
  const extra = total - MAX_NAMES_VISIBLE;
  return (
    <div className={clsx("flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground", className)}>
      {visible.map((p, i) => (
        <span key={i}>
          {p.name}
          {p.role && <span className="text-muted-foreground/80"> ({p.role})</span>}
          {i < visible.length - 1 && ", "}
        </span>
      ))}
      {!expanded && extra > 0 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }} className="inline-flex items-center font-medium text-primary hover:underline">
          +{extra}
          <ChevronDown className="ml-0.5 h-3 w-3" />
        </button>
      )}
      {expanded && total > MAX_NAMES_VISIBLE && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }} className="inline-flex items-center font-medium text-primary hover:underline">
          Show less
          <ChevronUp className="ml-0.5 h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function getRiskLevel(annotationCount: number): "Low" | "Medium" | "High" {
  if (annotationCount === 0) return "Low";
  if (annotationCount <= 2) return "Medium";
  return "High";
}

function ChatContent() {
  const searchParams = useSearchParams();
  const professionalId = searchParams.get("professionalId");
  const clientId = searchParams.get("clientId");
  const view = searchParams.get("view");
  const deepLinkThreadId = view === "tfp-client" && professionalId && clientId ? "vo-1" : null;

  const [chatCategory, setChatCategory] = useState<ChatCategory>("all");
  const [professionalSearch, setProfessionalSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkThreadId ?? "int-1");
  const [composerText, setComposerText] = useState("");
  const [expandedParticipantsId, setExpandedParticipantsId] = useState<string | null>(null);
  const [showAllViewOnly, setShowAllViewOnly] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [annotationsByThread, setAnnotationsByThread] = useState<Record<string, Annotation[]>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string; text: string } | null>(null);

  const viewOnlyVisible = viewOnlyThreads.slice(0, showAllViewOnly ? viewOnlyThreads.length : VIEW_ONLY_VISIBLE_DEFAULT);
  const viewOnlyHiddenCount = Math.max(0, viewOnlyThreads.length - VIEW_ONLY_VISIBLE_DEFAULT);

  const filteredProfessionals = useMemo(
    () =>
      chatProfessionals.filter((p) =>
        professionalSearch.trim() === ""
          ? true
          : p.name.toLowerCase().includes(professionalSearch.toLowerCase())
      ),
    [professionalSearch]
  );

  const threadsForList = useMemo(() => {
    if (chatCategory === "view-only") return viewOnlyThreads;
    if (chatCategory === "interactive") return interactiveThreads;
    return [...viewOnlyThreads, ...interactiveThreads];
  }, [chatCategory]);

  const selectedThread = useMemo(() => {
    const all = [...viewOnlyThreads, ...interactiveThreads];
    return all.find((t) => t.id === selectedId) ?? null;
  }, [selectedId]);

  const messages: Message[] = selectedThread ? (threadMessages[selectedThread.id] ?? []) : [];
  const isViewOnly = selectedThread?.viewOnly ?? false;
  const showRightPanel = isViewOnly && selectedThread != null;
  const metadata = selectedThread ? threadMetadataByThreadId[selectedThread.id] ?? null : null;
  const annotations = selectedThread ? (annotationsByThread[selectedThread.id] ?? []) : [];
  const riskLevel = getRiskLevel(annotations.length);

  const handleSend = () => {
    if (!composerText.trim() || isViewOnly) return;
    setComposerText("");
  };

  const handleAnnotateDangerous = useCallback(() => {
    if (!contextMenu || !selectedThread) return;
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      messageId: contextMenu.messageId,
      text: contextMenu.text,
      label: "dangerous",
      author: "Sarah Lee",
      date: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    setAnnotationsByThread((prev) => ({
      ...prev,
      [selectedThread.id]: [...(prev[selectedThread.id] ?? []), newAnnotation],
    }));
    setContextMenu(null);
  }, [contextMenu, selectedThread]);

  const handleMessageContextMenu = useCallback(
    (e: React.MouseEvent, messageId: string, _body: string) => {
      if (!showRightPanel) return;
      const selection = window.getSelection()?.toString()?.trim();
      if (!selection) return;
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, messageId, text: selection });
    },
    [showRightPanel]
  );

  const getMessageAlignment = useCallback(
    (m: Message) => {
      if (!selectedThread) return { isRight: false, isPrimary: false };
      if (selectedThread.viewOnly) {
        if (selectedThread.participants) {
          const podLeaderName = selectedThread.participants.find((p) => p.role === "Pod leader")?.name;
          const isPodLeader = m.sender === podLeaderName;
          return { isRight: isPodLeader, isPrimary: isPodLeader };
        }
        const isProfessional = m.senderId !== "clinical" && !m.senderId.startsWith("c");
        return { isRight: isProfessional, isPrimary: isProfessional };
      }
      const isClinical = m.senderId === "clinical";
      return { isRight: isClinical, isPrimary: isClinical };
    },
    [selectedThread]
  );

  const renderThreadListItem = (t: ChatThread) => (
    <button
      key={t.id}
      type="button"
      onClick={() => setSelectedId(t.id)}
      className={clsx(
        "w-full rounded-lg px-4 py-2 text-left transition",
        selectedId === t.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
      )}
    >
      <p className="truncate text-sm font-medium text-foreground">{t.label}</p>
      {t.participants ? (
        <>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {t.participants.find((p) => p.role === "Pod leader")?.name ?? t.participants[0]?.name}
          </p>
          <div className="mt-1">
            <ParticipantChip count={t.participants.length} />
          </div>
        </>
      ) : t.subLabel ? (
        <p className="truncate text-xs text-muted-foreground">{t.subLabel}</p>
      ) : null}
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.lastPreview}</p>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl bg-card shadow-card">
        {/* Left panel: All / View Only / Interactive + Professionals */}
        <div className="flex w-52 shrink-0 flex-col border-r border-border/50">
          <div className="border-b border-border p-3">
            <h2 className="text-sm font-semibold text-foreground">Chat</h2>
          </div>
          <div className="flex flex-col gap-1 border-b border-border p-2">
            <button
              type="button"
              onClick={() => setChatCategory("all")}
              className={clsx(
                "rounded-md px-3 py-2 text-left text-sm font-medium transition",
                chatCategory === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setChatCategory("view-only")}
              className={clsx(
                "rounded-md px-3 py-2 text-left text-sm font-medium transition",
                chatCategory === "view-only" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              View Only
            </button>
            <button
              type="button"
              onClick={() => setChatCategory("interactive")}
              className={clsx(
                "rounded-md px-3 py-2 text-left text-sm font-medium transition",
                chatCategory === "interactive" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              Interactive
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex-col p-2">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Professionals
            </p>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={professionalSearch}
                onChange={(e) => setProfessionalSearch(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
            <div className="space-y-0.5 overflow-y-auto">
              {filteredProfessionals.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {p.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{p.name}</p>
                    <p className={clsx("text-xs", p.online ? "text-emerald-600" : "text-muted-foreground")}>
                      {p.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center-left: Chat list filtered by category */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border/50">
          <div className="border-b border-border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {chatCategory === "all" ? "All conversations" : chatCategory === "view-only" ? "View-only" : "Interactive"}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {chatCategory === "all" && (
              <>
                <section className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">View-only</p>
                  {viewOnlyVisible.map(renderThreadListItem)}
                  {viewOnlyHiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllViewOnly((v) => !v)}
                      className="mt-1 w-full rounded-lg px-4 py-2 text-left text-xs font-medium text-primary hover:bg-muted/50"
                    >
                      {showAllViewOnly ? "Show less" : `View more (${viewOnlyHiddenCount})`}
                    </button>
                  )}
                </section>
                <section className="border-t border-border pt-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Interactive</p>
                  {interactiveThreads.map(renderThreadListItem)}
                </section>
              </>
            )}
            {chatCategory === "view-only" && (
              <>
                {viewOnlyVisible.map(renderThreadListItem)}
                {viewOnlyHiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllViewOnly((v) => !v)}
                    className="mt-1 w-full rounded-lg px-4 py-2 text-left text-xs font-medium text-primary hover:bg-muted/50"
                  >
                    {showAllViewOnly ? "Show less" : `View more (${viewOnlyHiddenCount})`}
                  </button>
                )}
              </>
            )}
            {chatCategory === "interactive" && interactiveThreads.map(renderThreadListItem)}
          </div>
        </div>

        {/* Center-right: Thread messages */}
        <div className="flex min-w-0 flex-1 flex-col">
          {selectedThread ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{selectedThread.label}</h3>
                  {selectedThread.participants ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <ParticipantChip count={selectedThread.participants.length} />
                      <ParticipantNames
                        participants={selectedThread.participants}
                        expanded={expandedParticipantsId === selectedThread.id}
                        onToggle={() =>
                          setExpandedParticipantsId((id) => (id === selectedThread.id ? null : selectedThread.id))
                        }
                      />
                    </div>
                  ) : selectedThread.subLabel ? (
                    <p className="text-xs text-muted-foreground">{selectedThread.subLabel}</p>
                  ) : null}
                  {selectedThread.viewOnly && (
                    <span className="mt-1.5 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      View only – No intervention
                    </span>
                  )}
                </div>
                {showRightPanel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRightPanelOpen((v) => !v)}
                    className="shrink-0"
                    aria-label={rightPanelOpen ? "Hide right panel" : "Expand right panel"}
                  >
                    {rightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((m) => {
                  const { isRight, isPrimary } = getMessageAlignment(m);
                  return (
                    <div
                      key={m.id}
                      onContextMenu={(e) => handleMessageContextMenu(e, m.id, m.body)}
                      className={clsx(
                        "max-w-[85%] rounded-xl px-4 py-2 selection:bg-amber-200 dark:selection:bg-amber-800",
                        isRight ? "ml-auto mr-0" : "ml-0",
                        isPrimary ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      )}
                    >
                      <p className="text-xs font-medium opacity-90">{m.sender}</p>
                      <p className="mt-0.5 text-sm">{m.body}</p>
                      <p className="mt-1 text-xs opacity-70">{m.time}</p>
                    </div>
                  );
                })}
              </div>
              {!isViewOnly && (
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <Button onClick={handleSend} disabled={!composerText.trim()} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12" />
                <p className="mt-2 text-sm">Select a conversation</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Metadata + Annotations + Risk (view-only, collapsible) */}
        {selectedThread && showRightPanel && (
          <div
            className={clsx(
              "flex shrink-0 flex-col border-l border-border/50 bg-muted/30 transition-[width]",
              rightPanelOpen ? "w-80" : "w-0 overflow-hidden border-0"
            )}
          >
            {rightPanelOpen && (
              <>
                <div className="border-b border-border p-3">
                  <h3 className="text-sm font-semibold text-foreground">Chat details</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {metadata && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Metadata</p>
                      <ul className="space-y-1.5 text-sm text-foreground">
                        <li className="flex items-center gap-2">
                          <span className="text-muted-foreground">Channel:</span>
                          {metadata.channel}
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-muted-foreground">Participant:</span>
                          {metadata.participantName}
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-muted-foreground">ID:</span>
                          {metadata.threadId}
                        </li>
                        {metadata.phone && (
                          <li className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {metadata.phone}
                          </li>
                        )}
                        {metadata.address && (
                          <li className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {metadata.address}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Risk level</p>
                    <div
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium",
                        riskLevel === "High" && "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
                        riskLevel === "Medium" && "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
                        riskLevel === "Low" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                      )}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      {riskLevel}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Annotations</p>
                    <p className="text-xs text-muted-foreground">
                      Highlight text in the chat, right-click and choose &quot;Annotate as dangerous&quot;.
                    </p>
                    {annotations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No annotations yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {annotations.map((a) => (
                          <li key={a.id} className="rounded-md bg-background p-2 text-sm shadow-card">
                            <span className="font-medium text-amber-700 dark:text-amber-400">&quot;{a.text}&quot;</span>
                            <span className="ml-1 text-muted-foreground">– {a.label}</span>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {a.author} · {a.date}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Context menu for "Annotate as dangerous" */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 min-w-[180px] rounded-md bg-card py-1 shadow-panel"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={handleAnnotateDangerous}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Annotate as dangerous
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center text-slate-500">Loading chat…</div>}>
      <ChatContent />
    </Suspense>
  );
}
