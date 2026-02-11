"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Tabs } from "@/components/Tabs";
import {
  professionals,
  clients,
  calendarEvents,
  calendarDayLabel,
  calendarDayShort,
  calendarDayWeekday,
  calendarDaySlots,
  calendarMonthLabel,
  calendarMonthDays,
  calendarSelectedDate,
  courses,
  jobsForProfessional,
  professionalGigOpportunities,
} from "@/lib/mock/professionals";
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
} from "lucide-react";
import { clsx } from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SpiderChart } from "@/components/SpiderChart";
import { Sparkles, Loader2 } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "client", label: "Client" },
  { id: "calendar", label: "Calendar" },
  { id: "learn", label: "Learn" },
  { id: "gig", label: "Gig" },
];

export default function ProfessionalPage() {
  const params = useParams();
  const id = params.id as string;
  const professional = professionals.find((p) => p.id === id) ?? professionals[0];
  const { setItems } = useBreadcrumb();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    setItems([
      { label: "Professionals", href: "/professional/1" },
      { label: professional.name },
    ]);
  }, [professional.name, setItems]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [slaInfoModalOpen, setSlaInfoModalOpen] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisGenerated, setAiAnalysisGenerated] = useState(false);
  const [aiImprovementModalOpen, setAiImprovementModalOpen] = useState(false);
  const [caseNotesPage, setCaseNotesPage] = useState(1);
  const [caseNotesPageSize, setCaseNotesPageSize] = useState(5);
  const [gigSearch, setGigSearch] = useState("");
  const [gigStatusFilter, setGigStatusFilter] = useState<string>("all");
  const [gigTypeFilter, setGigTypeFilter] = useState<string>("all");

  const filteredGigOpportunities = useMemo(
    () =>
      professionalGigOpportunities.filter((g) => {
        const matchSearch =
          !gigSearch ||
          g.title.toLowerCase().includes(gigSearch.toLowerCase()) ||
          g.description.toLowerCase().includes(gigSearch.toLowerCase());
        const matchStatus =
          gigStatusFilter === "all" || g.status === gigStatusFilter;
        const matchType =
          gigTypeFilter === "all" || g.type === gigTypeFilter;
        return matchSearch && matchStatus && matchType;
      }),
    [gigSearch, gigStatusFilter, gigTypeFilter]
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
    const start = (caseNotesPage - 1) * caseNotesPageSize;
    return professional.caseNotes.slice(start, start + caseNotesPageSize);
  }, [professional.caseNotes, caseNotesPage, caseNotesPageSize]);

  return (
    <div className="space-y-6">
      {/* Profile header - Figma: name, role, Active badge, License Number, License Expiry */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {"avatar" in professional && professional.avatar ? (
              <img
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
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">{professional.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{professional.role}</p>
                </div>
                {"status" in professional && professional.status && (
                  <Badge variant="default" className="shrink-0">
                    {String(professional.status)}
                  </Badge>
                )}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">License Number</p>
                  <p className="text-sm font-medium text-foreground">{professional.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">License Expiry</p>
                  <p className="text-sm font-medium text-foreground">
                    Expires {new Date(professional.licenseExpiry).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
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

          {/* Row 1 right: metric cards (rows 1–4 only) */}
          <div className="min-w-0 space-y-6">
          {/* Row 1 — SLA/TFP+, Messages 24h, Avg Response Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">SLA / TFP+ Status</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSlaInfoModalOpen(true)} title="SLA & payout details">
                  <Info className="h-4 w-4 text-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.slaStatus}</p>
                <Badge variant="secondary" className="mt-1">{professional.qualified ? "Qualified" : "Not qualified"}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Messages within 24h</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.responseRate24h}%</p>
                <p className="text-xs text-muted-foreground">SLA Target: &gt;90%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.averageResponseTime}</p>
                <p className="text-xs text-muted-foreground">Response speed</p>
              </CardContent>
            </Card>
            </div>
          {/* Row 2 — Client Chat Hours, TFP Chat Score, Payout Multiplier */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Client Chat Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.clientChatHours}</p>
                <p className="text-xs text-muted-foreground">Hours spent by clients typing or audio length</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">TFP Chat Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.tfpChatScore}</p>
                <p className="text-xs text-muted-foreground">Performance score</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payout Multiplier</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.payoutMultiplier}</p>
                <p className="text-xs text-muted-foreground">On client chat hours</p>
              </CardContent>
            </Card>
          </div>
          {/* Row 3 — Feedback, Rating (with AI-Summarized pill) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setFeedbackModalOpen(true)}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-foreground" />
                  Feedback
                  <Badge variant="secondary" className="font-normal">AI-Summarized</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{professional.feedbackSummary}</p>
                <p className="mt-2 text-xs text-primary hover:underline">Click to view all feedback</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setRatingModalOpen(true)}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <Star className="h-4 w-4 text-foreground" />
                  Rating
                  <Badge variant="secondary" className="font-normal">AI-Summarized</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{professional.ratingSummary}</p>
                <p className="mt-2 text-xs text-primary hover:underline">Click to view all ratings</p>
              </CardContent>
            </Card>
          </div>
          {/* Row 4 — Missed/Late, Excessive, Late Case Notes, Missing Case Notes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Missed / Late Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.missedLateSessions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Excessive Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{professional.excessiveSessions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Late Case Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{"lateCaseNotes" in professional ? Number(professional.lateCaseNotes) : 6}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Missing Case Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{"missingCaseNotes" in professional ? Number(professional.missingCaseNotes) : 0}</p>
              </CardContent>
            </Card>
          </div>
          </div>

          {/* Row 2: Case Notes table — full width across both columns */}
          <div className="min-w-0 lg:col-span-2 space-y-3">
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
                        {new Date(f.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
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
                          {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
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
                <DialogTitle>SLA & Payout multiplier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">TFP+ qualification:</strong> TFPs with &gt;90% messages responded to within 24 hours qualify for TFP+.
                </p>
                <p>
                  <strong className="text-foreground">Payout multiplier (on client chat hours):</strong> TFP+ get {professional.payoutMultiplier}; Non TFP+ get 0.8x.
                </p>
                <p>
                  <strong className="text-foreground">client_chat_hours</strong> = hours spent by clients typing (or for audio, length of audio).
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => {
            const lastContactDate = "lastContact" in c ? new Date(c.lastContact) : null;
            const daysSince = lastContactDate ? Math.floor((Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const isActive = daysSince <= 7;
            const clientId = "clientId" in c ? (c as { clientId?: string }).clientId : (c as { id: string }).id.toUpperCase();
            const organisation = "organisation" in c ? (c as { organisation?: string | null }).organisation : null;
            const packageType = "packageType" in c ? (c as { packageType?: string }).packageType : "personal";
            const packageEndDate = "packageEndDate" in c ? (c as { packageEndDate?: string }).packageEndDate : "";
            const packageLabel = packageType === "corporate" ? "Corporate package" : "Personal package";
            const packageEndFormatted = packageEndDate ? new Date(packageEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
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
                      <img src={avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" width={48} height={48} />
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
                  <Button asChild className="mt-auto w-full" size="sm">
                    <Link href={`/chat?view=tfp-client&professionalId=${id}&clientId=${c.id}`}>
                      <MessageSquare className="h-4 w-4" />
                      View Chat
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Professional Development Courses
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue your growth with courses designed for mental health professionals.
            </p>
          </div>
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
        </div>
      )}

      {activeTab === "gig" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Gig Opportunities
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Apply to webinars, roadshows, and workshops to expand your practice
            </p>
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
        </div>
      )}
    </div>
  );
}

