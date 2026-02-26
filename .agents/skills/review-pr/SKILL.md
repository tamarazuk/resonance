---
name: review-pr
description: >-
  Find the PR for the current branch, fetch all unresolved review comments,
  autonomously triage each as fix or skip, apply fixes with per-comment commits,
  and reply on GitHub with commit links or skip reasoning.
metadata:
  short-description: Review and address PR comments
---

# Review PR Comments

Autonomously review and address all unresolved review comments on the pull request associated with the current branch.

## Prerequisites

- `gh` CLI must be authenticated (`gh auth status`)
- Current branch must have an open pull request

## Workflow

### Step 1: Detect the PR

Do **not** ask the user for the PR number. Detect it from the current branch:

```sh
gh pr view --json number,url,title,baseRefName
```

Extract the `number` for subsequent API calls. For the `owner` and `repo`, use the **current repository** (i.e., the base repo where the PR targets), not the head repository. This ensures correct behavior for fork PRs where the head repo differs from the base:

```sh
# Derive owner/repo from the current git remote
gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"'
```

### Step 2: Fetch all review comments

Use `gh api graphql` with pagination to fetch review threads. Pass the query via stdin to avoid shell quoting issues:

```sh
gh api graphql -F query=@- \
  -F owner="OWNER" \
  -F repo="REPO" \
  -F number=NUMBER <<'GRAPHQL'
query($owner: String!, $repo: String!, $number: Int!, $threadsCursor: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      number
      url
      title
      author { login }
      reviewThreads(first: 100, after: $threadsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          startLine
          comments(first: 100) {
            nodes {
              id
              databaseId
              body
              createdAt
              author { login }
            }
          }
        }
      }
    }
  }
}
GRAPHQL
```

If `pageInfo.hasNextPage` is true, paginate by passing the `endCursor` as `threadsCursor`.

You can also fetch top-level conversation comments separately:

```sh
gh api repos/OWNER/REPO/issues/NUMBER/comments
```

### Step 3: Filter to actionable comments

Only process comments that meet **all** of these criteria:

- Thread is **not resolved** (`isResolved: false`)
- Thread is **not outdated** (`isOutdated: false`)
- Comment author is **not** the PR author (skip self-comments)
- Comment author is **not** a bot (skip authors ending in `[bot]`)

### Step 4: Triage each comment

For each actionable comment, read the comment body and the referenced file/line. Decide one of:

- **Fix** -- The comment raises a legitimate issue (bug, correctness, style violation, missing edge case, etc.). Add it as a task to address.
- **Skip** -- The comment conflicts with an intentional design choice, is a matter of preference with no clear improvement, or is already handled elsewhere. Add it as a task noting the reason for skipping.

When triaging, consider:

- If the reviewer flags something as a serious problem but it is actually an intentional design decision, that is a valid reason to skip. Explain the design rationale clearly in your reply.
- If you are uncertain whether something is intentional, err on the side of fixing it.

### Step 5: Address each comment

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

### Step 6: Summary

After all comments are addressed, present a summary to the user:

- Total comments found
- How many were filtered out (resolved, outdated, self, bot)
- How many were fixed (with commit SHAs)
- How many were skipped (with brief reasons)

## Notes

- If `gh` hits auth or rate-limit issues mid-run, prompt the user to re-authenticate with `gh auth login` and retry.
- Use `databaseId` (not the GraphQL `id`) when replying to comments via the REST API's `in_reply_to` parameter.
- Always pull the latest from the remote before starting fixes to avoid conflicts: `git pull --rebase`.
