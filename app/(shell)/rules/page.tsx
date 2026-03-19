import { RuleDashboard } from "@/features/rules/components/RuleBuilder";
import { rulesApi } from "@/features/rules/api";

export default async function RulesPage() {
  const rules = await rulesApi.listRules();

  return <RuleDashboard initialRules={rules} />;
}
