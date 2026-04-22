"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Download,
  Info,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  User,
} from "@/components/ui/solar-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const COLOR_TOKENS = [
  { name: "Primary", token: "--primary", usage: "Buttons, active nav, links" },
  { name: "Secondary", token: "--secondary", usage: "Secondary chips, soft panels" },
  { name: "Muted", token: "--muted", usage: "Muted surfaces, low-emphasis rows" },
  { name: "Success", token: "--success", usage: "Positive status and completion" },
  { name: "Warning", token: "--warning", usage: "Caution states and alerts" },
  { name: "Destructive", token: "--destructive", usage: "Danger actions and errors" },
  { name: "Border", token: "--border", usage: "Dividers and structural lines" },
];

const ICON_EXAMPLES = [
  { name: "Search", Comp: Search, usage: "Search fields across chat/list pages" },
  { name: "Calendar", Comp: Calendar, usage: "Date and schedule contexts" },
  { name: "MessageSquare", Comp: MessageSquare, usage: "Chat and conversation actions" },
  { name: "Settings", Comp: Settings, usage: "Sidebar settings access" },
  { name: "Download", Comp: Download, usage: "Export/report actions" },
  { name: "User", Comp: User, usage: "People and profile context" },
  { name: "Plus", Comp: Plus, usage: "Create/add actions" },
  { name: "CheckCircle", Comp: CheckCircle, usage: "Positive status indicators" },
  { name: "AlertTriangle", Comp: AlertTriangle, usage: "Warnings and risk flags" },
  { name: "Info", Comp: Info, usage: "Guidance/tooltips and metadata" },
  { name: "ChevronDown", Comp: ChevronDown, usage: "Expand and dropdown controls" },
  { name: "MoreHorizontal", Comp: MoreHorizontal, usage: "Overflow/extra actions" },
];

export function ColorPalettePreview() {
  return (
    <section className="my-4 space-y-3 rounded-lg border border-border/70 bg-card/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-label-sm text-muted-foreground">
        Live preview
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLOR_TOKENS.map((item) => (
          <Card key={item.token}>
            <CardContent className="p-3">
              <div
                className="h-20 rounded-md border border-border"
                style={{ backgroundColor: `hsl(var(${item.token}))` }}
              />
              <p className="mt-2 text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.token}</p>
              <p className="mt-1 text-xs text-muted-foreground">Used in: {item.usage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function TypographyPreview() {
  return (
    <section className="my-4 space-y-3 rounded-lg border border-border/70 bg-card/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-label-sm text-muted-foreground">
        Live preview
      </p>
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Heading 1</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              Sell, bill and organize your work
            </p>
            <p className="text-xs text-muted-foreground">Used in: page title and top-level section title.</p>
          </div>
          <div className="space-y-1 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Heading 2</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              Section title for operations dashboard
            </p>
            <p className="text-xs text-muted-foreground">Used in: module section headers and card groups.</p>
          </div>
          <div className="space-y-1 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Body</p>
            <p className="text-sm leading-6 text-foreground">
              Body text is optimized for scanability and readability in operational surfaces.
            </p>
            <p className="text-xs text-muted-foreground">Used in: descriptions, helper text, and content paragraphs.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function IconographyPreview() {
  return (
    <section className="my-4 space-y-3 rounded-lg border border-border/70 bg-card/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-label-sm text-muted-foreground">
        Live preview
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ICON_EXAMPLES.map(({ name, Comp, usage }) => (
          <Card key={name}>
            <CardContent className="space-y-1 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Comp className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">{name}</span>
                </div>
                <Badge variant="secondary">Solar</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Used in: {usage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ComponentsPreview() {
  return (
    <TooltipProvider>
      <section className="my-4 space-y-3 rounded-lg border border-border/70 bg-card/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-label-sm text-muted-foreground">
          Live preview
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Label + optional helper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="example-name">Label</FieldLabel>
                <Input id="example-name" placeholder="Placeholder" />
                <FieldDescription>Use concise labels for clarity.</FieldDescription>
              </Field>
              <p className="text-xs text-muted-foreground">Used in: forms, drawers, and modal inputs.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Required + tooltip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="example-email" className="flex items-center gap-1">
                  Label <span className="text-destructive">*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Field help"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Explain why this field is needed.</TooltipContent>
                  </Tooltip>
                </FieldLabel>
                <Input id="example-email" placeholder="Placeholder" />
              </Field>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox defaultChecked />
                Enable notifications
              </label>
              <div className="flex gap-2">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Used in: create/edit flows and settings forms.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </TooltipProvider>
  );
}
