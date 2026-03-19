# Shadcn UI Migration Checklist

Use this checklist for any new UI work and during ongoing migration.

## When to use this

- Any time you add or modify interactive UI in feature code.
- Any time you touch forms, dialogs, dropdowns, or inputs.
- Any time you introduce new Radix usage or replace existing UI.

## Migration flow (recommended)

1. Check if the primitive already exists in `components/ui`.
2. If missing, add the primitive to `components/ui` first.
3. Replace feature code to use the shared primitive.
4. Verify focus, keyboard, and visual states are preserved.

## Standards

- Import UI primitives from `@/components/ui/*` in feature code.
- Prefer existing wrappers (`Button`, `Input`, `Select`, `Dialog`, `Popover`, `Textarea`, `Checkbox`, `Switch`, `Tooltip`, `DatePicker`).
- If a primitive is missing, add it in `components/ui/` first, then consume it.
- Avoid direct Radix usage in feature pages unless wrapped locally first.

## Review Checklist (per PR)

- No raw `<textarea>` in feature components (use `Textarea`).
- No raw interactive checkboxes for UI forms (use `Checkbox`).
- No custom switches for standard boolean toggles (use `Switch`).
- Inputs/selects/buttons use shared shadcn components.
- Date rendering in client pages uses deterministic formatting where SSR/CSR mismatch is possible (set `timeZone` when needed).
- Keyboard and focus behavior preserved for replaced controls.

## Known Exceptions

- File upload inputs may remain native hidden `<input type="file">`.
- Highly custom row wrappers may remain native buttons when shadcn `Button` changes layout semantics.
