"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Menu, Sun, Moon, Monitor, Bell, User, BookOpen, Calendar } from "@/components/ui/solar-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/ThemeProvider";
import { useBreadcrumb } from "@/components/BreadcrumbContext";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { notifications as initialNotifications, formatTimeAgo, type Notification } from "@/features/org/mock/notifications";

const TOPBAR_USER_AVATAR = "https://i.pravatar.cc/128?img=32";

const NOTIFICATION_ICON: Record<Notification["type"], typeof User> = {
  profile_update: User,
  on_leave: User,
  learn_activity: BookOpen,
  upcoming_event: Calendar,
};

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { setTheme, resolved } = useTheme();
  const { items } = useBreadcrumb();
  const [notifs, setNotifs] = useState(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) markAllRead();
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border/50 bg-card px-4 shadow-card sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <Breadcrumbs items={items} />
      </div>
      <div className="flex shrink-0 items-center gap-2">
          {/* Notifications */}
          <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative shrink-0" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xxxs font-semibold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {notifs.some((n) => !n.read) && (
                  <button type="button" className="text-xs text-primary hover:underline" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <ScrollArea className="max-h-80">
                {notifs.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {notifs.map((n) => {
                      const Icon = NOTIFICATION_ICON[n.type];
                      return (
                        <li key={n.id}>
                          <Link
                            href={n.href ?? "#"}
                            className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                            onClick={() => setOpen(false)}
                          >
                            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground leading-snug">
                                {n.title}
                                {!n.read && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                              <p className="mt-1 text-xxs text-muted-foreground/70">{formatTimeAgo(n.timestamp)}</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" aria-label="Theme">
                {resolved === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User avatar + dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="hidden h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:flex">
                  <Image
                    src={TOPBAR_USER_AVATAR}
                    alt=""
                    className="h-full w-full object-cover"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-foreground">Sarah Lee</p>
                  <p className="text-xs text-muted-foreground">Clinical Ops</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  View my calendar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pro360">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </header>
  );
}
