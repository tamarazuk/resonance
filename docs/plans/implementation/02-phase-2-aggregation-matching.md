# Phase 2: Aggregation + Basic Matching

**Duration:** 4 weeks (2 sprints)
**Depends on:** Phase 1 (Steadyhand MVP — ends Week 10)
**Enables:** Phase 3 (Clearview + Double Opt-In)

---

## 1. Phase Goal

Build the job opportunity aggregation pipeline (Tier 2-4 sources) and deliver basic candidate-side matching with explainability. Candidates see ranked, explained matches from aggregated job postings. No employer-side features yet.

---

## 2. Sprint Breakdown

### Sprint 5 (Weeks 11-12): Aggregation Service + Normalization

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 5.1 | **Job Board API connectors (Tier 2)** | Adapter pattern per provider behind unified `PostingConnector` interface. LinkedIn Job Posting API (OAuth 2.0). Indeed Publisher API (API key). Scheduled sync (hourly). Circuit breaker per connector. Rate limit handling with backoff. | 3d |
| 5.2 | **Career page monitor (Tier 3)** | Automated monitoring of target company career pages via managed LLM scraping APIs (Firecrawl or Jina Reader API) — no bespoke HTML parsing. Provider returns structured markdown/JSON; `PostingParser` normalizes output. Change detection (daily scrape cadence). Canonical URL tracking to avoid re-ingestion. Provider abstracted behind `ScrapingProvider` interface for swapability. | 2d |
| 5.3 | **Candidate submission handler (Tier 4)** | `POST /aggregation/postings/ingest` (candidate-facing). Submission deduplication. Multiple submissions of same posting increase priority. Routing to moderation queue before indexing. | 1d |
| 5.4 | **Normalization pipeline** | `PostingParser`: extract structured data from raw posting text. `RequirementExtractor`: identify must-have vs nice-to-have (Claude-assisted). `CompensationNormalizer`: standardize salary ranges, currency, equity. `ConfidenceAnnotator`: assign confidence score based on data quality (Tier 1-4 mapping). | 3d |
| 5.5 | **Deduplication service** | `FingerprintGenerator`: hash-based fingerprint from title + company + core description. `MergeHandler`: merge duplicate postings, prefer higher-tier source. Fuzzy matching for near-duplicates (title similarity + company match). | 2d |
| 5.6 | **Moderation pipeline (Tier 4)** | `AbuseClassifier`: flag spam, scam, and inappropriate postings. `QuarantineQueue`: hold flagged postings for human review. `POST /aggregation/postings/moderate` (internal/ops). Review actions: approve, reject, quarantine. | 2d |
| 5.7 | **Posting embedding generation** | Generate embeddings for all canonical job postings using OpenAI text-embedding-3-large (1536 dims). Store in `job_postings.embedding` column. Event-triggered on canonicalization. | 1d |
| 5.8 | **Database: employer and posting tables** | Deploy `employers`, `employer_users`, `roles`, `job_postings` tables. Indexes per Architecture Section 2.4.2. | 1d |
| 5.9a | **Stale JD validation worker (Tier 4)** | BullMQ cron job (runs every 6 hours) pings all candidate-submitted URLs (Tier 4). Detects 404, 3xx redirects to unrelated pages, and "Position Closed/Filled" badge via keyword heuristic. On stale detection: mark posting `status=archived`, emit `opportunity.archived` event, remove from candidate match feeds. Exponential back-off for transient failures (retry 3x before archival). Dashboard metric: stale-detection rate. | 2d |
| 5.9b | **PII encryption tech debt paydown** | Implement `EncryptionService` using AWS KMS envelope encryption (AES-256-GCM). Envelope pattern: KMS generates data key, service encrypts/decrypts in-process. Create reversible database migration script to encrypt all plaintext PII columns gathered during MVP phase (`candidates.email`, `candidates.phone`, `candidates.full_name`, etc.). Migration runs online with row-level locking; rollback path decrypts back to plaintext. Add `encrypted_at` audit column. Integration test: round-trip encrypt/decrypt for every PII field. | 3d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 5.9 | **Job posting submission UI** | Form for candidates to submit job postings they find (Tier 4). URL input with auto-fetch. Manual entry fallback. Submission confirmation and status tracking. | 1d |

#### Deliverables
- Tier 2 (job board APIs) and Tier 3 (career page scraping via managed LLM APIs) ingestion operational
- Tier 4 candidate submissions with moderation pipeline
- Normalization, deduplication, and confidence annotation for all postings
- Embeddings generated for all canonical postings
- Stale JD validation worker archiving dead/closed Tier 4 postings
- All MVP-phase plaintext PII encrypted via AWS KMS AES-256-GCM `EncryptionService`

---

### Sprint 6 (Weeks 13-14): Basic Matching + Candidate Match Feed

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 6.1 | **MVP matching algorithm** | Implement Phase 2 reference algorithm from Architecture Section 10.6. Semantic similarity (pgvector ANN), skill overlap, location match, salary alignment. Configurable weights from config store. Minimum threshold filtering. | 3d |
| 6.2 | **Match scoring pipeline** | Event triggers: `candidate.profile.updated`, `candidate.memory_bank.added`, `opportunity.canonicalized`. Refresh embeddings for updated entities. Retrieve top-100 by semantic similarity. Score and rank using MVP algorithm. Persist match records with explainability. | 3d |
| 6.3 | **Explainability generator** | Generate strengths, gaps, and practical constraints for each match. Reasoning text via Claude with retrieval context. Must conform to explainability schema. Match only persisted if explainability contract is complete. | 2d |
| 6.4 | **Confidence classifier** | Assign confidence bucket: Strong (85-100), Promising (70-84), Stretch (55-69), Weak (<55). Only Strong and Promising surfaced to candidates. Stretch available on candidate pull. Weak never surfaced. | 1d |
| 6.5 | **CQRS candidate match feed** | Denormalized read model: `candidate_match_feed`. Projected from `match.scored` events. Pre-ranked match cards with explainability summaries. Optimized for fast UI rendering. | 2d |
| 6.6 | **Match API endpoints** | `GET /candidate/matches` — paginated, ranked match feed from read model. `GET /candidate/matches/:id/explainability` — full dimension breakdown. `POST /candidate/matches/:id/respond` — interested/save/pass (candidate decision). | 2d |
| 6.7 | **Hourly backfill job** | BullMQ scheduled job: rescore all stale matches, recover stuck workflows, recalibrate. Success rate >= 99% target. DLQ routing for failed jobs. | 1d |
| 6.8 | **Match staleness tracking** | On candidate profile or role update, mark associated matches `stale=true`. Suppress stale matches from feed. Clear stale flag after rescore. Auto-archive matches > 30 days without interaction. | 1d |
| 6.9 | **Database: matching tables** | Deploy `matches`, `match_feedback` tables. Indexes per Architecture Section 2.4.3. Constraint: `match_has_target` check. | 1d |
| 6.10 | **Outcome data collection instrumentation** | Record candidate match interactions: card views, time-on-card, detail expansions, saves, passes, interested clicks. Store in `match_interaction_events` table. Consume `candidate.interaction.tracked` events from Phase 1. Foundation for two-tower model training in Phase 4. | 2d |
| 6.11 | **CQRS event replay tooling** | Build event replay utility for read model rebuild. Supports replaying all events for a given read model from the event store. Supports schema migration of read models by full replay. Required for safe read model evolution in Phase 3-4. | 1d |
| 6.12a | **Market calibration feedback** | Async worker compares candidate `PreferenceMap` (salary expectations, target seniority, location flexibility) against aggregated Tier 2/Clearview market data. Computes percentile rank for each preference dimension. If any dimension falls outside p5-p95 bounds for the candidate's target role cluster, emit `candidate.calibration.warning` event. Surfaces a non-blocking calibration nudge in the Steadyhand UI ("Your salary expectation is above 95% of similar roles in this market"). Candidate can dismiss or adjust preferences inline. Re-evaluated on `candidate.preferences.updated` and weekly via scheduled job. | 3d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 6.12 | **Candidate match feed** | Card-based match list. Match score visualization (confidence tier badge). Brief reasoning summary per card. Sort/filter options. Pagination/infinite scroll. "Last updated" timestamp. Pull-to-refresh. | 3d |
| 6.13 | **Match detail and explainability view** | Full explainability breakdown: strengths, gaps, practical constraints. Rationale text. Dimension scores visualization. Action buttons: Explore (interested), Save, Pass. | 2d |
| 6.14 | **Match decision interaction** | Interested/Save/Pass buttons with confirmation. Optimistic UI update on decision. Read model catches up async. Fallback to write path query if projection fails. | 1d |

#### Deliverables
- Candidates see ranked matches from aggregated job postings
- Every surfaced match includes explainability payload
- Candidate can express interest, save, or pass on matches
- Event-driven matching + hourly backfill operational
- Match staleness tracking and auto-archival
- Outcome data collection instrumented (card views, interactions, decisions)
- CQRS event replay tooling operational for read model rebuilds
- Market calibration feedback surfacing out-of-bounds preference warnings in UI

---

## 3. Data Model Deliverables (Phase 2)

New tables deployed:
- `employers` (structure only, populated in Phase 3)
- `employer_users` (structure only)
- `roles` (structure only for Tier 1, used for FK from matches)
- `job_postings` (with pgvector index)
- `matches` (with indexes)
- `match_feedback`
- `match_interaction_events` (outcome data for ML training)

---

## 4. API Endpoints Delivered

```
# Candidate matching
GET    /candidate/matches
GET    /candidate/matches/:id/explainability
POST   /candidate/matches/:id/respond

# Aggregation (internal/webhook)
POST   /aggregation/postings/ingest
POST   /aggregation/postings/moderate

# Internal matching
POST   /internal/match/trigger
GET    /internal/match/:id
```

### API Request/Response Contracts

#### Candidate Matches

```yaml
GET /api/v1/candidate/matches
  Query: page (default: 1), limit (default: 20), tier ("strong"|"promising"|"stretch"),
         status ("pending"|"interested"|"passed"), sortBy (default: "score")
  Response: 200
    {
      "data": [{
        "id": "uuid",
        "overallScore": 92,
        "matchTier": "strong",
        "job": {
          "title": "Senior Software Engineer",
          "company": "Acme Corp",
          "location": "San Francisco, CA",
          "workArrangement": "hybrid",
          "salaryRange": { "min": 180000, "max": 220000, "currency": "USD" }
        },
        "strengths": ["Strong backend experience matching requirements"],
        "gaps": ["Limited experience with Kubernetes"],
        "candidateStatus": "pending",
        "createdAt": "timestamp"
      }],
      "pagination": { "page": 1, "limit": 20, "total": 15 }
    }

POST /api/v1/candidate/matches/:id/respond
  Request: { "decision": "interested|pass|save", "reasonCode": "string (optional)" }
  Response: 200
    { "matchId": "uuid", "candidateStatus": "interested", "introductionStatus": "none" }
```

#### Internal Matching

```yaml
POST /api/v1/internal/match/trigger
  Auth: Internal service
  Request: { "entityType": "candidate|role|posting", "entityId": "uuid" }
  Response: 202 { "jobId": "uuid", "status": "queued" }
```

#### Event Contracts (Structured Payloads)

```yaml
match.scored:
  Payload: { "match_id": "uuid", "candidate_id": "uuid", "role_id": "uuid",
             "overall_score": 92, "match_tier": "strong", "has_explainability": true }
  Consumers: Steadyhand (feed), Clearview (feed), Read Model Projector

match.candidate.decisioned:
  Payload: { "match_id": "uuid", "candidate_id": "uuid", "decision": "interested",
             "reason_code": null }
  Consumers: Governance (audit), Clearview (update), Intro Orchestrator

opportunity.canonicalized:
  Payload: { "posting_id": "uuid", "source": "indeed", "data_quality_tier": 2,
             "confidence_score": 0.85 }
  Consumers: Resonance Core (match candidates)
```

---

## 5. Event Contracts Introduced

| Event | Producer | Consumers |
|---|---|---|
| `opportunity.canonicalized` | Aggregation | Resonance Core (match scoring) |
| `match.scored` | Resonance Core | Candidate match feed read model projector |
| `match.candidate.decisioned` | Steadyhand -> Core | Governance (audit), Read model projector |
| `match.feedback.submitted` | Candidate UI | Calibration layer (future) |
| `match.interaction.recorded` | Match Feed | Outcome data store (ML training, Phase 4) |
| `opportunity.archived` | Stale JD Worker | Match feed projector (remove from feeds), Aggregation (update index) |
| `candidate.calibration.warning` | Market Calibration Worker | Steadyhand UI (render nudge) |

---

## 6. Aggregation Source SLAs

| Source | Tier | Freshness Target | Confidence |
|---|---|---|---|
| Job Board APIs (LinkedIn, Indeed) | 2 | Indexed within 4 hours of API availability | Medium |
| Career page scrapes | 3 | Indexed within 24 hours of publication | Lower |
| Candidate submissions | 4 | Moderated and indexed within 48 hours | Varies |

---

## 7. Matching Pipeline Data Flow

```
1. Trigger event received (profile update, new posting canonicalized)
       │
2. Refresh embeddings for updated entities
       │
3. pgvector ANN: retrieve top-100 candidate-posting pairs by cosine similarity
       │
4. MVP scorer: semantic + skills + location + salary weighted scoring
       │
5. Confidence classifier: assign Strong/Promising/Stretch/Weak bucket
       │
6. Explainability generator: strengths, gaps, constraints, rationale text
       │
7. Persist match (only if explainability contract complete)
       │
8. Update CQRS read model (candidate_match_feed)
       │
9. Emit match.scored.v1 event
       │
10. Candidate views matches in feed (no auto-notification yet)
```

---

## 8. Testing Requirements

| Category | Tool | Scope | Coverage Target |
|---|---|---|---|
| Unit tests | Vitest (TS) / pytest (Python) | Match scoring algorithm, confidence classifier, deduplication fingerprinting | 100% for matching, 80%+ others |
| Integration tests | Vitest + Supertest + testcontainers | Full aggregation pipeline (ingest -> normalize -> dedupe -> embed), matching pipeline (trigger -> score -> persist -> read model) | 80%+ |
| E2E tests | Playwright | Candidate views matches, expresses interest, sees updated feed | Key happy paths |
| AI output tests | Vitest + golden test sets | Explainability generation conformance to schema | All golden sets passing |
| Load tests | k6 | Match scoring pipeline throughput, pgvector query latency at target data volume | p95 < 200ms for vector search |
| Moderation tests | Vitest + Supertest | Tier 4 quarantine path, abuse classifier accuracy | Quarantine path fully tested |

---

## 9. Exit Criteria

- [ ] Match explainability completeness = 100% for all surfaced matches
- [ ] Moderation quarantine path active for Tier-4 submissions
- [ ] Hourly backfill success rate >= 99%
- [ ] Tier-2 ingestion operational (at least one job board API)
- [ ] Tier-3 ingestion operational (career page monitoring via managed LLM scraping API)
- [ ] Candidate match feed rendering < 500ms (p95)
- [ ] All matches include confidence bucket classification
- [ ] Stale match suppression verified
- [ ] DLQ routing configured for all BullMQ queues
- [ ] Outcome data collection verified (interaction events persisting correctly)
- [ ] CQRS event replay tooling tested (full read model rebuild from events)
- [ ] Stale JD validation worker operational; archived postings removed from match feeds
- [ ] All PII columns encrypted at rest via `EncryptionService`; migration rollback tested
- [ ] Market calibration warnings surfacing for out-of-bounds preferences

---

## 10. Key Risks (Phase 2)

| Risk | Impact | Mitigation |
|---|---|---|
| Job board API access/rate limits | Incomplete opportunity coverage | Multiple source strategy, rate limit handling, circuit breakers |
| Low match quality at launch | Poor candidate experience, loss of trust | Conservative threshold (only surface Strong/Promising), explainability helps set expectations |
| Embedding quality issues | Poor recall in semantic search | Golden test sets for embedding quality, manual review of top matches |
| Deduplication false positives | Same posting shown multiple times or legitimate postings merged incorrectly | Fuzzy matching tuning, human review queue for uncertain merges |
| Moderation bottleneck | Tier-4 submissions stuck in queue | Auto-approve clear submissions, prioritize by submission count |

---

## 11. Sprint Acceptance Criteria

### Sprint 5 Exit Checks
- Tier 2 freshness <= 4 hours, Tier 3 freshness <= 24 hours
- Moderation quarantine path active with auditable actions
- Deduplication fingerprint precision meets baseline
- Stale JD validation worker running on schedule; stale Tier 4 postings archived
- PII encryption migration completed; round-trip encrypt/decrypt passing for all PII fields

### Sprint 6 Exit Checks (Phase 2 Gate)
- Explainability completeness = 100% for surfaced matches
- Hourly backfill success >= 99%
- Candidate match feed projection lag within SLA (< 5 minutes)
- Outcome data collection verified (interaction events persisting correctly)
- CQRS event replay tooling tested (full read model rebuild from events)
- Market calibration nudges rendering for candidates with out-of-bounds preferences
