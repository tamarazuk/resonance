---
name: ship-work
description: >-
  Stage relevant changes if needed, commit using conventional commits, push
  to remote, and open a PR if one doesn't already exist for the current branch.
metadata:
  short-description: Commit, push, and open PR
---

# Ship Work

Stage relevant changes for the current task if needed, commit, push to remote,
and ensure a PR exists.

## Workflow

### Step 1: Check status

```sh
git status
git diff --staged
```

If nothing is staged, stage all modified and new files relevant to the current task. Do **not** commit files that likely contain secrets (`.env`, credentials, etc.).

### Step 2: Commit with conventional commits

Write a commit message following conventional commits:

- `feat(scope):` new feature
- `fix(scope):` bug fix
- `refactor(scope):` refactoring
- `chore(scope):` maintenance
- `docs(scope):` documentation
- `test(scope):` tests

The scope should match the area of the codebase (e.g. `steadyhand`, `docs`, `deps`). The message should be concise and focus on the "why" not the "what".

### Step 3: Push

```sh
git push -u origin HEAD
```

### Step 4: Open or finalize a PR

Check if a PR already exists:

```sh
gh pr view --json number,url,isDraft 2>/dev/null
```

If **no PR exists**, create a **draft** PR:

```sh
gh pr create --draft --title "type(scope): summary" --body "$(cat <<'EOF'
## Summary
- Brief description of changes

Closes #ISSUE_NUMBER
EOF
)"
```

- Title should follow conventional commit style.
- If the branch name contains an issue number, include `Closes #N` in the body. This is how the linked project board item gets moved to Done — **never** manually set the project status to Done.

If a **draft PR already exists**, update the title and body to reflect the latest state of the work:

```sh
gh pr edit --title "type(scope): final summary" --body "$(cat <<'EOF'
## Summary
- Final description of changes

Closes #ISSUE_NUMBER
EOF
)"
```

If a **non-draft PR already exists**, update title/body if needed and confirm the push succeeded.

### Step 5: Sync the linked issue body with the PR number

After creating or updating the PR, update the linked issue description so the first line is exactly:

```md
# PR: #<number>
```

Requirements:

- Keep the rest of the issue body intact.
- If the first line already starts with `# PR: #`, replace it with the current PR number.
- Apply this for both newly created PRs and already-existing PRs.

Use the shared script:

```sh
python .agents/scripts/sync_issue_pr_header.py --issue-number <ISSUE_NUMBER>
```

Notes:

- The script auto-detects the current branch PR number by default.
- You can override PR or repo explicitly when needed:
  ```sh
  python .agents/scripts/sync_issue_pr_header.py --issue-number <ISSUE_NUMBER> --pr-number <PR_NUMBER> --repo <OWNER/REPO>
  ```

### Step 6: Mark ready for review when work is complete

When implementation is complete, move the PR out of draft and return the URL:

```sh
gh pr ready
gh pr view --json url --jq '.url'
```

- Keep the PR in draft while work is still in progress.
- If the user explicitly asks to keep it in draft, do not run `gh pr ready`.
