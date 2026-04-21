"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BreadcrumbProvider } from "@/components/BreadcrumbContext";
import { PathnameBreadcrumbSync } from "@/components/PathnameBreadcrumbSync";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const sidebarWidth = sidebarCollapsed ? 64 : 256;

  // Scroll lock when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // Focus first focusable when drawer opens; focus trap (Tab wraps)
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;
    const el = drawerRef.current;
    const focusables = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <ThemeProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ ["--sidebar-width" as never]: `${sidebarWidth}px` }}
      >
        {/* Desktop sidebar: fixed, full height, collapse/expand */}
        <div
          className={`
            hidden md:flex md:h-screen md:shrink-0 md:flex-col md:overflow-hidden
            ${sidebarCollapsed ? "md:w-16" : "md:w-64"}
          `}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          />
        </div>
        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
        )}
        {/* Mobile drawer sidebar: scrollable content, focus trap container */}
        <div
          ref={drawerRef}
          className={`
            sidebar-sleek fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden shadow-panel transition-transform duration-200 ease-out md:hidden
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
        {/* Main: top bar fixed, only this content area scrolls */}
        <BreadcrumbProvider>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:min-h-screen">
            <TopBar onMenuClick={() => setMobileOpen(true)} />
            <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-screen-2xl">
                <PathnameBreadcrumbSync>{children}</PathnameBreadcrumbSync>
              </div>
            </main>
          </div>
        </BreadcrumbProvider>
      </div>
    </ThemeProvider>
  );
}
