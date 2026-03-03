"use client"

import * as React from "react"
import { format, isValid, parse, parseISO } from "date-fns"

import { Calendar } from "@/components/ui/calendar"
import { Icon } from "@/components/ui/icon"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function toDate(value?: string) {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

function toIsoDate(date?: Date) {
  if (!date || !isValid(date)) return ""
  return format(date, "yyyy-MM-dd")
}

function formatDate(date: Date | undefined) {
  if (!date) return ""
  return format(date, "dd MMMM yyyy")
}

function parseInputDate(value: string) {
  const attempts = [
    parse(value, "dd MMMM yyyy", new Date()),
    parse(value, "dd MMM yyyy", new Date()),
    parse(value, "yyyy-MM-dd", new Date()),
    new Date(value),
  ]
  return attempts.find((d) => isValid(d))
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  className,
}: DatePickerProps) {
  const inputId = React.useId()
  const [open, setOpen] = React.useState(false)
  const date = toDate(value)
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [inputValue, setInputValue] = React.useState(formatDate(date))

  React.useEffect(() => {
    setInputValue(formatDate(date))
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    setMonth(date)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <InputGroup className={cn(className)}>
      <InputGroupInput
        id={inputId}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          const nextValue = e.target.value
          setInputValue(nextValue)
          const parsed = parseInputDate(nextValue)
          if (parsed) {
            onChange(toIsoDate(parsed))
            setMonth(parsed)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              id={`${inputId}-calendar-button`}
              type="button"
              aria-label="Select date"
              disabled={disabled}
            >
              <Icon name="calendar" className="h-4 w-4" />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={(nextDate) => {
                onChange(toIsoDate(nextDate))
                setInputValue(formatDate(nextDate))
                setOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  )
}
