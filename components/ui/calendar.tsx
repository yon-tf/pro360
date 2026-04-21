"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rdp-custom", className)}
      classNames={{
        months: cn(defaults.months, "flex flex-col gap-4"),
        month: cn(defaults.month, "space-y-3"),
        month_caption: cn(defaults.month_caption, "relative flex h-9 items-center justify-center"),
        caption_label: cn(defaults.caption_label, "text-sm font-medium"),
        dropdowns: cn(defaults.dropdowns, "flex items-center gap-1 text-sm font-medium"),
        dropdown_root: cn(defaults.dropdown_root, "relative"),
        dropdown:
          cn(
            defaults.dropdown,
            "h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          ),
        months_dropdown: cn(
          defaults.months_dropdown,
          "h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
        ),
        years_dropdown: cn(
          defaults.years_dropdown,
          "h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
        ),
        nav: cn(defaults.nav, "flex items-center gap-1"),
        button_previous: cn(
          defaults.button_previous,
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        button_next: cn(
          defaults.button_next,
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        month_grid: cn(defaults.month_grid, "w-full border-collapse"),
        weekdays: cn(defaults.weekdays, "flex"),
        weekday: cn(defaults.weekday, "text-muted-foreground rounded-md w-9 font-normal text-xsplus text-center"),
        week: cn(defaults.week, "flex w-full mt-2"),
        day: cn(defaults.day, "h-9 w-9 p-0 text-center text-sm relative"),
        day_button: cn(
          defaults.day_button,
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        selected: cn(defaults.selected, "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"),
        today: cn(defaults.today, "bg-muted text-foreground"),
        outside: cn(defaults.outside, "text-muted-foreground opacity-50"),
        disabled: cn(defaults.disabled, "text-muted-foreground opacity-50"),
        hidden: cn(defaults.hidden, "invisible"),
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
