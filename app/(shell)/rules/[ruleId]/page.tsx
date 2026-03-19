"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RuleCanvas } from "@/features/rules/components/RuleBuilder";
import { rulesApi } from "@/features/rules/api";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

export default function RuleDetailPage() {
  const { ruleId } = useParams<{ ruleId: string }>();
  const [rule, setRule] = useState<Awaited<ReturnType<typeof rulesApi.getRule>> | undefined>();
  const [loaded, setLoaded] = useState(false);
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setLoaded(false);
    void rulesApi.getRule(ruleId).then((nextRule) => {
      setRule(nextRule);
      setItems([
        { label: "Automation Rules", href: "/rules" },
        { label: nextRule?.summary.name ?? "Rule", href: `/rules/${ruleId}` },
        { label: "Edit rule" },
      ]);
      setLoaded(true);
    });
  }, [ruleId, setItems]);

  if (!loaded) {
    return <div className="text-sm text-muted-foreground">Loading rule builder...</div>;
  }

  if (!rule) {
    return <div className="text-sm text-muted-foreground">Rule not found.</div>;
  }

  return <RuleCanvas mode="edit" initialRule={rule} />;
}
