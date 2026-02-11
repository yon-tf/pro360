# Pro360 – Clinical Ops Pitch

Frontend-only pitch/demo for the Clinical Ops experience (persona: Sarah Lee). Built with Next.js 14, Tailwind CSS, and a clean, modern, light design inspired by Supabase and Vercel.

## Design language

- **Light theme**: White and light grey surfaces, dark grey text, subtle borders.
- **Typography**: Clear sans-serif (Inter / system UI), comfortable spacing and hierarchy.
- **Components**: Minimal buttons, cards with subtle borders/shadows, tables with clear headers.
- **Spacing**: Generous padding and gaps for an uncluttered feel.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/professional/1` (Professional 360).

## Pages

### Professional 360 (`/professional/1`)

- **Profile header**: Name, license number, expiry, role.
- **Dashboard tab**  
  - Metric order: **Avg response time** → **Client chat hours** → **TFP chat score** → **SLA / TFP+ status** (with info icon) → **Missed sessions** → **Late sessions** → **Excessive sessions**.  
  - **SLA / TFP+ status** card has an info icon; click to open a popup with TFP+ qualification rules and **payout multiplier** (1.2x / 0.8x). Payout multiplier is not shown as a separate card.  
  - **Feedback** and **Rating** cards: click to open a popup with the full list.  
  - **Case notes submission log** table below.
- **Client tab**: Table with User ID, age, gender, name, last contact; **View chat** links to Chat with that client.
- **Calendar tab**: **Day view** only. Date header (e.g. FEB 10, weekday), prev/next and **Today** controls, **View full page calendar** button (links to `/calendar`). List of **upcoming appointment cards** for the day (F2F, Pod meeting, Townhall) with time, title, and “With”.
- **Learn tab**: Course list (module type, enrollment).
- **Jobs tab**: Available (Apply), Applied, Expired.

### Calendar (`/calendar`)

- Full-page **day view**: Hourly timeline (8 AM–6 PM) with **event cards** per hour. Click a card to open a detail panel on the right (title, date/time, with, type). Back link to Professional 360.

### Payout (`/payout`)

- Stats (total payout, vs last month), status bar (Draft / In review / Completed).
- **Reports** tab: Monthly payout reports (Aug 2025–Feb 2026). Feb 2026 = **Generate**; others = **Export to PDF**. Columns: Report, Reviewer, Generated, Status, Actions. Search and filters.
- **Tasks** tab: Reviewer, status, task type.

### Rule Engine (`/rules`)

- IFTTT-style **Create new rule** (variable, condition, action) with predefined SLA variables.
- Table of rules: name, trigger, action, enabled, times triggered.

### Chat (`/chat`)

- Email-like layout: inbox list (left), thread (right).
- **View-only**: TFP↔Client, Pod leader↔TFP (no composer).
- **Interactive**: Clinical↔All TFPs, Clinical↔Specific TFP (with composer).
- Deep link from Professional 360 → Client → **View chat**.

### LMS (`/lms`)

- Module list: name, label, time spent, users taken, pass count. Add module / View analytics.

### Gig (`/gig`)

- Job list; **Create job** opens a placeholder modal.

### Appointments (`/appointments`)

- Table with type filter (User / Pod / Townhall), attendance, AI rating.

---

No backend; all data is mock. Nav shows **Sarah Lee**, **Clinical Ops**, and a logout-style control.
