# Agent Rules

## Branding

- The correct brand name is **Steadyhand** (one word, lowercase "h"). Never use "SteadyHand", "Steady Hand", "steady hand", or any other variation.
- The user sometimes uses dictation software that will transcribe it incorrectly as two words ("Steady Hand"). Always assume the user meant to say "Steadyhand" in this repo.

## Next.js 16

- This project uses **Next.js 16**, which renamed `middleware.ts` to **`proxy.ts`**. The auth proxy lives at `apps/steadyhand/proxy.ts`. Do not flag this as a missing middleware file.

## Conventional Commits

- All commits should follow [Conventional Commits](https://www.conventionalcommits.org/) format.
- Use prefixes like `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- Examples: `feat(steadyhand): add user authentication`, `fix(docs): resolve login redirect issue`, `chore(deps): update dependencies`.

## Worktree Workflow Notes (Learned)

- In `.codex/worktrees/*`, verify branch state first; worktrees may start in detached `HEAD`.
- Use semantic branches with issue linkage: `codex/feat/issue-<number>-<slug>` or `codex/fix/issue-<number>-<slug>`.
- If `gh auth status` fails in sandbox but was recently authenticated, rerun `gh` commands with escalated permissions to access keychain/network.
- Use `gh project item-list 2 --owner @me --format json` to read the board and pull the linked GitHub Issue number when available.
- Include the issue number in branch and PR:
  - Branch: `.../issue-<number>-...`
  - PR title: `<type>(<scope>): <summary> (#<number>)`
  - PR footer: `Closes #<number>`
- While the task-tracking protocol is paused, do not change project item status unless explicitly requested by the user.

## Task Tracking — GitHub Projects

> **⏸ PAUSED:** Task tracking protocol is temporarily suspended. The user is testing on main. Do not claim items, create branches, or update board status until this notice is removed.

We track all work on the **Resonance Roadmap** GitHub Project (project #2, owner `tamarazuk`). Every agent working in this repo must follow this protocol.

### Project IDs (for `gh project item-edit`)

- **Project ID:** `PVT_kwHOADQ5Ws4BQKPh`
- **Status field:** `PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc`
  - Todo: `f75ad846`
  - In Progress: `47fc9ee4`
  - Done: `98236657`
- **Priority field:** `PVTSSF_lAHOADQ5Ws4BQKPhzg-XDdU`
  - MVP This Week: `96c99f73`
  - Next Up: `a061e06c`
  - Future Ideas: `27f59b16`

### Before Starting Work

1. **Check the board first.** List current items with:
   ```sh
   gh project item-list 2 --owner tamarazuk --format json
   ```
2. **Only pick up items with Status = Todo.** If an item is already "In Progress", another agent is working on it — do not touch it.
3. **Claim the item** by setting Status to "In Progress" before writing any code:
   ```sh
   gh project item-edit --project-id "PVT_kwHOADQ5Ws4BQKPh" \
     --id "<ITEM_ID>" \
     --field-id "PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc" \
     --single-select-option-id "47fc9ee4"
   ```
4. **Work in a feature branch** (not main). Branch naming: `feat/<short-description>`, `fix/<short-description>`.

### After Completing Work

1. **Set Status to Done:**
   ```sh
   gh project item-edit --project-id "PVT_kwHOADQ5Ws4BQKPh" \
     --id "<ITEM_ID>" \
     --field-id "PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc" \
     --single-select-option-id "98236657"
   ```
2. If work is incomplete or blocked, leave it as "In Progress" and note the blocker in your summary to the user.

### Avoiding Conflicts Between Agents

- **One agent per item.** The "In Progress" status is a lock — respect it.
- **Check for overlapping files.** Before editing a file, verify no other in-progress item is likely touching the same file. When in doubt, ask the user.
- **Don't batch unrelated changes.** Keep each branch focused on a single board item so branches don't conflict.
- **Prefer isolated directories.** Items like "Add loading.tsx files" and "Add error.tsx boundaries" touch different files and can safely run in parallel. Items like "Manual JD paste fallback" and "Experience edit/delete API" both touch API routes — coordinate if running simultaneously.
