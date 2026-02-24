# Phase 3: Clearview + Double Opt-In Introductions

**Duration:** 5 weeks (2.5 sprints)
**Depends on:** Phase 2 (Aggregation + Basic Matching — ends Week 14)
**Enables:** Phase 4 (Resonance Core Full)

---

## 1. Phase Goal

Build the employer-facing engine (Clearview) with role definition, posting analysis, and candidate match management. Implement the full double opt-in introduction state machine with policy-gated introductions. This phase makes Resonance a two-sided marketplace.

---

## 2. Sprint Breakdown

### Sprint 7 (Weeks 15-16): Employer Onboarding + Role Definition

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 7.1 | **Employer auth and organization management** | Employer OAuth (Google, LinkedIn). Organization creation: `POST /employer/organizations`. Multi-user support: admin, recruiter, hiring_manager roles. RBAC via `employer_users.permissions`. Row-level security: `app.current_employer_id` session variable enforcement. | 3d |
| 7.2 | **Role definition API** | `POST/GET/PATCH /employer/roles`, `GET /employer/roles/:id`. AI-guided flow: RequirementChallenger (challenge inflated requirements via Claude). RealWorkCapture (months 1-3, 3-6, 6-12 responsibilities). TeamGapAnalyzer (team composition + gap description). HiddenRequirementSurface (political dynamics, legacy challenges, timeline pressure). | 3d |
| 7.3 | **Culture Signal capture** | DecisionStyleClassifier, CommunicationPatternMapper, ValueInPracticeExtractor. Structured questionnaire + AI-assisted extraction. Store as part of role profile. | 2d |
| 7.4 | **Posting analysis engine** | `GET /employer/roles/:id/analysis`. ClarityScorer: evaluate posting clarity (vague language detection). InclusivityAnalyzer: gendered language, exclusionary phrases, bias detection. RequirementCalibrator: are requirements realistic for compensation offered? MarketBenchmarker: how does this role compare to similar postings? | 3d |
| 7.5 | **Role embedding generation** | Generate embeddings for each role profile. Regenerate on role update. Emit `employer.role.updated` event. Trigger match rescoring. | 1d |
| 7.6 | **Employer claim flow** | `POST /aggregation/postings/claim`. Employer claims auto-detected posting (Tier 2-3). Links `job_postings.role_id` to employer-created role. Upgrades posting confidence to Tier 1 with full Team Needs Graph data. | 2d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 7.7 | **Employer signup and org setup** | Employer registration flow. Company profile creation. Team member invitations. Role selector (admin/recruiter/hiring manager). | 2d |
| 7.8 | **Role definition wizard** | Step-by-step role creation: requirements (must-have vs nice-to-have with AI challenge), real day-to-day work, team composition, success criteria, growth opportunity. AI-assisted requirement prioritization ("If you could only have 5, which would they be?"). | 3d |
| 7.9 | **Culture signal questionnaire** | Interactive form for decision-making style, communication patterns, pace, autonomy level, values in practice. | 1d |
| 7.10 | **Posting analysis dashboard** | Clarity score visualization. Inclusivity report with flagged phrases and suggestions. Requirement calibration feedback. Market comparison. | 2d |

#### Deliverables
- Employer onboarding, authentication, and RBAC
- AI-guided role definition with requirement challenging
- Posting analysis (clarity, inclusivity, calibration, benchmarking)
- Role embeddings generated and triggering match rescoring
- Employer can claim aggregated postings

---

### Sprint 8 (Weeks 17-18): Employer Match Feed + Double Opt-In State Machine

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 8.1 | **Employer match feed (CQRS)** | `employer_match_feed` read model. Projected from `match.scored` and `match.employer.decisioned` events. Candidate evidence cards per role. Filtered by role, sorted by confidence. | 2d |
| 8.2 | **Employer match API** | `GET /employer/matches` — paginated match feed per role. `POST /employer/matches/:id/respond` — interested/save/pass with required `decision_reason_code`. Employer decision validation: auth + role ownership check. | 2d |
| 8.3 | **Introduction state machine** | Full state machine per Architecture Section 3.6. States: `discovered` through `introduced` and terminal states. Candidate-first flow, employer-first flow, convergence flow. All transitions enforce auth and ownership checks. Terminal reason codes recorded. | 4d |
| 8.4 | **Policy engine — intro preconditions** | `POST /internal/policy/evaluate`. Policy checks before introduction creation: both parties must be in `interested` state, valid consent state for both parties, no active moderation flags. Policy decision logged immutably. | 2d |
| 8.5 | **Introduction broker + role snapshot** | `POST /internal/introductions/:matchId/attempt`. Only executes after policy engine returns `allow`. Creates introduction record. **Role Snapshot:** on `match.introduction.created`, persist a canonical point-in-time snapshot of the `RoleProfile` (title, requirements, compensation, location, work-model, responsibilities) to `introduction_role_snapshots`, linked to the introduction record. Snapshot is immutable and serves as the contractual baseline for the role at introduction time. Sends introduction materials to both parties. Emit `match.introduction.created` event. Record in audit trail. | 3d |
| 8.5b | **Materiality diff engine** | Hooks into `PATCH /employer/roles/:id` (task 7.2). On any update to an active role, diff the incoming `RoleProfile` against all active `introduction_role_snapshots` for that role. **Material change fields:** compensation range, location/work-model (e.g., remote changed to hybrid/onsite), must-have requirements added/removed, seniority level, title. On material change detected: emit `role.material_change.detected` event, auto-notify affected candidates currently in the pipeline with a structured diff summary, and present `proceed` / `exit_gracefully` options via `POST /candidate/introductions/:id/material-change-response`. Employer is informed that candidates have been notified of changes. Non-material changes (description copy, nice-to-have tweaks) are silent. | 3d |
| 8.6 | **Introduction timeline (CQRS)** | `introduction_timeline` read model. State transitions projected for both UIs and ops console. | 1d |
| 8.7 | **Notification service** | SendGrid integration for match notifications and introduction emails. Template management with version control. Delivery tracking. Candidate notification preferences respected (opt-in). No unsolicited outreach — only triggered by explicit match surfacing or introduction. | 2d |
| 8.8 | **Policy decision logging** | `policy_decision_logs` table population. Every policy evaluation (allow/deny) recorded with inputs, outcome, reason code, actor, timestamp. Queryable via `GET /internal/audit/events`. | 1d |
| 8.9 | **Dispute resolution intake** | `POST /disputes`. `GET /disputes/:id`. `GET /internal/disputes/queue` (ops). Database table for disputes. Status tracking: open, in_review, resolved, escalated. | 1d |
| 8.10 | **Consent revocation cascade** | When candidate revokes consent: close active matches, cancel pending intros, suppress from employer feeds, mark embeddings for deletion. Per Architecture Section 6.4.1. Transactional workflow with DLQ for partial failures. | 2d |
| 8.11 | **Introduction outcome tracking** | Record post-introduction outcomes: no_response, interview_scheduled, interview_completed, offer_extended, hired, rejected. Timestamps for all transitions. Store in `introduction_outcomes` table. Feed into Phase 4 calibration loop. Emit `introduction.outcome.recorded` events. | 2d |
| 8.12 | **Email deliverability setup** | Configure SPF, DKIM, and DMARC records for sending domain. SendGrid domain authentication. Dedicated IP warm-up plan (if using dedicated IP). Email template rendering tests across major email clients. Bounce and complaint handling. | 1d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 8.13 | **Employer match feed UI** | Candidate cards per role with evidence summaries. Confidence tier badges. Explainability reasoning. Filter by match tier. Sort by score. | 3d |
| 8.14 | **Employer decision interaction** | Interested/Save/Pass buttons with required reason code dropdown. Decision confirmation. Optimistic UI update. | 1d |
| 8.15 | **Introduction status UI** | For both candidates and employers: introduction progress view. State machine visualization (pending -> matched -> introduced). Introduction details when both sides opt in. | 2d |
| 8.16 | **Candidate match feed update** | Update candidate match feed to show introduction status. Distinguish between "waiting for employer" and "introduced" states. No exposure of one-sided decisions (per double opt-in principle). | 1d |

#### Deliverables
- Employer match feed with candidate evidence cards
- Employer decision recording with reason codes
- Full double opt-in introduction state machine
- Policy-gated introduction creation
- Role snapshot persisted at introduction time (bait-and-switch prevention)
- Materiality diff engine detecting material role changes and notifying pipeline candidates
- Introduction notifications via email (with deliverability configured)
- Consent revocation cascade operational
- Introduction outcome tracking for Phase 4 ML training
- Dispute resolution intake

---

### Sprint 8.5 (Week 19): Integration, Polish, Hardening

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 8.17 | **End-to-end flow testing** | Full candidate-employer lifecycle: profile creation -> matching -> mutual interest -> introduction. Verify all guardrails: no intro without both decisions, no notification leaks, policy logging. | 2d |
| 8.18 | **Eventual consistency verification** | Verify CQRS read model propagation < 5 seconds for decisions, < 5 minutes for scoring. Fallback to write path on projection failure. Lag monitoring alerts configured. | 1d |
| 8.19 | **Calendar integration (opt-in)** | Google Calendar / Outlook OAuth. Interview scheduling assistance. Prep reminders before scheduled interviews. Feature-flagged, opt-in only. | 2d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 8.20 | **Employer dashboard** | Role management overview. Active match counts per role. Introduction status summary. Quick actions. | 2d |
| 8.21 | **Cross-app polish** | Consistent design language between candidate and employer UIs. Error states, loading states, empty states. Accessibility review. | 2d |

#### Deliverables
- End-to-end two-sided flow verified
- Calendar integration (opt-in, feature-flagged)
- Polish across both candidate and employer experiences

---

## 3. Data Model Updates (Phase 3)

Tables populated that were deployed in Phase 2:
- `employers` (now with data)
- `employer_users` (now with data)
- `roles` (full Team Needs Graph data for Tier 1)

New tables:
- `policy_decision_logs` (populated by policy engine)
- `introduction_outcomes` (outcome tracking for ML training)
- `introduction_role_snapshots` (immutable point-in-time `RoleProfile` snapshots created at introduction time; used as contractual baseline for materiality diff)
- Disputes table (new)

Updated tables:
- `matches` — employer_status, introduction_status fields now active
- `job_postings` — `role_id` linkage for claimed postings

---

## 4. API Endpoints Delivered

```
# Employer
POST   /employer/organizations
GET    /employer/organizations/:id
POST   /employer/roles
GET    /employer/roles
GET    /employer/roles/:id
PATCH  /employer/roles/:id
GET    /employer/roles/:id/analysis
GET    /employer/matches
POST   /employer/matches/:id/respond

# Aggregation
POST   /aggregation/postings/claim

# Internal - Introductions
POST   /internal/introductions/:matchId/attempt
GET    /internal/introductions/:id/state
POST   /internal/policy/evaluate
GET    /internal/audit/events

# Disputes
POST   /disputes
GET    /disputes/:id
GET    /internal/disputes/queue

# Candidate — Material Change Response
POST   /candidate/introductions/:id/material-change-response
```

### API Request/Response Contracts

#### Employer Organization

```yaml
POST /api/v1/employer/organizations
  Request: { "name": "string", "domain": "string", "size": "startup|mid|enterprise", "industry": "string" }
  Response: 201
    { "id": "uuid", "name": "string", "subscriptionTier": "standard", "createdAt": "timestamp" }
```

#### Role Management

```yaml
POST /api/v1/employer/roles
  Request:
    {
      "title": "string",
      "department": "string",
      "location": {},
      "mustHaveRequirements": ["string"],
      "niceToHaveRequirements": ["string"],
      "seniorityLevel": "string",
      "months1to3Responsibilities": "string",
      "months3to6Responsibilities": "string",
      "months6to12Responsibilities": "string",
      "successCriteria6Months": "string",
      "salaryRangeMin": 150000,
      "salaryRangeMax": 200000
    }
  Response: 201
    {
      "id": "uuid",
      "title": "string",
      "status": "draft",
      "requirementChallengerSuggestions": [
        { "requirement": "10+ years experience", "suggestion": "Consider reducing to 5+ years to broaden candidate pool" }
      ],
      "createdAt": "timestamp"
    }

GET /api/v1/employer/roles/:id/analysis
  Response: 200
    {
      "clarityScore": 0.85,
      "claritySuggestions": ["Consider replacing 'rockstar' with specific requirements"],
      "inclusivityScore": 0.72,
      "inclusivityIssues": [
        { "phrase": "aggressive growth", "issue": "May discourage some candidates", "suggestion": "ambitious growth" }
      ],
      "requirementCalibration": {
        "salaryVsRequirements": "below_market",
        "suggestion": "Your requirements exceed typical for this salary range"
      },
      "biasFlags": []
    }
```

#### Employer Matches

```yaml
GET /api/v1/employer/matches
  Query: page, limit, roleId (uuid), tier
  Response: 200
    {
      "data": [{
        "id": "uuid",
        "roleId": "uuid",
        "roleTitle": "Senior Software Engineer",
        "candidate": {
          "headline": "Backend Engineer with 8 years experience",
          "location": "San Francisco, CA",
          "topSkills": ["Python", "System Design", "PostgreSQL"],
          "yearsExperience": 8
        },
        "overallScore": 91,
        "matchTier": "strong",
        "strengths": ["Strong backend experience", "Culture fit"],
        "gaps": ["Limited frontend exposure"],
        "candidateStatus": "pending",
        "employerStatus": "pending"
      }]
    }

POST /api/v1/employer/matches/:id/respond
  Request:
    { "decision": "interested", "decisionReasonCode": "strong_capability_fit", "notes": "string (optional)" }
  Response: 200
    { "matchId": "uuid", "employerStatus": "interested", "introductionStatus": "candidate_pending" }
```

#### Introduction and Policy

```yaml
POST /api/v1/internal/introductions/:matchId/attempt
  Auth: Internal service
  Response: 200
    {
      "introductionId": "uuid",
      "status": "created",
      "candidateContact": { "email": "candidate@example.com" },
      "employerContact": { "email": "recruiter@company.com" }
    }
  Error: 403
    { "error": "Policy denied", "reasonCode": "missing_consent", "policyDecisionLogId": "uuid" }

POST /api/v1/internal/policy/evaluate
  Request: { "policyName": "introduction_creation", "inputRefs": ["match:uuid", "candidate:uuid", "employer:uuid"] }
  Response: 200 { "outcome": "allow", "decisionLogId": "uuid" }

GET /api/v1/internal/audit/events
  Query: category, subjectId, actorId, from, to, page, limit
  Response: 200
    { "data": [{ "id": "uuid", "category": "consent", "subjectId": "uuid", "actorId": "uuid", "metadata": {}, "timestamp": "timestamp" }] }
```

#### Candidate Material Change Response

```yaml
POST /api/v1/candidate/introductions/:id/material-change-response
  Auth: Candidate
  Request:
    { "decision": "proceed | exit_gracefully", "reason": "string (optional)" }
  Response: 200
    {
      "introductionId": "uuid",
      "decision": "proceed",
      "snapshotId": "uuid",
      "materialChanges": [
        { "field": "compensationMax", "was": 200000, "now": 170000 },
        { "field": "workModel", "was": "remote", "now": "hybrid" }
      ]
    }
  Notes: >
    Triggered after `role.material_change.detected` event notifies the candidate.
    If candidate chooses `exit_gracefully`, the introduction enters `candidate_exited_material_change` terminal state.
    If candidate chooses `proceed`, introduction continues with the updated role terms.
```

#### Row-Level Security Reference

```sql
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY employer_isolation_policy ON roles
  USING (employer_id = current_setting('app.current_employer_id')::UUID);

-- Application must set session variable per request:
-- SET LOCAL app.current_employer_id = '<employer_uuid>';
```

```typescript
class DatabaseMiddleware {
  async setRequestContext(req, res, next) {
    await db.query(`SET LOCAL app.current_employer_id = $1`, [req.user.employerId]);
    next();
  }
}
```

---

## 5. Introduction State Machine Summary

```
                    ┌─────────────┐
                    │  discovered  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            │            ▼
    ┌─────────────┐        │   ┌─────────────┐
    │  candidate   │        │   │  employer    │
    │  interested  │        │   │  interested  │
    └──────┬──────┘        │   └──────┬──────┘
           │               │          │
           │    ┌──────────┘          │
           ▼    ▼                     ▼
    ┌──────────────┐          (reverse flow)
    │both_interested│
    └──────┬───────┘
           │
           ▼ (policy check)
    ┌──────────────┐
    │  introduced   │
    └──────────────┘

Terminal states: candidate_passed, employer_passed, closed
```

All transitions are policy-enforced and audit-logged.

---

## 6. Event Contracts Introduced

| Event | Producer | Consumers |
|---|---|---|
| `employer.role.updated` | Clearview | Resonance Core (rescore candidates) |
| `match.employer.decisioned` | Clearview -> Core | Governance, Steadyhand, Read model |
| `match.introduction.created` | Intro Orchestrator | Steadyhand, Clearview, Audit, Role Snapshot Writer |
| `role.material_change.detected` | Materiality Diff Engine | Notification Service (candidate alert), Clearview (employer notice), Audit |
| `introduction.outcome.recorded` | Outcome tracker | ML training data store, Analytics, Phase 4 calibration |
| `policy.decision.logged` | Policy Engine | Audit, Ops console |
| `dispute.created` | Dispute Intake | Ops Console, Audit |

---

## 7. Testing Requirements

| Category | Scope | Coverage Target |
|---|---|---|
| Unit tests | Introduction state machine (all transitions), policy engine (all rules), reason code recording, materiality diff classification (material vs non-material changes) | 100% for intro state machine, policy, and diff engine |
| Integration tests | Employer auth + RBAC, role definition flow, posting analysis, employer match feed, introduction orchestration end-to-end, role snapshot creation on introduction, materiality diff triggering on role update with active snapshots | 80%+ |
| E2E tests | Full lifecycle: candidate matches -> mutual interest -> introduction created. One-sided interest -> no intro. | All critical paths |
| Security tests | Row-level security (employer isolation), RBAC enforcement, policy gate bypass attempts | 100% |
| Consent tests | Revocation cascade: matches closed, intros cancelled, feeds updated | 100% |
| Notification tests | No notification leaks (one-sided interest must not notify other party) | 100% |

---

## 8. Exit Criteria

- [ ] 100% of introductions created only after both decision events
- [ ] Policy denial logging enabled and verified
- [ ] No notification leak incidents (one-sided decisions never exposed)
- [ ] Employer onboarding flow complete (org creation -> role definition -> match viewing)
- [ ] Posting analysis operational (clarity, inclusivity, calibration)
- [ ] Row-level security verified (employer data isolation)
- [ ] Consent revocation cascade verified
- [ ] Introduction outcome tracking operational (events persisting correctly)
- [ ] Role snapshot mechanism verified (immutable snapshots persisted at introduction time)
- [ ] Materiality diff engine verified (material role changes trigger candidate notifications; non-material changes are silent)
- [ ] Email deliverability verified (SPF/DKIM/DMARC passing, introduction emails not in spam)
- [ ] Dispute intake operational

---

## 9. Key Risks (Phase 3)

| Risk | Impact | Mitigation |
|---|---|---|
| State machine edge cases | Unauthorized introductions, trust damage | Exhaustive state transition tests, policy engine as second gate |
| Notification leaks | Privacy violation, user trust destroyed | No outbound paths without both explicit decisions; integration tests for every state |
| Employer adoption friction | Empty marketplace, no value for candidates | Posting analysis provides standalone value; claim flow enables engagement with existing postings |
| Row-level security misconfiguration | Data breach between employers | Integration tests verify zero-row return without session variable; security review for all employer queries |
| Consent cascade complexity | Compliance gaps on revocation | Transactional workflow with DLQ for failures; audit log for partial cascades |
| Role bait-and-switch | Employer changes role terms after introduction, eroding candidate trust | Immutable role snapshots at introduction time; materiality diff engine auto-notifies candidates of material changes with exit option |
| Materiality classification false positives | Candidates over-notified on non-material changes, causing fatigue | Conservative materiality thresholds; only trigger on defined material fields (comp, location, must-haves, seniority, title); iteration based on candidate feedback |

---

## 10. Sprint Acceptance Criteria

### Sprint 7 Exit Checks (Employer Onboarding + Role Definition)

- [ ] Employer org/user auth and role ownership boundaries (RLS enforced)
- [ ] Role Definition flow operational (must-have vs nice-to-have, real-work capture, team gap capture)
- [ ] Culture signal capture and posting analysis (clarity, inclusivity, calibration) generating outputs for active roles
- [ ] Employer role lifecycle (`draft`, `active`, `paused`, `closed`) persisting correctly
- [ ] Employer-side audit logging for decision and role edits
- [ ] Employer isolation policy enforced in integration tests (zero-row return without session variable)
- [ ] Role analysis outputs generated and persisted for all active roles

### Sprint 8 Exit Checks (Double Opt-In + Introduction Orchestration)

- [ ] Employer match feed CQRS projection with evidence cards rendering within SLO
- [ ] Candidate and employer decision endpoints with reason codes operational
- [ ] Introduction state machine implementation (`discovered` to terminal states) complete
- [ ] Policy-gated intro attempts via `IntroductionOrchestrator` and `Policy Engine` enforced
- [ ] 100% of introductions require both explicit decisions — no exceptions
- [ ] Policy denial logging enabled with reason codes for every denied attempt
- [ ] No notification leak incidents (one-sided decisions never exposed to the other party)
- [ ] Consent revocation cascade verified (matches closed, intros cancelled, feeds updated)
- [ ] Role snapshot created and persisted for every introduction (immutable baseline)
- [ ] Materiality diff engine operational: material role changes trigger candidate notification with diff and proceed/exit options
- [ ] Non-material role changes do not trigger candidate notifications

### Sprint 8.5 / Phase 3 Gate

- [ ] End-to-end two-sided flow tested: employer onboarding → role definition → match viewing → candidate decision → employer decision → introduction creation
- [ ] CQRS propagation timing within SLA (< 5 minutes lag for match feed projections)
- [ ] Introduction outcome tracking operational (events persisting correctly, timeline read model accurate)
- [ ] Dispute intake and triage APIs operational
- [ ] No notification leak incidents in staging and pilot environments
- [ ] Consent revocation cascade is auditable end-to-end
