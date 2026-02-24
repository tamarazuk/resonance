# Resonance Implementation Plan — Overview

**Version:** 1.1
**Date:** February 24, 2026
**Source Documents:** PRD v2.0, Architecture v2.1

---

## 1. Plan Structure

| Document | Scope |
|---|---|
| `00-implementation-overview.md` | This file. Timeline, team, milestones, dependencies. |
| `01-phase-1-steadyhand-mvp.md` | Steadyhand standalone — candidate engine MVP. |
| `02-phase-2-aggregation-matching.md` | Job aggregation + basic matching pipeline. |
| `03-phase-3-clearview-double-opt-in.md` | Employer engine + double opt-in introductions. |
| `04-phase-4-resonance-core-full.md` | Full six-dimension scoring, fairness, ops console. |
| `05-infrastructure-and-devops.md` | Cross-cutting: infra, CI/CD, observability, security. |
| `06-risk-register-and-mitigations.md` | Technical and product risks with mitigations. |
| `07-hardening-and-launch.md` | Security audit, load testing, DR drills, go-live checklist. |
| `09-operator-summary.md` | Concise execution roadmap view for operators and stakeholders. |
| `10-contract-reference-map.md` | Single-reference index for canonical API/data/event/state contracts. |

---

## 2. Timeline Summary

All estimates assume a small, focused team (see Section 4). Sprints are 2-week cycles.

| Phase | Name | Duration | Sprints | Start | End (Est.) |
|---|---|---|---|---|---|
| 0 | Foundation & Infrastructure | 2 weeks | 1 | Week 1 | Week 2 |
| 1 | Steadyhand MVP | 8 weeks | 4 | Week 3 | Week 10 |
| 2 | Aggregation + Basic Matching | 4 weeks | 2 | Week 11 | Week 14 |
| 3 | Clearview + Double Opt-In | 5 weeks | 2.5 | Week 15 | Week 19 |
| 4 | Resonance Core Full | 4 weeks | 2 | Week 20 | Week 23 |
| — | Hardening + Launch Prep | 2 weeks | 1 | Week 24 | Week 25 |

**Total estimated timeline: ~25 weeks (roughly 6 months)**

Phase 0 (Foundation) runs before Phase 1 and covers repository setup, CI/CD pipeline, infrastructure provisioning, and shared service scaffolding. It is detailed in `05-infrastructure-and-devops.md`.

---

## 3. Phase Dependencies

```
Phase 0: Foundation & Infrastructure
  │
  ├── Phase 1: Steadyhand MVP
  │     │
  │     └── Phase 2: Aggregation + Basic Matching
  │           │
  │           └── Phase 3: Clearview + Double Opt-In
  │                 │
  │                 └── Phase 4: Resonance Core Full
  │                       │
  │                       └── Hardening + Launch Prep
  │
  └── (Infrastructure work continues in parallel across all phases)
```

Key dependencies:
- Phase 2 requires Phase 1's candidate profile, embedding pipeline, and consent system.
- Phase 3 requires Phase 2's matching engine and aggregation service.
- Phase 4 requires Phase 3's introduction state machine and employer decision recording.
- Infrastructure (Phase 0) is a prerequisite for all phases but continues evolving.

---

## 4. Assumed Team Structure

| Role | Count | Phases Active | Key Responsibilities |
|---|---|---|---|
| Tech Lead / Architect | 1 | All | Architecture decisions, code review, cross-phase coordination |
| Senior Backend Engineer | 2 | All | API services, data layer, event pipelines, governance |
| Senior Frontend Engineer | 1 | All | Next.js application, component library, UX implementation |
| ML / AI Engineer | 1 | P1 onward | AI gateway, STAR extraction, embedding pipeline, scoring models |
| DevOps / Platform Engineer | 1 | P0 + ongoing | AWS infra, CI/CD, monitoring, database administration |
| Product Designer | 1 | All | UX design, user flows, design system |

**Total: 7 people.** The plan is calibrated for this team size. Adjust timelines proportionally for smaller/larger teams.

---

## 5. Phase Exit Criteria

These gates must be met before proceeding to the next phase. Sourced from Architecture v2.1 Section 10.5.

| Phase | Exit Criteria |
|---|---|
| **Phase 0** | Repository scaffolded, CI green, staging environment operational, database provisioned, local dev setup documented and working, feature flag infrastructure operational, API versioning convention enforced, OpenAPI spec generation wired |
| **Phase 1** | Wedge loop functional (paste URL -> fit analysis -> draft materials), candidate profile completion >= 60%, consent write/read audited, 0 unauthorized outbound actions, resume import functional, conversation capture working |
| **Phase 2** | Match explainability completeness = 100% for surfaced matches, moderation quarantine path active, hourly backfill success >= 99%, Tier 2-3 ingestion operational |
| **Phase 3** | 100% introductions created only after both decision events, policy denial logging enabled, no notification leak incidents, employer onboarding flow complete |
| **Phase 4** | Confidence calibration within defined error bounds, fairness disparity alerts operational, rollback drill executed successfully, ops console functional |

---

## 6. Tech Stack Summary

Consolidated from Architecture v2.1 Section 6.2:

| Layer | Technology |
|---|---|
| Product APIs | TypeScript + Fastify (Node.js) |
| ML/Inference | Python + FastAPI |
| Frontend | Next.js 16+ / Tailwind CSS / Radix UI |
| Client State | React Query (server) + Zustand (client) |
| Database | PostgreSQL 17+ with pgvector |
| Cache / Queue | Redis 7.2+ with BullMQ |
| Hosting | AWS (us-east-1 primary, us-west-2 DR) |
| LLM | AI Gateway — Claude primary, OpenAI fallback |
| Embeddings | OpenAI text-embedding-3-large (1536 dims) |
| CI/CD | GitHub Actions |
| Observability | Prometheus + Grafana, OpenTelemetry, Pino/structlog |

---

## 7. Milestone Markers

Key demonstrable milestones for stakeholder visibility:

| Week | Milestone | Deliverable |
|---|---|---|
| 2 | **M0: Foundation Complete** | CI/CD green, staging live, local dev documented, feature flags and API versioning in place |
| 4 | **M1: Profile + JD URL Parser** | Candidate can create profile, add experiences, paste any public JD URL, and view structured job description |
| 6 | **M2: Wedge Loop Complete** | Full Steadyhand wedge: Paste URL -> Fit & Effort Analysis -> Draft Cover Letter / Tailored Bullets. Resume import operational. |
| 8 | **M3: Conversation + Consent** | Conversational experience capture via WebSocket, consent system with audit trail, embedding pipeline, data export and account management |
| 10 | **M4: Steadyhand MVP** | Full candidate flow: Prep Engine, Follow-Up Manager, dashboard with triage, accessibility audit, cognitive protection polish, account pause/deactivation |
| 12 | **M5: First Matches** | Candidates see matched job postings with explainability from aggregated Tier 2-3 sources |
| 14 | **M6: Matching Pipeline Stable** | Event-triggered matching, hourly backfill, candidate match feed, moderation for Tier-4, outcome data collection |
| 17 | **M7: Employer Onboarding** | Employers can create roles, receive candidate match suggestions, record decisions |
| 19 | **M8: Double Opt-In Live** | Full introduction state machine operational, policy-gated introductions, email deliverability configured |
| 21 | **M9: Full Scoring** | Six-dimension scoring, two-tower retrieval, confidence calibration |
| 23 | **M10: Governance & Ops** | Fairness monitoring, ops console, dispute resolution, model governance gates |
| 25 | **M11: Launch Ready** | Load tested, DR drill passed, all SLOs met, security audit complete |

---

## 8. Non-Negotiable Guardrails (Enforced Throughout)

These are from PRD Section 5.3 and Architecture Section 1.2. They must hold true at every phase:

1. **Double opt-in introductions** — No introduction without both parties expressing interest.
2. **Humans decide, AI recommends** — Every external action requires explicit user approval.
3. **Candidate free forever** — No candidate billing or pay-for-placement paths.
4. **Consent-gated model training** — Only opt-in candidate data used for training.
5. **Explainable matches** — Every surfaced match includes strengths, gaps, and constraints.
6. **No demographic inference** — Protected attributes excluded from online scoring.

---

## 9. Cross-Cutting Concerns (All Phases)

These workstreams run continuously and are detailed in `05-infrastructure-and-devops.md`:

- **Authentication & Authorization:** OAuth 2.0, JWT, RBAC, row-level security
- **Consent & Governance:** Immutable audit trail, consent ledger, policy engine
- **AI Gateway:** LLM abstraction, prompt versioning, schema-constrained outputs
- **Observability:** Structured logging, distributed tracing, metrics, alerting
- **Security:** PII encryption, network security, WAF, vulnerability scanning
- **Testing:** Unit, integration, E2E, load testing, golden sets for ML
- **Feature Flags:** LaunchDarkly/Unleash-based rollout control, kill switches, flag audit logging
- **API Versioning:** `/v1/` prefix convention, OpenAPI spec generation, backward-compatibility enforcement
- **LLM Cost Controls:** Per-request cost tracking, budget threshold alerts, model tiering optimization
- **Accessibility:** WCAG 2.1 AA standard, axe-core in CI, accessibility audits at phase exits

---

## 10. Decision Log

Decisions made during planning that are not in the source documents:

| ID | Decision | Rationale |
|---|---|---|
| PLAN-001 | Add Phase 0 (Foundation) before Phase 1 | Repository setup, CI/CD, and infrastructure provisioning are prerequisites that the architecture doc assumes but doesn't phase explicitly |
| PLAN-002 | 2-week sprint cadence | Standard cadence; aligns with architecture's "two consecutive sprints" extraction criteria |
| PLAN-003 | Infrastructure work parallels all phases | DevOps engineer works on hardening, monitoring, and scaling throughout, not just Phase 0 |
| PLAN-004 | ML engineer joins at Phase 1 start | STAR extraction and embedding pipeline are Phase 1 deliverables; ML work starts immediately |
| PLAN-005 | Design system and component library built incrementally | No big-bang design system; components built as needed per phase and extracted into shared library |
| PLAN-006 | Evaluate ORM for pgvector + PgBouncer compatibility | TypeORM/Prisma may have issues with pgvector custom types and PgBouncer transaction mode. Evaluate Drizzle or Kysely as alternatives during Phase 0. Decision required before Phase 1 schema work begins. |
| PLAN-007 | ML engineer can prototype Phase 4 model during Phase 2-3 | Two-tower model requires outcome data collected in Phase 2-3. ML engineer should use idle cycles to prototype with synthetic data so Phase 4 starts with a head start, not a cold start. |
| PLAN-008 | Feature flags and API versioning added to Phase 0 | Feature flags enable safe rollouts and kill switches from the start. API versioning (`/v1/`) prevents breaking changes as the platform evolves. Both are foundational and cheaper to add early. |
| PLAN-009 | Phase 1 Sprint 3 split into Sprint 3 + Sprint 4 (8 weeks total) | Original Sprint 3 was overloaded with 4 AI features + compliance + polish. Split gives breathing room: Sprint 3 for data export, dashboard, triage, emotional intelligence; Sprint 4 for Prep Engine, Follow-Up Manager, accessibility audit, and polish. Cascades all subsequent phase timelines by +2 weeks. |
| PLAN-010 | Steadyhand wedge pivot: JD URL parsing, fit analysis, and material drafting promoted to Sprint 1-2 | PRD v2 identifies the single-player wedge (paste JD URL -> fit analysis -> draft materials) as the day-one activation hook. Conversation capture and cognitive protection (Prep/Follow-Up) deferred to Sprint 3-4 respectively. Application-level AES encryption explicitly deferred to Phase 2 to reduce MVP scope; Phase 1 relies on PostgreSQL TDE at rest + TLS in transit. |

---

## 11. Definition of Ready / Definition of Done

Applies to all tasks across all phases. These definitions ensure consistent quality and prevent work-in-progress ambiguity.

### Definition of Ready (DoR)

A task is ready to begin when:

- [ ] API contract draft approved (if applicable)
- [ ] Data model impact documented (new tables, columns, indexes, migrations)
- [ ] Policy/consent implications identified (does this task touch consent, PII, or introduce outbound communication?)
- [ ] Observability plan attached (what metrics, logs, traces, and alerts does this task require?)
- [ ] Test plan attached (unit, integration, E2E — with coverage expectations)
- [ ] Dependencies resolved or explicitly deferred (no blocked tasks in sprint)
- [ ] Acceptance criteria defined (testable success conditions, not just a task description)

### Definition of Done (DoD)

A task is done when:

- [ ] Code merged with lint, typecheck, and unit/integration checks passing
- [ ] Audit/event instrumentation complete for sensitive actions (consent, policy, matching, introductions)
- [ ] SLO and error handling verified in staging
- [ ] Product acceptance criteria signed off
- [ ] Documentation updated (API docs, architecture decision records, runbooks if applicable)
- [ ] No new accessibility regressions (axe-core CI passing)
- [ ] Feature flag configured (if applicable — default off for new features)

---

## 12. Ticketization and Work Breakdown

Guidelines for translating sprint tasks into trackable tickets.

### Epic → Story → Task Hierarchy

- **Epic:** Maps to a sprint section (e.g., "Sprint 5: Aggregation Service + Normalization")
- **Story:** Maps to a numbered task (e.g., "5.4 Normalization pipeline") — delivers user-visible or system-observable value
- **Task:** Sub-unit of a story — a single PR or deployable change (e.g., "Implement CompensationNormalizer")

### Ticket Standards

- One owner per ticket, one owning workstream per epic
- Break each epic into 3-8 tickets max per sprint
- Every ticket references its phase, sprint, and task number (e.g., `P2-S5-5.4`)
- Tickets must include: description, acceptance criteria, dependencies, estimated effort

### Labeling Conventions

| Label | Usage |
|---|---|
| `phase:1` through `phase:4` | Phase assignment |
| `sprint:N` | Sprint assignment |
| `guardrail` | Consent, policy, intro, or audit-related work |
| `ml-pipeline` | AI/ML model or pipeline work |
| `infra` | Infrastructure, DevOps, or platform work |
| `frontend` | UI/UX work |
| `security` | Security-specific tasks |
| `blocked` | Waiting on dependency resolution |

### Negative Test Requirements

Every ticket that touches introductions, consent, moderation, or policy decisions must include explicit negative tests:
- What happens when consent is revoked mid-flow?
- What happens when one party passes after the other expresses interest?
- What happens when a policy check denies an introduction?

---

## 13. Reporting Cadence

| Cadence | Audience | Content |
|---|---|---|
| **Weekly** | Engineering team | Sprint burndown, blocked dependencies, SLO trend, DLQ depth |
| **Biweekly** | Stakeholders | Phase readiness scorecard (green/yellow/red by milestone criteria), key decisions made |
| **Monthly** | Leadership | Risk review with mitigation status, timeline impact assessment, budget vs. actuals (infra + LLM costs) |

### Phase Gate Reviews

At each phase boundary, conduct a formal gate review:
- Present exit criteria checklist (pass/fail for each item)
- Review risk register updates
- Confirm next phase's Definition of Ready is met for all Sprint 1 tasks
- Obtain stakeholder sign-off before proceeding

---

*Detailed sprint-level plans follow in phase-specific documents.*
