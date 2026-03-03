export type FilterFieldType = "select" | "multi-select" | "tri-state" | "slider" | "text";

export interface FilterOption {
  value: string;
  label: string;
  heading?: boolean;
}

export interface FilterContext {
  activeTab?: string;
  [key: string]: unknown;
}

export interface FilterFieldDef {
  key: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[] | (() => FilterOption[]);
  isVisible?: (ctx: FilterContext) => boolean;
  isEnabled?: (ctx: FilterContext) => boolean;
  lockedDisplay?: string;
  isActive?: (value: unknown) => boolean;
  chipLabel?: (value: unknown) => string | null;
  searchable?: boolean;
  sliderConfig?: { min: number; max: number; step: number; suffix?: string };
}

export interface FilterGroup {
  title: string;
  fields: FilterFieldDef[];
  isVisible?: (ctx: FilterContext) => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AdvancedFilterConfig<TAdv extends Record<string, any> = Record<string, any>> {
  groups: FilterGroup[];
  defaults: TAdv;
}

export interface VisibleGroup {
  title: string;
  fields: FilterFieldDef[];
}

export function defaultIsActive(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (value === false) return false;
  if (typeof value === "string" && (value === "" || value === "all" || value === "__none")) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}
