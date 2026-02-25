# GitHub Projects Workflow

## Monorepo Structure

This is a **monorepo** at `tamarazuk/resonance`. The main app is **Steadyhand**, located at `apps/steadyhand/`.

## Project Board

We track work on the **Resonance Roadmap** GitHub Project:

- **Project #2**, owner: `tamarazuk`
- **URL:** https://github.com/users/tamarazuk/projects/2

## Item Types

When asking an agent to add items, specify the type:

| Request                                   | Result                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| "create an issue" / "create a repo issue" | Full GitHub issue in `tamarazuk/resonance` (can link PRs, assign, label) |
| "add a draft item" / "add to the board"   | Project-only draft (no repo, no PR linking)                              |

If unspecified, agents should default to **draft item**.

## Labeling Convention

- Use `steadyhand` label for issues/items related to the Steadyhand app
- Other monorepo apps/packages will have their own labels added later

## Project IDs (for `gh project item-edit`)

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

## Common Commands

```sh
# List all items
gh project item-list 2 --owner tamarazuk --format json

# Create a draft item
gh project item-create 2 --owner tamarazuk --title "..." --body "..."

# Create a repo issue (requires repo context)
gh issue create --repo tamarazuk/resonance --title "..." --body "..." --label "steadyhand"

# Add an existing issue to the project
gh project item-add 2 --owner tamarazuk --url https://github.com/tamarazuk/resonance/issues/123

# Update item status
gh project item-edit --project-id "PVT_kwHOADQ5Ws4BQKPh" \
  --id "<ITEM_ID>" \
  --field-id "PVTSSF_lAHOADQ5Ws4BQKPhzg-XDYc" \
  --single-select-option-id "47fc9ee4"
```

## Limitations

- The `gh` CLI returns GraphQL IDs (e.g., `PVTI_lAHOADQ5Ws4BQKPhzgmLS0Y`), not the numeric IDs used in web UI URLs
- Direct item permalinks aren't constructable from CLI output — provide project link + item title instead
