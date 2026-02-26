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

## Task Tracking — GitHub Projects

We track all work on the **Resonance Roadmap** GitHub Project (project #2, owner `tamarazuk`). Every agent working in this repo must follow this protocol.

### Immediate Claim Rule

- **"If user confirms an issue pick (including phrases like `plan issue X`), immediately set it to Planning before any repo exploration."**

### End-to-End Flow (authoritative)

1. User runs pick-work -> agent suggests safe Todo items.
2. User confirms an issue (including `plan issue X`) -> agent runs `gh issue view`, then immediately sets project item to **Planning**.
3. Agent explores and returns a plan -> waits for user implementation approval.
4. User approves implementation -> agent sets item to **In Progress** before code edits.
5. Agent implements in chunks, opens/keeps a **draft PR**, and pushes atomic commits as practical.
6. After creating/updating the PR, agent updates issue line 1 to `# PR: #<number>` using `.agents/scripts/sync_issue_pr_header.py`.
7. When implementation is complete, agent moves PR to ready (`gh pr ready`) and returns the PR URL.
8. If new review comments arrive, agent continues follow-up commits/pushes until resolved.

### Project IDs (for `gh project item-edit`)

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

### Before Starting Work

1. **Check the board first.** List current items with:
   ```sh
   gh project item-list 2 --owner tamarazuk --format json
   ```
2. **Only pick up items with Status = Todo.** If an item is already "Planning" or "In Progress", another agent is working on it — do not touch it.
3. **Required checklist (strict order) after user confirms an issue pick** (including `plan issue X`):
   1. View the issue first:
      ```sh
      gh issue view <ISSUE_NUMBER>
      ```
   2. Immediately claim the linked project item by setting Status to "Planning":
      ```sh
      gh project item-edit --project-id "PVT_kwHOADQ5Ws4BQKPh" \
        --id "<ITEM_ID>" \
        --field-id "PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc" \
        --single-select-option-id "63bc7529"
      ```
   3. Only then do repo exploration and planning.
4. **Return a plan and wait for implementation approval.** Do not start coding until the user approves the plan (e.g. "implement", "build this", "go ahead").
5. **Move to "In Progress" when you start coding (before code edits):**
   ```sh
   gh project item-edit --project-id "PVT_kwHOADQ5Ws4BQKPh" \
     --id "<ITEM_ID>" \
     --field-id "PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc" \
     --single-select-option-id "47fc9ee4"
   ```
6. **Work in a feature branch** (not main). Branch naming: `feat/<short-description>`, `fix/<short-description>`.

### During Work

1. **Open a draft PR after your first commit.** Push the branch and create a draft PR immediately so there is always a visible link between the issue, branch, and worktree — even if the agent session is interrupted or the workspace is deleted:

   ```sh
   git push -u origin HEAD
   gh pr create --draft --title "type(scope): summary (#N)" --body "$(cat <<'EOF'
   ## Summary
   - Work in progress

   Closes #ISSUE_NUMBER
   EOF
   )"
   ```

2. **Update the linked issue description with the PR number at the top.** After creating or updating the PR, edit the linked issue body so line 1 is exactly `# PR: #<number>`.
   - Keep the existing issue description content intact.
   - If line 1 already starts with `# PR: #`, replace it with the current PR number.
   - Do this for both newly created PRs and already-existing PRs.
   - Use the shared script:
     ```sh
     python .agents/scripts/sync_issue_pr_header.py --issue-number <ISSUE_NUMBER>
     ```
3. **Commit and push in logical chunks.** Prefer atomic commits where practical: complete one chunk, commit, push; then continue. Never leave work only in a local worktree.
4. **Keep the PR in draft while implementation is still in progress.**

### After Completing Work

1. **Do NOT manually set Status to Done.** Instead, include `Closes #<issue-number>` in the PR body. GitHub automation will move the item to Done when the PR merges.
2. **When implementation is complete, move the PR to ready for review and return the PR URL to the user.**
   ```sh
   gh pr ready
   gh pr view --json url --jq '.url'
   ```
3. **If additional PR review comments arrive, continue with follow-up commits and pushes until resolved.**
4. If work is incomplete or blocked, leave it as "In Progress" and note the blocker in your summary to the user.

### Avoiding Conflicts Between Agents

- **One agent per item.** The "Planning" and "In Progress" statuses are locks — respect them.
- **Check for overlapping files.** Before editing a file, verify no other in-progress item is likely touching the same file. When in doubt, ask the user.
- **Don't batch unrelated changes.** Keep each branch focused on a single board item so branches don't conflict.
- **Prefer isolated directories.** Items like "Add loading.tsx files" and "Add error.tsx boundaries" touch different files and can safely run in parallel. Items like "Manual JD paste fallback" and "Experience edit/delete API" both touch API routes — coordinate if running simultaneously.
