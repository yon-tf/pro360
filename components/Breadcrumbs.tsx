"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getModuleRoot(path: string): string {
  const clean = path.split(/[?#]/)[0] ?? "";
  const first = clean.split("/").filter(Boolean)[0];
  return first ?? "";
}

function isCrossModuleHref(href: string, pathname: string): boolean {
  if (/^https?:\/\//.test(href)) return true;
  const current = getModuleRoot(pathname);
  const next = getModuleRoot(href);
  if (!current || !next) return false;
  return current !== next;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const pathname = usePathname();
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-foreground">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const crossModule = item.href ? isCrossModuleHref(item.href, pathname) : false;
        return (
          <span key={i}>
            {i > 0 && <span className="mx-2 text-muted-foreground">/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                target={crossModule ? "_blank" : undefined}
                rel={crossModule ? "noopener noreferrer" : undefined}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : isLast ? (
              <h1 className="inline text-sm font-medium">{item.label}</h1>
            ) : (
              <span className="text-muted-foreground">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
