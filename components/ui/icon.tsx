"use client"

import {
  Calendar,
  Circle,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  X,
} from "@/components/ui/solar-icons"

type SolarIconName =
  | "check"
  | "chevronDown"
  | "chevronUp"
  | "chevronRight"
  | "circle"
  | "close"
  | "calendar"
  | "search"

const SOLAR_ICON_COMPONENTS = {
  check: Check,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronRight: ChevronRight,
  circle: Circle,
  close: X,
  calendar: Calendar,
  search: Search,
}

export function Icon({
  name,
  className,
}: {
  name: SolarIconName
  className?: string
}) {
  const Component = SOLAR_ICON_COMPONENTS[name]
  return <Component className={className} />
}

