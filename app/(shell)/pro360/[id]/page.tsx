"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useRef, useDeferredValue } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Tabs } from "@/components/Tabs";
import {
  professionals,
  clients,
  courses,
  professionalGigOpportunities,
  chatExceptionsByTfp,
} from "@/features/professionals/mock/professionals";
import {
  calendarEvents,
  calendarDayLabel,
  calendarDayWeekday,
  calendarDaySlots,
  calendarMonthLabel,
  calendarMonthDays,
  calendarSelectedDate,
} from "@/features/calendar/mock/calendar";
import { professionalProfiles, tfpIdToProId } from "@/features/professionals/mock/professionalProfiles";
import { pods } from "@/features/team/mock/pods";
import {
  MessageSquare,
  Star,
  Info,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  Check,
  Clock,
  BookOpen,
  Users,
  Monitor,
  Mic,
  Presentation,
  MapPin,
  Calendar,
  Search,
  UsersRound,
  Sparkles,
  Loader2,
} from "@/components/ui/solar-icons";
import { clsx } from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClickableCardSurface } from "@/components/ui/clickable";
import { ViewModeToggle, type ViewMode } from "@/components/ui/view-mode-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/TablePagination";
import { useBreadcrumb } from "@/components/BreadcrumbContext";
import { measureInDev } from "@/lib/devPerf";

const SpiderChart = dynamic(
  () => import("@/components/SpiderChart").then((m) => m.SpiderChart),
  { ssr: false }
);

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "client", label: "Client" },
  { id: "calendar", label: "Calendar" },
  { id: "learn", label: "Learn" },
  { id: "gig", label: "Gig" },
];

function formatDateGB(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDateTimeGB(dateValue: string) {
  return new Date(dateValue).toLocaleString("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export default function ProfessionalPage() {
  const params = useParams();
  const rawId = params.id as string;
  const professional =
    professionals.find((p) => rawId === tfpIdToProId(p.id) || p.id === rawId) ?? professionals[0];
  const podAssignment = pods.find((pod) => pod.members.some((m) => m.tfpId === professional.id));
  const proId = tfpIdToProId(professional.id);
  const accountProfile = professionalProfiles.find((p) => p.id === proId);
  const displayName = accountProfile
    ? `${accountProfile.firstName} ${accountProfile.lastName}`
    : professional.name;
  const { setItems } = useBreadcrumb();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    setItems([
      { label: "Professional 360", href: "/pro360" },
      { label: `${displayName} (${proId})` },
    ]);
  }, [proId, displayName, setItems]);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [slaInfoModalOpen, setSlaInfoModalOpen] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisGenerated, setAiAnalysisGenerated] = useState(false);
  const [aiImprovementModalOpen, setAiImprovementModalOpen] = useState(false);
  const [caseNotesPage, setCaseNotesPage] = useState(1);
  const [caseNotesPageSize, setCaseNotesPageSize] = useState(5);
  const [chatExceptionTab, setChatExceptionTab] = useState<"1" | "3" | "5">("1");
  const [cardPopoverOpen, setCardPopoverOpen] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [gigSearch, setGigSearch] = useState("");
  const deferredGigSearch = useDeferredValue(gigSearch);
  const [gigStatusFilter, setGigStatusFilter] = useState<string>("all");
  const [gigTypeFilter, setGigTypeFilter] = useState<string>("all");
  const [clientViewMode, setClientViewMode] = useState<ViewMode>("card");
  const [clientOrgFilter, setClientOrgFilter] = useState<string>("all");
  void clientOrgFilter;
  void setClientOrgFilter;
  const [learnViewMode, setLearnViewMode] = useState<ViewMode>("card");
  const [gigViewMode, setGigViewMode] = useState<ViewMode>("card");
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  const cardHoverHandlers = (cardId: string) => ({
    onMouseEnter: () => {
      hoverTimeoutRef.current = setTimeout(() => setCardPopoverOpen(cardId), 1000);
    },
    onMouseLeave: () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
      setCardPopoverOpen(null);
    },
  });

  const CARD_EXPLANATIONS: Record<string, string> = {
    sla: "SLA compliance: % of messages replied within 24 hours (target ≥90%). Use the info icon for payout details.",
    overdue: "Overdue chats: conversations with no reply for 3 working days or more. Use \"View chat\" in the table below to review.",
    casenotes: "Case notes issues: total of late + missing case notes. Click \"View submission log\" to see the full list.",
    rating: "Rating: AI-summarized summary of client ratings. Click the card to view all ratings.",
    feedback: "Feedback: AI-summarized summary of client feedback. Click the card to view all feedback.",
    avgresponse: "Average chat response: average time to respond to chats (in hours). Performance signal.",
    latereplies: "Late replies: number of replies sent after 24 hours. Performance signal, not necessarily unresolved.",
    missedlate: "Missed/Late cancel: no-show or cancellation within 24 hours of session start.",
    excessive: "Excessive therapy: more than 2 sessions per user per week with this therapist (if applicable to current period).",
  };

  const filteredGigOpportunities = useMemo(
    () =>
      measureInDev("performance:filteredGigOpportunities", () =>
        professionalGigOpportunities.filter((g) => {
          const matchSearch =
            !deferredGigSearch ||
            g.title.toLowerCase().includes(deferredGigSearch.toLowerCase()) ||
            g.description.toLowerCase().includes(deferredGigSearch.toLowerCase());
          const matchStatus =
            gigStatusFilter === "all" || g.status === gigStatusFilter;
          const matchType =
            gigTypeFilter === "all" || g.type === gigTypeFilter;
          return matchSearch && matchStatus && matchType;
        })
      ),
    [deferredGigSearch, gigStatusFilter, gigTypeFilter]
  );

  const handleGenerateAiAnalysis = () => {
    setAiAnalysisLoading(true);
    setTimeout(() => {
      setAiAnalysisLoading(false);
      setAiAnalysisGenerated(true);
    }, 2200);
  };

  const strengthsRadar = "strengthsRadar" in professional && Array.isArray(professional.strengthsRadar)
    ? (professional.strengthsRadar as { label: string; value: number; description?: string }[])
    : [];
  const aiImprovementDetail = "aiImprovementDetail" in professional ? String(professional.aiImprovementDetail) : "";
  // Card body: first section from modal ("What to improve") so card and modal stay in sync
  const aiImprovementCardBody = useMemo(() => {
    if (!aiImprovementDetail) return "";
    const first = aiImprovementDetail.split("\n\n")[0] ?? "";
    const afterLabel = first.replace(/^\*\*What to improve:\*\*\s*/i, "").trim();
    return afterLabel || ("aiImprovementPreview" in professional ? String(professional.aiImprovementPreview) : "");
  }, [aiImprovementDetail, professional]);

  const paginatedCaseNotes = useMemo(() => {
    return measureInDev("performance:paginatedCaseNotes", () => {
      const start = (caseNotesPage - 1) * caseNotesPageSize;
      return professional.caseNotes.slice(start, start + caseNotesPageSize);
    });
  }, [professional.caseNotes, caseNotesPage, caseNotesPageSize]);

  const chatExceptionsForThisTfp = useMemo(() => {
    return measureInDev("performance:chatExceptionsFiltered", () => {
      const list = chatExceptionsByTfp.filter((r) => r.tfpId === professional.id);
      const minDays = Number(chatExceptionTab);
      return list.filter((r) => r.working_days_over >= minDays);
    });
  }, [professional.id, chatExceptionTab]);

  const lateCaseNotesCount = "lateCaseNotes" in professional ? Number(professional.lateCaseNotes) : 0;
  const missingCaseNotesCount = "missingCaseNotes" in professional ? Number(professional.missingCaseNotes) : 0;
  const caseNotesComplianceIssues = lateCaseNotesCount + missingCaseNotesCount;
  const capacityLabel = accountProfile
    ? `${accountProfile.activeClients}/${accountProfile.maximumClients}`
    : "—";
  const roleLabel = accountProfile?.profession ?? professional.role;
  const countryLabel = accountProfile?.country || "—";

  return (
    <div className="space-y-6">
      <div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Professional 360</h1>
          </div>
          <p className="text-sm text-muted-foreground">Monitor delivery quality, responsiveness, and compliance signals.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {"avatar" in professional && professional.avatar ? (
              <Image
                src={String(professional.avatar)}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-full bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h2>
                    {"status" in professional && professional.status && (
                      <Badge variant="default" className="shrink-0">
                        {String(professional.status)}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{proId}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/professionals/${proId}/profile`}>View Profile</Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Role</p>
                  <p className="text-sm font-medium text-foreground">{roleLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Country</p>
                  <p className="text-sm font-medium text-foreground">{countryLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pod</p>
                  {podAssignment ? (
                    <Link
                      href={`/team/${podAssignment.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <UsersRound className="h-4 w-4" />
                      {podAssignment.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-foreground">Not assigned</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Capacity</p>
                  <p className="text-sm font-medium text-foreground">{capacityLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === "dashboard" && (
        <>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          {/* Row 1 left: Performance card — height matches right cards block only (not table) */}
          <div className="flex flex-col min-h-0">
            <Card
              className="relative flex h-full min-h-0 flex-col overflow-hidden border border-blue-400/25 bg-[length:100%_100%] bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,_rgba(255,255,255,0.25)_0%,_transparent_45%),_radial-gradient(ellipse_80%_60%_at_50%_40%,_rgba(147,197,253,0.35)_0%,_transparent_50%),_linear-gradient(180deg,_#3b82f6_0%,_#2563eb_35%,_#1d4ed8_100%)] shadow-[0_24px_48px_-12px_rgba(37,99,235,0.35),0_12px_24px_-8px_rgba(30,64,175,0.2),0_0_0_1px_rgba(255,255,255,0.15)_inset] dark:border-white/[0.08] dark:bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,_rgba(59,130,246,0.22)_0%,_transparent_50%),_radial-gradient(ellipse_80%_80%_at_50%_30%,_rgba(30,58,138,0.4)_0%,_transparent_55%),_linear-gradient(180deg,_#1e1e3f_0%,_#171733_40%,_#0f0f23_100%)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
            >
              <CardHeader className="shrink-0 pb-2">
                <CardTitle className="text-base text-white">Performance strengths & AI analysis</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col gap-6">
                {strengthsRadar.length > 0 && (
                  <div className="flex shrink-0 justify-center rounded-xl bg-white/20 backdrop-blur-md py-4 px-2 ring-1 ring-white/30 dark:bg-white/[0.06] dark:ring-white/[0.08]">
                    <SpiderChart data={strengthsRadar} size={240} className="w-full max-w-[240px]" improvementThreshold={4} />
                  </div>
                )}
                <div className="flex min-h-0 flex-1 flex-col border-t border-white/[0.08] pt-4">
                  <p className="mb-3 shrink-0 text-sm font-medium text-white">AI analysis and how to improve</p>
                  {aiAnalysisLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                      <p className="text-xs text-white/80">Scanning profile…</p>
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  ) : aiAnalysisGenerated ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        <p className="text-sm text-white/95">{aiImprovementCardBody}</p>
                      </div>
                      <Button variant="secondary" size="sm" className="mt-4 shrink-0 w-full sm:w-auto bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => setAiImprovementModalOpen(true)}>
                        View full analysis
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-white/80">Get an AI summary of what to improve and why.</p>
                      <Button size="sm" className="bg-white text-[#2563eb] hover:bg-white/90" onClick={handleGenerateAiAnalysis}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate improvement summary
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: KPI cards with row headers, helpers, and ⓘ tooltips */}
          <div className="min-w-0 space-y-6">
            {/* Row 1 — Needs attention */}
            <div className="space-y-2">
              <div className="flex items-center gap-2" title="Items that may require follow-up or review.">
                <h3 className="text-sm font-semibold text-foreground">Needs attention</h3>
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Row explanation">
                  <Info className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Card className="relative flex flex-col" {...cardHoverHandlers("sla")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-h-[3.25rem]">
                    <CardTitle className="text-sm font-medium text-muted-foreground">SLA compliance</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSlaInfoModalOpen(true)} title="SLA & payout details">
                      <Info className="h-4 w-4 text-foreground" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-semibold text-foreground">{professional.responseRate24h}%</p>
                    {professional.qualified && (
                      <Badge variant="secondary" className="mt-1 font-medium">TFP+ qualified</Badge>
                    )}
                  </CardContent>
                  {cardPopoverOpen === "sla" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel">
                      {CARD_EXPLANATIONS.sla}
                    </div>
                  )}
                </Card>
                <Card className="relative flex flex-col" {...cardHoverHandlers("overdue")}>
                  <CardHeader className="pb-2 min-h-[3.25rem]">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Overdue chats</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-semibold text-foreground">
                      {"unrespondedCount" in professional && professional.unrespondedCount != null ? professional.unrespondedCount : 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">unresponded ≥3 working days</p>
                  </CardContent>
                  {cardPopoverOpen === "overdue" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel">
                      {CARD_EXPLANATIONS.overdue}
                    </div>
                  )}
                </Card>
                <Card className="relative flex flex-col" {...cardHoverHandlers("casenotes")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-h-[3.25rem]">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Case notes issues</CardTitle>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-primary hover:underline shrink-0"
                      onClick={() => document.getElementById("case-notes-log")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      View log
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-semibold text-foreground">{caseNotesComplianceIssues}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Late: {lateCaseNotesCount} • Missing: {missingCaseNotesCount}</p>
                  </CardContent>
                  {cardPopoverOpen === "casenotes" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel">
                      {CARD_EXPLANATIONS.casenotes}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Row 2 — Client experience */}
            <div className="space-y-2">
              <div className="flex items-center gap-2" title="What clients are rating and saying about sessions.">
                <h3 className="text-sm font-semibold text-foreground">Client experience</h3>
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Row explanation">
                  <Info className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ClickableCardSurface
                  className="rounded-lg"
                  onActivate={() => setRatingModalOpen(true)}
                  {...cardHoverHandlers("rating")}
                >
                  <Card className="relative transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                        <Star className="h-4 w-4 text-foreground" />
                        Rating
                        <Badge variant="secondary" className="font-normal">AI-Summarized</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground line-clamp-4">{professional.ratingSummary}</p>
                      <p className="mt-2 text-xs text-primary hover:underline">Click to view all ratings</p>
                    </CardContent>
                    {cardPopoverOpen === "rating" && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel" onClick={(e) => e.stopPropagation()}>
                        {CARD_EXPLANATIONS.rating}
                      </div>
                    )}
                  </Card>
                </ClickableCardSurface>
                <ClickableCardSurface
                  className="rounded-lg"
                  onActivate={() => setFeedbackModalOpen(true)}
                  {...cardHoverHandlers("feedback")}
                >
                  <Card className="relative transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                        <MessageSquare className="h-4 w-4 text-foreground" />
                        Feedback
                        <Badge variant="secondary" className="font-normal">AI-Summarized</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground line-clamp-4">{professional.feedbackSummary}</p>
                      <p className="mt-2 text-xs text-primary hover:underline">Click to view all feedback</p>
                    </CardContent>
                    {cardPopoverOpen === "feedback" && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel" onClick={(e) => e.stopPropagation()}>
                        {CARD_EXPLANATIONS.feedback}
                      </div>
                    )}
                  </Card>
                </ClickableCardSurface>
              </div>
            </div>

            {/* Row 3 — Responsiveness */}
            <div className="space-y-2">
              <div className="flex items-center gap-2" title="How quickly chats are being responded to.">
                <h3 className="text-sm font-semibold text-foreground">Responsiveness</h3>
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Row explanation">
                  <Info className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="relative" {...cardHoverHandlers("avgresponse")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average chat response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-foreground">
                      {"avgServiceResponseHours" in professional && professional.avgServiceResponseHours != null
                        ? `${professional.avgServiceResponseHours} hours`
                        : professional.averageResponseTime}
                    </p>
                  </CardContent>
                  {cardPopoverOpen === "avgresponse" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel">
                      {CARD_EXPLANATIONS.avgresponse}
                    </div>
                  )}
                </Card>
                <Card className="relative" {...cardHoverHandlers("latereplies")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Late replies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-foreground">
                      {"noOfResponseBeyond24hr" in professional && professional.noOfResponseBeyond24hr != null
                        ? professional.noOfResponseBeyond24hr
                        : 0}
                    </p>
                  </CardContent>
                  {cardPopoverOpen === "latereplies" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel">
                      {CARD_EXPLANATIONS.latereplies}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Row 4 — Therapy exceptions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2" title="Session patterns that may need intervention.">
                <h3 className="text-sm font-semibold text-foreground">Therapy exceptions</h3>
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Row explanation">
                  <Info className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="relative" {...cardHoverHandlers("missedlate")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Missed/Late cancel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-foreground">{professional.missedLateSessions}</p>
                  </CardContent>
                  {cardPopoverOpen === "missedlate" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel">
                      {CARD_EXPLANATIONS.missedlate}
                    </div>
                  )}
                </Card>
                <Card className="relative" {...cardHoverHandlers("excessive")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Excessive therapy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-foreground">{professional.excessiveSessions}</p>
                  </CardContent>
                  {cardPopoverOpen === "excessive" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-panel">
                      {CARD_EXPLANATIONS.excessive}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>

          {/* Chat exceptions — full width */}
          <div className="min-w-0 lg:col-span-2 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Chat exceptions</h2>
            <Tabs
              tabs={[
                { id: "1", label: "≥ 1 working day" },
                { id: "3", label: "≥ 3 working days" },
                { id: "5", label: "≥ 5 working days" },
              ]}
              activeId={chatExceptionTab}
              onChange={(id) => setChatExceptionTab(id as "1" | "3" | "5")}
            />
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Flagged message</TableHead>
                      <TableHead>Response deadline</TableHead>
                      <TableHead>Received (day)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatExceptionsForThisTfp.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No exceptions in this threshold.
                        </TableCell>
                      </TableRow>
                    ) : (
                      chatExceptionsForThisTfp.map((r) => (
                        <TableRow key={r.chat_group_id}>
                          <TableCell className="font-medium">{r.client_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTimeGB(r.flagged_message_timestamp)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.response_deadline ? formatDateTimeGB(r.response_deadline) : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.received_dow ?? r.received_day_type ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "unresponded" ? "destructive" : "secondary"}>{r.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/chat?thread=${r.chat_group_id}`}>View chat</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Case Notes Submission Log — full width, with anchor for scroll */}
          <div id="case-notes-log" className="min-w-0 lg:col-span-2 space-y-3 scroll-mt-4">
            <h2 className="text-base font-semibold text-foreground">Case Notes Submission Log</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCaseNotes.map((n) => (
                    <TableRow key={n.date + n.client}>
                      <TableCell className="font-medium">{n.date}</TableCell>
                      <TableCell>{n.client}</TableCell>
                      <TableCell className="text-muted-foreground">{n.submittedAt}</TableCell>
                      <TableCell>
                        <Badge variant={n.status === "Late" ? "destructive" : "secondary"}>{n.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                total={professional.caseNotes.length}
                pageSize={caseNotesPageSize}
                page={caseNotesPage}
                onPageChange={setCaseNotesPage}
                onPageSizeChange={(size) => { setCaseNotesPageSize(size); setCaseNotesPage(1); }}
              />
            </CardContent>
          </Card>
          </div>
        </div>

        <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Client Feedback</DialogTitle>
                <p className="text-sm text-muted-foreground">View detailed feedback from clients.</p>
              </DialogHeader>
              <ul className="space-y-4 overflow-y-auto pr-1 -mr-1">
                {professional.feedbackList.map((f) => (
                  <li key={f.id} className="rounded-xl bg-card p-4 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(f.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          timeZone: "UTC",
                        })}
                      </span>
                      <span className="flex items-center gap-1 shrink-0 text-sm font-medium text-foreground">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {f.rating}/5
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground leading-relaxed">{f.comment}</p>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
          <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Rating breakdown</DialogTitle>
                <p className="text-sm text-muted-foreground">View ratings by category (anonymous).</p>
              </DialogHeader>
              <ul className="space-y-4 overflow-y-auto pr-1 -mr-1">
                {professional.ratingList.map((r) => (
                  <li key={r.id} className="rounded-xl bg-card p-4 shadow-card">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-sm font-medium text-foreground">{r.type}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {new Date(r.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            timeZone: "UTC",
                          })}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {r.overall}/5 overall
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span>Communication {r.communication}/5</span>
                      <span>Effectiveness {r.effectiveness}/5</span>
                      <span>Empathy {r.empathy}/5</span>
                      <span>Professionalism {r.professionalism}/5</span>
                    </div>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
          <Dialog open={slaInfoModalOpen} onOpenChange={setSlaInfoModalOpen}>
            <DialogContent>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle>SLA & Payout multiplier</DialogTitle>
                  {professional.qualified && (
                    <Badge variant="secondary" className="font-medium">TFP+</Badge>
                  )}
                </div>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">TFP+ qualification:</strong> TFPs with &gt;90% messages responded to within 24 hours qualify for TFP+.
                </p>
                <p>
                  <strong className="text-foreground">Payout multiplier (on Client Chat Hours):</strong> TFP+ get {professional.payoutMultiplier}; Non TFP+ get 0.8x.
                </p>
                <p>
                  <strong className="text-foreground">Client Chat Hours</strong> = hours spent by clients typing (or for audio, length of audio).
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={aiImprovementModalOpen} onOpenChange={setAiImprovementModalOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-foreground" />
                  Full AI analysis
                </DialogTitle>
                <p className="text-sm text-muted-foreground">What to improve, why it matters, and what it will lead to.</p>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto text-sm text-muted-foreground pr-1">
                {aiImprovementDetail.split("\n\n").map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="text-foreground font-medium">{part.slice(2, -2)}</strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {activeTab === "client" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Client List</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Directory of clients assigned to this professional. Click a client to view assessments, mood history, and more.
              </p>
            </div>
            <ViewModeToggle value={clientViewMode} onChange={setClientViewMode} />
          </div>
          {clientViewMode === "card" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((c) => {
                const lastContactDate = "lastContact" in c ? new Date(c.lastContact) : null;
                const daysSince = lastContactDate && nowMs
                  ? Math.floor((nowMs - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const isActive = daysSince <= 7;
                const clientId = "clientId" in c ? (c as { clientId?: string }).clientId : (c as { id: string }).id.toUpperCase();
                const organisation = "organisation" in c ? (c as { organisation?: string | null }).organisation : null;
                const packageType = "packageType" in c ? (c as { packageType?: string }).packageType : "personal";
                const packageEndDate = "packageEndDate" in c ? (c as { packageEndDate?: string }).packageEndDate : "";
                const packageLabel = packageType === "corporate" ? "Corporate package" : "Personal package";
                const packageEndFormatted = packageEndDate ? formatDateGB(packageEndDate) : "";
                const avatar = "avatar" in c ? (c as { avatar?: string }).avatar : null;
                return (
                  <Card key={c.id} className="flex flex-col overflow-hidden">
                    <CardContent className="relative flex flex-1 flex-col gap-3 p-5">
                      <span
                        className={clsx(
                          "absolute right-4 top-4 rounded px-2 py-0.5 text-xs font-medium",
                          isActive ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                      <div className="flex items-center gap-3 min-w-0">
                        {avatar ? (
                          <Image src={avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" width={48} height={48} />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {clientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>{c.age} years • {c.gender}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{organisation ?? "Not available"}</span>
                      </div>
                      {packageEndFormatted && (
                        <div className="rounded-lg bg-muted/60 px-3 py-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {packageLabel} ending on {packageEndFormatted}
                          </p>
                        </div>
                      )}
                      <div className="mt-auto flex gap-2">
                        <Button asChild className="flex-1" size="sm">
                          <Link href={`/pro360/${professional.id}/client/${c.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/chat?view=tfp-client&professionalId=${professional.id}&clientId=${c.id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((c) => {
                      const lastContactDate = "lastContact" in c ? new Date(c.lastContact) : null;
                      const daysSince = lastContactDate && nowMs
                        ? Math.floor((nowMs - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                      const isActive = daysSince <= 7;
                      const clientId = "clientId" in c ? (c as { clientId?: string }).clientId : (c as { id: string }).id.toUpperCase();
                      const organisation = "organisation" in c ? (c as { organisation?: string | null }).organisation : null;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-muted-foreground">{clientId}</TableCell>
                          <TableCell className="text-muted-foreground">{c.age} years • {c.gender}</TableCell>
                          <TableCell className="text-muted-foreground">{organisation ?? "Not available"}</TableCell>
                          <TableCell>
                            <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild size="sm" variant="default">
                                <Link href={`/pro360/${professional.id}/client/${c.id}`}>View Details</Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/chat?view=tfp-client&professionalId=${professional.id}&clientId=${c.id}`}>Chat</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage your schedule and appointments</p>
            </div>
            <div className="flex rounded-[10px] bg-muted/30 p-1 shadow-card">
              <Button variant="default" size="sm" className="rounded-lg">Day</Button>
              <Button variant="ghost" size="sm" className="rounded-lg">Week</Button>
              <Button variant="ghost" size="sm" className="rounded-lg">Month</Button>
            </div>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1">
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border py-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" aria-label="Previous day">
                      <ChevronLeft className="h-4 w-4 text-foreground" />
                    </Button>
                    <div>
                      <p className="text-base font-semibold text-foreground">{calendarDayLabel}</p>
                      <p className="text-sm text-muted-foreground">{calendarDayWeekday}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Today</Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" aria-label="Next day">
                      <ChevronRight className="h-4 w-4 text-foreground" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y border-border">
                    {calendarDaySlots.map((hour) => {
                      const slotLabel = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
                      const event = calendarEvents.find((ev) => {
                        const startHour = parseInt(ev.start.slice(0, 2), 10);
                        return startHour === hour;
                      });
                      const eventStyle = event
                        ? event.type === "pod"
                          ? "border-l-4 border-l-violet-500 bg-violet-50/50 dark:bg-violet-950/20"
                          : event.type === "townhall"
                            ? "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : "border-l-4 border-l-primary bg-primary/5"
                        : "";
                      return (
                        <div key={hour} className="flex min-h-[4rem]">
                          <div className="w-20 shrink-0 border-r border-border py-3 pl-4 pr-2">
                            <p className="text-xs font-medium text-muted-foreground">{slotLabel}</p>
                          </div>
                          <div className="min-w-0 flex-1 py-2 pr-4 pl-4">
                            {event ? (
                              <div className={clsx("rounded px-4 py-3", eventStyle)}>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-foreground">{event.title}</span>
                                  {"badge" in event && event.badge && (
                                    <Badge
                                      variant="outline"
                                      className={clsx(
                                        "text-xs font-medium",
                                        event.type === "pod" && "border-violet-500 text-violet-700 dark:text-violet-400",
                                        event.type === "townhall" && "border-emerald-500 text-emerald-700 dark:text-emerald-400",
                                        event.type === "f2f" && "border-primary text-primary"
                                      )}
                                    >
                                      {String(event.badge)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{event.with}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {event.start} - {event.end}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex w-full flex-col gap-6 lg:w-80 lg:shrink-0">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-base font-medium text-foreground">{calendarMonthLabel}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Previous month">
                      <ChevronLeft className="h-4 w-4 text-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Next month">
                      <ChevronRight className="h-4 w-4 text-foreground" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <span key={d} className="text-xs font-medium text-muted-foreground">
                        {d}
                      </span>
                    ))}
                    {calendarMonthDays.map(({ date }) => (
                      <button
                        key={date}
                        type="button"
                        className={clsx(
                          "h-8 w-8 rounded-[10px] text-sm font-medium transition-colors",
                          date === calendarSelectedDate
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                        style={{
                          gridColumn: (date - 1) % 7 + 1,
                          gridRow: Math.floor((date - 1) / 7) + 2,
                        }}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-medium text-foreground">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {calendarEvents.map((ev) => (
                    <div key={ev.id} className="flex gap-3">
                      <div
                        className={clsx(
                          "w-1 shrink-0 rounded-full",
                          ev.type === "pod" && "bg-violet-500",
                          ev.type === "townhall" && "bg-emerald-500",
                          ev.type === "f2f" && "bg-primary"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ev.start} - {ev.end}
                        </p>
                        <p className="text-xs text-muted-foreground">{ev.with}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "learn" && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Professional Development Courses
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                List of courses available for professionals, tracked by clinical and admin teams.
              </p>
            </div>
            <ViewModeToggle value={learnViewMode} onChange={setLearnViewMode} />
          </div>
          {learnViewMode === "card" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <Card key={c.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          c.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        )}
                      >
                        {c.status === "completed" ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground">{c.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {c.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {c.enrollment}
                          </span>
                        </div>
                        {c.status === "completed" && "completedOn" in c && c.completedOn && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Completed on {c.completedOn}
                          </p>
                        )}
                        {c.status === "in_progress" && "progressPercent" in c && c.progressPercent != null && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${c.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {c.progressPercent}%
                            </span>
                          </div>
                        )}
                        <div className="mt-3">
                          {c.status === "completed" && (
                            <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                              Completed
                            </Button>
                          )}
                          {c.status === "in_progress" && (
                            <Button size="sm" variant="default">
                              In Progress
                            </Button>
                          )}
                          {c.status === "not_started" && (
                            <Button size="sm" variant="secondary" className="text-muted-foreground">
                              Not started
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell className="text-muted-foreground">{c.category}</TableCell>
                        <TableCell className="text-muted-foreground">{c.enrollment}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.status === "in_progress" && "progressPercent" in c && c.progressPercent != null
                            ? `${c.progressPercent}%`
                            : c.status === "completed" && "completedOn" in c && c.completedOn
                              ? `Completed on ${c.completedOn}`
                              : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.status === "completed" ? "default" : c.status === "in_progress" ? "secondary" : "outline"}>
                            {c.status === "not_started" ? "Not started" : c.status === "in_progress" ? "In progress" : "Completed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "gig" && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Gig Opportunities
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open and historical gig opportunities for operational planning and performance tracking.
              </p>
            </div>
            <ViewModeToggle value={gigViewMode} onChange={setGigViewMode} />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search gigs..."
                value={gigSearch}
                onChange={(e) => setGigSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={gigStatusFilter} onValueChange={setGigStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gigTypeFilter} onValueChange={setGigTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Webinar">Webinar</SelectItem>
                <SelectItem value="Roadshow">Roadshow</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredGigOpportunities.length} gig{filteredGigOpportunities.length !== 1 ? "s" : ""}
          </p>
          {gigViewMode === "card" ? (
            <div className="space-y-4">
              {filteredGigOpportunities.map((g) => (
                <Card key={g.id}>
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div
                        className={clsx(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          "bg-primary/10 text-primary"
                        )}
                      >
                        {g.type === "Webinar" && <Monitor className="h-5 w-5" />}
                        {g.type === "Roadshow" && <Mic className="h-5 w-5" />}
                        {g.type === "Workshop" && <Presentation className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{g.title}</h3>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {g.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={clsx(
                              g.status === "Applied" && "border-primary text-primary",
                              g.status === "Completed" && "text-muted-foreground",
                              g.status === "Expired" && "text-muted-foreground"
                            )}
                          >
                            {g.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{g.description}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {g.dateTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {g.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 shrink-0" />
                              {g.participants}
                            </div>
                          </div>
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              Claims available: {g.claimsAvailable}
                            </div>
                            {g.applicationOrCompletion && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                {g.applicationOrCompletion}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gig</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Claims available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGigOpportunities.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.title}</TableCell>
                        <TableCell>{g.type}</TableCell>
                        <TableCell className="text-muted-foreground">{g.dateTime}</TableCell>
                        <TableCell className="text-muted-foreground">{g.location}</TableCell>
                        <TableCell>
                          <Badge variant={g.status === "Applied" ? "default" : "secondary"}>{g.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{g.claimsAvailable}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
