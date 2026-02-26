#!/usr/bin/env python3
"""Sync a linked issue body with the current PR number header.

Sets line 1 of the issue body to `# PR: #<number>` while preserving the rest
of the issue description.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from typing import Any


HEADER_PREFIX = "# PR: #"


def run_gh(args: list[str]) -> str:
    proc = subprocess.run(
        ["gh", *args],
        check=False,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        stderr = proc.stderr.strip()
        stdout = proc.stdout.strip()
        details = stderr or stdout or "unknown gh error"
        raise RuntimeError(f"gh {' '.join(args)} failed: {details}")
    return proc.stdout


def get_current_pr_number(repo: str | None) -> int:
    cmd = ["pr", "view", "--json", "number"]
    if repo:
        cmd.extend(["--repo", repo])
    output = run_gh(cmd)
    payload: dict[str, Any] = json.loads(output)
    number = payload.get("number")
    if not isinstance(number, int):
        raise RuntimeError("Unable to determine current PR number from gh pr view")
    return number


def get_issue_body(issue_number: int, repo: str | None) -> str:
    cmd = ["issue", "view", str(issue_number), "--json", "body"]
    if repo:
        cmd.extend(["--repo", repo])
    output = run_gh(cmd)
    payload: dict[str, Any] = json.loads(output)
    body = payload.get("body")
    return body if isinstance(body, str) else ""


def build_new_body(existing_body: str, pr_number: int) -> str:
    header = f"{HEADER_PREFIX}{pr_number}"
    lines = existing_body.splitlines()

    if lines and lines[0].startswith(HEADER_PREFIX):
        lines[0] = header
    elif lines:
        lines = [header, "", *lines]
    else:
        lines = [header]

    return "\n".join(lines)


def edit_issue_body(issue_number: int, new_body: str, repo: str | None) -> None:
    cmd = ["issue", "edit", str(issue_number), "--body", new_body]
    if repo:
        cmd.extend(["--repo", repo])
    run_gh(cmd)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Update issue body line 1 to '# PR: #<number>' while preserving "
            "the remaining description."
        )
    )
    parser.add_argument(
        "--issue-number",
        type=int,
        required=True,
        help="Linked GitHub issue number to update",
    )
    parser.add_argument(
        "--pr-number",
        type=int,
        help="PR number to place in the header (defaults to current branch PR)",
    )
    parser.add_argument(
        "--repo",
        help="Optional owner/repo override, e.g. tamarazuk/resonance",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the computed body instead of updating the issue",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    pr_number = args.pr_number or get_current_pr_number(args.repo)
    existing_body = get_issue_body(args.issue_number, args.repo)
    new_body = build_new_body(existing_body, pr_number)

    if args.dry_run:
        print(new_body)
        return 0

    if new_body == existing_body:
        print(
            f"No issue update needed for #{args.issue_number}; "
            f"header already matches PR #{pr_number}."
        )
        return 0

    edit_issue_body(args.issue_number, new_body, args.repo)
    print(f"Updated issue #{args.issue_number} header to '# PR: #{pr_number}'.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as err:
        print(f"Error: {err}", file=sys.stderr)
        raise SystemExit(1)
