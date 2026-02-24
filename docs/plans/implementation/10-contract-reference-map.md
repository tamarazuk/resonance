# 10 — Contract Reference Map (Single Index)

**Version:** 1.0  
**Date:** February 24, 2026  
**Purpose:** Single-reference index for canonical data, API, event, and state contracts across Plan V1.

---

## 1. Contract Lookup Rules

1. For SQL schema contracts, use `05-infrastructure-and-devops.md` as canonical.
2. For phase APIs/events/state transitions, use the phase document where the contract is introduced.
3. If a summary and detailed contract conflict, detailed contract sections win.
4. Keep this index updated whenever new contract sections are added or moved.

---

## 2. Data Contracts

| Contract Type | Canonical Location | Notes |
|---|---|---|
| Full SQL schema (candidate, employer, matching, governance) | `05-infrastructure-and-devops.md` → `## 15. Database Schema Reference` | Primary schema source for implementation and migrations |
| Candidate tables | `05-infrastructure-and-devops.md` → `### 15.1 Candidate Tables` | Includes profile, experience, preferences, growth, documents |
| Employer tables | `05-infrastructure-and-devops.md` → `### 15.2 Employer Tables` | Includes org, users, roles, postings |
| Matching tables | `05-infrastructure-and-devops.md` → `### 15.3 Matching Tables` | Includes matches and feedback |
| Governance tables | `05-infrastructure-and-devops.md` → `### 15.4 Governance Tables` | Includes consent, policy logs, audit, training snapshots |
| Phase 1 data deliverables | `01-phase-1-steadyhand-mvp.md` → `## 3. Data Model Deliverables (Phase 1)` | Phase-scope additions and expected usage |
| Phase 2 data deliverables | `02-phase-2-aggregation-matching.md` → `## 3. Data Model Deliverables (Phase 2)` | Aggregation + matching deltas |
| Phase 3 data updates | `03-phase-3-clearview-double-opt-in.md` → `## 3. Data Model Updates (Phase 3)` | Employer + intro workflow deltas |

---

## 3. API Contracts

| API Surface | Canonical Location | Notes |
|---|---|---|
| Candidate APIs (profile, memory bank, preferences, consent, export/account) | `01-phase-1-steadyhand-mvp.md` → `## 4. API Endpoints Delivered` + `### API Request/Response Contracts` | Base candidate-facing contracts |
| Candidate matching + aggregation ingestion APIs | `02-phase-2-aggregation-matching.md` → `## 4. API Endpoints Delivered` + `### API Request/Response Contracts` | Match feed, explainability, response actions |
| Employer + intro + dispute APIs | `03-phase-3-clearview-double-opt-in.md` → `## 4. API Endpoints Delivered` + `### API Request/Response Contracts` | Employer decisions and intro orchestration |
| Internal ops/model APIs (Phase 4) | `04-phase-4-resonance-core-full.md` → `## 6.1 API Endpoints Delivered` + `### API Request/Response Contracts` | Ops console and model governance endpoints |

---

## 4. Event Contracts

| Event Domain | Canonical Location | Notes |
|---|---|---|
| Candidate engine events | `01-phase-1-steadyhand-mvp.md` → `## 6. Event Contracts Introduced` | Foundational candidate-side events |
| Aggregation/matching events | `02-phase-2-aggregation-matching.md` → `## 5. Event Contracts Introduced` | Match scoring and interaction events |
| Introduction/policy/dispute events | `03-phase-3-clearview-double-opt-in.md` → `## 6. Event Contracts Introduced` | Double opt-in lifecycle and governance events |
| Model governance/fairness events | `04-phase-4-resonance-core-full.md` → `## 6. Event Contracts Introduced` | Rollback, canary, fairness alerts |

---

## 5. State and Policy Contracts

| Contract Type | Canonical Location | Notes |
|---|---|---|
| Introduction state machine | `03-phase-3-clearview-double-opt-in.md` → `## 5. Introduction State Machine Summary` | Source for valid intro transitions and outcomes |
| Row-level security isolation | `05-infrastructure-and-devops.md` → `### 15.6 Row-Level Security` | Canonical RLS policy and session variable requirements |
| Phase 3 RLS implementation reference | `03-phase-3-clearview-double-opt-in.md` → `#### Row-Level Security Reference` | Endpoint-layer implementation guidance |
| Token revocation rules | `01-phase-1-steadyhand-mvp.md` → `### Token Revocation` | Auth/session invalidation behavior |
| PII encryption rules | `01-phase-1-steadyhand-mvp.md` → `### PII Encryption` and `05-infrastructure-and-devops.md` → `## 4. Security (All Phases)` | App-layer + platform controls |
| Consent enforcement rules | `01-phase-1-steadyhand-mvp.md` → `### Consent Enforcement` | Candidate-side consent gating semantics |

---

## 6. Related Execution References

| Need | Reference |
|---|---|
| Phase gates and milestone criteria | `00-implementation-overview.md` → `## 5. Phase Exit Criteria`, `## 7. Milestone Markers` |
| Parallel workstream dependencies | `08-workstream-overlay.md` |
| Launch go/no-go validation and rollback | `07-hardening-and-launch.md` |
