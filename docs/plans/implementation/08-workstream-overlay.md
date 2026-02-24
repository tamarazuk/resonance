# 08 — Workstream Overlay for Parallel Execution

> **Purpose:** This document maps V1's phase-sequential plan onto eight parallel workstreams, enabling concurrent execution across teams while preserving phase gate dependencies. Sourced from V3's workstream model (WS-01 through WS-08) and adapted to V1's structure.

---

## 1. Workstream Map

| ID | Workstream | Primary Modules | Phase Focus | Key Owner |
|---|---|---|---|---|
| WS-01 | Platform and Data Foundation | Shared platform, DB, auth, events | 1–4 | Backend / DevOps |
| WS-02 | Steadyhand Candidate Engine | `steadyhand` | 1–2 | Backend |
| WS-03 | Aggregation Pipeline | `aggregation` | 2–4 | Backend / ML |
| WS-04 | Resonance Core Matching | `resonance_core` | 2–4 | ML / Backend |
| WS-05 | Clearview Employer Engine | `clearview` | 3–4 | Backend |
| WS-06 | Governance and Trust | `governance` | 1–4 | Backend |
| WS-07 | Frontend and UX Surfaces | Next.js web app | 1–4 | Frontend |
| WS-08 | Observability and Operations | Dashboards, alerts, ops console | 1–4 | DevOps / Backend |

---

## 2. Relationship to V1 Phase Structure

This overlay does **not** replace the phase-sequential plan. It provides a parallel execution lens:

- **Phase gates remain authoritative.** No workstream can advance past a phase gate until the gate criteria in the corresponding phase document (01–04) are met.
- **Workstreams enable parallelism within a phase.** For example, during Phase 1, WS-01, WS-02, WS-06, WS-07, and WS-08 all execute concurrently.
- **Cross-workstream dependencies are explicit.** Epic dependency columns below define the handoff points between workstreams.

---

## 3. Detailed Epics and Acceptance Criteria

### WS-01: Platform and Data Foundation

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-001 | 1 | Bootstrap modular monolith, domain boundaries, shared contracts | None | Domain modules compile independently; contract tests pass |
| EP-002 | 1 | PostgreSQL schema v1 and migrations for candidate/governance core | EP-001 | Migrations idempotent; rollback migration exists for each change |
| EP-003 | 1 | Auth and session/token layer (candidate first) | EP-001 | Auth middleware enforces scopes; token revocation checks active |
| EP-004 | 1 | Event envelope and event bus abstraction | EP-001 | Every emitted event includes required metadata; replay is idempotent |
| EP-005 | 2 | pgvector integration and ANN query baseline | EP-002 | Vector queries p95 < 200ms in staging benchmark |
| EP-006 | 3 | Employer tenancy isolation and RLS middleware | EP-002, EP-003 | Queries without tenant context return zero rows; no cross-tenant leaks |
| EP-007 | 4 | Release hardening: migration safety checks and schema drift monitor | EP-002, EP-006 | Pre-deploy checks block unsafe migrations; drift alerts operational |

### WS-02: Steadyhand Candidate Engine

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-101 | 1 | Candidate profile CRUD and completeness scoring | EP-002, EP-003 | Profile lifecycle APIs stable; completeness score updates on writes |
| EP-102 | 1 | Memory Bank ingestion (conversation/import/manual) | EP-101 | Entries persist with source metadata and audit trail |
| EP-103 | 1 | STAR extraction and skill/theme tagging pipeline | EP-102 | Structured output schema pass rate >= 99% |
| EP-104 | 1 | Preference Map and Growth Map APIs | EP-101 | Preferences and growth updates trigger profile events |
| EP-105 | 1 | Triage Engine MVP and daily prioritization output | EP-101, EP-104 | Prioritized list generated with fit/effort/timing factors |
| EP-106 | 1 | Prep Engine MVP and calm mode output | EP-103, EP-104 | Prep packet generated per selected match/role with top 3 points |
| EP-107 | 2 | Candidate match feed and explainability view integration | EP-201, EP-301 | Feed render lag < 5 minutes; explainability is complete for surfaced cards |

### WS-03: Aggregation Pipeline

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-201 | 2 | Tier 2 connector framework and first provider adapters | EP-001, EP-004 | Ingestion freshness <= 4 hours; connector failures isolated |
| EP-202 | 2 | Tier 3 career page monitor and parser pipeline | EP-201 | Fresh postings indexed <= 24 hours from publication |
| EP-203 | 2 | Candidate-submitted posting intake (Tier 4) | EP-003, EP-201 | Submissions persisted with provenance and moderation status |
| EP-204 | 2 | Canonical posting schema, parsing, normalization | EP-201, EP-202, EP-203 | Canonical schema coverage >= 95% for required fields |
| EP-205 | 2 | Deduplication fingerprint and merge workflow | EP-204 | Duplicate detection precision >= target baseline; merges auditable |
| EP-206 | 2–3 | Moderation quarantine queue and reviewer actions | EP-203 | Quarantined items blocked from matching until release decision |
| EP-207 | 4 | Claimed posting flow from aggregated source to employer role | EP-205, EP-401 | Claimed posting links to role and rescoring triggers successfully |

### WS-04: Resonance Core Matching

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-301 | 2 | Event-driven basic match scoring pipeline | EP-004, EP-005, EP-201 | Candidate updates trigger scoring and persistence within SLA |
| EP-302 | 2 | Explainability contract generator and validator | EP-301 | 100% surfaced matches include strengths/gaps/constraints |
| EP-303 | 2 | Candidate match read model projection | EP-301 | Projection lag monitor active; fallback query path available |
| EP-304 | 2 | Staleness marking and hourly backfill rescoring | EP-301 | Stale matches suppressed and cleared after successful rescoring |
| EP-305 | 3 | Match decision ingestion (candidate/employer) with reason codes | EP-303, EP-501 | Decision events emitted and persisted exactly once |
| EP-306 | 3 | Introduction state machine and orchestration | EP-305, EP-601 | No introduction without both decisions and policy allow |
| EP-307 | 4 | Six-dimension scoring engine | EP-301, EP-401 | Dimension scores available and calibrated for surfaced matches |
| EP-308 | 4 | Confidence bucket classifier and calibration loop | EP-307 | Calibration report shows acceptable bucket reliability |
| EP-309 | 4 | Two-tower retrieval model integration behind flag | EP-307 | Canary mode shows improved recall without SLO regression |

### WS-05: Clearview Employer Engine

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-501 | 3 | Employer organization, user management, and role ownership | EP-003, EP-006 | Employer authz checks pass for all role actions |
| EP-502 | 3 | Role definition wizard and requirement challenger | EP-501 | Must-have and nice-to-have separation captured in schema |
| EP-503 | 3 | Real-work timeline and team gap capture | EP-502 | Month 1-3/3-6/6-12 fields required for active roles |
| EP-504 | 3 | Culture signal capture and values-in-practice extraction | EP-502 | Culture profile completeness threshold met for active roles |
| EP-505 | 3 | Posting quality analysis (clarity, inclusivity, calibration) | EP-502 | Analysis report generated on each active role update |
| EP-506 | 3 | Employer match feed and decision UI API | EP-305 | Employer feed latency and decision persistence meet SLO |
| EP-507 | 4 | Evaluation framework templates and outcome capture | EP-506 | Interview/offer/hire outcomes captured with reason taxonomy |

### WS-06: Governance and Trust

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-601 | 1 | Consent APIs and immutable ledger | EP-002, EP-003 | Every consent change creates record + event |
| EP-602 | 1 | Policy decision logging and reason code taxonomy | EP-601 | Denials/allows are queryable by policy and actor/time |
| EP-603 | 2 | Training eligibility snapshot publisher | EP-601 | Snapshot reflects current consent tuple and version |
| EP-604 | 3 | Intro precondition policy checks | EP-602, EP-306 | Intro attempts denied when consent/guardrails fail |
| EP-605 | 3 | Dispute intake and triage queue | EP-602 | Disputes are trackable from intake to resolution |
| EP-606 | 4 | Fairness monitoring pipeline and disparity alerts | EP-307 | Alerting, triage, and remediation workflow tested |
| EP-607 | 4 | Candidate deletion and consent revocation cascade hardening | EP-601, EP-603 | Data purge/anonymization steps validated and auditable |

### WS-07: Frontend and UX Surfaces

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-701 | 1 | Candidate onboarding, profile builder, and consent UX | EP-101, EP-601 | Onboarding completion and consent capture telemetry live |
| EP-702 | 1 | Memory Bank and preference/growth management UI | EP-102, EP-104 | Candidate can create/edit/delete profile artifacts end-to-end |
| EP-703 | 1 | Triage/prep/follow-up UI experiences | EP-105, EP-106 | Prep workflows complete without blocking manual control |
| EP-704 | 2 | Candidate match feed and explainability views | EP-303 | Match cards show required rationale sections |
| EP-705 | 3 | Employer role builder and posting analysis UI | EP-502, EP-505 | Employer can move role from draft to active with analysis |
| EP-706 | 3 | Double opt-in decision and intro timeline UI | EP-306 | States map exactly to backend state machine |
| EP-707 | 4 | Internal operations console shell | EP-605, EP-606 | Ops users can access disputes, moderation, and audit views |

### WS-08: Observability and Operations

| Epic ID | Phase | Scope | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| EP-801 | 1 | Baseline telemetry (metrics/logging/tracing) | EP-001 | Trace IDs propagate across API and async jobs |
| EP-802 | 2 | Queue health and projection lag dashboards | EP-301, EP-303 | Lag and DLQ alerts fire with correct severity |
| EP-803 | 2 | Data freshness dashboards (ingestion, embeddings) | EP-201, EP-301 | Freshness SLA breaches alert operations |
| EP-804 | 3 | Guardrail and intro audit dashboards | EP-306, EP-604 | Unauthorized introduction attempts remain zero and monitored |
| EP-805 | 4 | Model drift/calibration dashboards and rollback hooks | EP-308, EP-309 | Automatic rollback tested in staging canary |
| EP-806 | 4 | DR and incident response runbook drills | EP-801 | RPO/RTO drills meet target and produce postmortem notes |

---

## 4. Sprint-to-Workstream Mapping

Shows which workstreams are active in each sprint. This enables resource planning and identifies concurrency peaks.

| Sprint | Phase | WS-01 | WS-02 | WS-03 | WS-04 | WS-05 | WS-06 | WS-07 | WS-08 |
|---|---|---|---|---|---|---|---|---|---|
| Sprint 1 | P1 | EP-001–004 | EP-101 | — | — | — | EP-601–602 | EP-701 | EP-801 |
| Sprint 2 | P1 | — | EP-102–104 | — | — | — | — | EP-702 | — |
| Sprint 3 | P1 | — | EP-105–106 | — | — | — | — | EP-703 | — |
| Sprint 4 | P1 (buffer) | — | — | — | — | — | — | — | — |
| Sprint 5 | P2 | EP-005 | EP-107 | EP-201–205 | EP-301–304 | — | EP-603 | EP-704 | EP-802–803 |
| Sprint 6 | P2 | — | — | EP-206 | — | — | — | — | — |
| Sprint 7 | P3 | EP-006 | — | — | EP-305–306 | EP-501–505 | EP-604–605 | EP-705–706 | EP-804 |
| Sprint 8 | P3 | — | — | — | — | EP-506 | — | — | — |
| Sprint 8.5 | P3 (buffer) | — | — | — | — | — | — | — | — |
| Sprint 9 | P4 | — | — | EP-207 | EP-307–309 | EP-507 | EP-606–607 | EP-707 | EP-805 |
| Sprint 10 | P4 | EP-007 | — | — | — | — | — | — | EP-806 |

---

## 5. Milestone Dependency Chains

Each milestone requires specific epics across multiple workstreams. No milestone can be declared complete until all listed epics pass their acceptance criteria.

| Milestone | Target Sprint | Required Epics |
|---|---|---|
| **M1: Candidate Engine MVP** | End Sprint 3 | EP-001, EP-002, EP-003, EP-101 through EP-106, EP-601, EP-602, EP-701 through EP-703, EP-801 |
| **M2: Candidate Matching Beta** | End Sprint 6 | EP-005, EP-107, EP-201 through EP-206, EP-301 through EP-304, EP-603, EP-704, EP-802, EP-803 |
| **M3: Double Opt-In Launch** | End Sprint 8.5 | EP-006, EP-305, EP-306, EP-501 through EP-506, EP-604, EP-605, EP-705, EP-706, EP-804 |
| **M4: Full Resonance Readiness** | End Sprint 10 | EP-007, EP-207, EP-307 through EP-309, EP-507, EP-606, EP-607, EP-707, EP-805, EP-806 |

### Milestone Evidence Requirements

| Milestone | Required Evidence |
|---|---|
| M1 | Profile completion report, consent audit sample, no unauthorized outbound path |
| M2 | Explainability completeness report, ingestion freshness dashboard, backfill success report |
| M3 | Intro policy conformance report, denial reason coverage, leak test report |
| M4 | Calibration/fairness report, rollback drill record, SLO dashboard trend (2 weeks green) |

---

## 6. Critical Path

The critical path runs through these dependency chains. Delays on any of these epics directly delay the corresponding milestone:

1. **EP-001 → EP-002 → EP-003 → EP-101 → EP-102 → EP-103** (Platform → Profile → Memory Bank → STAR) — blocks M1
2. **EP-004 → EP-201 → EP-301 → EP-303 → EP-107** (Events → Aggregation → Matching → Feed) — blocks M2
3. **EP-006 → EP-501 → EP-305 → EP-306 → EP-604** (RLS → Employer → Decisions → Intros → Policy) — blocks M3
4. **EP-301 → EP-307 → EP-308 → EP-309** (Basic matching → Six-dimension → Calibration → Two-tower) — blocks M4
5. **EP-601 → EP-602 → EP-604** (Consent → Policy logging → Intro policy) — cross-cutting governance chain, blocks M3

### Dependency Visualization

```
Phase 1                    Phase 2                     Phase 3                    Phase 4
─────────────────────────  ────────────────────────── ──────────────────────────  ─────────────────────
EP-001 ──┬── EP-002 ─────── EP-005 ─────────────────── EP-006 ──── EP-501 ─────── EP-007
         ├── EP-003 ──────────────────────────────────── ↑
         └── EP-004 ─────── EP-201 ─── EP-204 ────────────────────────────────── EP-207
                            EP-301 ─── EP-303 ─────── EP-305 ─── EP-306 ──────── EP-307 ─── EP-308 ─── EP-309
EP-601 ── EP-602 ────────── EP-603 ──────────────────── EP-604
                                                        EP-605 ───────────────── EP-606
```

---

## 7. Cross-Workstream Coordination Notes

1. **WS-01 and WS-06 are foundational.** Both must deliver in Sprint 1 before any other workstream can progress meaningfully. Plan for WS-01/WS-06 engineers to be 100% allocated in Sprint 1.

2. **Phase 2 is the highest concurrency phase.** Sprints 5–6 have 6 workstreams active simultaneously (WS-01, WS-02, WS-03, WS-04, WS-06, WS-07, WS-08). This is the resource bottleneck — plan headcount accordingly.

3. **WS-04 (Matching) has the longest dependency chain** spanning Phases 2–4. Any delay in EP-301 cascades through EP-307, EP-308, EP-309. This workstream should have dedicated ownership throughout.

4. **WS-06 (Governance) is a cross-cutting dependency** for WS-04 and WS-05. The consent/policy chain (EP-601 → EP-604) must be stable before any introduction flow can ship. Treat governance work as P0 priority.

5. **WS-07 (Frontend) is always downstream.** Frontend epics depend on backend APIs being stable. Plan for frontend sprints to lag backend by ~1 week within each phase to avoid blocking on unstable APIs.

6. **Buffer sprints (4 and 8.5) exist for a reason.** Use them for integration testing across workstreams, not for feature work. Phase gate reviews happen during buffer sprints.
