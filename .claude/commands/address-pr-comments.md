Find the open PR for my current branch and address all unresolved review comments.
Do not ask me for the PR number -- detect it from the branch using `gh pr view`.

For each unresolved comment:

1. **Triage** -- decide whether to fix it or skip it.
2. **If fixing** -- make the code change, commit it (one commit per comment), and reply on the GitHub thread with what you did and the commit SHA.
3. **If skipping** -- reply on the GitHub thread explaining why (e.g. intentional design choice).

After you're done, give me a summary of what was fixed and what was skipped.
