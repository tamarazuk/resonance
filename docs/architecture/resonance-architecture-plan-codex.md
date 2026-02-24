# Resonance Architecture Plan (Full Product)

## 1. Scope and Intent
- This architecture is for the full Resonance platform, not only MVP.
- MVP focus on Steadyhand is a delivery sequence decision, not an architecture constraint.
- Architecture must preserve the system-wide boundary: AI recommends, humans approve all external actions.

## 2. Product Domains and Bounded Contexts

### 2.1 Steadyhand (Candidate Engine)
- Professional Identity Graph
- Memory Bank capture and structuring
- Preference Map and Growth Map
- Candidate workflow automation (triage, prep, follow-up)
- Candidate consent and privacy controls

### 2.2 Clearview (Employer Engine)
- Team Needs Graph and role calibration
- Posting enrichment and requirement normalization
- Culture and hidden requirement capture
- Bias and clarity analysis
- Employer-side consent and workflow controls

### 2.3 Resonance Core (Matching Protocol)
- Multi-dimensional matching and confidence scoring
- Explainability generation for both sides
- Double opt-in orchestration
- Introduction workflow and state machine
- Match performance measurement and calibration

### 2.4 Opportunity Aggregation
- Direct employer postings ingestion
- Job board/API ingestion
- Career page monitoring/scraping
- Candidate-contributed opportunity ingestion
- Source confidence and deduplication layer

### 2.5 Trust, Safety, and Governance
- Identity, authn/authz, tenancy
- Consent and human-approval enforcement
- Audit logs and compliance controls
- Bias/fairness monitoring and model governance
- Security/privacy operations and incident response

## 3. Target System Architecture

### 3.1 High-Level Topology
- Frontends:
  - Candidate app (web/mobile-first)
  - Employer app (web)
  - Internal operations console (trust/safety, review, support)
- API Gateway + BFF layer:
  - Candidate BFF
  - Employer BFF
  - Internal admin API
- Core platform services (domain-oriented microservices or modular monolith with clear boundaries)
- Data and intelligence layer:
  - Operational databases
  - Search/index stores
  - Graph store for identity/needs/match relations
  - Feature and embedding stores
  - Event bus + workflow engine
- AI/ML platform:
  - LLM orchestration service
  - Extraction/classification services
  - Matching/ranking service
  - Evaluation and observability pipelines

### 3.2 Architectural Style
- Domain-first modular architecture with asynchronous event-driven integration.
- Service boundaries aligned to bounded contexts.
- Workflow/state machines for consent-critical processes.
- CQRS-style read models for fast UX and explainability views.

## 4. Core Services by Domain

### 4.1 Identity and Access
- User/org identity service
- Role-based and attribute-based access control
- Session and device security
- Multi-tenant isolation for employer organizations

### 4.2 Candidate Services (Steadyhand)
- Candidate Profile Service
- Memory Bank Service
- Preference & Growth Service
- Candidate Copilot Service (triage, prep, follow-up)
- Candidate Consent Service

### 4.3 Employer Services (Clearview)
- Employer Org and Team Service
- Role Definition Service
- Team Needs Graph Service
- Posting Intelligence Service (quality/bias/calibration)
- Employer Consent Service

### 4.4 Matching Services (Resonance Core)
- Opportunity Normalization Service
- Candidate-Opportunity Scoring Service
- Match Explainability Service
- Match State Orchestrator (double opt-in)
- Introduction Coordination Service

### 4.5 Aggregation Services
- Source Connector Service (APIs)
- Career Monitor/Scrape Service
- Deduplication and Canonicalization Service
- Source Quality and Confidence Service

### 4.6 Governance and Safety Services
- Policy Engine (hard constraints and compliance rules)
- Audit/Event Ledger Service
- Fairness Monitoring Service
- Feedback and Dispute Resolution Service

## 5. Data Architecture

### 5.1 Data Stores
- Relational DB:
  - Users, orgs, roles, permissions, workflows, audit metadata
- Document store:
  - Raw candidate/employer narratives and parsed artifacts
- Graph DB:
  - Identity/needs relations, skills, experiences, team signals, match edges
- Search index:
  - Fast filtering and retrieval for opportunities and profiles
- Vector store:
  - Embeddings for semantic retrieval and similarity features
- Object store:
  - Resume/docs, ingestion artifacts, model inputs/outputs, logs

### 5.2 Canonical Data Models
- Candidate Professional Identity Graph:
  - Experience nodes (STAR, evidence strength)
  - Skill nodes (explicit/implicit)
  - Preference nodes
  - Growth trajectory nodes
- Employer Team Needs Graph:
  - Role requirement nodes (must/nice-to-have)
  - Culture/operating style nodes
  - Hidden requirement/risk nodes
- Opportunity Canonical Model:
  - Normalized role, comp, location, timeline, constraints, source confidence
- Match Artifact Model:
  - Dimension-level scores
  - Confidence bucket
  - Explainability traces
  - Consent states and timestamps

### 5.3 Event Model (Core Topics)
- `candidate.profile.updated`
- `candidate.memorybank.entry.added`
- `employer.role.updated`
- `opportunity.ingested`
- `opportunity.canonicalized`
- `match.scored`
- `match.candidate.decisioned`
- `match.employer.decisioned`
- `match.introduction.created`
- `match.feedback.submitted`

## 6. Matching and AI Architecture

### 6.1 Matching Pipeline
1. Ingest and canonicalize opportunities.
2. Retrieve candidate and employer graph features.
3. Compute dimension-level scores:
   - Capability
   - Growth trajectory
   - Culture compatibility
   - Values/mission
   - Practical constraints
   - Mutual advantage
4. Apply hard policy filters (comp, visa, location, consent boundaries).
5. Compute calibrated confidence score and bucket.
6. Generate explainability summaries for both sides.
7. Trigger double opt-in workflow.

### 6.2 AI Components
- Extraction models:
  - STAR extraction, skill/theme detection, requirement parsing
- Classification and quality models:
  - Posting clarity/bias signals, evidence strength scoring
- Retrieval + LLM orchestration:
  - Context assembly from graphs/documents
  - Prompt governance and output validation
- Ranking and calibration:
  - Offline evaluation + online calibration loop

### 6.3 Human Approval Guardrails
- No outbound introduction without explicit candidate and employer approvals.
- No autonomous application submission.
- No silent data sharing across parties.
- Policy engine enforces non-bypassable approval gates in workflows.

## 7. Privacy, Security, and Compliance

### 7.1 Data Protection
- Encryption in transit and at rest.
- PII segmentation and strict access scopes.
- Field-level controls for sensitive attributes.
- Data retention/erasure lifecycle and user export portability.

### 7.2 Consent and Data Dignity
- Explicit consent records for:
  - profile use in matching
  - data sharing at introduction stage
  - model improvement/training participation
- Candidate data portability exports.
- Immutable audit trails for consent and sharing actions.

### 7.3 Security Controls
- Tenant isolation for employer data.
- Secret management and key rotation.
- Continuous vulnerability scanning and incident playbooks.
- Abuse controls for scraping connectors and bot activity.

## 8. Workflow Architecture

### 8.1 Candidate Lifecycle
- Onboard -> memory capture -> profile enrichment -> opportunity triage -> match review -> opt-in/decline -> intro support -> feedback/debrief.

### 8.2 Employer Lifecycle
- Org onboarding -> role definition -> posting enrichment -> match review -> opt-in/decline -> interview workflow -> hire/no-hire feedback.

### 8.3 Introduction State Machine
- `discovered` -> `candidate_interested|candidate_passed`
- `candidate_interested` -> `employer_interested|employer_passed`
- `candidate_interested + employer_interested` -> `introduced`
- Terminal states maintain reason codes for calibration and fairness audits.

## 9. Analytics, Evaluation, and Observability

### 9.1 Product and Marketplace Metrics
- Match quality satisfaction (candidate/employer)
- Time-to-interview and time-to-fill
- Coverage by source tier
- Conversion rates by confidence bucket

### 9.2 Model and System Quality
- Confidence calibration quality
- Precision/recall by dimension
- Bias/fairness slices and disparity alerts
- Drift detection for source and profile distributions

### 9.3 Platform Observability
- Distributed tracing, structured logs, domain KPIs
- Workflow failure and stuck-state detection
- Data quality SLAs for ingestion and graph freshness

## 10. Integration Strategy

### 10.1 External Integrations
- Job board APIs (contract-based connectors)
- Career page crawlers/scrapers with compliance and rate-limits
- Calendar/email integrations for workflow assistance (opt-in)

### 10.2 Internal Integration Contracts
- Event schemas versioned and backward compatible
- Domain APIs with explicit ownership and SLAs
- Shared platform libraries only for cross-cutting concerns (auth, policy, telemetry)

## 11. Delivery Sequencing (Architecture-Aware)
- Sequence starts with Steadyhand, but all interfaces align to full-system contracts from day one.
- Define stable canonical models early (candidate graph, team needs graph, match artifact).
- Implement match workflow engine with feature flags so Clearview and aggregation sources can attach incrementally.
- Keep governance and consent controls in v1 architecture, not deferred.

## 12. Key Risks and Architectural Mitigations
- Cold start:
  - Build standalone candidate value and reusable profile graph assets.
- False claims/fabrication:
  - Evidence scoring, confidence weighting, and transparency surfaces.
- Bias:
  - Fairness monitoring service, policy constraints, periodic audits.
- Privacy breach:
  - PII segmentation, consent ledger, zero-trust access patterns.
- Employer gaming:
  - Feedback loops, source/role credibility scoring, downgrade mechanisms.

## 13. Open Architecture Decisions (To Resolve Before MVP-Plus)
- Modular monolith vs. early microservices split for core domains.
- Graph database choice and coexistence with relational model.
- Real-time vs. batch matching cadence by source tier.
- Hosting strategy for LLM orchestration (managed vs. self-hosted for sensitive workloads).
- Compliance baseline by launch region and enterprise requirements.
