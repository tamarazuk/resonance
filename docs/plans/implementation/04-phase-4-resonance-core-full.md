# Phase 4: Resonance Core Full

**Duration:** 4 weeks (2 sprints)
**Depends on:** Phase 3 (Clearview + Double Opt-In — ends Week 19)
**Enables:** Hardening + Launch Prep

---

## 1. Phase Goal

Replace the MVP matching algorithm with the full six-dimension scoring system. Deploy the two-tower retrieval model. Implement confidence calibration, fairness monitoring, model governance gates, and the internal operations console for trust and safety.

---

## 2. Sprint Breakdown

### Sprint 9 (Weeks 20-21): Full Scoring + Two-Tower Model

#### ML/Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 9.1 | **Two-tower retrieval model** | Candidate tower: experience + skills + preferences + growth trajectory embeddings -> dense layers (768->512->256) -> 128-dim vector. Role tower: requirements + culture + growth + compensation embeddings -> same architecture. Cosine similarity with learned temperature scaling. Replaces pgvector ANN recall stage. | 4d |
| 9.2 | **Capability Alignment scorer** | Skill matching via NER + semantic similarity. Experience relevance via embedding distance. Requirement satisfaction classification (must-have vs nice-to-have). Weighted score for capability dimension. | 2d |
| 9.3 | **Growth Trajectory scorer** | Trajectory prediction (sequence model on career history). Learning signal analysis (attention-based on growth map). Opportunity fit regression: does this role advance the candidate's stated goals? | 2d |
| 9.4 | **Culture Compatibility scorer** | Work style matching (classification: remote/hybrid/async preferences). Values alignment (sentiment + semantic similarity). Communication fit (NLP analysis of communication style preferences vs team patterns). | 2d |
| 9.5 | **Values/Mission Alignment scorer** | Mission statement analysis (NLP on company mission vs candidate mission preferences). Values extraction (NER on employer values in practice). Alignment regression scoring. | 1d |
| 9.6 | **Practical Compatibility scorer** | Compensation matching (rules + ML: salary range overlap). Location feasibility (geospatial matching, remote preference handling). Timeline alignment (candidate availability vs hire urgency). | 1d |
| 9.7 | **Mutual Advantage estimator** | Rarity scoring: how rare is this candidate-role combination? Benefit prediction: does this match provide uncommon value to both sides? Two-sided value estimation. | 1d |
| 9.8 | **Composite scorer + confidence classifier** | Weighted aggregation of six dimension scores. Confidence bucket assignment with updated thresholds calibrated from Phase 2-3 match outcomes. Configurable weights per dimension (A/B testable). | 1d |

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 9.9 | **Scoring pipeline upgrade** | Replace MVP algorithm with full pipeline: two-tower recall -> six-dimension scoring -> confidence classification -> explainability generation. Backward-compatible: existing matches rescored during migration. | 2d |
| 9.10 | **Explainability enhancement** | Update reasoning generator to produce per-dimension explanations. Strengths now mapped to specific dimensions. Gaps mapped to specific dimension shortfalls. Rationale text references specific evidence from both sides. | 2d |
| 9.11 | **Match outcome tracking** | `POST /internal/match/:id/outcome`. Track outcomes: no_response, interview, offer, hired, rejected. Feed into calibration loop. Timestamps for all transitions. | 1d |
| 9.12 | **Model serving infrastructure** | Python FastAPI model server. MLflow model registry. Redis caching for hot embeddings. Model quantization (int8) for inference efficiency. ONNX Runtime optimization. Request batching. | 2d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 9.13 | **Enhanced explainability UI** | Six-dimension radar chart / breakdown view. Per-dimension strength and gap callouts. Improved rationale text display. Dimension-level detail expansion. | 2d |
| 9.14 | **Match quality indicators** | Updated confidence badges reflecting calibrated thresholds. Dimension score previews on match cards. Visual differentiation between Strong, Promising, and Stretch matches. | 1d |

#### Deliverables
- Full six-dimension scoring replacing MVP algorithm
- Two-tower retrieval model deployed
- Enhanced explainability with per-dimension reasoning
- Model serving infrastructure operational
- Outcome tracking for calibration feedback loop

---

### Sprint 10 (Weeks 22-23): Fairness, Governance, Ops Console

#### ML/Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 10.1 | **Confidence calibration loop** | Compare predicted confidence buckets with actual outcomes. Compute calibration error per bucket. Adjust bucket thresholds to minimize calibration error. Automated recalibration on weekly cadence. Alert on drift beyond acceptable bounds. | 3d |
| 10.2 | **Fairness monitoring** | SliceMetrics: compute match quality and outcome metrics across candidate subgroups (offline, segregated dataset). DriftAlerts: detect when match distribution shifts unexpectedly. DisparityInvestigationQueue: flag subgroups with significantly different outcome rates for manual review. | 3d |
| 10.3 | **Bias detection models** | Job posting bias classifier (gendered language, exclusionary phrases, unrealistic requirements). Output: bias score, flagged phrases with positions, suggested alternatives. Offline match outcome fairness analysis (statistical parity, equalized odds, disparate impact). | 2d |
| 10.4 | **Model governance gates** | Every deployment references `(model_version, prompt_version, evaluator_version)` tuple. New tuple promotion requires: offline evaluation pass (precision, recall, NDCG), explainability completeness check, fairness disparity check. Canary gate: 5% -> 50% -> 100% rollout. | 2d |
| 10.5 | **Drift detection and rollback** | Monitor embedding drift (cosine similarity of reference vs current distributions). Output schema failure rate tracking. Calibration degradation monitoring. Automatic rollback to last known-good tuple on threshold breach. Emit `model.rollback.executed` audit event. | 2d |

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 10.6 | **Internal Operations Console — API layer** | `GET /internal/audit/events` with rich filtering (category, subject, actor, date range). `GET /internal/disputes/queue` with triage workflow. `PATCH /disputes/:id/resolve`. Moderation action endpoints. Fairness report generation endpoint. | 2d |
| 10.7 | **Abuse and moderation controls** | PostingModerationRules: configurable rule engine for auto-quarantine. ReporterTriage: user reports routed to moderation queue. EnforcementActions: warn, suspend, ban for repeat offenders. | 2d |
| 10.8 | **Dispute resolution workflow** | DisputeIntakeAPI, DisputeTriageQueue, ResolutionWorkflow, EscalationPath. Dispute states: open -> in_review -> resolved/escalated. Audit trail for all dispute actions. SLA tracking for resolution time. | 2d |
| 10.9 | **Expanded analytics** | Match quality metrics over time. Conversion funnel (matched -> interested -> introduced -> interviewed -> hired). Coverage metrics (percentage of available opportunities indexed). Network effect measurement (does adding participants improve match quality?). | 2d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 10.10 | **Operations Console — Moderation dashboard** | Queue of items requiring human review (Tier-4 postings, flagged content, reports). Action buttons: approve, reject, quarantine, escalate. Audit history per item. | 3d |
| 10.11 | **Operations Console — Consent audit viewer** | Search by user. Full consent event timeline. Current consent state summary. Training eligibility snapshot viewer. | 1d |
| 10.12 | **Operations Console — Dispute management** | Dispute queue with priority sorting. Dispute detail view with full context. Resolution workflow UI. Escalation path. | 2d |
| 10.13 | **Operations Console — Fairness reports** | Subgroup metric dashboards. Disparity alerts. Investigation queue. Historical fairness trends. | 1d |
| 10.14 | **Operations Console — System health** | Match quality dashboard. Calibration accuracy charts. Model version tracking. DLQ depth monitoring. Incident response tooling. | 1d |

#### Deliverables
- Confidence calibration loop with automated recalibration
- Fairness monitoring with disparity detection and alerts
- Model governance gates (evaluation, canary, rollback)
- Full internal operations console (moderation, audit, disputes, fairness, system health)
- Expanded analytics for match quality and conversion

---

## 3. Model Architecture Summary

### Two-Tower Retrieval

```
Candidate Tower:                    Role Tower:
  Professional Identity Graph         Team Needs Graph
  ├── Experience embeddings           ├── Requirements embeddings
  ├── Skills embeddings               ├── Culture signal embeddings
  ├── Preference embeddings           ├── Growth opportunity embeddings
  └── Growth trajectory embeddings    └── Compensation/location embeddings
           │                                    │
     Dense layers                         Dense layers
     768 -> 512 -> 256                    768 -> 512 -> 256
           │                                    │
     128-dim vector                       128-dim vector
           │                                    │
           └──────── Cosine Similarity ─────────┘
                     + Temperature Scaling
                            │
                     Raw match score (0-1)
```

### Six-Dimension Reranking

| Dimension | Method | Key Signals |
|---|---|---|
| Capability Alignment | NER + semantic similarity + classification | Skills match, experience relevance, requirement satisfaction |
| Growth Trajectory | Sequence model + attention | Career direction, learning signals, opportunity fit |
| Culture Compatibility | Classification + sentiment | Work style, values alignment, communication fit |
| Values/Mission | NLP + NER + regression | Mission alignment, values extraction |
| Practical Compatibility | Rules + ML + geospatial | Compensation, location, timeline |
| Mutual Advantage | Statistical + regression | Rarity, two-sided benefit prediction |

---

## 4. Model Governance Pipeline

```
1. Development: Train model with consent-gated data
       │
2. Offline Evaluation: precision, recall, NDCG, fairness checks
       │
3. Gate: All metrics within acceptable bounds?
       │ Yes                    │ No
       ▼                        ▼
4. Shadow Deploy (parallel)   Block promotion
       │
5. Canary (5% traffic, 30 min)
       │
6. Gate: Error rate, latency, calibration, fairness?
       │ Pass                   │ Fail
       ▼                        ▼
7. Promote (50% -> 100%)     Automatic rollback
       │                        + model.rollback.executed event
8. Monitor continuously
       │
9. Drift detected?
       │ Yes
       ▼
   Auto-rollback to last known-good tuple
```

---

## 5. Operations Console Modules

| Module | Purpose | Key Features |
|---|---|---|
| **Moderation Dashboard** | Review flagged content | Tier-4 posting review queue, user reports, enforcement actions |
| **Consent Audit Viewer** | Compliance verification | Per-user consent timeline, training eligibility snapshots |
| **Dispute Management** | Resolve user disputes | Triage queue, resolution workflow, escalation path, SLA tracking |
| **Fairness Report Viewer** | Monitor algorithmic fairness | Subgroup metrics, disparity alerts, investigation queue |
| **Incident Response** | System operational health | DLQ monitoring, model version tracking, calibration charts, alert management |

---

## 6. Event Contracts Introduced

| Event | Producer | Consumers |
|---|---|---|
| `model.rollback.executed` | Model governance | Audit, Ops console |
| `fairness.disparity.detected` | Fairness monitoring | Ops console, Investigation queue |
| `model.canary.promoted` | Model governance | Audit |
| `model.evaluation.completed` | ML pipeline | Model registry, Governance |

---

## 6.1 API Endpoints Delivered

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/internal/match/:id/outcome` | Internal service | Record match outcome (interview, offer, hired, rejected) |
| `GET` | `/internal/audit/events` | Internal service | Enhanced audit event query with rich filtering |
| `GET` | `/internal/moderation/queue` | Internal service (ops) | List items awaiting moderation review |
| `POST` | `/internal/moderation/review` | Internal service (ops) | Submit moderation decision on flagged item |
| `GET` | `/internal/disputes/queue` | Internal service (ops) | List disputes with priority sorting |
| `GET` | `/internal/disputes/:id` | Internal service (ops) | Get dispute detail with full context |
| `POST` | `/internal/disputes` | Internal service | Create new dispute |
| `PATCH` | `/internal/disputes/:id/resolve` | Internal service (ops) | Resolve a dispute with outcome and reason |
| `GET` | `/internal/fairness/report` | Internal service (ops) | Generate fairness report for a given time range |
| `GET` | `/internal/model/versions` | Internal service (ops) | List model versions with governance status |

### API Request/Response Contracts

#### Match Outcome Tracking

```yaml
POST /api/v1/internal/match/:id/outcome
  Description: Record match outcome for calibration feedback loop
  Auth: Required (internal service)
  Request:
    {
      "outcome": "interview" | "offer" | "hired" | "rejected" | "no_response",
      "outcomeAt": "timestamp",
      "metadata": {
        "source": "employer_reported" | "candidate_reported" | "system_inferred",
        "notes": "string (optional)"
      }
    }
  Response: 200
    {
      "matchId": "uuid",
      "outcome": "interview",
      "outcomeAt": "timestamp",
      "updatedAt": "timestamp"
    }
```

#### Moderation Queue

```yaml
GET /api/v1/internal/moderation/queue
  Description: List items awaiting moderation review
  Auth: Required (internal service, ops role)
  Query Params:
    - page: number (default: 1)
    - limit: number (default: 20)
    - status: string (pending, in_review)
    - itemType: string (posting, report, content)
    - priority: string (high, medium, low)
  Response: 200
    {
      "data": [
        {
          "id": "uuid",
          "itemType": "posting",
          "itemId": "uuid",
          "reason": "auto_flagged_abuse_classifier",
          "priority": "high",
          "status": "pending",
          "createdAt": "timestamp",
          "preview": {
            "title": "string",
            "flaggedPhrases": ["string"]
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 8
      }
    }

POST /api/v1/internal/moderation/review
  Description: Submit moderation decision on flagged item
  Auth: Required (internal service, ops role)
  Request:
    {
      "itemId": "uuid",
      "decision": "approve" | "reject" | "quarantine" | "escalate",
      "reason": "string",
      "editedContent": {} (optional, for "edit and approve")
    }
  Response: 200
    {
      "itemId": "uuid",
      "decision": "approve",
      "reviewedBy": "uuid",
      "reviewedAt": "timestamp",
      "auditEventId": "uuid"
    }
```

#### Dispute Management

```yaml
POST /api/v1/internal/disputes
  Description: Create new dispute
  Auth: Required (internal service)
  Request:
    {
      "disputeType": "match_quality" | "introduction_issue" | "data_accuracy" | "bias_concern" | "other",
      "subjectType": "match" | "introduction" | "posting" | "profile",
      "subjectId": "uuid",
      "description": "string",
      "evidence": [
        {
          "type": "screenshot" | "text" | "reference",
          "content": "string"
        }
      ]
    }
  Response: 201
    {
      "id": "uuid",
      "status": "open",
      "priority": "medium",
      "createdAt": "timestamp",
      "estimatedResponseTime": "48 hours"
    }

GET /api/v1/internal/disputes/queue
  Description: List disputes with triage workflow
  Auth: Required (internal service, ops role)
  Query Params:
    - page: number (default: 1)
    - limit: number (default: 20)
    - status: string (open, in_review, resolved, escalated)
    - priority: string (high, medium, low)
    - assignedTo: uuid (optional)
  Response: 200
    {
      "data": [
        {
          "id": "uuid",
          "disputeType": "bias_concern",
          "status": "open",
          "priority": "high",
          "subjectType": "match",
          "subjectId": "uuid",
          "createdAt": "timestamp",
          "slaDeadline": "timestamp",
          "assignedTo": "uuid | null"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 5
      }
    }

GET /api/v1/internal/disputes/:id
  Description: Get dispute detail with full context
  Auth: Required (internal service, ops role)
  Response: 200
    {
      "id": "uuid",
      "disputeType": "match_quality",
      "status": "in_review",
      "priority": "medium",
      "subjectType": "match",
      "subjectId": "uuid",
      "description": "string",
      "evidence": [],
      "timeline": [
        {
          "action": "created",
          "actorId": "uuid",
          "timestamp": "timestamp",
          "notes": "string"
        }
      ],
      "assignedTo": "uuid",
      "createdAt": "timestamp",
      "slaDeadline": "timestamp"
    }

PATCH /api/v1/internal/disputes/:id/resolve
  Description: Resolve a dispute with outcome and reason
  Auth: Required (internal service, ops role)
  Request:
    {
      "resolution": "resolved_in_favor" | "resolved_against" | "no_action" | "escalated",
      "reasonCode": "string",
      "notes": "string",
      "actions": [
        {
          "type": "rescore_match" | "flag_posting" | "warn_user" | "suspend_user" | "none",
          "targetId": "uuid"
        }
      ]
    }
  Response: 200
    {
      "id": "uuid",
      "status": "resolved",
      "resolution": "resolved_in_favor",
      "resolvedBy": "uuid",
      "resolvedAt": "timestamp",
      "auditEventId": "uuid"
    }
```

#### Fairness Reporting

```yaml
GET /api/v1/internal/fairness/report
  Description: Generate fairness report for a given time range
  Auth: Required (internal service, ops role)
  Query Params:
    - from: timestamp
    - to: timestamp
    - sliceBy: string (optional: confidence_tier, score_range, source_tier)
  Response: 200
    {
      "reportId": "uuid",
      "period": {
        "from": "timestamp",
        "to": "timestamp"
      },
      "summary": {
        "totalMatchesScored": 12500,
        "disparityAlertsTriggered": 2,
        "overallCalibrationError": 0.04
      },
      "sliceMetrics": [
        {
          "sliceName": "strong_confidence",
          "matchCount": 3200,
          "meanScore": 88.5,
          "outcomeRate": 0.42,
          "calibrationError": 0.03,
          "disparityRatio": 1.05
        }
      ],
      "alerts": [
        {
          "type": "disparity_threshold_exceeded",
          "sliceName": "stretch_confidence",
          "metric": "outcomeRate",
          "value": 1.28,
          "threshold": 1.20,
          "severity": "warning"
        }
      ],
      "generatedAt": "timestamp"
    }
```

#### Model Version Management

```yaml
GET /api/v1/internal/model/versions
  Description: List model versions with governance status
  Auth: Required (internal service, ops role)
  Query Params:
    - status: string (optional: candidate, canary, promoted, rolled_back)
    - limit: number (default: 10)
  Response: 200
    {
      "data": [
        {
          "modelVersion": "string",
          "promptVersion": "string",
          "evaluatorVersion": "string",
          "status": "promoted",
          "evaluationResults": {
            "precision": 0.87,
            "calibrationError": 0.04,
            "fairnessDisparity": 0.08,
            "explainabilityCompleteness": 1.0
          },
          "deployedAt": "timestamp",
          "promotedAt": "timestamp",
          "trafficPercentage": 100
        }
      ]
    }
```

---

## 7. Testing Requirements

| Category | Tool | Scope | Coverage Target |
|---|---|---|---|
| Unit tests | Vitest (TS) / pytest (Python) | Each dimension scorer, composite scorer, confidence classifier, calibration loop | 100% for scoring and calibration |
| ML evaluation | pytest + golden test sets | Golden test sets for two-tower model, per-dimension scorers | All evaluation gates passing |
| Fairness tests | pytest | Statistical parity, equalized odds on test populations | Disparity within approved bounds |
| Integration tests | Vitest + Supertest + testcontainers | Full scoring pipeline end-to-end, model serving, rollback mechanism | 80%+ |
| Ops console tests | Playwright | Moderation workflow, dispute resolution, consent audit queries | Key flows tested |
| Load tests | k6 | Two-tower inference latency, scoring pipeline throughput | p95 match scoring < 30s end-to-end |
| Rollback drill | Manual + k6 | Model rollback from canary to known-good | Successfully executed |

---

## 8. Exit Criteria

- [ ] Confidence calibration within defined error bounds
- [ ] Fairness disparity alerts operational (detection + alerting verified)
- [ ] Model rollback drill executed successfully
- [ ] All six dimension scorers producing scores
- [ ] Two-tower retrieval model deployed and serving
- [ ] Ops console functional: moderation, audit, disputes, fairness, health
- [ ] Model governance gates enforced (no ungated model promotion)
- [ ] Expanded analytics dashboards operational
- [ ] All SLOs from Architecture Section 6.9 met

---

## 9. Key Risks (Phase 4)

| Risk | Impact | Mitigation |
|---|---|---|
| Model training data insufficient | Poor scoring quality | Start collecting outcome data early (Phase 2-3); supplement with synthetic data |
| Two-tower model latency | Scoring pipeline exceeds 30s SLO | Model quantization, ONNX Runtime, batching, caching; fallback to MVP algorithm |
| Fairness audit reveals disparities | Legal and ethical risk | Mitigation strategies in architecture (blind matching, adversarial debiasing); disparity investigation queue |
| Calibration drift between phases | Confidence scores misleading | Automated weekly recalibration; drift alerts; rollback on threshold breach |
| Ops console scope creep | Delays to Phase 4 exit | MVP ops console (moderation + audit + disputes minimum); advanced features can follow post-launch |

---

## 10. Sprint Acceptance Criteria

### Sprint 9 Exit Checks (Full Scoring + Governance)

- [ ] Six-dimension scorers operational (capability, growth, culture, values, practical, mutual advantage)
- [ ] Confidence classifier (`Strong`, `Promising`, `Stretch`, `Weak`) producing outputs for all scored matches
- [ ] Calibration pipeline running and calibration report showing acceptable bucket reliability
- [ ] Two-tower retrieval model serving path deployed behind feature flag (canary mode)
- [ ] Two-tower canary shows improved recall without SLO regression
- [ ] Fairness monitoring jobs and disparity alert pipeline operational with runbook linkage
- [ ] Model tuple governance enforced (`model_version`, `prompt_version`, `evaluator_version`)
- [ ] Confidence calibration within agreed error bounds

### Sprint 10 Exit Checks / Phase 4 Gate

- [ ] Internal Operations Console v1 functional: moderation, consent audit viewer, fairness reports, disputes
- [ ] Model rollback automation and drift alarms operational
- [ ] Rollback drill executed successfully in staging
- [ ] SLO dashboards and error budget monitoring live
- [ ] DR runbook validation complete (RPO <= 1 hour, RTO <= 4 hours)
- [ ] Unauthorized introduction attempts remain zero across all environments
- [ ] All SLOs from Architecture Section 6.9 green for two consecutive weeks
- [ ] Governance gates enforced — no ungated model promotion to production
- [ ] Launch readiness review and go/no-go packet prepared and reviewed
