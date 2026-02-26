---
name: address-pr-comments
description: >-
  Find the PR for the current branch, fetch all unresolved review comments,
  autonomously triage each as fix or skip, apply fixes with per-comment commits,
  and reply on GitHub with commit links or skip reasoning.
metadata:
  short-description: Address unresolved PR review comments
---

# Address PR Comments

Autonomously address all unresolved review comments on the pull request associated with the current branch.

## Prerequisites

- `gh` CLI must be authenticated (`gh auth status`)
- Current branch must have an open pull request

## Workflow

### Step 1: Fetch PR comments

Run the bundled script to fetch all comments, reviews, and review threads for the current branch's PR. The script handles auth validation, pagination, and fork PR detection automatically:

```sh
python .agents/skills/address-pr-comments/scripts/fetch_comments.py --unresolved-only
```

This outputs JSON with the structure:

```json
{
  "pull_request": { "number": 34, "url": "...", "title": "...", "state": "OPEN", "author": "...", "owner": "...", "repo": "..." },
  "conversation_comments": [ ... ],
  "reviews": [ ... ],
  "review_threads": [ ... ]
}
```

With `--unresolved-only`, review threads are pre-filtered to unresolved and non-outdated. Omit the flag to get everything.

Extract `owner` and `repo` from the `pull_request` object for subsequent API calls.

### Step 2: Filter to actionable comments

Only process review thread comments that meet **all** of these criteria:

- Comment author is **not** the PR author (skip self-comments)
- Comment author is **not** a bot (skip authors ending in `[bot]`)

If you did not use `--unresolved-only`, also filter out threads where `isResolved: true` or `isOutdated: true`.

Also check `conversation_comments` and `reviews` for any actionable feedback not captured in review threads.

### Step 3: Triage each comment

For each actionable comment, read the comment body and the referenced file/line. Decide one of:

- **Fix** -- The comment raises a legitimate issue (bug, correctness, style violation, missing edge case, etc.). Add it as a task to address.
- **Skip** -- The comment conflicts with an intentional design choice, is a matter of preference with no clear improvement, or is already handled elsewhere. Add it as a task noting the reason for skipping.

When triaging, consider:

- If the reviewer flags something as a serious problem but it is actually an intentional design decision, that is a valid reason to skip. Explain the design rationale clearly in your reply.
- If you are uncertain whether something is intentional, err on the side of fixing it.

### Step 4: Address each comment

#### For fixes

1. Make the code change in the relevant file(s).
2. Commit with a message that references the review. Follow conventional commits:
   ```
   fix(scope): address review — brief description
   ```
3. Note the commit SHA from the output of `git commit`.
4. Reply on the GitHub review thread:
   ```sh
   gh api repos/OWNER/REPO/pulls/NUMBER/comments \
     -f body="Fixed in COMMIT_SHA — brief explanation of what was changed." \
     -F in_reply_to=COMMENT_DATABASE_ID
   ```

Make **one commit per comment** so each GitHub reply can link to a specific SHA.

#### For skips

Reply on the GitHub review thread explaining why:

```sh
gh api repos/OWNER/REPO/pulls/NUMBER/comments \
  -f body="Skipping this one — explanation of the design choice or reasoning." \
  -F in_reply_to=COMMENT_DATABASE_ID
```

Be respectful and specific. Reference the design decision, existing pattern, or trade-off that justifies the choice.

### Step 5: Summary

After all comments are addressed, present a summary to the user:

- Total comments found
- How many were filtered out (resolved, outdated, self, bot)
- How many were fixed (with commit SHAs)
- How many were skipped (with brief reasons)

## Notes

- If `gh` hits auth or rate-limit issues mid-run, prompt the user to re-authenticate with `gh auth login` and retry.
- Use `databaseId` (not the GraphQL `id`) when replying to comments via the REST API's `in_reply_to` parameter.
- Always pull the latest from the remote before starting fixes to avoid conflicts: `git pull --rebase`.
