"use client";

import { useState } from "react";
import Link from "next/link";
import {
  calendarEvents,
  calendarDayLabel,
  calendarDayShort,
  calendarDayWeekday,
} from "@/features/calendar/mock/calendar";
import { ChevronLeft, ChevronRight } from "@/components/ui/solar-icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

function parseTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

export default function CalendarPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = selectedEventId
    ? calendarEvents.find((e) => e.id === selectedEventId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        items={[]}
        cta={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">Today</Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pro360/PRO7862025001">Back to Professional 360</Link>
          </Button>
        </div>
        }
      />

      <div className="flex gap-4">
        <Card className="min-w-0 flex-1">
          <CardHeader className="pb-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">{calendarDayShort}</p>
            <p className="text-sm text-muted-foreground">{calendarDayLabel} · {calendarDayWeekday}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Day view</p>
          </CardHeader>
          <CardContent className="p-0">
          <div className="divide-y divide-border">
            {HOURS.map((hour) => {
              const hourEvents = calendarEvents.filter(
                (ev) => Math.floor(parseTime(ev.start)) === hour
              );
              return (
                <div
                  key={hour}
                  className="flex min-h-[4.5rem]"
                >
                  <div className="w-24 shrink-0 py-3 pr-4 text-right text-xs font-medium text-muted-foreground tabular-nums">
                    {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2 py-2">
                    {hourEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEventId(ev.id)}
                        className={cn(
                          "w-full rounded-xl px-4 py-2 text-left shadow-card transition hover:shadow-panel",
                          ev.type === "pod" && "bg-violet-50/50 dark:bg-violet-950/30",
                          ev.type === "townhall" && "bg-primary/5 dark:bg-primary/10",
                          ev.type === "f2f" && "bg-card"
                        )}
                      >
                        <p className="text-sm font-medium text-foreground">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">{ev.with}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {ev.start} – {ev.end}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          </CardContent>
        </Card>

        {selectedEvent && (
          <Card className="w-80 shrink-0">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground">{selectedEvent.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {calendarDayLabel} · {selectedEvent.start} – {selectedEvent.end}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">With: {selectedEvent.with}</p>
              <Badge variant="secondary" className="mt-2">
                {selectedEvent.type === "f2f" ? "Face to face" : selectedEvent.type}
              </Badge>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSelectedEventId(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
