# /ship

Release command. Sync with main, run checks, open a clean PR.
Do not run this if /review-code or /review-design returned unresolved P0s.

## Pre-flight check

Before doing anything, confirm:
```bash
# 1. Check for unresolved P0s in implementation log
rg "P0" docs/features/ --type md

# 2. Check TypeScript
npm run typecheck 2>&1 | tail -20

# 3. Check lint
npm run lint 2>&1 | tail -20

# 4. Run tests if they exist
npm test 2>&1 | tail -30
```

If typecheck or lint fail: stop. Fix before proceeding.
If tests fail: stop. Fix before proceeding.
If P0s found in logs: confirm with user "There are unresolved P0s. Ship anyway?"

## Steps

### 1. Sync with main
```bash
git fetch origin main
git rebase origin/main
```
If conflicts: list them. Stop. Resolve conflicts before proceeding.

### 2. Review what's shipping
```bash
git diff origin/main --stat
git diff origin/main --name-only
```
Output the file list. Confirm with user: "These files will ship. Confirm?"

### 3. Final checks
```bash
npm run build 2>&1 | tail -30
```
If build fails: stop. Fix before proceeding.

### 4. Commit if uncommitted changes
```bash
git status
```
If uncommitted changes exist:
```bash
git add -A
git commit -m "feat([module]): [auto-generated from implementation log]"
```
Pull commit message from most recent entry in `04-implementation-log.md`.

### 5. Push and open PR
```bash
git push origin HEAD
```

Then generate PR description from the feature docs:

```markdown
## [Feature name]

### What
[One paragraph from 03-interface-plan.md — what this feature does]

### Why
[One paragraph from 01-discovery.md — the problem it solves]

### Changes
[File list from git diff --name-only]

### Design
[Link to Vercel preview if available]
[Reference to 03-interface-plan.md]

### QA
[Summary from 05-qa-log.md — what was tested, what passed]

### Notes for reviewer
[Any non-obvious decisions from 04-implementation-log.md]
```

### 6. Output
```
Shipped: [branch] → PR opened
─────────────────────────────
PR: [URL if available]
Vercel preview: [auto-deploys on PR open]

Files shipped: [count]
Reviews run: /review-design [PASS/FAIL], /review-code [PASS/FAIL]
QA: [COMPLETE/PENDING]
```

## Hard Rules

- Never force push to main.
- Never skip typecheck or lint.
- If tests exist and fail: never ship. No exceptions.
- If the user asks to ship with known P0s: confirm twice, then log the
  exception explicitly in the PR description.
