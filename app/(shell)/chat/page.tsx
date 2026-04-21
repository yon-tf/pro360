"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect, useRef, Suspense, useDeferredValue } from "react";
import {
  viewOnlyThreads,
  podThreads,
  interactiveThreads,
  threadMessages,
  threadMetadataByThreadId,
  type Message,
  type ChatThread,
} from "@/features/chat/mock/chat";
import {
  MessageSquare,
  Send,
  Paperclip,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronLeft,
  AlertTriangle,
  Lock,
  Info,
  X,
} from "@/components/ui/solar-icons";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { detectPII, redactPII, type RedactionMatch } from "@/lib/pii/redaction";
import { logIdentityReveal, logPIIOverride } from "@/lib/pii/audit";
import { measureInDev } from "@/lib/devPerf";

const MAX_NAMES_VISIBLE = 2;
const VIEW_ONLY_VISIBLE_DEFAULT = 5;
const IDENTITY_REVEAL_MS = 2 * 60 * 1000;
const CURRENT_USER_ID = "clinical-ops-user";

type PrivacyModalMode = "blocked" | "warning";
type ComposerAttachment = { id: string; name: string; type: "image" | "file" };
type LeftPaneTab = "clients" | "internal";
type InternalFilter = "all" | "broadcast" | "pods" | "professionals";

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
    <Badge variant="secondary" className="px-2 py-1 text-xs font-medium text-muted-foreground">
      {count} {count === 1 ? "member" : "members"}
    </Badge>
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
    <div className={clsx("flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted-foreground", className)}>
      {visible.map((p, i) => (
        <span key={i}>
          {p.name}
          {p.role && <span className="text-muted-foreground/80"> ({p.role})</span>}
          {i < visible.length - 1 && ", "}
        </span>
      ))}
      {!expanded && extra > 0 && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="h-auto px-0 text-xs font-medium"
        >
          +{extra}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      )}
      {expanded && total > MAX_NAMES_VISIBLE && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="h-auto px-0 text-xs font-medium"
        >
          Show less
          <ChevronUp className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function getRiskLevel(annotationCount: number): "Low" | "Medium" | "High" {
  if (annotationCount === 0) return "Low";
  if (annotationCount <= 2) return "Medium";
  return "High";
}

function formatCountdown(remainingMs: number): string {
  const safeMs = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function typeLabel(type: RedactionMatch["type"]): string {
  if (type === "phone") return "Phone number";
  if (type === "email") return "Email address";
  if (type === "link") return "Link";
  if (type === "credit_card") return "Credit card";
  if (type === "bank_account") return "Bank account";
  if (type === "national_id") return "National ID";
  return "Passport";
}

function getThreadPrimaryLabel(thread: ChatThread): string {
  return thread.clientDisplayId ? `Client • ${thread.clientDisplayId}` : thread.label;
}

function getThreadSecondaryLabel(thread: ChatThread): string | null {
  if (thread.clientDisplayId) return thread.label;
  if (thread.subLabel) return thread.subLabel;
  return null;
}

function RevealIdentityModal({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onReveal,
  isVisible,
  countdownMs,
  clientFullName,
  clientEmail,
  clientPhone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  onReveal: () => void;
  isVisible: boolean;
  countdownMs: number;
  clientFullName?: string;
  clientEmail?: string;
  clientPhone?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reveal identity</DialogTitle>
          <DialogDescription>
            Sensitive identity access will be logged. Only reveal if necessary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Reason</p>
            <Select value={reason} onValueChange={onReasonChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="care-coordination">Care coordination</SelectItem>
                <SelectItem value="safety-follow-up">Safety follow-up</SelectItem>
                <SelectItem value="admin-verification">Admin verification</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isVisible ? (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Identity details</p>
                <Badge variant="warning">Visible ({formatCountdown(countdownMs)})</Badge>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="min-w-20 text-muted-foreground">Full name:</dt>
                  <dd className="text-foreground">{clientFullName ?? "—"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="min-w-20 text-muted-foreground">Email:</dt>
                  <dd className="text-foreground">
                    {clientEmail ? (
                      <a className="text-primary hover:underline" href={`mailto:${clientEmail}`}>
                        {clientEmail}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="min-w-20 text-muted-foreground">Phone:</dt>
                  <dd className="text-foreground">{clientPhone ?? "—"}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              Identity hidden.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onReveal}>
            Reveal identity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PIIReviewModal({
  open,
  mode,
  matches,
  onEdit,
  onSendAnyway,
}: {
  open: boolean;
  mode: PrivacyModalMode;
  matches: RedactionMatch[];
  onEdit: () => void;
  onSendAnyway: () => void;
}) {
  const detectedTypes = Array.from(new Set(matches.map((match) => match.type)));
  const snippets = Array.from(new Set(matches.map((match) => match.value))).slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onEdit()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "blocked" ? "Message blocked" : "Review before sending"}</DialogTitle>
          <DialogDescription>
            {mode === "blocked"
              ? "This message appears to include highly sensitive information. Remove it before sending."
              : "This looks like personal contact information. Share only if needed."}
          </DialogDescription>
        </DialogHeader>

        {mode === "warning" && (
          <div className="space-y-3 text-sm">
            <ul className="list-inside list-disc text-muted-foreground">
              {detectedTypes.map((type) => (
                <li key={type}>{typeLabel(type)}</li>
              ))}
            </ul>
            <div>
              <p className="font-medium text-foreground">Detected:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {snippets.map((snippet) => (
                  <li key={snippet} className="truncate">
                    {snippet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={onEdit}>
            Edit message
          </Button>
          {mode === "warning" && (
            <Button type="button" variant="outline" onClick={onSendAnyway}>
              Send anyway
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const professionalId = searchParams.get("professionalId");
  const clientId = searchParams.get("clientId");
  const view = searchParams.get("view");
  const deepLinkThreadId = view === "tfp-client" && professionalId && clientId ? "vo-1" : null;

  const [leftPaneTab, setLeftPaneTab] = useState<LeftPaneTab>(deepLinkThreadId ? "clients" : "internal");
  const [internalFilter, setInternalFilter] = useState<InternalFilter>("all");
  const [conversationSearch, setConversationSearch] = useState("");
  const deferredConversationSearch = useDeferredValue(conversationSearch);
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkThreadId ?? null);
  const [composerText, setComposerText] = useState("");
  const [composerAttachments, setComposerAttachments] = useState<ComposerAttachment[]>([]);
  const [pendingSendText, setPendingSendText] = useState("");
  const [pendingSendAttachments, setPendingSendAttachments] = useState<ComposerAttachment[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>(() => ({ ...threadMessages }));
  const [expandedParticipantsId, setExpandedParticipantsId] = useState<string | null>(null);
  const [showAllViewOnly, setShowAllViewOnly] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [annotationsByThread, setAnnotationsByThread] = useState<Record<string, Annotation[]>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string; text: string } | null>(null);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [revealReason, setRevealReason] = useState("care-coordination");
  const [identityRevealExpiresAt, setIdentityRevealExpiresAt] = useState<number | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [privacyModalMode, setPrivacyModalMode] = useState<PrivacyModalMode>("warning");
  const [detectedPrivacyMatches, setDetectedPrivacyMatches] = useState<RedactionMatch[]>([]);
  const [privacyInfoOpen, setPrivacyInfoOpen] = useState(false);
  const composerRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [now, setNow] = useState(Date.now());

  const matchesConversationSearch = useCallback((thread: ChatThread, query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;

    const participantNames = thread.participants?.map((p) => p.name).join(" ") ?? "";
    const haystack = [
      thread.label,
      thread.subLabel ?? "",
      thread.clientDisplayId ?? "",
      participantNames,
      thread.lastPreview,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  }, []);

  const filteredViewOnlyThreads = useMemo(
    () =>
      measureInDev("chat:filteredViewOnlyThreads", () =>
        viewOnlyThreads.filter((thread) =>
          matchesConversationSearch(thread, deferredConversationSearch)
        )
      ),
    [deferredConversationSearch, matchesConversationSearch]
  );

  const allInteractiveThreads = useMemo(() => [...interactiveThreads, ...podThreads], []);

  const filteredInteractiveThreads = useMemo(
    () =>
      measureInDev("chat:filteredInteractiveThreads", () =>
        allInteractiveThreads.filter((thread) =>
          matchesConversationSearch(thread, deferredConversationSearch)
        )
      ),
    [allInteractiveThreads, deferredConversationSearch, matchesConversationSearch]
  );

  const interactiveBroadcast = useMemo(() => filteredInteractiveThreads.filter((t) => t.subtype === "broadcast"), [filteredInteractiveThreads]);
  const interactivePod = useMemo(() => filteredInteractiveThreads.filter((t) => t.subtype === "pod"), [filteredInteractiveThreads]);
  const interactiveProfessional = useMemo(() => filteredInteractiveThreads.filter((t) => t.subtype === "professional"), [filteredInteractiveThreads]);

  const internalFilteredThreads = useMemo(() => {
    if (internalFilter === "broadcast") return interactiveBroadcast;
    if (internalFilter === "pods") return interactivePod;
    if (internalFilter === "professionals") return interactiveProfessional;
    return [...interactiveBroadcast, ...interactivePod, ...interactiveProfessional];
  }, [internalFilter, interactiveBroadcast, interactivePod, interactiveProfessional]);

  const viewOnlyVisibleFiltered =
    deferredConversationSearch.trim() === ""
      ? filteredViewOnlyThreads.slice(0, showAllViewOnly ? filteredViewOnlyThreads.length : VIEW_ONLY_VISIBLE_DEFAULT)
      : filteredViewOnlyThreads;
  const viewOnlyHiddenCountFiltered =
    deferredConversationSearch.trim() === ""
      ? Math.max(0, filteredViewOnlyThreads.length - VIEW_ONLY_VISIBLE_DEFAULT)
      : 0;

  const allThreads = useMemo(() => [...viewOnlyThreads, ...podThreads, ...interactiveThreads], []);

  const selectedThread = useMemo(() => {
    return allThreads.find((t) => t.id === selectedId) ?? null;
  }, [allThreads, selectedId]);

  const messages: Message[] = selectedThread ? (messagesByThread[selectedThread.id] ?? []) : [];
  const isViewOnly = selectedThread?.viewOnly ?? false;
  const hasOversight = selectedThread?.oversight ?? selectedThread?.viewOnly ?? false;
  const showRightPanel = hasOversight && selectedThread != null;
  const metadata = selectedThread ? threadMetadataByThreadId[selectedThread.id] ?? null : null;
  const annotations = selectedThread ? (annotationsByThread[selectedThread.id] ?? []) : [];
  const riskLevel = getRiskLevel(annotations.length);

  useEffect(() => {
    if (deepLinkThreadId) return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    if (mediaQuery.matches) setSelectedId((prev) => prev ?? "int-1");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setSelectedId((prev) => prev ?? "int-1");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [deepLinkThreadId]);

  useEffect(() => {
    if (!identityRevealExpiresAt) return;
    const tick = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(tick);
  }, [identityRevealExpiresAt]);

  useEffect(() => {
    if (!identityRevealExpiresAt) return;
    if (Date.now() >= identityRevealExpiresAt) {
      setIdentityRevealExpiresAt(null);
    }
  }, [now, identityRevealExpiresAt]);

  useEffect(() => {
    setIdentityRevealExpiresAt(null);
    setRevealModalOpen(false);
    setDetailsOpen(false);
    setComposerText("");
    setComposerAttachments([]);
    setPendingSendText("");
    setPendingSendAttachments([]);
  }, [selectedId]);

  const isIdentityVisible = identityRevealExpiresAt != null && identityRevealExpiresAt > now;
  const identityCountdownMs = isIdentityVisible && identityRevealExpiresAt ? identityRevealExpiresAt - now : 0;

  const commitSend = useCallback(
    (text: string, attachments: ComposerAttachment[] = []) => {
      if (!selectedThread || (!text.trim() && attachments.length === 0)) return;
      const newMessage: Message = {
        id: `m-${Date.now()}`,
        sender: "Sarah Lee",
        senderId: "clinical",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase(),
        body: text,
        attachments: attachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
        })),
      };
      setMessagesByThread((prev) => ({
        ...prev,
        [selectedThread.id]: [...(prev[selectedThread.id] ?? []), newMessage],
      }));
    },
    [selectedThread]
  );

  const handleSend = () => {
    if ((!composerText.trim() && composerAttachments.length === 0) || isViewOnly || !selectedThread) return;
    const draft = composerText.trim();
    const piiMatches = detectPII(draft);
    const hardTypes = new Set<RedactionMatch["type"]>(["credit_card", "bank_account", "national_id", "passport"]);
    const hasHardBlock = piiMatches.some((match) => hardTypes.has(match.type));
    const hasSoftWarning = piiMatches.some((match) => !hardTypes.has(match.type) && ["phone", "email", "link"].includes(match.type));

    if (hasHardBlock) {
      setDetectedPrivacyMatches(piiMatches.filter((match) => hardTypes.has(match.type)));
      setPrivacyModalMode("blocked");
      setPrivacyModalOpen(true);
      return;
    }

    if (hasSoftWarning) {
      setPendingSendText(draft);
      setPendingSendAttachments(composerAttachments);
      setDetectedPrivacyMatches(
        piiMatches.filter((match) => match.type === "phone" || match.type === "email" || match.type === "link")
      );
      setPrivacyModalMode("warning");
      setPrivacyModalOpen(true);
      return;
    }

    commitSend(draft, composerAttachments);
    setComposerText("");
    setComposerAttachments([]);
    setPendingSendText("");
    setPendingSendAttachments([]);
  };

  const handleSendAnyway = () => {
    if (!selectedThread || (!pendingSendText && pendingSendAttachments.length === 0)) return;
    commitSend(pendingSendText, pendingSendAttachments);
    const detectedTypes = Array.from(new Set(detectedPrivacyMatches.map((match) => match.type)));
    logPIIOverride({
      conversationId: selectedThread.conversationId,
      detectedTypes,
      overriddenByUserId: CURRENT_USER_ID,
      overriddenAt: new Date().toISOString(),
    });
    setComposerText("");
    setComposerAttachments([]);
    setPendingSendText("");
    setPendingSendAttachments([]);
    setPrivacyModalOpen(false);
    setDetectedPrivacyMatches([]);
  };

  const handlePrivacyEdit = () => {
    setPrivacyModalOpen(false);
    setDetectedPrivacyMatches([]);
    composerRef.current?.focus();
  };

  const addAttachmentFromFiles = (files: FileList | null, type: ComposerAttachment["type"]) => {
    if (!files || files.length === 0) return;
    const next: ComposerAttachment[] = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type,
    }));
    setComposerAttachments((prev) => [...prev, ...next]);
  };

  const removeAttachment = (attachmentId: string) => {
    setComposerAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
  };

  const handleRevealIdentity = () => {
    if (!selectedThread) return;
    const expiresAt = Date.now() + IDENTITY_REVEAL_MS;
    setIdentityRevealExpiresAt(expiresAt);
    logIdentityReveal({
      conversationId: selectedThread.conversationId,
      reason: revealReason,
      revealedByUserId: CURRENT_USER_ID,
      revealedAt: new Date().toISOString(),
    });
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
    (e: React.MouseEvent, messageId: string) => {
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
      // Interactive pod chats: clinical ops messages align right
      if (selectedThread.oversight && selectedThread.participants) {
        const isClinical = m.senderId === "clinical";
        return { isRight: isClinical, isPrimary: isClinical };
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
      onClick={() => {
        setLeftPaneTab(t.viewOnly ? "clients" : "internal");
        setSelectedId(t.id);
      }}
      className={clsx(
        "w-full border-b border-border/50 px-4 py-2 text-left transition last:border-b-0",
        selectedId === t.id ? "bg-primary/10 text-primary" : "hover:bg-muted/40"
      )}
    >
      <p className="truncate text-sm font-medium text-foreground">{getThreadPrimaryLabel(t)}</p>
      {t.participants ? (
        <>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {t.participants.find((p) => p.role === "Pod leader")?.name ?? t.participants[0]?.name}
          </p>
          <div className="mt-1">
            <ParticipantChip count={t.participants.length} />
          </div>
        </>
      ) : getThreadSecondaryLabel(t) ? (
        <p className="truncate text-xs text-muted-foreground">{getThreadSecondaryLabel(t)}</p>
      ) : null}
      <p className="mt-1 truncate text-xs text-muted-foreground">{redactPII(t.lastPreview).redactedText}</p>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl bg-card shadow-card">
        {/* Left panel (responsive): Conversations / Professionals */}
        <div
          className={clsx(
            "w-full shrink-0 flex-col md:flex md:w-96 md:border-r md:border-border/50",
            selectedThread ? "hidden md:flex" : "flex"
          )}
        >
          <div className="border-b border-border p-3">
            <h2 className="text-sm font-semibold text-foreground">Chat</h2>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-3">
            <Tabs
              value={leftPaneTab}
              onValueChange={(next) => setLeftPaneTab(next as LeftPaneTab)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="w-full">
                <TabsTrigger value="clients" className="flex-1">
                  Clients
                </TabsTrigger>
                <TabsTrigger value="internal" className="flex-1">
                  Internal
                </TabsTrigger>
              </TabsList>

              <div className="relative mt-3">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>

              <TabsContent value="clients" className="mt-2 flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto">
                  {viewOnlyVisibleFiltered.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
                      {viewOnlyVisibleFiltered.map(renderThreadListItem)}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No results.</div>
                  )}
                  {viewOnlyHiddenCountFiltered > 0 && (
                    <Button
                      type="button"
                      onClick={() => setShowAllViewOnly((v) => !v)}
                      variant="ghost"
                      className="mt-2 h-auto w-full justify-start rounded-lg px-4 py-2 text-left text-xs font-medium text-primary hover:bg-muted/50"
                    >
                      {showAllViewOnly ? "Show less" : `View more (${viewOnlyHiddenCountFiltered})`}
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="internal" className="mt-2 flex min-h-0 flex-1 flex-col">
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={internalFilter === "all" ? "secondary" : "outline"}
                    className="h-8 rounded-full px-3"
                    onClick={() => setInternalFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={internalFilter === "broadcast" ? "secondary" : "outline"}
                    className="h-8 rounded-full px-3"
                    onClick={() => setInternalFilter("broadcast")}
                  >
                    Broadcast
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={internalFilter === "pods" ? "secondary" : "outline"}
                    className="h-8 rounded-full px-3"
                    onClick={() => setInternalFilter("pods")}
                  >
                    Pods
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={internalFilter === "professionals" ? "secondary" : "outline"}
                    className="h-8 rounded-full px-3"
                    onClick={() => setInternalFilter("professionals")}
                  >
                    Professionals
                  </Button>
                </div>
                <div className="mt-3 flex-1 overflow-y-auto">
                  {internalFilteredThreads.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
                      {internalFilteredThreads.map(renderThreadListItem)}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No results.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Thread panel (responsive): hidden on mobile until selected */}
        <div className={clsx("flex min-w-0 flex-1 flex-col", selectedThread ? "flex" : "hidden md:flex")}>
          {selectedThread ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedId(null)}
                    className="mt-1 md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{getThreadPrimaryLabel(selectedThread)}</h3>
                    {selectedThread.participants ? (
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <ParticipantChip count={selectedThread.participants.length} />
                        <ParticipantNames
                          participants={selectedThread.participants}
                          expanded={expandedParticipantsId === selectedThread.id}
                          onToggle={() =>
                            setExpandedParticipantsId((id) => (id === selectedThread.id ? null : selectedThread.id))
                          }
                        />
                      </div>
                    ) : getThreadSecondaryLabel(selectedThread) ? (
                      <p className="text-xs text-muted-foreground">{getThreadSecondaryLabel(selectedThread)}</p>
                    ) : null}
                    {selectedThread.viewOnly && (
                      <Badge variant="warning" className="mt-2 inline-flex">
                        View-only (privacy-safe)
                      </Badge>
                    )}
                    {!selectedThread.viewOnly && selectedThread.oversight && (
                      <Badge variant="secondary" className="mt-2 inline-flex">
                        Pod chat · Monitored
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {selectedThread.clientDisplayId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRevealModalOpen(true)}
                      title="Reveal identity"
                      aria-label="Reveal identity"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                  {showRightPanel && (
                    <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
                      <SheetTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label="Open chat details">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="sm:max-w-md">
                        <SheetHeader>
                          <SheetTitle>Chat details</SheetTitle>
                          <SheetDescription>Oversight metadata, risk level, and annotations.</SheetDescription>
                        </SheetHeader>
                        <div className="mt-4 space-y-4 overflow-y-auto">
                          {metadata && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium uppercase text-muted-foreground">Metadata</p>
                              <ul className="space-y-2 text-sm text-foreground">
                                <li className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Channel:</span>
                                  {metadata.channel}
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Participant:</span>
                                  {selectedThread.clientDisplayId
                                    ? `Client • ${selectedThread.clientDisplayId}`
                                    : metadata.participantName}
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="text-muted-foreground">ID:</span>
                                  {metadata.threadId}
                                </li>
                              </ul>
                            </div>
                          )}
                          <div className="space-y-2">
                            <p className="text-xs font-medium uppercase text-muted-foreground">Risk level</p>
                            <div
                              className={clsx(
                                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                                riskLevel === "High" &&
                                  "bg-destructive/12 text-destructive dark:bg-destructive/18 dark:text-destructive",
                                riskLevel === "Medium" &&
                                  "bg-warning/12 text-warning dark:bg-warning/18 dark:text-warning",
                                riskLevel === "Low" &&
                                  "bg-success/12 text-success dark:bg-success/18 dark:text-success"
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
                                    <span className="font-medium text-warning">&quot;{a.text}&quot;</span>
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
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((m) => {
                  const { isRight, isPrimary } = getMessageAlignment(m);
                  const senderLabel =
                    selectedThread.clientDisplayId && m.senderId.startsWith("c")
                      ? `Client • ${selectedThread.clientDisplayId}`
                      : m.sender;
                  const { redactedText, matches } = redactPII(m.body);
                  return (
                    <div
                      key={m.id}
                      onContextMenu={(e) => handleMessageContextMenu(e, m.id)}
                      className={clsx(
                        "max-w-[85%] rounded-xl px-4 py-2 selection:bg-primary/20 dark:selection:bg-primary/35",
                        isRight ? "ml-auto mr-0" : "ml-0",
                        isPrimary ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      )}
                    >
                      <p className="text-xs font-medium opacity-90">{senderLabel}</p>
                      <p className="mt-1 text-sm">{redactedText}</p>
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {m.attachments.map((attachment) => (
                            <span
                              key={attachment.id}
                              className="inline-flex items-center rounded-md border border-border/70 bg-background/70 px-2 py-1 text-xs text-foreground"
                            >
                              {attachment.type === "image" ? <ImagePlus className="mr-1 h-3 w-3" /> : <Paperclip className="mr-1 h-3 w-3" />}
                              {attachment.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {matches.length > 0 && (
                        <p className="mt-1 text-xs opacity-80">Some details are hidden for privacy.</p>
                      )}
                      <p className="mt-1 text-xs opacity-70">{m.time}</p>
                    </div>
                  );
                })}
              </div>
              {!isViewOnly && (
                <div className="border-t border-border p-4">
                  {composerAttachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {composerAttachments.map((attachment) => (
                        <span
                          key={attachment.id}
                          className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground"
                        >
                          {attachment.type === "image" ? <ImagePlus className="mr-1 h-3 w-3" /> : <Paperclip className="mr-1 h-3 w-3" />}
                          <span className="max-w-40 truncate">{attachment.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(attachment.id)}
                            className="ml-1 h-4 w-4 rounded-sm p-0"
                            aria-label={`Remove ${attachment.name}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => imageInputRef.current?.click()}
                      aria-label="Add image"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Add file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      ref={composerRef}
                      type="text"
                      placeholder="Type a message..."
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={!composerText.trim() && composerAttachments.length === 0} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                    <div onMouseEnter={() => setPrivacyInfoOpen(true)} onMouseLeave={() => setPrivacyInfoOpen(false)}>
                      <Popover open={privacyInfoOpen} onOpenChange={setPrivacyInfoOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" aria-label="Privacy guidance">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80">
                          <p className="text-sm font-medium text-foreground">Privacy best practices</p>
                          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                            <li>Prefer client pseudonymous IDs, not real names.</li>
                            <li>Avoid phone numbers, email addresses, and external profile links.</li>
                            <li>Share identity only through authorized reveal workflows.</li>
                          </ul>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addAttachmentFromFiles(e.target.files, "image");
                      e.currentTarget.value = "";
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addAttachmentFromFiles(e.target.files, "file");
                      e.currentTarget.value = "";
                    }}
                  />
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
            <Button
              type="button"
              variant="ghost"
              onClick={handleAnnotateDangerous}
              className="h-auto w-full justify-start gap-2 rounded-none px-3 py-2 text-left text-sm text-foreground"
            >
              <AlertTriangle className="h-4 w-4 text-warning" />
              Annotate as dangerous
            </Button>
          </div>
        </>
      )}

      {selectedThread?.clientDisplayId && (
        <RevealIdentityModal
          open={revealModalOpen}
          onOpenChange={setRevealModalOpen}
          reason={revealReason}
          onReasonChange={setRevealReason}
          onReveal={handleRevealIdentity}
          isVisible={isIdentityVisible}
          countdownMs={identityCountdownMs}
          clientFullName={selectedThread.clientFullName}
          clientEmail={selectedThread.clientEmail}
          clientPhone={selectedThread.clientPhone}
        />
      )}

      <PIIReviewModal
        open={privacyModalOpen}
        mode={privacyModalMode}
        matches={detectedPrivacyMatches}
        onEdit={handlePrivacyEdit}
        onSendAnyway={handleSendAnyway}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={<div className="flex h-96 items-center justify-center text-muted-foreground">Loading chat…</div>}
    >
      <ChatContent />
    </Suspense>
  );
}
