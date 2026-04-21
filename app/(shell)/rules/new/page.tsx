"use client";

import { useEffect, useState } from "react";
import { RuleCanvas } from "@/features/rules/components/RuleBuilder";
import { rulesApi } from "@/features/rules/api";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

export default function NewRulePage() {
  const [draftRule, setDraftRule] = useState<Awaited<ReturnType<typeof rulesApi.createDraftRule>> | null>(null);
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    void rulesApi.createDraftRule().then(setDraftRule);
    setItems([
      { label: "Rule Engine", href: "/rules" },
      { label: "Create" },
    ]);
  }, [setItems]);

  if (!draftRule) {
    return <div className="text-sm text-muted-foreground">Loading rule builder...</div>;
  }

  return <RuleCanvas mode="create" initialRule={draftRule} />;
}
