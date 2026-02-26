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

### Step 4: Open a PR if needed

Check if a PR already exists:

```sh
gh pr view --json number,url 2>/dev/null
```

If **no PR exists**, create one:

```sh
gh pr create --title "type(scope): summary" --body "$(cat <<'EOF'
## Summary
- Brief description of changes

Closes #ISSUE_NUMBER
EOF
)"
```

- Title should follow conventional commit style.
- If the branch name contains an issue number, include `Closes #N` in the body. This is how the linked project board item gets moved to Done — **never** manually set the project status to Done.

If a **PR already exists**, just confirm the push succeeded and print the PR URL.
