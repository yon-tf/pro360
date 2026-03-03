"use client";

import { useState, useRef } from "react";
import { X } from "@/components/ui/solar-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  label: string;
  helperText?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  label,
  helperText,
  tags,
  onChange,
  placeholder = "Type and press Enter...",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function addTag() {
    const trimmed = input.trim().replace(/,+$/, "").trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  function handleRemove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {helperText ? <FieldDescription>{helperText}</FieldDescription> : null}
      <div
        className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="rounded-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/10"
          >
            {tag}
            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(tag); }}
              variant="ghost"
              size="icon"
              className="ml-0.5 h-4 w-4 rounded-full p-0 text-primary hover:bg-primary/20 hover:text-primary"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          className="h-7 min-w-[120px] flex-1 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={tags.length > 0 ? "Add more..." : placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
        />
      </div>
      <FieldDescription>Press Enter or comma to add.</FieldDescription>
    </Field>
  );
}
