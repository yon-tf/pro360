// NOTE: Placeholder adapter. Replace with real API calls during backend integration.
import {
  actionCatalog,
  conditionOperators,
  conditionParameters,
  createEmptyRuleDefinition,
  getTriggersForCategory,
  getRuleDefinitionById,
  getRuleSummaries,
  triggerCategories,
  triggers,
  ruleSources,
  rulePresets,
} from "../mock/rules";

export const rulesApi = {
  listRules: async () => getRuleSummaries(),
  getRule: async (ruleId: string) => getRuleDefinitionById(ruleId),
  createDraftRule: async () => createEmptyRuleDefinition(),
  listTriggerCategories: async () => triggerCategories,
  listTriggers: async (categoryId?: string) => categoryId ? getTriggersForCategory(categoryId) : triggers,
  listPresets: async () => rulePresets,
  listFamilies: async () => triggerCategories, // legacy alias
  listSignals: async (familyId?: string) => familyId ? getTriggersForCategory(familyId) : triggers, // legacy alias
  listEventTypes: async () => triggers, // legacy alias
  listSources: async () => ruleSources,
  listTemplates: async () => rulePresets, // legacy alias
  listConditionParameters: async () => conditionParameters,
  listConditionOperators: async () => conditionOperators,
  listActions: async () => actionCatalog,
};
