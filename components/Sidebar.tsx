"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  Zap,
  MessageSquare,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/professional/1", label: "Professional 360", icon: LayoutDashboard },
  { href: "/payout", label: "Payout", icon: DollarSign },
  { href: "/rules", label: "Rule Engine", icon: Zap },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/lms", label: "Growth", icon: BookOpen },
  { href: "/gig", label: "Gig", icon: Briefcase },
  { href: "/appointments", label: "Appointments", icon: Calendar },
];

const PLATFORM_VERSION = "Pro360 V1.29";

export function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "sidebar-sleek flex h-full min-h-0 flex-col border-r border-white/10 text-white transition-[width] duration-200 ease-out",
        collapsed ? "w-[4rem]" : "w-64"
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3">
        {collapsed ? (
          onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex w-full justify-center rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )
        ) : (
          <>
            <Link
              href="/professional/1"
              className="text-lg font-semibold tracking-tight text-white"
              onClick={onNavigate}
            >
              Pro360
            </Link>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
      <nav
        className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2"
        aria-label="Main"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href === "/professional/1" && pathname.startsWith("/professional")) ||
            (href !== "/professional/1" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={clsx(
                "sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 transition-colors",
                collapsed && "justify-center px-2",
                isActive && "sidebar-sleek-nav-active text-white",
                !isActive && "hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-2">
        <Link
          href="/docs"
          onClick={onNavigate}
          title={collapsed ? "Documentation" : undefined}
          className={clsx(
            "sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <FileText className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Documentation</span>}
        </Link>
        <Link
          href="#"
          onClick={onNavigate}
          title={collapsed ? "Help and Support" : undefined}
          className={clsx(
            "sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Help and Support</span>}
        </Link>
        <Link
          href="#"
          onClick={onNavigate}
          title={collapsed ? "Settings" : undefined}
          className={clsx(
            "sidebar-sleek-nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>
        {!collapsed && (
          <p className="mt-2 px-3 py-1 text-xs text-white/50">
            Platform version: {PLATFORM_VERSION}
          </p>
        )}
        {collapsed && (
          <p
            className="mt-2 text-center text-[10px] text-white/50"
            title={`Platform version: ${PLATFORM_VERSION}`}
          >
            V1.29
          </p>
        )}
      </div>
    </aside>
  );
}
