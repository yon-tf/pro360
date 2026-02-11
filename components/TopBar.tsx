"use client";

import { LogOut, Menu, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useBreadcrumb } from "@/components/BreadcrumbContext";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const TOPBAR_USER_AVATAR = "https://i.pravatar.cc/128?img=32";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { setTheme, resolved } = useTheme();
  const { items } = useBreadcrumb();

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
          <div className="flex items-center gap-2">
            <div className="hidden h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:flex">
              <img
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
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
    </header>
  );
}
