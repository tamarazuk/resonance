# Resonance — Full System Architecture Plan

**Version:** 1.1
**Date:** February 24, 2026
**Status:** Draft — Full Product Scope (Execution-Ready)

> This document defines the end-state architecture for Steadyhand (Candidate Engine), Clearview (Employer Engine), Resonance Core (Matching Protocol), and shared platform services. It is decision-complete for launch-path implementation and explicitly documents deferred decisions as ADRs.

---

## 1. System Overview

Resonance is composed of three product surfaces backed by shared platform services:

```
┌─────────────────────────────────────────────────────────┐
│                     Resonance Platform                  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Steadyhand  │  │   Clearview  │  │ Resonance    │  │
│  │ (Candidate   │  │  (Employer   │  │    Core      │  │
│  │   Engine)    │  │   Engine)    │  │ (Matching)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────┴─────────────────┴──────────────────┴───────┐  │
│  │              Shared Platform Services              │  │
│  │ AI Gateway │ Governance │ Data │ Auth │ Aggregation│  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.1 Core Architectural Principles

- **Data dignity first:** candidate data is user-owned, exportable, deletable, and only used with explicit consent.
- **Zero-knowledge cross-side exposure:** matching operates on structured features and embeddings, not raw narratives.
- **Human decisions at all external boundaries:** AI recommends; humans approve every external action.
- **Policy enforcement in backend services:** no guardrail depends on UI behavior.
- **Event-driven internals:** profile, posting, and decision events trigger asynchronous workflows.
- **Modular AI layer:** model providers and prompts are versioned and swappable via gateway abstractions.

### 1.2 PRD Non-Negotiables

| Guardrail | Enforcement Mechanism | Audit Evidence |
|---|---|---|
| Double opt-in introductions | `IntroductionOrchestrator` requires both candidate and employer interested states before intro creation | `match.candidate.decisioned`, `match.employer.decisioned`, `match.introduction.created` events + policy decision log |
| Humans decide, AI recommends | All outbound communication endpoints require explicit user action token; no autonomous sender jobs | API access logs, outbound message audit events |
| Candidate free forever | No candidate billing service path and no candidate-side rank boost controls in matching | Product config snapshot + gateway policy checks |
| Consent-gated model training | Training dataset builder requires active `model_training_opt_in=true` and valid `consent_version` | `TrainingEligibilitySnapshot` records and `consent.updated` trail |
| Explainable matches | Match persistence requires strengths/gaps/practical constraints payload for surfaced matches | Explainability payload stored with match artifact |
| No demographic inference features | Protected attributes excluded from online feature schema; fairness uses offline audit datasets only | Feature registry diff logs + model card constraints |

---

## 2. High-Level Data Architecture

### 2.1 Core Data Models

#### Candidate Profile (Steadyhand)

```
CandidateProfile
├── identity: { userId, createdAt, lastActive }
├── memoryBank: MemoryEntry[]
│   ├── experienceId
│   ├── rawNarrative
│   ├── structuredSTAR: { situation, task, action, result }
│   ├── skillsExplicit: string[]
│   ├── skillsImplicit: string[]
│   ├── themes: string[]
│   ├── context: { companyStage, teamSize, industry, constraints }
│   └── evidenceStrength: 0-1 float
├── preferenceMap: PreferenceProfile
│   ├── roleType, seniority, scope
│   ├── industries, missions
│   ├── workStyle: { remote, hybrid, async, collaborative, autonomous }
│   ├── compensation: { min, max, flexibility }
│   ├── growthGoals: string[]
│   └── dealbreakers: string[]
├── growthMap: GrowthProfile
│   ├── activeSkills: string[]
│   ├── growthEdges: string[]
│   ├── trajectoryDirection: string
│   └── learningSignals: LearningSignal[]
├── consentState: { trainingOptIn, dataSharingOptIn, notificationOptIn, consentVersion }
└── vectorEmbedding: float[]
```

#### Employer Profile (Clearview)

```
EmployerProfile
├── companyId
├── roleProfiles: RoleProfile[]
│   ├── roleId
│   ├── mustHaves: Requirement[]
│   ├── niceToHaves: Requirement[]
│   ├── realWork: { months1to3, months3to6, months6to12 }
│   ├── teamComposition: TeamMember[]
│   ├── successCriteria: string[]
│   ├── growthOpportunity: string
│   └── hiddenRequirements: HiddenRequirement[]
├── cultureSignal: CultureProfile
│   ├── decisionMaking: enum
│   ├── communicationStyle: enum
│   ├── pace: enum
│   ├── autonomyLevel: enum
│   └── valuesInPractice: string[]
├── postingSource: enum (direct | api | scraped | candidate-submitted)
├── postingTier: 1 | 2 | 3 | 4
└── vectorEmbedding: float[]
```

#### Match Record

```
MatchRecord
├── matchId
├── candidateId
├── roleId
├── compositeScore: 0-100
├── confidenceBucket: Strong | Promising | Stretch | Weak
├── dimensionScores: { capability, growthTrajectory, culture, values, practical, mutualAdvantage }
├── explainability: { strengths[], gaps[], practicalConstraints[], rationaleText }
├── candidateStatus: pending | interested | saved | passed
├── employerStatus: pending | interested | saved | passed
├── introState: IntroState
├── introReasonCode: ReasonCode?
└── createdAt, updatedAt
```

### 2.2 Governance and Control Models

```
ConsentRecord
├── subjectType: candidate | employer_admin
├── subjectId
├── consentType: ConsentType
├── status: ConsentStatus
├── consentVersion
├── grantedAt
├── revokedAt?
└── evidenceRef
```

```
ConsentEvent
├── eventId
├── subjectId
├── consentType
├── previousStatus
├── newStatus
├── consentVersion
├── actorId
└── occurredAt
```

```
PolicyDecisionLog
├── decisionId
├── policyName
├── action
├── inputRefs[]
├── outcome: allow | deny
├── reasonCode: ReasonCode
├── actorId?
└── evaluatedAt
```

```
AuditEvent
├── auditEventId
├── category: consent | intro | policy | access | moderation | model
├── subjectId
├── actorId
├── metadata
└── timestamp
```

```
TrainingEligibilitySnapshot
├── snapshotId
├── candidateId
├── trainingEligible: boolean
├── consentVersion
├── effectiveFrom
└── generatedAt
```

```
IntroductionState
├── introId
├── matchId
├── currentState: IntroState
├── candidateDecisionAt?
├── employerDecisionAt?
├── terminalReasonCode?
└── updatedAt
```

### 2.3 Core Shared Types

| Type | Values | Purpose |
|---|---|---|
| `ConsentType` | `model_training`, `cross_party_data_share`, `match_notifications` | Consent domain normalization |
| `ConsentStatus` | `granted`, `revoked`, `expired` | Lifecycle and policy checks |
| `ReasonCode` | `candidate_passed`, `employer_passed`, `policy_denied_missing_consent`, `policy_denied_guardrail`, `moderation_quarantined`, `system_timeout` | Auditable terminal outcomes |
| `PolicyDecision` | `allow`, `deny` | Policy engine response contract |
| `IntroState` | `discovered`, `candidate_interested`, `candidate_passed`, `employer_interested`, `employer_passed`, `introduced`, `closed` | Introduction state machine |
| `ConfidenceBucket` | `Strong`, `Promising`, `Stretch`, `Weak` | Ranking + UX behavior contract |

---

## 3. Subsystem Architecture

### 3.1 Steadyhand — Candidate Engine

#### Responsibilities
- Capture and structure professional experiences through conversation and imports.
- Build and evolve the Professional Identity Graph.
- Reduce candidate cognitive load with triage, prep, and adaptive support.
- Present explainable matches and collect explicit candidate decisions.
- Manage candidate consent preferences and history.

#### Component Breakdown

```
Steadyhand
├── Ingestion Layer
│   ├── ConversationCapture
│   ├── DocumentImporter
│   └── PostEventDebrief
├── Structuring Layer (AI)
│   ├── STARExtractor
│   ├── SkillTagger
│   ├── ThemeClassifier
│   └── EvidenceScorer
├── Profile Graph
│   ├── MemoryBank
│   ├── PreferenceMap
│   └── GrowthMap
├── Cognitive Protection Layer
│   ├── TriageEngine
│   ├── PrepEngine
│   ├── FollowUpManager
│   └── EmotionalIntelligence
├── Consent Manager
│   ├── ConsentWriteAPI
│   ├── ConsentHistoryReader
│   └── TrainingEligibilityPublisher
└── Output Layer
    ├── ApplicationDrafter
    ├── MatchFeedRenderer
    └── EmbeddingUpdater
```

### 3.2 Clearview — Employer Engine

#### Responsibilities
- Structure role definitions and team needs.
- Analyze posting clarity, inclusion, and calibration.
- Present candidate matches with evidence and required reason-coded decisions.
- Capture explicit employer match decisions for calibration and audit.

#### Component Breakdown

```
Clearview
├── Role Definition Flow
│   ├── RequirementChallenger
│   ├── RealWorkCapture
│   ├── TeamGapAnalyzer
│   └── HiddenRequirementSurface
├── Culture Signal Capture
│   ├── DecisionStyleClassifier
│   ├── CommunicationPatternMapper
│   └── ValueInPracticeExtractor
├── Posting Analysis
│   ├── ClarityScorer
│   ├── InclusivityAnalyzer
│   ├── RequirementCalibrator
│   └── MarketBenchmarker
├── Match Management
│   ├── CandidateMatchFeed
│   ├── EmployerDecisionRecorder
│   └── EvaluationFramework
└── Output Layer
    ├── TeamNeedsGraphBuilder
    └── EmbeddingUpdater
```

### 3.3 Resonance Core — Matching Protocol

#### Responsibilities
- Compute six-dimension scores and confidence buckets.
- Enforce explainability persistence for surfaced matches.
- Trigger and monitor policy-gated double opt-in orchestration.
- Track outcomes for calibration, fairness, and quality.

#### Matching Architecture

```
ResonanceCore
├── Embedding Service
│   ├── CandidateEmbedder
│   ├── RoleEmbedder
│   └── EmbeddingStore
├── Match Engine
│   ├── CandidateRetriever
│   ├── RoleRetriever
│   └── DimensionScorer
│       ├── CapabilityAligner
│       ├── GrowthTrajectoryMatcher
│       ├── CultureCompatibilityScorer
│       ├── ValuesMissionAligner
│       ├── PracticalCompatibilityChecker
│       └── MutualAdvantageEstimator
├── Confidence + Explainability
│   ├── ConfidenceClassifier
│   └── ReasoningGenerator
├── Introduction Orchestration
│   ├── InterestTracker
│   ├── PolicyCheckClient
│   └── IntroductionBroker
└── Calibration Layer
    ├── OutcomeTracker
    ├── ConfidenceCalibrator
    └── FairnessAuditor
```

#### Match Scoring Flow

```
Trigger: candidate.profile.updated OR employer.role.updated OR opportunity.canonicalized

1. Refresh embeddings for updated entities.
2. Retrieve top-N pairs by semantic similarity.
3. Score six dimensions + compute confidence bucket.
4. Generate explainability payload (strengths, gaps, practical constraints).
5. Persist match only if explainability contract is complete.
6. Emit match.scored.v1 event.
7. Await explicit human decisions; no intro side effects yet.
```

### 3.4 Aggregation Service

#### Responsibilities
- Ingest opportunities from direct, API, scraped, and candidate-submitted sources.
- Normalize and deduplicate into canonical role representations.
- Moderate Tier-4 candidate submissions before indexing/matching.

#### Component Breakdown

```
AggregationService
├── Source Connectors
│   ├── DirectPostingIngester (Tier 1)
│   ├── JobBoardAPIConnector (Tier 2)
│   ├── CareerPageMonitor (Tier 3)
│   └── CandidateSubmissionHandler (Tier 4)
├── Normalization Pipeline
│   ├── PostingParser
│   ├── RequirementExtractor
│   ├── CompensationNormalizer
│   └── ConfidenceAnnotator
├── Deduplication
│   ├── FingerprintGenerator
│   └── MergeHandler
├── Moderation
│   ├── AbuseClassifier
│   ├── QuarantineQueue
│   └── HumanReviewConsole
└── ClaimFlow
    └── EmployerClaimHandler
```

### 3.5 Trust, Safety, and Governance

#### Responsibilities
- Enforce non-bypassable policy gates for sensitive actions.
- Maintain immutable consent and decision audit trails.
- Monitor fairness outcomes and moderation integrity.
- Provide operational controls for disputes, abuse, and incident response.

#### Component Breakdown

```
GovernanceDomain
├── Policy Engine
│   ├── GuardrailPolicySet
│   ├── ConsentPolicyAdapter
│   └── IntroPreconditionChecks
├── Consent Ledger
│   ├── ConsentStore
│   └── ConsentEventPublisher
├── Audit/Event Ledger
│   ├── ImmutableAuditWriter
│   └── AuditQueryAPI
├── Fairness Monitoring
│   ├── SliceMetrics
│   ├── DriftAlerts
│   └── DisparityInvestigationQueue
└── Abuse/Moderation Controls
    ├── PostingModerationRules
    ├── ReporterTriage
    └── EnforcementActions
```

### 3.6 Introduction State Machine

#### State Transitions

| Current State | Action | Next State | Enforcement |
|---|---|---|---|
| `discovered` | Candidate selects `interested` | `candidate_interested` | Candidate auth + match visibility check |
| `discovered` | Candidate selects `passed` | `candidate_passed` (terminal) | Record `reason_code=candidate_passed` |
| `candidate_interested` | Employer selects `interested` | `employer_interested` | Employer auth + role ownership check |
| `candidate_interested` | Employer selects `passed` | `employer_passed` (terminal) | Record `reason_code=employer_passed` |
| `employer_interested` | `POST /internal/introductions/:matchId/attempt` | `introduced` | Policy engine allow + consent checks |
| any non-terminal | SLA timeout/retry exhausted | `closed` (terminal) | Record `reason_code=system_timeout` |
| any non-terminal | Policy denial | unchanged or `closed` | Record policy denial reason code |

#### Terminal Reason Codes
- `candidate_passed`
- `employer_passed`
- `policy_denied_missing_consent`
- `policy_denied_guardrail`
- `moderation_quarantined`
- `system_timeout`

---

## 4. AI / LLM Architecture

### 4.1 Model Usage Strategy

| Task | Default Approach | Notes |
|---|---|---|
| Conversation capture | Claude via AI Gateway | Long-context, schema-constrained output |
| STAR extraction | Claude structured output | Required JSON schema validation |
| Skill/theme tagging | Claude + taxonomy mapper | Deterministic taxonomy post-processing |
| Evidence scoring | Heuristic model + LLM verification | Cost/performance control |
| Embedding generation | OpenAI text-embedding-3-large | Provider abstracted behind interface |
| Bias detection | Fine-tuned classifier + LLM assist | Offline evaluation required before deploy |
| Match reasoning generation | Claude with retrieval context | Must pass explainability schema |
| Interview prep generation | Claude grounded on Memory Bank + role context | Candidate-visible output only |

### 4.2 Prompt Architecture

- Prompts are versioned artifacts with immutable IDs.
- Every model interaction uses schema-constrained outputs.
- Output validators reject malformed or policy-violating responses.
- Prompt revisions require regression evaluation against golden sets.

### 4.3 Embedding Strategy

- Candidate embeddings: multi-vector (entry-level + aggregate profile vector).
- Role embeddings: per role profile; regenerated on role update.
- Store: pgvector in PostgreSQL at launch.
- Retrieval mode: ANN for candidate-role recall, followed by deterministic rerank.
- Refresh cadence: event-triggered on write + hourly recalibration backfill.

### 4.4 Model Governance

#### Versioning and Release Controls
- Each deployment references `(model_version, prompt_version, evaluator_version)` tuple.
- New tuple promotion requires offline evaluation pass and canary gate.

#### Evaluation Gates
- Minimum precision and calibration thresholds by confidence bucket.
- Explainability completeness must be 100% for surfaced matches.
- Fairness disparity checks must remain inside approved bounds.

#### Drift and Rollback
- Monitor embedding drift, output schema failures, and calibration degradation.
- Automatic rollback to last known-good tuple on threshold breach.
- Emit `model.rollback.executed` audit event with root-cause reference.

---

## 5. Privacy & Security Architecture

### 5.1 Data Ownership Model

- Candidate profiles are fully exportable and deletable by the candidate.
- Employer internal data is never exposed as raw data to candidates.
- Cross-party exposure is limited to policy-approved summaries.

### 5.2 Zero-Knowledge Matching

- Matching consumes embeddings and normalized signals, not raw narrative content.
- Candidate view: role summary + rationale; no employer internal notes.
- Employer view: evidence summary + rationale; no candidate raw narrative.

### 5.3 Encryption & Storage

- At rest: AES-256 for data stores and object storage.
- In transit: TLS 1.3.
- Sensitive fields: field-level encryption and key rotation.
- Auth: OAuth 2.0 with short-lived JWT and scoped service tokens.

### 5.4 No Demographic Signals in Matching

- Online scoring excludes protected attributes (name, age, gender, nationality, photo, graduation year).
- Offline fairness auditing uses segregated datasets with restricted access.

### 5.5 Data Dignity and Training Consent Lifecycle

1. Candidate sets training consent through consent API.
2. Consent change writes `ConsentRecord` and appends `ConsentEvent`.
3. Eligibility builder creates `TrainingEligibilitySnapshot` per training window.
4. Training pipeline includes only `trainingEligible=true` snapshots.
5. Revocations are honored in all future snapshots and pipeline runs.
6. Audit queries can reconstruct who was eligible for any model training run.

### 5.6 Compliance Baseline

| Control Area | Launch Baseline | Evidence Artifact |
|---|---|---|
| Access control | RBAC + scoped service auth + tenant boundaries | Access policy configs + auth audit logs |
| Consent governance | Versioned consents, immutable consent events | Consent ledger and event history |
| Intro guardrails | Policy-gated introduction attempts | Policy decision logs + intro event trail |
| Data subject rights | Export + delete workflows with SLA | Request logs + completion receipts |
| Security ops | Vulnerability scanning, incident runbooks, key rotation | Scan reports + incident postmortems |
| Model governance | Evaluation gates, rollback, drift alarms | Model registry + governance logs |

---

## 6. Infrastructure Architecture

### 6.1 Service Topology

```
┌──────────────────────────────────────────────────────────┐
│                        API Gateway                       │
│              (auth, routing, rate limits)                │
└──────────┬──────────────────────────┬────────────────────┘
           │                          │
   ┌───────▼────────┐        ┌────────▼────────┐
   │ Steadyhand API │        │  Clearview API  │
   └───────┬────────┘        └────────┬────────┘
           │                          │
   ┌───────▼──────────────────────────▼────────┐
   │        Modular Platform Application        │
   │  Resonance Core | Aggregation | Governance │
   └─────────────────────────────────────────────┘
           │
   ┌───────▼────────────────────────────────────┐
   │                 Data Layer                 │
   │ PostgreSQL + pgvector | Redis | Object S3 │
   └────────────────────────────────────────────┘
```

### 6.2 Tech Stack Decisions (Launch Defaults)

| Layer | Launch Default | Fallback (Deferred) | Trigger to Switch |
|---|---|---|---|
| Product APIs | TypeScript + Node.js | None in launch path | N/A |
| ML/Inference services | Python services behind internal APIs | None in launch path | N/A |
| Architecture style | Modular monolith | Service extraction | Trigger thresholds in 6.4 |
| Primary DB + vector | PostgreSQL + pgvector | Pinecone behind repository interface | Recall/latency exceeds SLO at validated load |
| Queue/workflows | Redis + BullMQ | Managed queue worker tier | Operational burden or throughput breach |
| Hosting | AWS | None in launch path | N/A |
| External API style | REST-first | GraphQL BFF (deferred) | Multi-client data-shape pressure |
| Internal integration | Versioned async events | Synchronous internal RPC additions | Required for strict consistency edge cases |
| LLM strategy | AI gateway with Claude primary, OpenAI fallback | Additional providers | Cost/reliability or policy requirements |
| Frontend | Next.js web-first | Native mobile apps | Product milestone after Phase 2 |

### 6.3 Async Processing and Cadence

Event-driven workflows:
- `candidate.memory_bank.added` -> structure -> embed -> rescore.
- `employer.role.updated` -> embed -> rescore.
- `opportunity.canonicalized` -> dedupe/moderate -> embed -> score candidates.
- `match.candidate.decisioned`/`match.employer.decisioned` -> intro policy evaluation.

Cadence policy:
- Incremental matching on write events.
- Hourly backfill for missed events, score recalibration, and stuck-state recovery.
- Stuck workflow watchdog retries idempotent jobs and emits compensation events.

### 6.4 Architecture Style Decision

**Decision:** launch with a modular monolith organized by domain modules:
- `steadyhand`
- `clearview`
- `resonance_core`
- `aggregation`
- `governance`

**Service extraction criteria (all measured for two consecutive sprints):**
1. Domain team ownership needs independent deploy cadence.
2. p95 latency or queue lag exceeds SLO despite within-module optimizations.
3. Module-specific scale profile causes noisy-neighbor resource contention.
4. Compliance boundary requires separate runtime isolation.

---

## 7. API Design

### 7.1 API Surface (High-Level)

#### Steadyhand (Candidate)

```
POST   /candidate/memory-bank
GET    /candidate/memory-bank
PATCH  /candidate/memory-bank/:id
GET    /candidate/preferences
PUT    /candidate/preferences
GET    /candidate/matches
GET    /candidate/matches/:id/explainability
POST   /candidate/matches/:id/respond                  # interested | save | pass
GET    /candidate/prep/:matchId
POST   /candidate/applications/draft
PUT    /candidate/consents                             # update consent tuple
GET    /candidate/consents
GET    /candidate/consents/history
```

#### Clearview (Employer)

```
POST   /employer/roles
GET    /employer/roles/:id
PATCH  /employer/roles/:id
GET    /employer/roles/:id/analysis
GET    /employer/matches
POST   /employer/matches/:id/respond                   # interested | save | pass + decision_reason_code
```

Contract requirement for `POST /employer/matches/:id/respond`:

```json
{
  "decision": "interested",
  "decision_reason_code": "strong_capability_fit",
  "notes": "optional"
}
```

#### Resonance Core + Governance (Internal)

```
POST   /internal/match/trigger
GET    /internal/match/:id
POST   /internal/match/:id/outcome
POST   /internal/introductions/:matchId/attempt        # policy-gated
GET    /internal/introductions/:id/state
POST   /internal/policy/evaluate
GET    /internal/audit/events                           # filter: category, subjectId, actorId, from, to
```

#### Aggregation (Internal / Webhook)

```
POST   /aggregation/postings/ingest
POST   /aggregation/postings/claim
POST   /aggregation/postings/moderate                   # Tier-4 moderation action
```

### 7.2 Internal Event Contracts (Versioned)

| Topic | Version | Owner Domain | Producers | Consumers | Purpose |
|---|---|---|---|---|---|
| `candidate.profile.updated` | v1 | Steadyhand | Steadyhand | Resonance Core | Re-score candidate-role pairs |
| `candidate.memory_bank.added` | v1 | Steadyhand | Steadyhand | Resonance Core, AI pipeline | Recompute embeddings and scores |
| `employer.role.updated` | v1 | Clearview | Clearview | Resonance Core | Re-score role candidate pool |
| `opportunity.canonicalized` | v1 | Aggregation | Aggregation | Resonance Core | Score candidates for canonical opportunity |
| `match.scored` | v1 | Resonance Core | Resonance Core | Steadyhand, Clearview | Surface ranked matches |
| `match.candidate.decisioned` | v1 | Resonance Core | Steadyhand -> Core | Governance, Clearview | Persist candidate interest/pass |
| `match.employer.decisioned` | v1 | Resonance Core | Clearview -> Core | Governance, Steadyhand | Persist employer interest/pass |
| `match.introduction.created` | v1 | Resonance Core | Intro Orchestrator | Steadyhand, Clearview, Audit | Confirm successful intro |
| `consent.updated` | v1 | Governance | Consent Manager | Training pipeline, Audit | Update training eligibility |
| `policy.decision.logged` | v1 | Governance | Policy Engine | Audit, Ops | Immutable policy decision record |

Event contract rules:
- Backward compatibility required for all `v1` payload fields.
- Every event includes `event_id`, `occurred_at`, `trace_id`, `schema_version`.
- Consumers must be idempotent on `event_id`.

---

## 8. Human/AI Boundary Enforcement

This boundary is enforced at service and policy layers, never only in client code.

| Boundary | Enforcement |
|---|---|
| No auto-application | Application endpoint produces drafts only; submission is separate explicit action |
| No unsolicited outreach | Intro attempts require both explicit decision events and policy allow result |
| No data sharing without consent | Policy checks require valid consent state before cross-party data surfaces |
| No autonomous hiring action | Match scores are advisory; no auto-advance/reject automation paths |
| No direct raw LLM outbound | All outbound content passes schema + policy + human action |

---

## 9. Phased Build Sequence

### 9.1 Phase 1 — Steadyhand Standalone (MVP)
- Candidate auth/profile, memory bank, STAR extraction, skills/themes, preference map, growth map.
- Candidate consent APIs and immutable consent event logging.
- Cognitive protection basics (triage/prep/follow-up).
- No introductions and no employer-side workflow.

### 9.2 Phase 2 — Aggregation + Basic Matching
- Tier-2 and Tier-3 ingestion with dedupe and moderation for Tier-4 submissions.
- Candidate-side match feed with explainability payload.
- Event-triggered matching + hourly backfill.

### 9.3 Phase 3 — Clearview + Double Opt-In
- Employer onboarding, role definition, posting analysis.
- Employer match decisions with reason codes.
- Introduction state machine and policy-gated intro attempts.

### 9.4 Phase 4 — Resonance Core Full
- Full six-dimension scoring and confidence calibration loop.
- Fairness monitoring, drift alerts, model governance gates.
- Expanded analytics for match quality and conversion.

### 9.5 Phase Exit Criteria

| Phase | Exit Criteria |
|---|---|
| Phase 1 | Candidate profile completion >= 60%, consent write/read audited, 0 unauthorized outbound actions |
| Phase 2 | Match explainability completeness = 100% for surfaced matches, moderation quarantine path active, hourly backfill success >= 99% |
| Phase 3 | 100% introductions created only after both decision events, policy denial logging enabled, no notification leak incidents |
| Phase 4 | Confidence calibration within defined error bounds, fairness disparity alerts operational, rollback drill executed successfully |

---

## 10. Architectural Decisions and Deferred ADRs

### 10.1 Resolved Launch Decisions

| Decision ID | Decision |
|---|---|
| RD-001 | Product APIs use TypeScript/Node.js; Python reserved for ML/inference services |
| RD-002 | Modular monolith is launch architecture; no premature microservice split |
| RD-003 | PostgreSQL + pgvector is primary operational/vector store at launch |
| RD-004 | Redis + BullMQ is default queue and workflow layer |
| RD-005 | AWS is launch hosting platform |
| RD-006 | REST-first public APIs; async events for internal domain integration |
| RD-007 | AI gateway abstraction with Claude primary and OpenAI fallback |
| RD-008 | Next.js web-first launch; native mobile deferred |
| RD-009 | Event-triggered incremental matching + hourly backfill/recalibration |
| RD-010 | Cloud-first launch with export/delete portability and strict consent/audit controls |

### 10.2 Deferred ADRs (True Deferrals)

| ADR ID | Topic | Default Until Decided | Owner | Decision Trigger |
|---|---|---|---|---|
| ADR-011 | Pinecone adoption vs pgvector-only | Stay on pgvector | Platform Lead | p95 vector query latency or recall misses SLO for 2 sprints |
| ADR-012 | Graph storage introduction | No separate graph DB | Data Lead | Query complexity exceeds acceptable cost/latency in production |
| ADR-013 | Native mobile app architecture | Web-only | Product + Mobile Lead | Phase 2 goals met and mobile usage case validated |
| ADR-014 | Multi-region active-active runtime | Single primary region + DR | Infra Lead | Enterprise SLA/regional compliance requirement |
| ADR-015 | GraphQL BFF for clients | REST-only | API Lead | Repeated client over/under-fetch issues across 2 releases |

---

## 11. Validation Scenarios and Architecture Guarantees

| Scenario | Expected Guarantee |
|---|---|
| Candidate interested, employer not interested | No introduction is created; no side is notified of unilateral decision |
| Employer attempts intro before candidate consent | Policy engine denies attempt with auditable reason code |
| Candidate revokes model-training consent | Future training snapshots exclude candidate; revocation trail remains queryable |
| Match surfaced to either side | Explainability includes strengths, gaps, and practical constraints |
| Any scoring path | Protected demographic attributes are absent from online inference features |
| Tier-4 posting spam detected | Posting is quarantined before canonicalization/matching |
| LLM provider outage | AI gateway fails over to fallback or degrades non-critical AI features while preserving core guardrails |
| Stuck workflow state | Watchdog retry + compensation path closes stale state with auditable `system_timeout` reason |

---

## 12. MVP Acceptance Metrics Framing

| Category | Metric | Target Direction |
|---|---|---|
| Candidate value | Profile completion and recurring usage | Up and stable after onboarding |
| Match quality | Candidate-perceived relevance and explainability trust | Up by cohort over time |
| Guardrail integrity | Unauthorized outbound intro count | Must remain zero |
| Consent integrity | Consent event audit completeness | 100% of state changes traceable |
| Reliability | API and workflow success rates | Meet phase SLOs before phase exit |
| Fairness monitoring | Disparity detection and resolution throughput | Alerts triaged within operational SLA |

---

*End of Document*
