# Feature: Chat
> Tier: 2 | Created: 2026-03-20 | Status: implementation

---

## Phase 1 — Discovery

### Problem & goal
- Provide a unified inbox for Clinical Ops to review and respond to threads.
- Support both view‑only and interactive conversations.

### Personas / primary user
- Primary user: Clinical Ops
- Secondary user: Pod lead

### User flow (high‑level)
1. Open Chat.
2. Select a thread from the inbox list.
3. View thread context; send responses where enabled.

### Screens & routes
- Route: `/chat`
  - Screen: Chat Inbox + Thread
  - Purpose: Manage communications across threads.

### Scope — What This Is Not
<!-- Add explicit exclusions when scope is defined -->

### Risks & open questions
- Clarify which threads are editable vs read‑only.
- Define attachment rules and storage integration.

### Success Criteria
<!-- Add observable, verifiable criteria when feature is scoped -->

---

## Phase 2 — Architecture & IA

### IA / navigation map
- Ops sidebar → Chat

### Interaction model (states + transitions)
- Loading: inbox and thread skeleton.
- Empty: no threads.
- Error: failed to load thread.

### Data requirements
- Entity: ChatThread
  - Fields: id, subject, participants, lastMessageAt, unreadCount
  - Source: chat API
- Entity: Message
  - Fields: id, threadId, author, body, createdAt, attachments
  - Source: chat API

### Component map
- Reusable components: Table, Input, Badge, Popover, Dialog
- New components: ThreadListItem (optional)

### Cross-Feature Dependencies
<!-- Reference docs/modules/DEPENDENCY_MAP.md -->

---

## Phase 3 — Interface plan

### Screen layout plan
- Screen: Chat Inbox + Thread
  - Sections: inbox list, thread header, message list, composer

### Token / design system impact
- New tokens: none expected
- Component variants: Badge (status)

### Implementation order
1. Inbox list + thread view
2. Composer + attachments

---

## Phase 4 — Implementation Log
> Maintained by: Claude Code | Append-only — never edit existing entries

<!-- No entries yet. First entry added when implementation begins. -->

---

## Phase 5 — Debug & Finetune
> Maintained by: Antigravity QA + Claude Code | Append-only

<!-- QA findings and debug entries appended here -->
<!-- Format:
### [YYYY-MM-DD] [Issue or polish item]
**Found by:** [Review / Antigravity QA / user feedback]
**Fix:** [What was done]
**Files changed:** [list]
**Status:** [resolved / in progress / deferred]
-->
