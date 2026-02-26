---
name: pick-work
description: Scan the GitHub Projects board for Todo items that won't conflict with in-progress work, recommend safe items to pick up, and wait for user confirmation before claiming.
metadata:
  short-description: Pick up safe work from the project board
---

# Pick Work

Pick up work items from the Resonance Roadmap GitHub Project board that are safe to work on without conflicting with items already in progress.

## Prerequisites

- `gh` CLI must be authenticated (`gh auth status`)
- You must be in the `resonance` repository

## Workflow

### Step 1: Fetch the board

Run:

```sh
gh project item-list 2 --owner tamarazuk --format json
```

### Step 2: Identify active work

From the board data, find all items with Status = **Planning** or **In Progress**. For each, note:

- The item title and linked issue
- The likely files/directories it touches (infer from title/description)
- The area of the codebase it affects

### Step 3: Find available work

Filter for items with Status = **Todo**. For each candidate:

- Assess scope (small, medium, large)
- Identify which files/directories it would likely touch
- Check for overlap with any Planning/In Progress items

### Step 4: Recommend safe picks

Present a numbered list of recommended items, prioritizing:

1. Small, self-contained items
2. Items that touch isolated directories (no overlap with active work)
3. Items with higher priority (MVP This Week > Next Up > Future Ideas)

For each recommendation, explain:

- Why it's safe (no file conflicts with active work)
- Estimated scope
- What area of the codebase it affects

### Step 5: Wait for confirmation

**Do not change any statuses yet.** Present the recommendations and ask the user which item(s) they want to pick up.

- You may use a direct question with selectable options so the user can pick quickly.
- Treat explicit confirmations like `plan issue 123` as immediate confirmation.

If the user confirms a specific issue pick (including phrases like `plan issue X`), treat that as confirmation and claim immediately before any repo exploration.

## Claiming an item

Once the user confirms, run this checklist in strict order:

1. View the issue first:

```sh
gh issue view <ISSUE_NUMBER>
```

2. **Immediately** claim the item by setting its status to Planning (per the AGENTS.md protocol, claim before any exploration or coding):

```sh
gh project item-edit --project-id "PVT_kwHOADQ5Ws4BQKPh" \
  --id "<ITEM_ID>" \
  --field-id "PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc" \
  --single-select-option-id "63bc7529"
```

3. Only then create a feature branch and begin repo exploration/planning following `AGENTS.md`.
4. Return a concise implementation plan and wait for user approval before coding.

## Project Board Reference

- **Project:** Resonance Roadmap (project #2, owner `tamarazuk`)
- **Project ID:** `PVT_kwHOADQ5Ws4BQKPh`
- **Status field:** `PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc`
  - Todo: `f75ad846`
  - Planning: `63bc7529`
  - In Progress: `47fc9ee4`
  - Done: `98236657`
- **Priority field:** `PVTSSF_lAHOADQ5Ws4BQKPhzg-XDdU`
  - MVP This Week: `96c99f73`
  - Next Up: `a061e06c`
  - Future Ideas: `27f59b16`

## Conflict Avoidance Rules

- One agent per item -- "Planning" and "In Progress" statuses are locks.
- Check for overlapping files before recommending an item.
- Don't batch unrelated changes -- keep each branch focused on a single board item.
- Prefer items that touch isolated directories.
