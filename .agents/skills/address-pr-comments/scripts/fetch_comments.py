#!/usr/bin/env python3
"""
Fetch all PR conversation comments, reviews, and review threads for the PR
associated with the current git branch by shelling out to `gh api graphql`.

Adapted from the gh-address-comments global skill with fixes:
  - Uses base repo (gh repo view) instead of head repo for correct fork PR support
   - Adds --unresolved-only flag to filter to unresolved threads (includes outdated ones)

Requires:
  - `gh auth login` already set up
  - Current branch has an associated (open) PR

Usage:
  python fetch_comments.py                  # all comments
  python fetch_comments.py --unresolved-only  # only unresolved review threads
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from typing import Any

QUERY = """\
query(
  $owner: String!,
  $repo: String!,
  $number: Int!,
  $commentsCursor: String,
  $reviewsCursor: String,
  $threadsCursor: String
) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      number
      url
      title
      state
      author { login }

      # Top-level conversation comments (issue comments on the PR)
      comments(first: 100, after: $commentsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          databaseId
          body
          createdAt
          updatedAt
          author { login }
        }
      }

      # Review submissions (Approve / Request changes / Comment)
      reviews(first: 100, after: $reviewsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          databaseId
          state
          body
          submittedAt
          author { login }
        }
      }

      # Inline review threads with resolved state and diff context
      reviewThreads(first: 100, after: $threadsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          diffSide
          startLine
          startDiffSide
          originalLine
          originalStartLine
          resolvedBy { login }
          comments(first: 100) {
            nodes {
              id
              databaseId
              body
              createdAt
              updatedAt
              author { login }
            }
          }
        }
      }
    }
  }
}
"""


def _run(cmd: list[str], stdin: str | None = None) -> str:
    p = subprocess.run(cmd, input=stdin, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{p.stderr}")
    return p.stdout


def _run_json(cmd: list[str], stdin: str | None = None) -> dict[str, Any]:
    out = _run(cmd, stdin=stdin)
    try:
        return json.loads(out)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Failed to parse JSON from command output: {e}\nRaw:\n{out}"
        ) from e


def _ensure_gh_authenticated() -> None:
    try:
        _run(["gh", "auth", "status"])
    except RuntimeError:
        print(
            "Run `gh auth login` to authenticate the GitHub CLI.",
            file=sys.stderr,
        )
        raise SystemExit(1)


def get_base_repo() -> tuple[str, str]:
    """Derive owner/repo from the current git remote (base repo).

    This is correct for both same-repo and fork PRs — API calls for PR
    comments, threads, etc. must target the base repository.
    """
    data = _run_json(["gh", "repo", "view", "--json", "owner,name"])
    return data["owner"]["login"], data["name"]


def get_pr_number() -> int:
    data = _run_json(["gh", "pr", "view", "--json", "number"])
    return int(data["number"])


def gh_api_graphql(
    owner: str,
    repo: str,
    number: int,
    comments_cursor: str | None = None,
    reviews_cursor: str | None = None,
    threads_cursor: str | None = None,
) -> dict[str, Any]:
    cmd = [
        "gh",
        "api",
        "graphql",
        "-F",
        "query=@-",
        "-F",
        f"owner={owner}",
        "-F",
        f"repo={repo}",
        "-F",
        f"number={number}",
    ]
    if comments_cursor:
        cmd += ["-F", f"commentsCursor={comments_cursor}"]
    if reviews_cursor:
        cmd += ["-F", f"reviewsCursor={reviews_cursor}"]
    if threads_cursor:
        cmd += ["-F", f"threadsCursor={threads_cursor}"]

    return _run_json(cmd, stdin=QUERY)


def fetch_all(owner: str, repo: str, number: int) -> dict[str, Any]:
    conversation_comments: list[dict[str, Any]] = []
    reviews: list[dict[str, Any]] = []
    review_threads: list[dict[str, Any]] = []

    comments_cursor: str | None = None
    reviews_cursor: str | None = None
    threads_cursor: str | None = None

    pr_meta: dict[str, Any] | None = None

    while True:
        payload = gh_api_graphql(
            owner=owner,
            repo=repo,
            number=number,
            comments_cursor=comments_cursor,
            reviews_cursor=reviews_cursor,
            threads_cursor=threads_cursor,
        )

        if "errors" in payload and payload["errors"]:
            raise RuntimeError(
                f"GitHub GraphQL errors:\n{json.dumps(payload['errors'], indent=2)}"
            )

        pr = payload["data"]["repository"]["pullRequest"]
        if pr_meta is None:
            pr_meta = {
                "number": pr["number"],
                "url": pr["url"],
                "title": pr["title"],
                "state": pr["state"],
                "author": pr.get("author", {}).get("login"),
                "owner": owner,
                "repo": repo,
            }

        c = pr["comments"]
        r = pr["reviews"]
        t = pr["reviewThreads"]

        conversation_comments.extend(c.get("nodes") or [])
        reviews.extend(r.get("nodes") or [])
        review_threads.extend(t.get("nodes") or [])

        comments_cursor = (
            c["pageInfo"]["endCursor"] if c["pageInfo"]["hasNextPage"] else None
        )
        reviews_cursor = (
            r["pageInfo"]["endCursor"] if r["pageInfo"]["hasNextPage"] else None
        )
        threads_cursor = (
            t["pageInfo"]["endCursor"] if t["pageInfo"]["hasNextPage"] else None
        )

        if not (comments_cursor or reviews_cursor or threads_cursor):
            break

    assert pr_meta is not None
    return {
        "pull_request": pr_meta,
        "conversation_comments": conversation_comments,
        "reviews": reviews,
        "review_threads": review_threads,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch PR comments for the current branch."
    )
    parser.add_argument(
        "--unresolved-only",
        action="store_true",
        help="Only include unresolved review threads (includes outdated threads whose diff context shifted).",
    )
    args = parser.parse_args()

    _ensure_gh_authenticated()

    owner, repo = get_base_repo()
    number = get_pr_number()
    result = fetch_all(owner, repo, number)

    if args.unresolved_only:
        result["review_threads"] = [
            t for t in result["review_threads"] if not t["isResolved"]
        ]

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
