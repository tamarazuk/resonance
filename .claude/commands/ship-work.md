Commit all current work using conventional commits (see AGENTS.md for conventions),
push to remote, and open a PR if one doesn't already exist for this branch.
If a PR already exists, update it as needed and push.
Include `Closes #<issue-number>` in the PR body so automation can move the item
to Done when the PR merges.
After creating or updating the PR, update the linked issue description so line 1
is exactly `# PR: #<pr-number>` while keeping the rest of the issue body intact.
Use `python .agents/scripts/sync_issue_pr_header.py --issue-number <issue-number>`.
Keep the PR in draft while work is in progress. When implementation is complete,
run `gh pr ready` and return the PR URL.
