# Resonance — Full System Architecture Plan

**Version:** 2.1
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
| `IntroState` | `discovered`, `candidate_interested`, `candidate_saved`, `candidate_passed`, `employer_interested`, `employer_saved`, `employer_passed`, `both_interested`, `candidate_interested_employer_saved`, `employer_interested_candidate_saved`, `introduced`, `closed` | Introduction state machine |
| `ConfidenceBucket` | `Strong`, `Promising`, `Stretch`, `Weak` | Ranking + UX behavior contract |

### 2.4 Database Schema (SQL)

#### 2.4.1 Candidate Tables

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,

  profile_status VARCHAR(50) DEFAULT 'incomplete',
  profile_completeness_score DECIMAL(5,4) DEFAULT 0.0000, -- range: 0.0000 to 1.0000

  visibility VARCHAR(50) DEFAULT 'matches_only',
  allow_contact BOOLEAN DEFAULT false,
  match_notification_opt_in BOOLEAN DEFAULT true,
  model_training_opt_in BOOLEAN DEFAULT false,
  model_training_opt_in_at TIMESTAMP WITH TIME ZONE,
  model_training_opt_out_at TIMESTAMP WITH TIME ZONE,
  consent_version VARCHAR(50),

  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  last_match_notification_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE candidate_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,
  consent_value BOOLEAN NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) NOT NULL -- 'onboarding', 'settings', 'api'
);

CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  raw_description TEXT,

  skills_demonstrated JSONB DEFAULT '[]',
  themes JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  evidence_strength DECIMAL(5,4) DEFAULT 0.0000, -- range: 0.0000 to 1.0000

  source VARCHAR(50), -- 'conversation', 'import', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  embedding vector(1536)
);

CREATE INDEX idx_experiences_candidate ON experiences(candidate_id);
CREATE INDEX idx_experiences_embedding ON experiences USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE candidate_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE, -- 1:1 with candidate

  role_types JSONB DEFAULT '[]',
  seniority_levels JSONB DEFAULT '[]',
  industries JSONB DEFAULT '[]',

  work_arrangements JSONB DEFAULT '[]',
  work_style_preferences JSONB DEFAULT '{}',

  min_salary_expectation INTEGER,
  max_salary_expectation INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  equity_preference VARCHAR(50),

  locations JSONB DEFAULT '[]',
  willing_to_relocate BOOLEAN DEFAULT false,

  growth_areas JSONB DEFAULT '[]',
  career_trajectory TEXT,

  dealbreakers JSONB DEFAULT '[]',
  non_negotiables JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE growth_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE, -- 1:1 with candidate

  skills_in_progress JSONB DEFAULT '[]',
  identified_growth_edges JSONB DEFAULT '[]',

  short_term_goals TEXT,
  long_term_goals TEXT,
  trajectory_direction VARCHAR(100),

  topics_engaged JSONB DEFAULT '[]',
  projects_pursued JSONB DEFAULT '[]',

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profile_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,

  document_type VARCHAR(50), -- 'resume', 'cover_letter', 'portfolio'
  file_name VARCHAR(255),
  file_url TEXT,
  file_size INTEGER,

  parsed_text TEXT,
  parsed_structured JSONB DEFAULT '{}',

  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_status VARCHAR(50) DEFAULT 'pending'
);
```

#### 2.4.2 Employer Tables

```sql
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),

  size VARCHAR(50), -- 'startup', 'mid', 'enterprise'
  industry VARCHAR(100),
  founded_year INTEGER,
  headquarters_location JSONB,

  subscription_tier VARCHAR(50),
  subscription_status VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE employer_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,

  role VARCHAR(100), -- 'admin', 'recruiter', 'hiring_manager'
  permissions JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  created_by UUID REFERENCES employer_users(id),

  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location JSONB,

  must_have_requirements JSONB DEFAULT '[]',
  nice_to_have_requirements JSONB DEFAULT '[]',
  seniority_level VARCHAR(50),

  months_1_3_responsibilities TEXT,
  months_3_6_responsibilities TEXT,
  months_6_12_responsibilities TEXT,

  success_criteria_6_months TEXT,

  team_composition JSONB DEFAULT '{}',
  team_gap_description TEXT,

  growth_opportunities JSONB DEFAULT '[]',
  career_path TEXT,

  decision_making_style VARCHAR(100),
  communication_style VARCHAR(100),
  pace VARCHAR(100),
  autonomy_level VARCHAR(100),
  values_in_practice JSONB DEFAULT '[]',

  hidden_requirements JSONB DEFAULT '{}',

  salary_range_min INTEGER,
  salary_range_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  equity_offered BOOLEAN,
  benefits_summary JSONB DEFAULT '{}',

  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'closed'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  embedding vector(1536)
);

CREATE INDEX idx_roles_employer ON roles(employer_id);
CREATE INDEX idx_roles_embedding ON roles USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  source VARCHAR(50), -- 'clearview', 'indeed', 'linkedin', 'company_page', 'candidate_submit'
  source_id VARCHAR(255),
  source_url TEXT,
  role_id UUID REFERENCES roles(id),

  title VARCHAR(255),
  company_name VARCHAR(255),
  description TEXT,
  requirements JSONB DEFAULT '{}',

  location JSONB,
  work_arrangement VARCHAR(50),

  salary_min INTEGER,
  salary_max INTEGER,

  data_quality_tier INTEGER, -- 1-4
  confidence_score DECIMAL(3,2),

  embedding vector(1536),

  posted_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

#### 2.4.3 Matching Tables

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  role_id UUID REFERENCES roles(id),
  job_posting_id UUID REFERENCES job_postings(id),

  -- A match must reference at least one of role_id or job_posting_id.
  -- role_id: Clearview-created (Tier 1) roles with full structured data.
  -- job_posting_id: Aggregated (Tier 2-4) postings. Both set when a posting is claimed by an employer.
  CONSTRAINT match_has_target CHECK (role_id IS NOT NULL OR job_posting_id IS NOT NULL),

  overall_score DECIMAL(5,2),
  capability_alignment_score DECIMAL(5,2),
  growth_trajectory_score DECIMAL(5,2),
  culture_compatibility_score DECIMAL(5,2),
  values_alignment_score DECIMAL(5,2),
  practical_compatibility_score DECIMAL(5,2),
  mutual_advantage_score DECIMAL(5,2),

  match_tier VARCHAR(50), -- 'strong', 'promising', 'stretch', 'weak'

  match_reasoning TEXT,
  strengths JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',

  candidate_status VARCHAR(50), -- 'pending', 'interested', 'passed', 'saved'
  employer_status VARCHAR(50), -- 'pending', 'interested', 'passed', 'saved'
  candidate_responded_at TIMESTAMP WITH TIME ZONE,
  employer_responded_at TIMESTAMP WITH TIME ZONE,

  introduction_status VARCHAR(50), -- 'none', 'initiated', 'in_progress', 'completed', 'declined'
  introduction_unlocked_at TIMESTAMP WITH TIME ZONE,
  introduced_at TIMESTAMP WITH TIME ZONE,

  outcome VARCHAR(50), -- 'no_response', 'interview', 'offer', 'hired', 'rejected'
  outcome_at TIMESTAMP WITH TIME ZONE,

  -- Match staleness tracking: matches are re-evaluated on profile/role changes.
  -- Stale matches are suppressed from feeds until rescored.
  last_scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stale BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matches_candidate ON matches(candidate_id);
CREATE INDEX idx_matches_role ON matches(role_id);
CREATE INDEX idx_matches_score ON matches(overall_score DESC);
CREATE INDEX idx_matches_stale ON matches(stale) WHERE stale = true;

CREATE TABLE match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),

  user_type VARCHAR(50), -- 'candidate', 'employer'
  feedback_type VARCHAR(50), -- 'explicit_rating', 'implicit_action', 'outcome'

  rating INTEGER, -- 1-5 stars
  feedback_text TEXT,

  action_taken VARCHAR(100), -- 'interested', 'passed', 'saved', 'interviewed', 'hired'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.4.4 Governance Tables

```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type VARCHAR(50) NOT NULL, -- 'candidate', 'employer_admin'
  subject_id UUID NOT NULL,
  consent_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'granted', 'revoked', 'expired'
  consent_version VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  evidence_ref TEXT
);

CREATE TABLE policy_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  input_refs JSONB DEFAULT '[]',
  outcome VARCHAR(50) NOT NULL, -- 'allow', 'deny'
  reason_code VARCHAR(100) NOT NULL,
  actor_id UUID,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- 'consent', 'intro', 'policy', 'access', 'moderation', 'model'
  subject_id UUID NOT NULL,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE training_eligibility_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  training_eligible BOOLEAN NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance table indexes for query patterns in §7.1
CREATE INDEX idx_consent_records_lookup ON consent_records(subject_type, subject_id, consent_type);
CREATE INDEX idx_consent_records_status ON consent_records(status);
CREATE INDEX idx_audit_events_category ON audit_events(category, subject_id);
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX idx_policy_decision_logs_policy ON policy_decision_logs(policy_name, evaluated_at);
CREATE INDEX idx_training_eligibility_candidate ON training_eligibility_snapshots(candidate_id, effective_from);

-- Row-level security for multi-tenancy
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY employer_isolation_policy ON roles
  USING (employer_id = current_setting('app.current_employer_id')::UUID);

-- IMPORTANT: The `app.current_employer_id` session variable MUST be set by the
-- request-scoped database middleware before any query execution. The middleware
-- extracts the employer_id from the authenticated JWT claims and calls:
--   SET LOCAL app.current_employer_id = '<employer_uuid>';
-- This is wrapped in a transaction so the setting is scoped to the request.
-- Integration tests MUST verify that queries without the session variable set
-- return zero rows (not an error), preventing silent data leaks.
```

### 2.5 Data Retention Policy

```
Active Users:
  • Profile data: retained while account active
  • Match data: 2 years
  • Activity logs: 1 year

Inactive Users:
  • Soft delete after 2 years inactivity
  • Hard delete after 5 years
  • Anonymize for analytics before deletion

Employer Data:
  • Active roles: retained while active
  • Closed roles: 3 years
  • Aggregated analytics: retained indefinitely (anonymized)

Audit/Governance Data:
  • Consent events: retained indefinitely (compliance requirement)
  • Policy decision logs: 5 years
  • Introduction state history: 3 years
```

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
│   ├── EmotionalIntelligence
│   └── WorkflowIntegrations (calendar/email, opt-in)
├── Consent Manager
│   ├── ConsentWriteAPI
│   ├── ConsentHistoryReader
│   └── TrainingEligibilityPublisher
└── Output Layer
    ├── ApplicationDrafter
    ├── MatchFeedRenderer (CQRS read model)
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
│   ├── CandidateMatchFeed (CQRS read model)
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
6. Update CQRS read models for candidate and employer match feeds.
7. Emit match.scored.v1 event.
8. Await explicit human decisions; no intro side effects yet.
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
- Surface trust and safety tooling through an internal operations console.

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
├── Abuse/Moderation Controls
│   ├── PostingModerationRules
│   ├── ReporterTriage
│   └── EnforcementActions
├── Dispute Resolution
│   ├── DisputeIntakeAPI
│   ├── DisputeTriageQueue
│   ├── ResolutionWorkflow
│   └── EscalationPath
└── Internal Operations Console
    ├── ModerationDashboard
    ├── ConsentAuditViewer
    ├── DisputeManagementUI
    ├── FairnessReportViewer
    └── IncidentResponseTooling
```

### 3.6 Introduction State Machine

#### State Transitions

**Candidate-first flow** (candidate expresses interest before employer):

| Current State | Action | Next State | Enforcement |
|---|---|---|---|
| `discovered` | Candidate selects `interested` | `candidate_interested` | Candidate auth + match visibility check |
| `discovered` | Candidate selects `passed` | `candidate_passed` (terminal) | Record `reason_code=candidate_passed` |
| `discovered` | Candidate selects `saved` | `candidate_saved` | Candidate auth; saved is a holding state |
| `candidate_saved` | Candidate selects `interested` | `candidate_interested` | Candidate auth |
| `candidate_saved` | Candidate selects `passed` | `candidate_passed` (terminal) | Record `reason_code=candidate_passed` |
| `candidate_interested` | Employer selects `interested` | `both_interested` | Employer auth + role ownership check |
| `candidate_interested` | Employer selects `passed` | `employer_passed` (terminal) | Record `reason_code=employer_passed` |
| `candidate_interested` | Employer selects `saved` | `candidate_interested_employer_saved` | Employer auth; employer decision pending |

**Employer-first flow** (employer expresses interest before candidate):

| Current State | Action | Next State | Enforcement |
|---|---|---|---|
| `discovered` | Employer selects `interested` | `employer_interested` | Employer auth + role ownership check |
| `discovered` | Employer selects `passed` | `employer_passed` (terminal) | Record `reason_code=employer_passed` |
| `discovered` | Employer selects `saved` | `employer_saved` | Employer auth; saved is a holding state |
| `employer_saved` | Employer selects `interested` | `employer_interested` | Employer auth |
| `employer_saved` | Employer selects `passed` | `employer_passed` (terminal) | Record `reason_code=employer_passed` |
| `employer_interested` | Candidate selects `interested` | `both_interested` | Candidate auth + match visibility check |
| `employer_interested` | Candidate selects `passed` | `candidate_passed` (terminal) | Record `reason_code=candidate_passed` |
| `employer_interested` | Candidate selects `saved` | `employer_interested_candidate_saved` | Candidate auth; candidate decision pending |

**Convergence flow** (both sides have expressed interest):

| Current State | Action | Next State | Enforcement |
|---|---|---|---|
| `both_interested` | `POST /internal/introductions/:matchId/attempt` | `introduced` | Policy engine allow + consent checks |
| `candidate_interested_employer_saved` | Employer selects `interested` | `both_interested` | Employer auth |
| `employer_interested_candidate_saved` | Candidate selects `interested` | `both_interested` | Candidate auth |

**Common transitions** (apply to any non-terminal state):

| Current State | Action | Next State | Enforcement |
|---|---|---|---|
| any non-terminal | SLA timeout/retry exhausted | `closed` (terminal) | Record `reason_code=system_timeout` |
| any non-terminal | Policy denial | unchanged or `closed` | Record policy denial reason code |

#### Terminal Reason Codes
- `candidate_passed`
- `employer_passed`
- `policy_denied_missing_consent`
- `policy_denied_guardrail`
- `moderation_quarantined`
- `system_timeout`

### 3.7 CQRS Read Models

Match feeds and explainability views are served from denormalized read models optimized for fast UX rendering.

| Read Model | Source Events | Consumers | Purpose |
|---|---|---|---|
| `candidate_match_feed` | `match.scored`, `match.candidate.decisioned` | Steadyhand UI | Pre-ranked match cards with explainability summaries |
| `employer_match_feed` | `match.scored`, `match.employer.decisioned` | Clearview UI | Candidate evidence cards per role |
| `explainability_detail` | `match.scored` | Both UIs | Full dimension breakdown, strengths, gaps, rationale |
| `introduction_timeline` | `match.introduction.created`, state transitions | Both UIs + Ops Console | Introduction progress and history |

Read model projections are rebuilt from events on schema change. Write path remains the source of truth.

#### 3.7.1 Eventual Consistency SLA and UX Strategy

Read models are eventually consistent with the write path. Target propagation latency: **< 5 seconds** for decision events, **< 5 minutes** for scoring events.

| Scenario | UX Handling |
|---|---|
| Candidate expresses interest | Optimistic UI update immediately; read model catches up async. If projection fails, client polls write path as fallback. |
| Employer sees stale match feed | Match feed shows "last updated" timestamp. Pull-to-refresh triggers read model refresh. |
| Introduction created but not yet in timeline | Introduction confirmation shown from write response; timeline projection follows within seconds. |
| Read model projection failure | Degraded mode: UI falls back to direct query against write path (slower but consistent). Alert emitted for ops. |

Read model lag is monitored via the difference between the latest event timestamp and the latest projected timestamp. Lag exceeding 30 seconds triggers a P2 alert; lag exceeding 5 minutes triggers a P1 alert.

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
- **Dimension configuration:** OpenAI `text-embedding-3-large` defaults to 3072 dimensions. All API calls MUST specify `dimensions=1536` to match the `vector(1536)` column type in PostgreSQL. This is enforced in the AI gateway embedding adapter configuration, not per-callsite. Changing the dimension requires a coordinated migration of all vector columns and indexes.

#### 4.3.1 Encrypt-then-Store Pipeline

Embedding generation requires plaintext input, but PII must be encrypted before it reaches the database. The following pipeline resolves this constraint by keeping plaintext strictly in worker memory and never persisting it unencrypted to disk. See §5.3.1 for the corresponding security controls.

```
1. RECEIVE — Plaintext PII arrives at the backend worker over TLS 1.3.
   The raw text (e.g., experience narrative, STAR fields) is held
   exclusively in worker process memory.

2. EMBED  — The worker sends the plaintext to the AI Gateway, which
   calls the configured embedding provider (OpenAI text-embedding-3-large,
   dimensions=1536). The AI Gateway returns the float[] vector embedding.

3. ENCRYPT — The worker encrypts the raw plaintext using application-level
   AES-256-GCM with a per-field data encryption key (DEK) envelope
   managed by AWS KMS (see §5.3 Key Management). After encryption, the
   worker zeroizes the plaintext buffer in memory.

4. WRITE  — The worker writes the AES-256-GCM ciphertext AND the
   plaintext float[] vector embedding to PostgreSQL in a single
   atomic transaction. Both columns are committed or neither is.
```

```
Worker Memory Timeline
──────────────────────────────────────────────────────────────
 TLS in ──► [plaintext in RAM] ──► AI Gateway (embed)
                 │                        │
                 │◄── float[] ────────────┘
                 │
            AES-256-GCM encrypt
                 │
                 ├── ciphertext ──┐
                 │                ├──► BEGIN TXN
                 └── float[]  ───┘       INSERT ciphertext + vector
                                      COMMIT TXN
            zeroize plaintext
──────────────────────────────────────────────────────────────
 Plaintext NEVER written to disk or database.
```

#### 4.3.2 Vector Embedding Security Classification

Vector embeddings are **lossy, irreversible transformations** — not reversible encodings of the source text. A 1536-dimensional float array is a mathematical projection into a semantic concept space; it cannot be decoded back into the original PII narrative. This property has two implications:

1. **Safe for unencrypted storage:** Vector columns (`embedding vector(1536)`) are stored as plaintext floats so that pgvector can perform ANN index scans (`ivfflat`, `hnsw`) without decryption overhead. This is acceptable because the vectors do not constitute PII.
2. **Deletion still required:** Although vectors are non-reversible, they are derived from candidate data and are deleted on account deletion (see §5.6) to honor the data dignity principle and prevent any future advances in inversion attacks from posing a risk.

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

### 4.5 Matching Model Architecture

#### Two-Tower Retrieval Model

Used for initial candidate-role recall before deterministic reranking.

```
Candidate Tower:
  Input: Professional Identity Graph
    ├── Experience embeddings (transformer-based)
    ├── Skills embeddings (taxonomy-aware)
    ├── Preference embeddings
    └── Growth trajectory embeddings

  Processing:
    ├── Dense layers (768 → 512 → 256)
    ├── Layer normalization
    ├── Dropout (0.2)
    └── Output: 128-dim candidate vector

Role/Posting Tower:
  Input: Team Needs Graph / Job Posting
    ├── Requirements embeddings
    ├── Culture signal embeddings
    ├── Growth opportunity embeddings
    └── Compensation/location embeddings

  Processing:
    ├── Dense layers (768 → 512 → 256)
    ├── Layer normalization
    ├── Dropout (0.2)
    └── Output: 128-dim role vector

Similarity:
  • Cosine similarity between vectors
  • Learned temperature scaling
  • Output: Raw match score (0-1)
```

#### Multi-Dimensional Scoring Models

Each dimension uses specialized scoring after retrieval:

```
Capability Alignment:
  • Skill matching (NER + semantic similarity)
  • Experience relevance (embedding distance)
  • Requirement satisfaction (classification)

Growth Trajectory:
  • Trajectory prediction (sequence model)
  • Learning signal analysis (attention-based)
  • Opportunity fit (regression)

Culture Compatibility:
  • Work style matching (classification)
  • Values alignment (sentiment + similarity)
  • Communication fit (NLP analysis)

Values/Mission:
  • Mission statement analysis (NLP)
  • Values extraction (NER)
  • Alignment scoring (regression)

Practical Compatibility:
  • Compensation matching (rules + ML)
  • Location feasibility (geospatial)
  • Timeline alignment (temporal)

Mutual Advantage:
  • Rarity scoring (statistical)
  • Benefit prediction (regression)
  • Two-sided value estimation
```

### 4.6 STAR Extraction Pipeline

```
Input: Natural language experience description
  │
  ├── Sentence Segmentation
  │   └── spaCy sentence tokenizer
  │
  ├── Component Classification
  │   └── Claude structured output (S/T/A/R/Other)
  │
  ├── Entity Extraction
  │   ├── Skills (NER model)
  │   ├── Technologies (NER model)
  │   └── Outcomes (pattern matching + LLM)
  │
  ├── Theme Identification
  │   └── Zero-shot classification against taxonomy
  │
  ├── Evidence Strength Scoring
  │   └── Specificity heuristic + LLM verification
  │
  └── Structured Output
      └── JSON conforming to MemoryEntry schema
```

### 4.7 Bias Detection Models

```
Job Posting Analysis:
  • Gendered language detection
  • Exclusionary phrase identification
  • Unrealistic requirement flagging

  Model: Fine-tuned classifier for bias classification

  Output:
    - Bias score (0-1)
    - Flagged phrases with positions
    - Suggested alternatives

Match Outcome Analysis (offline only):
  • Statistical parity testing
  • Demographic impact analysis
  • Disparate impact detection
  • Fairness data isolated in offline analytics store

  Methods:
    - Chi-square tests
    - Fairness metrics (demographic parity, equalized odds)
    - Causal analysis

Mitigation Strategies:
  Algorithmic:
    • Blind matching (remove demographic features from online inference)
    • Adversarial debiasing during training
    • Fairness constraints in optimization
    • Regular model audits

  Data-Level:
    • Diverse training data sourcing
    • Oversampling underrepresented groups
    • Synthetic data augmentation

  Process-Level:
    • Human review for edge cases
    • Feedback loops for bias reporting
    • Regular third-party audits
```

### 4.8 Model Training and Serving

#### Training Pipeline

```
Data Collection:
  ├── User interactions (with consent)
  ├── Consent filter (only model_training_opt_in = true)
  ├── Match outcomes
  ├── Feedback (explicit & implicit)
  └── External datasets (job boards, skills taxonomies)

Training:
  ├── Training cluster (GPU instances)
  ├── Experiment tracking (MLflow)
  ├── Hyperparameter tuning (Optuna)
  └── Cross-validation

Validation:
  ├── Offline metrics (precision, recall, NDCG)
  ├── Fairness metrics
  ├── A/B test planning
  └── Model explainability (SHAP)

Governance:
  ├── Dataset snapshots include consent_version
  ├── Consent revocation removes records from next training cycle
  └── Training lineage is auditable per model version
```

#### Model Serving

```
Architecture:
  ├── Model registry (MLflow)
  ├── Model server (Python FastAPI wrapper)
  ├── Load balancer (application-level)
  └── Redis caching for hot embeddings

Deployment Strategy:
  ├── Canary deployments (5% → 50% → 100%)
  ├── Shadow mode (new model runs in parallel)
  ├── Automatic rollback (if metrics degrade)
  └── A/B testing framework

Performance Optimization:
  ├── Model quantization (int8)
  ├── ONNX Runtime for optimized inference
  ├── Batching requests
  └── Embedding cache (Redis)
```

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

```
At Rest:
  • PostgreSQL (RDS): encryption at rest via AWS KMS (RDS-managed)
  • S3: Server-side encryption (SSE-S3)
  • Backups: AES-256 encryption
  • PII fields: application-level AES-256-GCM before storage (see §5.3.1 pipeline)
  • Vector embeddings: stored as plaintext float arrays for pgvector index scanning.
    Vectors are irreversible semantic projections, NOT reversible ciphers of PII.
    See §4.3.2 for security classification rationale.

In Transit:
  • TLS 1.3 for all connections
  • Certificate pinning for mobile apps (when applicable)
  • mTLS for service-to-service (when service extraction occurs)

Key Management:
  • AWS KMS for encryption key management (customer-managed CMKs)
  • Automatic key rotation
  • Separate keys per data classification tier
  • Per-field data encryption keys (DEKs) envelope-encrypted under CMKs

Auth:
  • OAuth 2.0 with short-lived JWT (RS256, 15-min access, 7-day refresh)
  • Scoped service tokens for internal APIs
  • HttpOnly, Secure cookies for token storage

Token Revocation:
  • Redis-backed token blocklist for immediate revocation (e.g., admin removal, account deletion)
  • Blocklist entries expire after access token TTL (15 min) — no unbounded growth
  • Auth middleware checks blocklist on every request before JWT signature validation
  • Refresh token revocation via database deletion (immediate effect on next refresh)
  • Account deletion and admin removal events trigger immediate blocklist insertion
```

#### 5.3.1 Cryptographic Pipeline Sequence (PII + Embedding)

Raw PII (experience narratives, STAR fields, etc.) must be encrypted at the application level before database persistence. However, vector embeddings require plaintext input to produce meaningful semantic representations. The following pipeline resolves this constraint. See §4.3.1 for the embedding-perspective description.

**Invariant:** Plaintext PII is NEVER written to disk, database, or any persistent store. It exists only in worker process memory for the minimum duration required to generate the embedding and encrypt.

```
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND WORKER (process memory only — no disk, no swap-to-disk)│
│                                                                 │
│  Step 1: RECEIVE                                                │
│    Client ──TLS 1.3──► Worker receives plaintext PII            │
│                                                                 │
│  Step 2: EMBED                                                  │
│    Worker ──TLS──► AI Gateway ──► Embedding Provider             │
│    Worker ◄── float[1536] vector embedding returned              │
│    (Plaintext still held in memory for encryption)              │
│                                                                 │
│  Step 3: ENCRYPT                                                │
│    Worker encrypts plaintext → AES-256-GCM ciphertext           │
│    DEK sourced from AWS KMS envelope encryption                 │
│    Plaintext buffer zeroized immediately after encryption        │
│                                                                 │
│  Step 4: ATOMIC WRITE                                           │
│    BEGIN TRANSACTION                                             │
│      INSERT ciphertext  → experiences.raw_description (etc.)    │
│      INSERT float[]     → experiences.embedding                  │
│    COMMIT                                                        │
│    (Both written together or neither — no partial state)        │
└─────────────────────────────────────────────────────────────────┘
```

**Security properties of this pipeline:**

| Property | Guarantee |
|---|---|
| Plaintext at rest | NEVER — PII is AES-256-GCM encrypted before any database write |
| Plaintext in transit | Protected by TLS 1.3 (client→worker) and TLS (worker→AI Gateway) |
| Plaintext in memory | Held only for the duration of embedding generation + encryption; zeroized immediately after |
| Vector at rest | Stored as plaintext floats — vectors are lossy, irreversible projections into semantic concept space and cannot be decoded back into source PII (see §4.3.2) |
| Atomicity | Ciphertext and vector are committed in a single PostgreSQL transaction — no window where one exists without the other |
| Key management | Per-field DEKs envelope-encrypted under AWS KMS CMKs; automatic rotation; separate keys per data classification tier |

#### 5.3.2 PII Field Classification

| Table | Field | Classification | Encryption | Retention |
|---|---|---|---|---|
| `candidates` | `email` | PII | App-level AES-256-GCM | Account lifetime |
| `experiences` | `raw_description`, `situation`, `task`, `action`, `result` | Sensitive PII | App-level AES-256-GCM | Account lifetime |
| `experiences` | `skills_demonstrated`, `themes` | Derived data | TDE (at rest) | Account lifetime |
| `candidate_preferences` | `min_salary_expectation`, `max_salary_expectation` | Sensitive PII | App-level AES-256-GCM | Account lifetime |
| `employer_users` | `email` | PII | App-level AES-256-GCM | Account lifetime |
| `matches` | `match_reasoning` | Cross-party sensitive | TDE (at rest) | 2 years |
| `profile_documents` | `parsed_text`, `file_url` | Sensitive PII | App-level AES-256-GCM | Account lifetime |
| `audit_events` | `metadata` | May contain PII refs | TDE (at rest) | Indefinite (compliance) |
| `consent_records` | all fields | Compliance-critical | TDE (at rest) | Indefinite (compliance) |

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

### 5.6 Candidate Account Deletion Cascade

When a candidate deletes their account (`DELETE /candidate/account`), the following data operations execute:

| Table | Action | Rationale |
|---|---|---|
| `candidates` | Hard delete (CASCADE triggers child deletes) | PII removal |
| `experiences` | Hard delete (via CASCADE) | PII removal — raw narratives, STAR data |
| `candidate_preferences` | Hard delete (via CASCADE) | PII removal — salary data |
| `growth_map` | Hard delete (via CASCADE) | PII removal |
| `profile_documents` | Hard delete + S3 object deletion | PII removal — uploaded files |
| `candidate_consent_events` | Anonymize `candidate_id` → hashed pseudonym, retain events | Compliance — consent history must be reconstructable |
| `matches` | Set `candidate_id` to anonymized pseudonym, null PII-adjacent fields (`match_reasoning`), retain scores | Aggregate analytics — outcome data retained anonymized |
| `match_feedback` | Retain with anonymized match reference | Analytics — feedback used for model calibration |
| `consent_records` | Anonymize `subject_id` → hashed pseudonym, retain | Compliance — indefinite retention requirement |
| `audit_events` | Anonymize `subject_id` → hashed pseudonym, retain | Compliance — indefinite retention requirement |
| `training_eligibility_snapshots` | Anonymize `candidate_id`, retain | Compliance — training lineage audit |
| Vector embeddings (pgvector) | Hard delete from `experiences` and any aggregate profile vectors | Embeddings derived from PII |
| Redis cache entries | Invalidate all keys for candidate | Cache coherence |
| Token blocklist | Add all active tokens to blocklist | Prevent post-deletion access |

The anonymized pseudonym is a one-way hash (`SHA-256(candidate_id + deletion_salt)`) that allows cross-table joins for analytics without reversibility. The `deletion_salt` is stored in AWS KMS and rotated annually.

### 5.7 Network Security

```
Network Architecture:
  • VPC with private subnets for all data and application services
  • NAT gateways for outbound traffic
  • VPC endpoints for AWS services
  • Network ACLs and security groups

Ingress:
  • AWS ALB (Application Load Balancer)
  • WAF (Web Application Firewall) rules
  • DDoS protection (AWS Shield Standard)
  • Rate limiting (per IP, per user)

Security Monitoring:
  • Structured access logs for all API requests
  • Audit logs for sensitive operations
  • Anomaly detection for brute force and credential stuffing
  • Incident response runbooks with PagerDuty integration
```

### 5.8 Compliance Baseline

| Control Area | Launch Baseline | Evidence Artifact |
|---|---|---|
| Access control | RBAC + scoped service auth + tenant boundaries | Access policy configs + auth audit logs |
| Consent governance | Versioned consents, immutable consent events | Consent ledger and event history |
| Intro guardrails | Policy-gated introduction attempts | Policy decision logs + intro event trail |
| Data subject rights | Export + delete workflows with SLA | Request logs + completion receipts |
| Security ops | Vulnerability scanning, incident runbooks, key rotation | Scan reports + incident postmortems |
| Model governance | Evaluation gates, rollback, drift alarms | Model registry + governance logs |
| GDPR/CCPA | Data export, deletion, consent tracking, retention enforcement | Subject rights request logs |
| EEOC | No demographic signals in matching, fairness audits | Fairness audit reports |

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

   ┌────────────────────────────────────────────┐
   │          Internal Operations Console       │
   │  Moderation | Audit | Disputes | Fairness  │
   └────────────────────────────────────────────┘
```

### 6.2 Tech Stack Decisions (Launch Defaults)

| Layer | Launch Default | Fallback (Deferred) | Trigger to Switch |
|---|---|---|---|
| Product APIs | TypeScript + Node.js (Fastify) | None in launch path | N/A |
| ML/Inference services | Python (FastAPI) behind internal APIs | None in launch path | N/A |
| Architecture style | Modular monolith | Service extraction | Trigger thresholds in 6.5 |
| Primary DB + vector | PostgreSQL 17+ with pgvector | Pinecone behind repository interface | Recall/latency exceeds SLO at validated load |
| Cache | Redis 7.2+ (cluster mode; Redis 8 where supported) | None in launch path | N/A |
| Queue/workflows | Redis + BullMQ | Managed queue worker tier | Operational burden or throughput breach |
| Hosting | AWS (us-east-1 primary) | None in launch path | N/A |
| External API style | REST-first | GraphQL BFF (deferred) | Multi-client data-shape pressure |
| Internal integration | Versioned async events | Synchronous internal RPC additions | Required for strict consistency edge cases |
| LLM strategy | AI gateway with Claude primary, OpenAI fallback | Additional providers | Cost/reliability or policy requirements |
| Frontend | Next.js 16+ + Tailwind CSS + Radix UI | Native mobile apps | Product milestone after Phase 2 |
| Search | PostgreSQL full-text + pg_trgm | Elasticsearch | Query complexity or volume exceeds PG capabilities |
| Testing | Vitest + React Testing Library (TS), pytest (Python), Supertest + testcontainers (API/DB integration), Playwright (E2E), k6 (load) | None in launch path | N/A |

### 6.3 Frontend Stack

```
Framework: Next.js 16+ (App Router; Active LTS as of 2026-02)
Language: TypeScript 5+
Styling: Tailwind CSS
Components: Radix UI (headless, accessible)
Animations: Framer Motion
State: React Query (server state) + Zustand (client state)
Forms: React Hook Form + Zod (validation)
Testing: Vitest + React Testing Library + Playwright (E2E)
Build: Turbopack (dev + production default in Next.js 16) / Webpack (fallback for incompatible plugins)
```

Rationale:
- Next.js: SSR for SEO, API routes, App Router for layouts
- Radix + Tailwind: accessible, customizable, performant
- React Query: server-state cache with background refresh
- Zustand: lightweight client state without Redux boilerplate

### 6.4 Async Processing and Cadence

Event-driven workflows:
- `candidate.memory_bank.added` -> structure -> embed -> rescore.
- `employer.role.updated` -> embed -> rescore.
- `opportunity.canonicalized` -> dedupe/moderate -> embed -> score candidates.
- `match.candidate.decisioned`/`match.employer.decisioned` -> intro policy evaluation.

Cadence policy:
- Incremental matching on write events.
- Hourly backfill for missed events, score recalibration, and stuck-state recovery.
- Stuck workflow watchdog retries idempotent jobs and emits compensation events.

Match staleness policy:
- When a candidate profile or role is updated, all associated matches are marked `stale=true`.
- Stale matches are suppressed from match feeds until rescored by the next matching cycle.
- Matches older than 30 days without interaction from either side are auto-archived.
- When a match reaches terminal state (`hired`, `candidate_passed`, `employer_passed`, `closed`), it is excluded from active feeds but retained for analytics.
- Hourly backfill rescores all stale matches and clears the stale flag.

Data quality SLAs:
- Ingestion freshness: Tier-2 postings indexed within 4 hours of API availability.
- Tier-3 career page postings indexed within 24 hours of publication.
- Embedding staleness: no profile embedding older than 1 hour after write event.
- Graph freshness: candidate/employer read models updated within 5 minutes of source event.

Dead letter queue (DLQ) strategy:
- All BullMQ queues are configured with a max retry count of 3 with exponential backoff.
- Failed jobs after retries are moved to a per-queue DLQ (e.g., `matching-dlq`, `consent-dlq`).
- **Consent-related DLQ jobs are P0 alerts** — missed consent events have compliance implications.
- DLQ dashboard in the Internal Operations Console surfaces failed jobs for manual triage.
- DLQ jobs older than 7 days without resolution trigger escalation alerts.
- Idempotent job design ensures safe replay from DLQ without side effects.

#### 6.4.1 Consent Revocation Cascade

When a candidate revokes all consent or deletes their account, the following cascade is executed as a transactional workflow:

```
1. Mark all active matches as `closed` with reason_code=`consent_revoked`.
2. Cancel any pending introduction attempts (transition to `closed`).
3. Suppress candidate from all employer match feeds (CQRS read model update).
4. Mark candidate embeddings for deletion from vector store.
5. If model_training consent revoked:
   a. Update TrainingEligibilitySnapshot to eligible=false.
   b. Flag candidate records for exclusion from next training pipeline run.
6. If full account deletion:
   a. Purge all PII (raw narratives, email, documents, salary data).
   b. Retain anonymized match outcome records for aggregate analytics.
   c. Retain consent event history (compliance requirement — anonymized subject_id).
7. Emit `candidate.consent.cascade.completed` audit event.
```

Failure at any step halts the cascade and routes to the consent DLQ for manual resolution. Partial cascades are tracked in the audit log for compliance investigation.

### 6.5 Architecture Style Decision

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

### 6.6 Infrastructure Sizing (Launch)

```
PostgreSQL (RDS):
  Instance: db.r6g.xlarge (4 vCPU, 32 GB RAM)
  Storage: 500 GB gp3
  Multi-AZ: Yes
  Read Replicas: 1 (add second when read load justifies)
  Backup: 7-day retention, point-in-time recovery
  Extensions: pgvector, pg_trgm, PostGIS

  Tuning:
    • shared_buffers = 8GB
    • effective_cache_size = 24GB
    • work_mem = 256MB
    • max_connections = 200

Redis (ElastiCache):
  Instance: cache.r6g.large (2 vCPU, 13 GB)
  Nodes: 3 (cluster mode)
  Persistence: AOF + RDB snapshots
  Encryption: at-rest and in-transit

Object Storage (S3):
  Versioning: enabled
  Lifecycle: transition to IA after 90 days, Glacier after 1 year
  Server-side encryption: SSE-S3
  CDN: CloudFront for static assets
```

### 6.7 Caching Strategy

```
Layer 1 — CDN (CloudFront):
  • Static frontend assets (1 year, cache-busted by hash)
  • Public API responses where applicable (5 min TTL)

Layer 2 — Application Cache (Redis):
  • User sessions
  • Profile data (15 min TTL, invalidate on write)
  • Match feed results (5 min TTL, invalidate on score event)
  • Hot embeddings for active candidates/roles (1 hour TTL)
  • Rate limiting counters

Layer 3 — Database Query Cache:
  • Prepared statements and query plan caching (PostgreSQL native)
  • PgBouncer for connection pooling (pool size: 20 per app instance)

Layer 4 — Browser Cache:
  • Static assets (immutable, 1 year)
  • API responses (Cache-Control: private, max-age=300)

Cache Invalidation:
  • Event-driven: profile/match events trigger targeted invalidation
  • Time-based: TTL expiration as fallback
  • Manual: admin flush for incident response
```

### 6.8 Monitoring & Observability

```
Metrics:
  • Prometheus for service metrics collection
  • Grafana for dashboards (system health, business KPIs, ML model performance)

Logging:
  • Structured JSON logs (Pino for Node.js, structlog for Python)
  • Centralized aggregation: Datadog or Loki
  • Access logs: all API requests with trace IDs

Distributed Tracing:
  • OpenTelemetry SDK instrumentation
  • Jaeger or Datadog APM for trace visualization
  • Trace IDs propagated through all event-driven workflows

Alerting:
  • PagerDuty for critical incidents (p95 latency breach, error rate spike, guardrail violation)
  • Slack for warnings (queue depth, cache miss rate, drift detection)
  • Email for daily summaries (system health, match quality metrics)

Key Dashboards:
  • System health (latency, error rates, throughput)
  • Business metrics (match quality, conversion, coverage)
  • ML model performance (calibration, drift, fairness)
  • Governance (consent events, policy denials, intro audit trail)
  • Cost tracking (AWS spend, LLM API costs)
```

### 6.9 Service Level Objectives (SLOs)

| Category | Metric | Target | Measurement |
|---|---|---|---|
| **Availability** | API uptime | 99.9% (8.7h downtime/year) | Synthetic health checks + ALB metrics |
| **Latency — API** | p50 / p95 / p99 response time | 100ms / 500ms / 1s | Per-endpoint Prometheus histograms |
| **Latency — Matching** | Match scoring pipeline (end-to-end) | < 30s from trigger event to read model update | Event timestamp delta |
| **Latency — Conversation** | WebSocket AI response time | p95 < 3s first token | AI gateway instrumentation |
| **Latency — Search** | Vector similarity search | p95 < 200ms | pgvector query timing |
| **Throughput** | Concurrent WebSocket connections | 1000 per instance | Connection pool metrics |
| **Data freshness** | Read model projection lag | < 5 min (P2 alert at 30s, P1 at 5 min) | Projection lag monitor |
| **Data freshness** | Embedding staleness | < 1 hour after write event | Embedding age monitor |
| **Error rate** | 5xx error rate | < 0.1% of requests | ALB + application error logs |
| **Guardrail** | Unauthorized introduction attempts | 0 (zero tolerance) | Policy decision log audit |
| **Queue health** | BullMQ job failure rate | < 0.5% | Queue metrics dashboard |
| **Queue health** | DLQ depth | < 50 jobs (P2 alert at 20, P1 at 50) | DLQ monitor |

Error budgets are calculated monthly. Burning > 50% of the monthly error budget in a single week triggers an incident review.

### 6.10 CI/CD Pipeline

```
Platform: GitHub Actions

Pull Request Workflow:
  • Lint (ESLint + Prettier for TS, Ruff for Python)
  • Type check (tsc --noEmit)
  • Unit tests (Vitest / pytest)
  • Integration tests (against test containers)
  • Security scan (Snyk / Trivy)

Merge to main:
  • Build Docker image, tag with commit SHA
  • Push to ECR
  • Deploy to staging (automatic)
  • Run E2E tests against staging (Playwright)
  • Manual approval gate for production

Production Deployment:
  • Canary deploy (5% traffic for 30 minutes)
  • Automated metric checks (error rate, latency, guardrail violations)
  • Promote to full rollout or automatic rollback
  • Database migrations run as pre-deploy step (TypeORM migrations)

Model Deployment (separate pipeline):
  • Offline evaluation pass required
  • Shadow mode deployment (parallel inference, no user impact)
  • Canary promotion with calibration checks
  • Rollback on fairness or calibration threshold breach
```

### 6.11 Disaster Recovery

```
Backup Strategy:
  • Database: daily automated snapshots + continuous WAL archiving
  • Redis: AOF persistence + periodic RDB snapshots
  • S3: cross-region replication to us-west-2
  • Code: Git (GitHub)
  • Secrets: AWS Secrets Manager with cross-region replication

Recovery Objectives:
  • RPO (Recovery Point Objective): 1 hour
  • RTO (Recovery Time Objective): 4 hours

DR Region: us-west-2
  • Standby database (async replication via RDS)
  • S3 cross-region replication (active)
  • Application deployment artifacts in both regions

Failover Process:
  1. DNS failover (Route 53 health checks)
  2. Promote read replica to primary database
  3. Deploy application to DR region (pre-built images)
  4. Update service endpoints and verify health
  5. Notify operations team and begin incident tracking

DR Testing:
  • Quarterly failover drills
  • Annual full-region failover exercise
```

---

## 7. API Design

### 7.1 API Surface (High-Level)

#### Steadyhand (Candidate)

```
POST   /candidate/profile
GET    /candidate/profile
PATCH  /candidate/profile

POST   /candidate/memory-bank
GET    /candidate/memory-bank
PATCH  /candidate/memory-bank/:id
DELETE /candidate/memory-bank/:id

GET    /candidate/preferences
PUT    /candidate/preferences

GET    /candidate/growth-map
PUT    /candidate/growth-map

GET    /candidate/matches
GET    /candidate/matches/:id/explainability
POST   /candidate/matches/:id/respond                  # interested | save | pass

GET    /candidate/prep/:matchId
POST   /candidate/applications/draft

PUT    /candidate/consents                             # update consent tuple
GET    /candidate/consents
GET    /candidate/consents/history

GET    /candidate/data-export
DELETE /candidate/account

WebSocket /candidate/conversation
```

#### Clearview (Employer)

```
POST   /employer/organizations
GET    /employer/organizations/:id

POST   /employer/roles
GET    /employer/roles
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

#### Disputes (Internal / Candidate / Employer)

```
POST   /disputes
GET    /disputes/:id
PATCH  /disputes/:id/resolve
GET    /internal/disputes/queue                          # ops console
```

### 7.2 Internal Event Contracts (Versioned)

| Topic | Version | Owner Domain | Producers | Consumers | Purpose |
|---|---|---|---|---|---|
| `candidate.profile.updated` | v1 | Steadyhand | Steadyhand | Resonance Core | Re-score candidate-role pairs |
| `candidate.memory_bank.added` | v1 | Steadyhand | Steadyhand | Resonance Core, AI pipeline | Recompute embeddings and scores |
| `employer.role.updated` | v1 | Clearview | Clearview | Resonance Core | Re-score role candidate pool |
| `opportunity.canonicalized` | v1 | Aggregation | Aggregation | Resonance Core | Score candidates for canonical opportunity |
| `match.scored` | v1 | Resonance Core | Resonance Core | Steadyhand, Clearview, Read Model Projector | Surface ranked matches |
| `match.candidate.decisioned` | v1 | Resonance Core | Steadyhand -> Core | Governance, Clearview | Persist candidate interest/pass |
| `match.employer.decisioned` | v1 | Resonance Core | Clearview -> Core | Governance, Steadyhand | Persist employer interest/pass |
| `match.introduction.created` | v1 | Resonance Core | Intro Orchestrator | Steadyhand, Clearview, Audit | Confirm successful intro |
| `match.feedback.submitted` | v1 | Resonance Core | Both UIs | Calibration Layer | Explicit feedback for model improvement |
| `consent.updated` | v1 | Governance | Consent Manager | Training pipeline, Audit | Update training eligibility |
| `policy.decision.logged` | v1 | Governance | Policy Engine | Audit, Ops | Immutable policy decision record |
| `dispute.created` | v1 | Governance | Dispute Intake | Ops Console, Audit | New dispute for triage |

Event contract rules:
- Backward compatibility required for all `v1` payload fields.
- Every event includes `event_id`, `occurred_at`, `trace_id`, `schema_version`.
- Consumers must be idempotent on `event_id`.

---

## 8. External Integrations

### 8.1 Job Board APIs

```
LinkedIn:
  • API: LinkedIn Job Posting API
  • Auth: OAuth 2.0
  • Rate limits: 100K requests/day
  • Data: Jobs, companies

Indeed:
  • API: Indeed Publisher API
  • Auth: API key
  • Rate limits: varies by publisher tier
  • Data: Job postings, metadata

Integration Pattern:
  • Adapter pattern per provider behind unified PostingConnector interface
  • Unified canonical job posting schema
  • Scheduled sync (configurable per source: hourly for APIs, daily for scrapes)
  • Webhook support for real-time updates where available
  • Circuit breaker per connector to isolate provider failures
```

### 8.2 OAuth Providers

```
Google:
  • Scopes: email, profile
  • Use case: SSO, profile bootstrap

LinkedIn:
  • Scopes: r_emailaddress, r_liteprofile
  • Use case: SSO, profile import

GitHub:
  • Scopes: user, repo (optional)
  • Use case: Code contributions, project evidence

Implementation:
  • Passport.js strategies (Node.js)
  • Account linking (multiple OAuth providers per user)
  • Token refresh handling with retry
```

### 8.3 Communication Services

```
Email: SendGrid
  • Transactional emails (verification, match notifications, digests)
  • Template management with version control
  • Delivery tracking and webhook events

Push Notifications: Firebase Cloud Messaging (deferred to mobile launch)
  • iOS and Android
  • Topic-based messaging for match digests

Calendar Integration (opt-in, Phase 3+):
  • Google Calendar / Outlook via OAuth
  • Interview scheduling assistance
  • Prep reminders before scheduled interviews
```

### 8.4 API Gateway

```
Rate Limits:
  • Unauthenticated: 100 req/hour
  • Authenticated candidate: 1000 req/hour
  • Employer standard: 2000 req/hour
  • Employer enterprise: 10000 req/hour

Monetization Guardrail:
  • Higher limits/features apply only to employer plans
  • Never affects candidate visibility or match ranking

Caching:
  • GET requests (5 min TTL)
  • Static content (1 hour TTL)
  • Invalidation on write events

WebSocket Rate Limiting (candidate conversation endpoint):
  • Max 30 messages/minute per authenticated user
  • Max 5 concurrent WebSocket connections per user
  • Per-message token budget: 4000 input tokens (estimated), hard-capped at AI gateway
  • Idle connection timeout: 30 minutes
  • Rate limit exceeded → 429 frame with retry-after header, connection preserved
  • Abuse detection: sustained high-frequency messaging triggers temporary cooldown + alert
```

---

## 9. Human/AI Boundary Enforcement

This boundary is enforced at service and policy layers, never only in client code.

| Boundary | Enforcement |
|---|---|
| No auto-application | Application endpoint produces drafts only; submission is separate explicit action |
| No unsolicited outreach | Intro attempts require both explicit decision events and policy allow result |
| No data sharing without consent | Policy checks require valid consent state before cross-party data surfaces |
| No autonomous hiring action | Match scores are advisory; no auto-advance/reject automation paths |
| No direct raw LLM outbound | All outbound content passes schema + policy + human action |

---

## 10. Phased Build Sequence

### 10.1 Phase 1 — Steadyhand Standalone (MVP)

**Duration estimate:** 6 weeks

- Candidate auth/profile, memory bank, STAR extraction, skills/themes, preference map, growth map.
- Candidate consent APIs and immutable consent event logging.
- Cognitive protection basics (triage/prep/follow-up).
- Resume import and parsing (PDF, DOCX).
- Web application (Next.js).
- No introductions and no employer-side workflow.

### 10.2 Phase 2 — Aggregation + Basic Matching

**Duration estimate:** 4 weeks

- Tier-2 and Tier-3 ingestion with dedupe and moderation for Tier-4 submissions.
- Candidate-side match feed with explainability payload.
- Event-triggered matching + hourly backfill.
- Basic matching algorithm (see 10.6).
- CQRS read model for candidate match feed.

### 10.3 Phase 3 — Clearview + Double Opt-In

**Duration estimate:** 5 weeks

- Employer onboarding, role definition, posting analysis.
- Employer match decisions with reason codes.
- Introduction state machine and policy-gated intro attempts.
- CQRS read model for employer match feed.
- Dispute resolution intake.
- Calendar integration (opt-in) for interview workflow.

### 10.4 Phase 4 — Resonance Core Full

**Duration estimate:** 4 weeks

- Full six-dimension scoring and confidence calibration loop.
- Two-tower retrieval model deployment.
- Fairness monitoring, drift alerts, model governance gates.
- Expanded analytics for match quality and conversion.
- Internal operations console for trust & safety.

### 10.5 Phase Exit Criteria

| Phase | Exit Criteria |
|---|---|
| Phase 1 | Candidate profile completion >= 60%, consent write/read audited, 0 unauthorized outbound actions |
| Phase 2 | Match explainability completeness = 100% for surfaced matches, moderation quarantine path active, hourly backfill success >= 99% |
| Phase 3 | 100% introductions created only after both decision events, policy denial logging enabled, no notification leak incidents |
| Phase 4 | Confidence calibration within defined error bounds, fairness disparity alerts operational, rollback drill executed successfully |

### 10.6 MVP Matching Algorithm (Phase 2 Reference Implementation)

```python
# Default match weights — loaded from environment/config, not hardcoded.
# Tunable per-environment to support A/B testing and iterative calibration.
DEFAULT_MATCH_WEIGHTS = {
    'semantic': 0.4,
    'skills': 0.3,
    'location': 0.2,
    'salary': 0.1,
}

MINIMUM_MATCH_THRESHOLD = 0.5

def get_match_weights() -> dict:
    """Load match weights from config store. Falls back to defaults."""
    return config.get('matching.weights', DEFAULT_MATCH_WEIGHTS)

def calculate_match_score(candidate, job_posting):
    """
    Phase 2 matching: semantic similarity + skill overlap + practical filters.
    Replaced by full six-dimension scoring in Phase 4.
    """
    scores = {}

    # 1. Semantic similarity (embedding cosine distance)
    candidate_embedding = get_candidate_embedding(candidate)
    job_embedding = job_posting.embedding
    scores['semantic'] = cosine_similarity(candidate_embedding, job_embedding)

    # 2. Skill overlap
    candidate_skills = set(get_candidate_skills(candidate))
    job_skills = set(extract_job_skills(job_posting))
    scores['skills'] = len(candidate_skills & job_skills) / max(len(job_skills), 1)

    # 3. Location match
    candidate_locations = candidate.preferences.locations
    job_location = job_posting.location
    scores['location'] = 1.0 if location_matches(candidate_locations, job_location) else 0.3

    # 4. Salary alignment
    if candidate.preferences.min_salary and job_posting.salary_max:
        scores['salary'] = 1.0 if job_posting.salary_max >= candidate.preferences.min_salary else 0.5
    else:
        scores['salary'] = 0.7  # Neutral if unknown

    # Weighted average (weights loaded from config, not hardcoded)
    weights = get_match_weights()
    overall_score = sum(scores[key] * weights[key] for key in scores)

    return overall_score


def get_matches_for_candidate(candidate_id, limit=20):
    """
    Retrieve and score top matches using pgvector ANN + reranking.
    """
    candidate = get_candidate(candidate_id)
    candidate_embedding = get_candidate_embedding(candidate)

    # Vector similarity search (recall stage)
    similar_jobs = db.query("""
        SELECT id,
               1 - (embedding <=> %s) as similarity
        FROM job_postings
        WHERE posted_at > NOW() - INTERVAL '30 days'
        ORDER BY embedding <=> %s
        LIMIT 100
    """, [candidate_embedding, candidate_embedding])

    # Score and rank (rerank stage)
    scored_matches = []
    for job in similar_jobs:
        score = calculate_match_score(candidate, job)
        if score > MINIMUM_MATCH_THRESHOLD:
            scored_matches.append({
                'job_posting_id': job.id,
                'score': score,
                'similarity': job.similarity
            })

    scored_matches.sort(key=lambda x: x['score'], reverse=True)
    return scored_matches[:limit]
```

---

## 11. Development Workflow

### 11.1 Local Development Environment

```
Setup:
  docker-compose up -d        # PostgreSQL, Redis, MinIO (S3-compatible)
  npm run dev                  # Start API server (Fastify, hot reload)
  npm run web                  # Start Next.js frontend
  npm run test:watch           # Run tests in watch mode

Environment Variables:
  • .env.local (git-ignored, developer-specific)
  • .env.example (committed, documents all required vars)
  • Environment-specific configs via AWS Parameter Store (staging/production)

External Service Mocks:
  • LLM Gateway: local mock server with golden response fixtures
  • Job board APIs: recorded response fixtures
  • SendGrid: local SMTP trap (Mailpit)
```

### 11.2 Code Quality

```
Linting:
  • ESLint + Prettier (TypeScript)
  • Ruff (Python)
  • Pre-commit hooks (Husky + lint-staged)

Testing:
  • Unit tests: Vitest (TS), pytest (Python)
  • Integration tests: Vitest + Supertest (API), testcontainers (DB)
  • E2E tests: Playwright
  • Load tests: k6 (pre-launch and quarterly)

Coverage:
  • Minimum: 80% line coverage
  • Critical paths (matching, intro orchestration, consent): 100%
  • ML models: dedicated golden test sets

Code Review:
  • Required for all changes (1 approval minimum)
  • CI must pass before merge
  • Security review required for auth, consent, and policy changes
```

### 11.3 Branch Strategy

```
Trunk-Based Development:

main (production-deployed)
  │
  ├── feature/PROJ-123-add-memory-bank
  ├── feature/PROJ-124-improve-matching
  ├── bugfix/PROJ-125-fix-auth-bug
  └── hotfix/critical-security-fix

Branch Naming:
  • feature/PROJ-123-description
  • bugfix/PROJ-124-description
  • hotfix/description

Commit Messages (Conventional Commits):
  • feat: add memory bank conversation capture
  • fix: correct consent revocation race condition
  • chore: update dependencies
```

---

## 12. Architectural Decisions and Deferred ADRs

### 12.1 Resolved Launch Decisions

| Decision ID | Decision |
|---|---|
| RD-001 | Product APIs use TypeScript/Node.js (Fastify); Python reserved for ML/inference services |
| RD-002 | Modular monolith is launch architecture; no premature microservice split |
| RD-003 | PostgreSQL 17+ with pgvector is primary operational/vector store at launch |
| RD-004 | Redis 7.2+ with BullMQ is default queue/workflow layer (Redis 8 where supported) |
| RD-005 | AWS (us-east-1 primary, us-west-2 DR) is launch hosting platform |
| RD-006 | REST-first public APIs; async events for internal domain integration |
| RD-007 | AI gateway abstraction with Claude primary and OpenAI fallback |
| RD-008 | Next.js + Tailwind + Radix web-first launch; native mobile deferred |
| RD-009 | Event-triggered incremental matching + hourly backfill/recalibration |
| RD-010 | Cloud-first launch with export/delete portability and strict consent/audit controls |
| RD-011 | CQRS read models for match feeds and explainability views |
| RD-012 | Internal operations console for trust, safety, and moderation from Phase 4 |

### 12.2 Deferred ADRs (True Deferrals)

| ADR ID | Topic | Default Until Decided | Owner | Decision Trigger |
|---|---|---|---|---|
| ADR-013 | Pinecone adoption vs pgvector-only | Stay on pgvector | Platform Lead | p95 vector query latency or recall misses SLO for 2 sprints |
| ADR-014 | Graph storage introduction | No separate graph DB | Data Lead | Query complexity exceeds acceptable cost/latency in production |
| ADR-015 | Native mobile app architecture | Web-only | Product + Mobile Lead | Phase 2 goals met and mobile usage case validated |
| ADR-016 | Multi-region active-active runtime | Single primary region + DR | Infra Lead | Enterprise SLA/regional compliance requirement |
| ADR-017 | GraphQL BFF for clients | REST-only | API Lead | Repeated client over/under-fetch issues across 2 releases |
| ADR-018 | Elasticsearch for search | PostgreSQL full-text | Platform Lead | Query volume or complexity exceeds PG full-text capabilities |
| ADR-019 | Calendar/email deep integration | Basic opt-in (Phase 3) | Product Lead | User research validates scheduling assistance as high-value |

---

## 13. Validation Scenarios and Architecture Guarantees

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
| Candidate requests data export | Full profile + consent history + match history exported within SLA |
| Candidate deletes account | All PII purged, anonymized records retained for aggregate analytics only |
| Dispute filed by candidate or employer | Dispute enters triage queue, tracked through resolution with audit trail |
| DR region failover | RPO <= 1 hour, RTO <= 4 hours, all guardrails preserved in DR region |

---

## 14. MVP Acceptance Metrics Framing

| Category | Metric | Target Direction |
|---|---|---|
| Candidate value | Profile completion and recurring usage | Up and stable after onboarding |
| Match quality | Candidate-perceived relevance and explainability trust | Up by cohort over time |
| Guardrail integrity | Unauthorized outbound intro count | Must remain zero |
| Consent integrity | Consent event audit completeness | 100% of state changes traceable |
| Reliability | API and workflow success rates | Meet phase SLOs before phase exit |
| Fairness monitoring | Disparity detection and resolution throughput | Alerts triaged within operational SLA |
| Data quality | Ingestion freshness and embedding staleness | Within SLAs defined in 6.4 |

---

## Appendix A: Technology Decisions Log

| Decision | Choice | Rationale | Date |
|---|---|---|---|
| Primary Language | TypeScript | Type safety, full-stack consistency, ecosystem breadth | 2026-02 |
| ML Language | Python | Best ML/AI ecosystem, FastAPI for serving | 2026-02 |
| Database | PostgreSQL 17+ | ACID, JSON, pgvector, reliability | 2026-02 |
| Cloud Provider | AWS | Maturity, managed services, team familiarity | 2026-02 |
| Web Framework | Next.js | SSR, App Router, API routes, React ecosystem | 2026-02 |
| API Framework | Fastify | High throughput, low overhead, TypeScript-first | 2026-02 |
| LLM Primary | Claude (Anthropic) | Long-context, structured output quality, safety | 2026-02 |
| Embedding Provider | OpenAI text-embedding-3-large | Quality, cost, provider abstracted | 2026-02 |
| UI Components | Radix UI + Tailwind CSS | Accessible, headless, customizable | 2026-02 |
| Queue | BullMQ + Redis | Simple, performant, good DX | 2026-02 |

---

## Appendix B: Glossary

| Term | Definition |
|---|---|
| **Professional Identity Graph** | Multi-dimensional representation of candidate's professional self |
| **Memory Bank** | Repository of candidate experiences and skills |
| **Team Needs Graph** | Structured representation of employer requirements |
| **Double Opt-In** | Both parties must agree before introduction |
| **Cognitive Load Protection** | Features to reduce mental burden on users |
| **Embedding** | Dense vector representation of text for semantic similarity |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **CQRS** | Command Query Responsibility Segregation — separate write and read models |
| **Confidence Bucket** | Match quality tier (Strong/Promising/Stretch/Weak) |
| **AI Gateway** | Abstraction layer for LLM provider routing, cost tracking, and failover |

---

*End of Document*
