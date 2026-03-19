"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Archive,
  ArrowLeft,
  Bell,
  CalendarBold,
  ChevronRight,
  ChevronDown,
  CheckCircleBold,
  ClockBold,
  AlertTriangleBold,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  Zap,
  Pencil,
  Menu,
} from "@/components/ui/solar-icons";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/features/pro360/components/KpiCard";
import {
  actionCatalog,
  conditionOperators,
  conditionParameters,
  createEmptyRuleDefinition,
  getTriggerCategoryLabel,
  getTriggerLabel,
  getTriggerSource,
  getTriggersForCategory,
  triggerCategories,
  rulePresets,
  type RuleAction,
  type RuleCondition,
  type RuleDefinition,
  type RulePreset,
  type RuleStatus,
  type RuleSummary,
  type RuleType,
} from "@/features/rules/mock/rules";

const RULE_TYPE_META: Record<RuleType, { icon: ComponentType<{ className?: string }>; tint: string; chip: string }> = {
  integration: { icon: Zap, tint: "bg-emerald-500/15 text-emerald-700", chip: "Quality" },
  support: { icon: MessageSquare, tint: "bg-amber-500/15 text-amber-700", chip: "Clinical Ops" },
  maintenance: { icon: Settings, tint: "bg-slate-500/15 text-slate-700", chip: "Compliance" },
  routing: { icon: Users, tint: "bg-teal-500/15 text-teal-700", chip: "Routing" },
  notification: { icon: Bell, tint: "bg-primary/10 text-primary", chip: "Alerts" },
  data: { icon: Archive, tint: "bg-orange-500/15 text-orange-700", chip: "Payout" },
};

const STATUS_BADGE: Record<RuleStatus, { label: string; variant: "success" | "secondary" | "warning" }> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "secondary" },
  invalid: { label: "Invalid", variant: "warning" },
};

function formatPct(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function isConditionComplete(condition: RuleCondition) {
  return Boolean(condition.parameter && condition.operator && condition.value.trim());
}

function isActionComplete(action: RuleAction) {
  return Boolean(action.actionType && action.title.trim());
}

function computeRuleValidity(rule: RuleDefinition) {
  const triggerReady = Boolean(rule.trigger.family && rule.trigger.signal);
  const conditionsReady = rule.conditions.length > 0 && rule.conditions.every(isConditionComplete);
  const actionsReady = rule.actions.length > 0 && rule.actions.every(isActionComplete);
  return {
    triggerReady,
    conditionsReady,
    actionsReady,
    isValid: triggerReady && conditionsReady && actionsReady,
  };
}

function lookupLabel(options: { id: string; label: string }[], id: string, fallback: string) {
  return options.find((option) => option.id === id)?.label ?? fallback;
}

export function RuleDashboard({
  initialRules,
}: {
  initialRules: RuleSummary[];
}) {
  const [rules, setRules] = useState(initialRules);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

  const visibleRules = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rules.filter((rule) => {
      const statusMatches =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? rule.status === "active"
            : rule.status === "paused";
      const searchMatches =
        query.length === 0
          ? true
          : [rule.name, rule.triggerPreview, rule.actionPreview, rule.team]
              .join(" ")
              .toLowerCase()
              .includes(query);
      return statusMatches && searchMatches;
    });
  }, [rules, search, statusFilter]);

  const totalRules = rules.length;
  const totalTriggers = rules.reduce((sum, rule) => sum + rule.executionCount, 0);
  const activeToday = rules.filter((rule) => rule.status === "active" && rule.enabled).length;
  const activeRules = rules.filter((rule) => rule.status === "active").length;
  const pausedRules = rules.filter((rule) => rule.status === "paused").length;

  const toggleRule = (ruleId: string, enabled: boolean) => {
    setRules((current) =>
      current.map((rule) => {
        if (rule.id !== ruleId) return rule;
        return {
          ...rule,
          enabled,
          status: enabled ? (rule.status === "invalid" ? "invalid" : "active") : "paused",
        };
      })
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Automation Rule Engine</h2>
          <p className="text-sm text-muted-foreground">
            Track automation rules, trigger volume, and operational status in one queue.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/rules/new">
            <Plus className="h-4 w-4" />
            Create Rule
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <KpiCard
          title="Total Rules"
          value={
            <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
              {totalRules}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                of {rules.length} enabled
              </span>
            </span>
          }
          icon={<Archive className="h-5 w-5" />}
        />
        <KpiCard
          title="Total Triggers"
          value={totalTriggers.toLocaleString()}
          icon={<Bell className="h-5 w-5" />}
          badge="All time"
        />
        <KpiCard
          title="Active Today"
          value={
            <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
              {activeToday}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                rules triggered
              </span>
            </span>
          }
          icon={<Zap className="h-5 w-5" />}
        />
      </section>

      <section className="space-y-5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search rules by name, trigger, or action..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>
              All ({totalRules})
            </Button>
            <Button variant={statusFilter === "active" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("active")}>
              Active ({activeRules})
            </Button>
            <Button variant={statusFilter === "paused" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("paused")}>
              Paused ({pausedRules})
            </Button>
          </div>
        </div>

        <RuleGrid rules={visibleRules} onToggleRule={toggleRule} />
      </section>
    </div>
  );
}

function RuleGrid({
  rules,
  onToggleRule,
  emptyLabel = "No rules available yet.",
}: {
  rules: RuleSummary[];
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  emptyLabel?: string;
}) {
  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">{emptyLabel}</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} onToggleRule={onToggleRule} />
      ))}
    </div>
  );
}

function RuleCard({
  rule,
  onToggleRule,
}: {
  rule: RuleSummary;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
}) {
  const typeMeta = RULE_TYPE_META[rule.type];
  const status = STATUS_BADGE[rule.status];
  const Icon = typeMeta.icon;

  return (
    <Link href={`/rules/${rule.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
      <Card className="h-full border border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-panel hover:border-primary/30">
        <CardContent className="flex h-full flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", typeMeta.tint)}>
              <Icon className="h-5 w-5" />
            </div>
            <div
              className="flex items-center gap-3"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <Badge variant={status.variant} className="border-0 uppercase tracking-[0.18em] text-[10px] font-semibold">
                {status.label}
              </Badge>
              <Switch
                checked={rule.enabled}
                onCheckedChange={(enabled) => onToggleRule(rule.id, enabled)}
                aria-label={`Toggle ${rule.name}`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{typeMeta.chip}</p>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{rule.name}</h3>
            </div>

            <div className="grid grid-cols-[12px_1fr] gap-x-3 gap-y-4">
              <div className="flex flex-col items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span className="h-14 w-px bg-border" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">If</p>
                <p className="text-xs font-medium leading-5 text-foreground">{rule.triggerPreview}</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Then</p>
                <p className="text-xs font-medium leading-5 text-foreground">{rule.actionPreview}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs">
            <span className="text-muted-foreground">Last run: {rule.lastRunAt}</span>
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              View Details
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function RuleCanvas({
  initialRule,
  mode,
}: {
  initialRule?: RuleDefinition;
  mode?: "create" | "edit";
}) {
  const resolvedMode = mode ?? (initialRule ? "edit" : "create");
  const isCreateMode = resolvedMode === "create";
  const [rule, setRule] = useState<RuleDefinition>(() => initialRule ?? createEmptyRuleDefinition());
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<RuleDefinition>(() => JSON.parse(JSON.stringify(initialRule ?? createEmptyRuleDefinition())) as RuleDefinition);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [creationStartMode, setCreationStartMode] = useState<"preset" | "custom">("custom");
  const [presetBaseline, setPresetBaseline] = useState<RuleDefinition | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [touchedTrigger, setTouchedTrigger] = useState<{ family?: boolean; signal?: boolean }>({});
  const [touchedConditions, setTouchedConditions] = useState<Record<string, { parameter?: boolean; operator?: boolean; value?: boolean }>>({});
  const [touchedActions, setTouchedActions] = useState<Record<string, boolean>>({});

  const validity = useMemo(() => computeRuleValidity(rule), [rule]);
  const triggerOptions = useMemo(() => getTriggersForCategory(rule.trigger.family), [rule.trigger.family]);
  const isDirty = JSON.stringify(rule) !== JSON.stringify(savedSnapshot);
  const lastSavedText =
    rule.metadata.lastModified === "Not saved yet"
      ? "Draft not saved yet"
      : `Last saved at ${rule.metadata.lastModified}`;

  const selectedPreset = useMemo(
    () => rulePresets.find((preset) => preset.id === selectedPresetId) ?? null,
    [selectedPresetId]
  );

  const resetDraft = (nextMode: "custom" | "preset" = "custom") => {
    const empty = createEmptyRuleDefinition();
    setRule(empty);
    setSavedSnapshot(JSON.parse(JSON.stringify(empty)) as RuleDefinition);
    setSelectedPresetId("");
    setPresetBaseline(null);
    setTouchedTrigger({});
    setTouchedConditions({});
    setTouchedActions({});
    setCreationStartMode(nextMode);
  };

  const hasStartedDraft =
    rule.summary.name.trim().length > 0 ||
    Boolean(rule.trigger.family || rule.trigger.signal) ||
    rule.conditions.some((condition) => Boolean(condition.parameter || condition.operator || condition.value.trim())) ||
    rule.actions.some((action) => Boolean(action.actionType || action.title.trim()));

  const applyPreset = (preset: RulePreset) => {
    const trigger = getTriggersForCategory(preset.familyId).find((item) => item.id === preset.signalId);
    setSelectedPresetId(preset.id);
    setCreationStartMode("preset");
    setTouchedTrigger({ family: true, signal: true });
    setRule((current) => {
      const nextRule: RuleDefinition = {
        ...current,
        summary: {
          ...current.summary,
          name: preset.label,
          type: preset.familyId === "payout_impact" ? "integration" : current.summary.type,
        },
        trigger: {
          family: preset.familyId,
          signal: preset.signalId,
          source: trigger?.source ?? "",
        },
        conditions: [
          {
            id: "condition-1",
            combinator: "and",
            parameter: preset.conditionParameter,
            operator: preset.conditionOperator,
            value: preset.conditionValue,
          },
        ],
        actions: [
          {
            id: "action-1",
            actionType: preset.actionType,
            title: preset.actionTitle,
            description: actionCatalog.find((item) => item.id === preset.actionType)?.description ?? "",
            order: 1,
          },
        ],
      };
      setPresetBaseline(JSON.parse(JSON.stringify(nextRule)) as RuleDefinition);
      return nextRule;
    });
  };

  useEffect(() => {
    if (!presetBaseline) return;
    if (creationStartMode !== "preset") return;
    const customized = JSON.stringify(rule) !== JSON.stringify(presetBaseline);
    if (customized) setCreationStartMode("custom");
  }, [creationStartMode, presetBaseline, rule]);

  const updateSummary = (patch: Partial<RuleDefinition["summary"]>) => {
    setRule((current) => ({ ...current, summary: { ...current.summary, ...patch } }));
  };

  const updateTrigger = (patch: Partial<RuleDefinition["trigger"]>) => {
    setRule((current) => ({ ...current, trigger: { ...current.trigger, ...patch } }));
  };

  const markTriggerTouched = (field: "family" | "signal") => {
    setTouchedTrigger((current) => ({ ...current, [field]: true }));
  };

  const updateCondition = (conditionId: string, patch: Partial<RuleCondition>) => {
    setRule((current) => ({
      ...current,
      conditions: current.conditions.map((condition) =>
        condition.id === conditionId ? { ...condition, ...patch } : condition
      ),
    }));
  };

  const markConditionTouched = (conditionId: string, field: "parameter" | "operator" | "value") => {
    setTouchedConditions((current) => ({
      ...current,
      [conditionId]: { ...current[conditionId], [field]: true },
    }));
  };

  const addCondition = () => {
    const id = `condition-${Date.now()}`;
    setRule((current) => ({
      ...current,
      conditions: [
        ...current.conditions,
        { id, combinator: "and", parameter: "", operator: "", value: "" },
      ],
    }));
    setTouchedConditions((current) => ({ ...current, [id]: {} }));
  };

  const removeCondition = (conditionId: string) => {
    setRule((current) => ({
      ...current,
      conditions: current.conditions.length === 1
        ? current.conditions
        : current.conditions.filter((condition) => condition.id !== conditionId),
    }));
    setTouchedConditions((current) => {
      const next = { ...current };
      delete next[conditionId];
      return next;
    });
  };

  const updateAction = (actionId: string, actionType: string) => {
    const actionOption = actionCatalog.find((item) => item.id === actionType);
    setRule((current) => ({
      ...current,
      actions: current.actions.map((action) =>
        action.id === actionId
          ? {
              ...action,
              actionType,
              title: actionOption?.label ?? action.title,
              description: actionOption?.description ?? action.description,
            }
          : action
      ),
    }));
  };

  const markActionTouched = (actionId: string) => {
    setTouchedActions((current) => ({ ...current, [actionId]: true }));
  };

  const addAction = () => {
    const id = `action-${Date.now()}`;
    setRule((current) => ({
      ...current,
      actions: [
        ...current.actions,
        {
          id,
          actionType: "",
          title: "Action pending",
          description: "Choose an action to define the expected outcome.",
          order: current.actions.length + 1,
        },
      ],
    }));
    setTouchedActions((current) => ({ ...current, [id]: false }));
  };

  const reorderAction = (actionId: string, direction: -1 | 1) => {
    setRule((current) => {
      const index = current.actions.findIndex((action) => action.id === actionId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.actions.length) return current;
      const actions = [...current.actions];
      const [moved] = actions.splice(index, 1);
      actions.splice(nextIndex, 0, moved);
      return {
        ...current,
        actions: actions.map((action, actionIndex) => ({ ...action, order: actionIndex + 1 })),
      };
    });
  };

  const discardChanges = () => {
    setRule(JSON.parse(JSON.stringify(savedSnapshot)) as RuleDefinition);
  };

  const saveRule = async () => {
    if (!validity.isValid) return;
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nextRule: RuleDefinition = {
      ...rule,
      summary: {
        ...rule.summary,
        status: "active",
        enabled: true,
        name:
          rule.summary.name.trim() ||
          lookupLabel(triggerCategories, rule.trigger.family, "Untitled rule"),
        triggerPreview: buildTriggerPreview(rule),
        actionPreview: buildActionPreview(rule),
      },
      metadata: {
        ...rule.metadata,
        lastModified: "Just now",
      },
    };

    setRule(nextRule);
    setSavedSnapshot(JSON.parse(JSON.stringify(nextRule)) as RuleDefinition);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 pb-16">
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleBold className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Reset draft?</DialogTitle>
            </div>
            <DialogDescription>
              Reset this draft and start a custom rule? This will clear your current configuration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetDraft("custom");
                setConfirmResetOpen(false);
              }}
            >
              Reset draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/rules">
            <ArrowLeft className="h-4 w-4" />
            Back to rules
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">{lastSavedText}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-6">
          {isCreateMode ? (
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Choose how to start</CardTitle>
                      <CardDescription>
                        Pick a preset to get moving quickly, or start with a custom rule and build step by step.
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup
                  value={creationStartMode}
                  onValueChange={(value) => {
                    const next = value as "preset" | "custom";
                    if (next === "custom") {
                      if (creationStartMode === "custom") return;
                      if (isDirty) {
                        setConfirmResetOpen(true);
                        return;
                      }
                      resetDraft("custom");
                      return;
                    }
                    if (creationStartMode === "preset") return;
                    if (hasStartedDraft) {
                      resetDraft("preset");
                      return;
                    }
                    setCreationStartMode("preset");
                  }}
                  className="grid gap-3 sm:grid-cols-2"
                  aria-label="Choose how to start creating a rule"
                >
                  <label
                    htmlFor="rule-start-preset"
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      creationStartMode === "preset"
                        ? "border-border bg-muted/30"
                        : "border-border/70 bg-card hover:bg-muted/20",
                    )}
                  >
                    <RadioGroupItem id="rule-start-preset" value="preset" className="mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Preset templates</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Prefill a common trigger, condition, and action. You can edit everything after.
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="rule-start-custom"
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      creationStartMode === "custom"
                        ? "border-border bg-muted/30"
                        : "border-border/70 bg-card hover:bg-muted/20",
                    )}
                  >
                    <RadioGroupItem id="rule-start-custom" value="custom" className="mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Custom rule</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Start from a blank rule and configure each step as you go.
                      </p>
                    </div>
                  </label>
                  {creationStartMode === "custom" && selectedPreset ? (
                    <p className="text-xs text-muted-foreground">
                      Started from preset: <span className="font-medium text-foreground">{selectedPreset.label}</span>
                    </p>
                  ) : null}
                </RadioGroup>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    creationStartMode === "preset"
                      ? "max-h-[520px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-1 pointer-events-none",
                  )}
                  aria-hidden={creationStartMode !== "preset"}
                >
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Presets</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {rulePresets.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={cn(
                              "relative rounded-xl border p-3 text-left transition-all",
                              isSelected
                                ? "border-primary/40 bg-muted/40"
                                : "border-border/70 bg-card hover:border-primary/30 hover:bg-muted/20 hover:shadow-sm",
                            )}
                          >
                            {isSelected ? (
                              <span
                                className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-primary"
                                aria-hidden="true"
                              />
                            ) : null}
                            <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{preset.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Trigger</CardTitle>
                  <CardDescription>Choose what should start this rule and which trigger it should watch.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field>
                <FieldLabel htmlFor="rule-name">Rule name</FieldLabel>
                <Input
                  id="rule-name"
                  value={rule.summary.name}
                  onChange={(event) => updateSummary({ name: event.target.value })}
                  placeholder="Support Escalation"
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Trigger type</FieldLabel>
                  <Select
                    value={rule.trigger.family}
                    onOpenChange={(open) => {
                      if (!open) markTriggerTouched("family");
                    }}
                    onValueChange={(value) => {
                      const nextTrigger = getTriggersForCategory(value)[0];
                      updateTrigger({
                        family: value,
                        signal: nextTrigger?.id ?? "",
                        source: nextTrigger?.source ?? "",
                      });
                      markTriggerTouched("family");
                      markTriggerTouched("signal");
                    }}
                  >
                    <SelectTrigger className={cn("w-full min-w-0", touchedTrigger.family && !rule.trigger.family ? "border-destructive focus:ring-destructive" : "")}>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerCategories.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touchedTrigger.family && !rule.trigger.family ? <FieldError>Choose a trigger type.</FieldError> : null}
                </Field>
                <Field>
                  <FieldLabel>Trigger</FieldLabel>
                  <Select
                    value={rule.trigger.signal}
                    onOpenChange={(open) => {
                      if (!open) markTriggerTouched("signal");
                    }}
                    onValueChange={(value) => {
                      updateTrigger({
                        signal: value,
                        source: getTriggerSource(value),
                      });
                      markTriggerTouched("signal");
                    }}
                  >
                    <SelectTrigger className={cn("w-full min-w-0", touchedTrigger.signal && !rule.trigger.signal ? "border-destructive focus:ring-destructive" : "")}>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touchedTrigger.signal && !rule.trigger.signal ? <FieldError>Choose a trigger.</FieldError> : null}
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Conditions</CardTitle>
                  <CardDescription>Set the conditions that must be true.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {rule.conditions.map((condition, index) => (
                <div key={condition.id} className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                  <div className="grid items-start gap-3 md:grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_56px]">
                    <div className="flex h-full items-center justify-start self-stretch">
                      {index === 0 ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">IF</span>
                      ) : (
                        <Select
                          value={condition.combinator ?? "and"}
                          onValueChange={(value) => updateCondition(condition.id, { combinator: value as "and" | "or" })}
                          onOpenChange={(open) => {
                            if (!open) markConditionTouched(condition.id, "operator");
                          }}
                        >
                          <SelectTrigger className="h-8 w-auto border-0 bg-transparent px-0 py-0 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="start">
                            <SelectItem value="and">AND</SelectItem>
                            <SelectItem value="or">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                      <Field className="min-w-0">
                        <FieldLabel>Parameter</FieldLabel>
                        <Select
                          value={condition.parameter}
                          onOpenChange={(open) => {
                            if (!open) markConditionTouched(condition.id, "parameter");
                          }}
                          onValueChange={(value) => {
                            updateCondition(condition.id, { parameter: value });
                            markConditionTouched(condition.id, "parameter");
                          }}
                        >
                        <SelectTrigger className={cn("w-full min-w-0", touchedConditions[condition.id]?.parameter && !condition.parameter ? "border-destructive focus:ring-destructive" : "")}>
                          <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionParameters.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {touchedConditions[condition.id]?.parameter && !condition.parameter ? (
                        <FieldError>Choose a parameter.</FieldError>
                      ) : null}
                    </Field>
                      <Field className="min-w-0">
                        <FieldLabel>Operator</FieldLabel>
                        <Select
                          value={condition.operator}
                          onOpenChange={(open) => {
                            if (!open) markConditionTouched(condition.id, "operator");
                          }}
                          onValueChange={(value) => {
                            updateCondition(condition.id, { operator: value });
                            markConditionTouched(condition.id, "operator");
                          }}
                        >
                        <SelectTrigger className={cn("w-full min-w-0", touchedConditions[condition.id]?.operator && !condition.operator ? "border-destructive focus:ring-destructive" : "")}>
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOperators.map((item) => (
                            <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {touchedConditions[condition.id]?.operator && !condition.operator ? (
                        <FieldError>Choose an operator.</FieldError>
                      ) : null}
                    </Field>
                    <Field className="min-w-0">
                      <FieldLabel>Value</FieldLabel>
                      <Input
                        value={condition.value}
                        onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                        onBlur={() => markConditionTouched(condition.id, "value")}
                        className={cn(touchedConditions[condition.id]?.value && !condition.value.trim() ? "border-destructive focus-visible:ring-destructive" : "")}
                        placeholder="Enter value"
                      />
                      {touchedConditions[condition.id]?.value && !condition.value.trim() ? (
                        <FieldError>Enter a value.</FieldError>
                      ) : null}
                    </Field>
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(condition.id)}
                        disabled={rule.conditions.length === 1}
                        aria-label="Delete condition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="link" className="px-0" onClick={addCondition}>
                <Plus className="h-4 w-4" />
                Add additional parameter
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Actions</CardTitle>
                  <CardDescription>THEN: define what happens next.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rule.actions.map((action, index) => (
                <div key={action.id} className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-semibold text-foreground">Step {index + 1}</p>
                        <Field>
                          <FieldLabel className="sr-only">Action type</FieldLabel>
                          <Select
                            value={action.actionType}
                            onOpenChange={(open) => {
                              if (!open) markActionTouched(action.id);
                            }}
                            onValueChange={(value) => {
                              updateAction(action.id, value);
                              markActionTouched(action.id);
                            }}
                          >
                            <SelectTrigger className="w-full min-w-[240px]">
                              <SelectValue placeholder="Choose action" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionCatalog.map((item) => (
                                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {touchedActions[action.id] && !isActionComplete(action) ? (
                            <FieldError>Choose an action.</FieldError>
                          ) : null}
                        </Field>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      <Button type="button" variant="ghost" size="icon" aria-label="Edit action">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Move action"
                        onClick={() => reorderAction(action.id, index === 0 ? 1 : -1)}
                        disabled={rule.actions.length === 1}
                      >
                        <Menu className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full border-dashed" onClick={addAction}>
                <Plus className="h-4 w-4" />
                Add subsequent action
              </Button>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="border border-border/70 bg-card shadow-card">
            <CardContent className="px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="w-full" onClick={saveRule} disabled={!validity.isValid || !isDirty || isSaving}>
                  {isSaving ? "Saving rule..." : "Save Rule"}
                </Button>
                <Button size="sm" variant="secondary" className="w-full" onClick={discardChanges} disabled={!isDirty || isSaving}>
                  Discard Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Rule Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <MetricCard label="Total executions" value={rule.metadata.executionCount.toLocaleString()} />
                <MetricCard label="Success rate" value={formatPct(rule.metadata.successRate)} />
              </div>
              <div className="space-y-3 border-t border-border pt-3 text-sm">
                <MetadataRow
                  label="Created by"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <span className="font-medium text-foreground">{rule.metadata.createdByName}</span>
                      <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                        {rule.metadata.createdByRole}
                      </Badge>
                    </span>
                  }
                />
                <MetadataRow label="Created on" value={rule.metadata.createdAt} />
                <MetadataRow label="Last triggered" value={rule.metadata.lastTriggeredAt} />
                <MetadataRow label="Last outcome" value={rule.metadata.lastTriggeredOutcome} />
                <MetadataRow label="Last Modified" value={rule.metadata.lastModified} />
                <MetadataRow
                  label="Environment"
                  value={<Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">{rule.metadata.environment}</Badge>}
                />
              </div>
            </CardContent>
          </Card>

          {rule.activity.length > 0 && (
            <Card className="border border-border/70">
              <CardHeader className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActivityOpen((current) => !current)}
                  className="flex items-center justify-between gap-3 text-left"
                >
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold tracking-tight">Activity Log</CardTitle>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {activityOpen ? "Hide" : "Show"}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", activityOpen && "rotate-180")} />
                  </span>
                </button>
              </CardHeader>
              {activityOpen && (
                <CardContent className="space-y-0">
                  <div className="max-h-[320px] overflow-y-auto overscroll-contain pr-1 -mr-1">
                    {rule.activity.map((entry, index) => {
                      const isLast = index === rule.activity.length - 1;
                      const iconStyle = getActivityStyle(entry.kind);
                      const Icon = iconStyle.icon;

                      return (
                        <div key={entry.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconStyle.badge)}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            {!isLast && <div className="w-px flex-1 bg-border" />}
                          </div>
                          <div className="min-w-0 pb-5">
                            <p className="text-sm leading-8 text-foreground">
                              {entry.title}
                              <span className="ml-1.5 text-xs text-muted-foreground">
                                · {entry.actor} · {entry.at}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground -mt-1">{entry.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

        </div>
      </div>

    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5 shadow-card">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-tight tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function buildTriggerPreview(rule: RuleDefinition) {
  const familyLabel = getTriggerCategoryLabel(rule.trigger.family);
  const signalLabel = getTriggerLabel(rule.trigger.signal);
  const firstCondition = rule.conditions[0];
  if (firstCondition && isConditionComplete(firstCondition)) {
    const parameter = lookupLabel(conditionParameters, firstCondition.parameter, firstCondition.parameter);
    const operator = lookupLabel(conditionOperators, firstCondition.operator, firstCondition.operator);
    return `${parameter} ${operator} ${firstCondition.value}`;
  }
  return `${familyLabel} · ${signalLabel}`;
}

function buildActionPreview(rule: RuleDefinition) {
  const firstAction = rule.actions.find(isActionComplete);
  return firstAction?.title ?? "Add at least one action";
}

function getActivityStyle(kind: RuleDefinition["activity"][number]["kind"]) {
  switch (kind) {
    case "created":
      return { icon: CalendarBold, badge: "bg-primary/10 text-primary" };
    case "updated":
      return { icon: ClockBold, badge: "bg-muted text-muted-foreground" };
    case "triggered":
    case "success":
      return { icon: CheckCircleBold, badge: "bg-emerald-500/15 text-emerald-700" };
    case "error":
      return { icon: AlertTriangleBold, badge: "bg-destructive/10 text-destructive" };
    default:
      return { icon: ClockBold, badge: "bg-muted text-muted-foreground" };
  }
}
