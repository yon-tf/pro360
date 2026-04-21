"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DollarSign,
  Zap,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  Contact,
  LayoutDashboard,
  Users,
  MessageSquare,
} from "@/components/ui/solar-icons";
import { clsx } from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  matchPath?: string;
  matchParam?: { key: string; value: string };
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Quality",
    items: [
      { href: "/pro360", label: "Professional 360", icon: LayoutDashboard },
      { href: "/appointments?context=internal", label: "Internal appointments", icon: Users, matchPath: "/appointments", matchParam: { key: "context", value: "internal" } },
    ],
  },
  {
    heading: "Commercial",
    items: [
      { href: "/payout", label: "Payout", icon: DollarSign },
      { href: "/appointments?context=external", label: "External appointments", icon: Calendar, matchPath: "/appointments", matchParam: { key: "context", value: "external" } },
      { href: "/gig", label: "Gig", icon: Briefcase },
    ],
  },
  {
    heading: "Administration",
    items: [
      { href: "/team", label: "Pod Management", icon: UsersRound },
      { href: "/chat", label: "Chat", icon: MessageSquare },
      { href: "/rules", label: "Rule Engine", icon: Zap },
      { href: "/lms", label: "Learn", icon: BookOpen },
      { href: "/professionals", label: "Professionals", icon: Contact },
    ],
  },
];

const PREFIX_MATCH_PATHS = ["/professionals", "/pro360", "/team", "/payout", "/chat"];

function isItemActive(item: NavItem, pathname: string, searchParams: URLSearchParams): boolean {
  if (item.matchPath && item.matchParam) {
    return pathname === item.matchPath && searchParams.get(item.matchParam.key) === item.matchParam.value;
  }
  const basePath = item.href.split("?")[0];
  if (PREFIX_MATCH_PATHS.includes(basePath) && pathname.startsWith(basePath)) return true;
  return pathname === basePath;
}

const PLATFORM_VERSION = "Pro360 V1.29";

function SidebarLogo() {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return <span className="text-lg font-semibold tracking-tight text-white">ThoughtFull Pro360</span>;
  }
  return (
    <Image
      src="/brand/tf-logo-pro360.png"
      alt="ThoughtFull Pro360"
      width={140}
      height={36}
      className="h-9 w-auto"
      priority
      onError={() => setImgError(true)}
    />
  );
}

interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarNav({ onNavigate, collapsed = false }: Pick<SidebarProps, "onNavigate" | "collapsed">) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-2" aria-label="Main">
      {NAV_GROUPS.map((group) => (
        <div key={group.heading} className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 pt-2 text-xxs font-semibold uppercase tracking-wider text-white/40">
              {group.heading}
            </p>
          )}
          {collapsed && <div className="mx-auto my-1 h-px w-6 bg-white/10" aria-hidden />}
          {group.items.map((item) => {
            const active = isItemActive(item, pathname, searchParams);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={clsx(
                  "sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition-colors",
                  collapsed && "justify-center px-2",
                  active && "sidebar-sleek-nav-active text-white",
                  !active && "hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={clsx(
        "sidebar-sleek flex h-full min-h-0 flex-col border-r border-white/10 text-white transition-[width] duration-200 ease-out",
        collapsed ? "w-[4rem]" : "w-64",
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3">
        {collapsed ? (
          onToggleCollapse && (
            <button type="button" onClick={onToggleCollapse} className="flex w-full justify-center rounded p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Expand sidebar">
              <ChevronRight className="h-4 w-4" />
            </button>
          )
        ) : (
          <>
            <Link href="/pro360" className="inline-flex items-center min-h-9" onClick={onNavigate} aria-label="ThoughtFull Pro360 home">
              <SidebarLogo />
            </Link>
            {onToggleCollapse && (
              <button type="button" onClick={onToggleCollapse} className="rounded p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Collapse sidebar">
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      <Suspense><SidebarNav onNavigate={onNavigate} collapsed={collapsed} /></Suspense>

      <div className="shrink-0 border-t border-white/10 p-2">
        <Link href="/docs" onClick={onNavigate} title={collapsed ? "Documentation" : undefined} className={clsx("sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white", collapsed && "justify-center px-2")}>
          <FileText className="h-4 w-4 shrink-0" />{!collapsed && <span className="truncate">Documentation</span>}
        </Link>
        <Link href="#" onClick={onNavigate} title={collapsed ? "Help and Support" : undefined} className={clsx("sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white", collapsed && "justify-center px-2")}>
          <HelpCircle className="h-4 w-4 shrink-0" />{!collapsed && <span className="truncate">Help and Support</span>}
        </Link>
        <Link href="#" onClick={onNavigate} title={collapsed ? "Settings" : undefined} className={clsx("sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white", collapsed && "justify-center px-2")}>
          <Settings className="h-4 w-4 shrink-0" />{!collapsed && <span className="truncate">Settings</span>}
        </Link>
        {!collapsed && <p className="mt-2 px-3 py-1 text-xs text-white/50">Platform version: {PLATFORM_VERSION}</p>}
        {collapsed && <p className="mt-2 text-center text-xxxs text-white/50" title={`Platform version: ${PLATFORM_VERSION}`}>V1.29</p>}
      </div>
    </aside>
  );
}
