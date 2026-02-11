"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 p-4 sm:max-w-md sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search pages and actions. Press Escape to close.
          </DialogDescription>
        </DialogHeader>
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search…"
          className="h-10"
          aria-label="Search"
          onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
