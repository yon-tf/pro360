# Pro360 ↔ FlyonUI Component Map

Reference: [FlyonUI Default Dashboard](https://demos.flyonui.com/templates/html/dashboard-default/common-dashboard.html)

This doc maps each Pro360 page to FlyonUI patterns and components. **Cosmetics only** — same content, elements, and flow; visual style aligned to FlyonUI.

---

## Cosmetic mapping (applied)

| Area | FlyonUI reference | Pro360 implementation |
|------|------------------|------------------------|
| **Theme** | Purple primary, light grey sidebar, white content | `--primary` purple (263 70% 50%), `--sidebar` light grey, `--background` near-white; success/warning for badges |
| **Sidebar** | Light grey bg, purple pill for active link | `bg-sidebar`; active = `bg-primary text-primary-foreground` |
| **Top bar** | White bar, centered “Search [CTRL + K]”, icons right | `bg-card` + shadow; search trigger opens modal; theme + user right |
| **Cards** | Rounded, soft shadow, clear header/content | `rounded-xl shadow-sm`, CardHeader `py-4`, CardTitle `font-medium` |
| **Tables** | Uppercase headers, row hover, 8pt cell padding | TableHead uppercase + `tracking-wider`; TableCell `py-4`; row hover `bg-muted/50` |
| **Badges** | Success (green), warning (amber), destructive (red), secondary (grey) | Variants: `default`, `secondary`, `destructive`, `success`, `warning`, `outline` |
| **Buttons** | Rounded-lg, primary purple, focus ring | `rounded-lg`, `ring-2 ring-offset-2`; primary uses theme |
| **Inputs / Dialog** | Rounded inputs, modal with border and shadow | Input `rounded-lg px-4 py-2`; DialogContent `bg-card border-border rounded-xl` |

---

## App shell

| Pro360 | FlyonUI | Component | Notes |
|--------|---------|-----------|--------|
| Sidebar | Left nav (grouped links) | `Sidebar` | Flat nav; FlyonUI-style active pill and sidebar bg. |
| Top bar | Search, theme, user | `TopBar` | Search [CTRL+K] trigger; theme + user; FlyonUI-style bar. |

---

## Page → pattern checklist

| Pro360 page | Pattern | Components |
|-------------|---------|------------|
| **Professional 360 – Dashboard** | Stat cards + bento + table | Card (bento), stat cards, Table + pagination |
| **Professional 360 – Client** | DataTable | Table, Button (View chat) |
| **Professional 360 – Calendar** | Calendar + cards | Card, day view, Button |
| **Professional 360 – Learn** | DataTable | Card, Table |
| **Professional 360 – Jobs** | Cards / list | Card grid, Button, Badge |
| **Payout** | Stats + DataTable + Tabs | Stat cards, Tabs, Table, toolbar, TablePagination |
| **Rule Engine** | Form + DataTable | Card (form), Select/Input, Button, Table |
| **Chat** | Messaging | Two-panel layout, list + thread + composer |
| **LMS** | DataTable | Card, Table, Button |
| **Gig** | DataTable + modal | Card, Table, Button, Dialog |
| **Appointments** | DataTable + filters | Card, Tabs/pills, Table |

---

## 8pt grid

- **Padding:** `p-2` (8), `p-4` (16), `p-6` (24), `p-8` (32)
- **Gaps:** `gap-2`, `gap-4`, `gap-6`
- Avoid: `p-3`, `py-2.5`, `p-5` unless needed.

---

## Responsiveness

- **Sidebar:** Visible `md+`; drawer on smaller; scroll lock and focus trap when open.
- **TopBar:** Search collapses to icon on very small screens.
- **Tables:** Horizontal scroll on small viewports.
