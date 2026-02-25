# Phase 1: Steadyhand MVP — Candidate Engine

**Duration:** 8 weeks (4 sprints)
**Depends on:** Phase 0 (Foundation)
**Enables:** Phase 2 (Aggregation + Matching)

---

## 1. Phase Goal

Deliver the Steadyhand single-player wedge: a standalone candidate experience where users can paste an external job description URL, receive an instant fit-and-effort analysis against their profile, and draft tailored application materials (cover letters, resume bullets) — all on day one. Subsequent sprints layer in conversational experience capture, document import, and cognitive protection. No matching or employer-side features.

---

## 2. Sprint Breakdown

### Sprint 1 (Weeks 3-4): Auth, Profile Foundation, External JD URL Parser

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 1.1 | **Candidate auth system** | OAuth 2.0 with Google and LinkedIn (Passport.js strategies). JWT issuance (RS256, 15-min access, 7-day refresh). HttpOnly/Secure cookie storage. Token refresh endpoint. Token blocklist in Redis. | 3d |
| 1.2 | **Candidate profile CRUD** | `POST/GET/PATCH /candidate/profile`. Profile status tracking (`incomplete`, `active`). Profile completeness scoring logic. Database: `candidates` table with all fields from schema. | 2d |
| 1.3 | **Memory Bank API** | `POST/GET/PATCH/DELETE /candidate/memory-bank`. Database: `experiences` table. JSONB fields for skills, themes, context. Source tracking (`conversation`, `import`, `manual`). | 2d |
| 1.4 | **STAR extraction pipeline** | Claude integration via AI Gateway for structured output. Input: raw narrative text. Output: JSON conforming to `MemoryEntry` schema (situation, task, action, result). Schema validation on output. Prompt versioned as immutable artifact. | 3d |
| 1.5 | **Skill and theme tagging** | NER-based skill extraction (explicit + implicit). Theme classification against taxonomy (leadership, conflict resolution, technical depth, etc.). Deterministic taxonomy post-processing after LLM output. | 2d |
| 1.6 | **Evidence strength scoring** | Specificity heuristic (ratio of concrete details to vague claims). LLM verification pass. Score range: 0.0000 to 1.0000. | 1d |
| 1.7 | **AI Gateway foundation** | Abstraction layer for LLM calls. Claude as primary, OpenAI as fallback. Prompt version registry. Schema-constrained output enforcement. Request/response logging. Cost tracking per call. | 3d |
| 1.8 | **External JD URL Parser** | `POST /candidate/jd-parse`. Accept an external job-posting URL. Scrape page content via Firecrawl (primary) / Jina Reader (fallback). Extract structured JD fields via Claude: title, company, location, seniority, requirements (must-have vs. nice-to-have), responsibilities, compensation range (if present), work arrangement. Store in `parsed_jds` table. Idempotent on URL (return cached parse if < 7 days old). Rate limit: 20 parses/hour per user. | 3d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 1.9 | **Auth flows** | Login/signup with Google and LinkedIn. Token management. Protected route wrapper. Redirect logic. | 2d |
| 1.10 | **Profile creation wizard** | Multi-step onboarding flow. Name, headline, basic info. Resume quick-import prompt. Progress indicator. Save partial progress. | 2d |
| 1.11 | **Memory Bank UI** | Experience list view. Add experience form (manual entry). View structured STAR breakdown per experience. Edit/delete experiences. Skills and themes displayed as tags. Evidence strength indicator. | 3d |
| 1.12 | **JD URL input & parsed preview** | URL paste input (hero placement on dashboard). Loading skeleton during scrape. Parsed JD preview card with editable fields (title, company, requirements list). Error handling for unparseable URLs. "Analyze Fit" CTA linking to Sprint 2 flow. | 2d |

#### Deliverables
- Candidate can sign up, create profile, manually add experiences
- Experiences are auto-structured into STAR format with skill/theme tagging
- Evidence strength is scored per experience
- AI gateway is operational with prompt versioning
- **Candidate can paste any public JD URL and see a structured, editable job description**

---

### Sprint 2 (Weeks 5-6): Fit & Effort Estimation, Material Drafting, Document Import

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 2.1 | **Fit Analysis Engine** | `POST /candidate/jd/:jdId/fit-analysis`. Compare candidate Memory Bank (skills, themes, evidence strength) + preferences against parsed JD requirements. Output: overall fit score (0–100), strengths (matched skills with supporting experiences), gaps (missing requirements with severity), qualification match checklist. Cache result per candidate×JD pair. Re-compute on profile change via event. | 3d |
| 2.2 | **Effort Estimation** | Extension of fit analysis response. For each identified gap: estimated ramp-up category (`quick-win`, `moderate`, `stretch`), suggested learning signals, and relevance weight to the role. Heuristic + LLM hybrid scoring. | 2d |
| 2.3 | **Material Drafting Service** | `POST /candidate/jd/:jdId/draft-materials`. Generate tailored cover letter using candidate Memory Bank experiences mapped to JD requirements. Generate tailored resume bullet suggestions keyed to JD keywords. Support `type` param: `cover_letter`, `bullets`, `both`. Regeneration with optional user guidance prompt. Store drafts in `material_drafts` table. | 3d |
| 2.4 | **Document importer** | Resume parsing: PDF and DOCX support. `profile_documents` table. File upload to S3. Text extraction. Structured data extraction via Claude (roles, companies, dates, descriptions). Auto-populate memory bank entries from parsed resume. Processing status tracking (`pending`, `processing`, `completed`, `failed`). | 3d |
| 2.5 | **Preference Map API** | `GET/PUT /candidate/preferences`. Database: `candidate_preferences` table. Role types, seniority, industries, work arrangements, compensation, locations, growth areas, dealbreakers. | 1d |
| 2.6 | **Growth Map API** | `GET/PUT /candidate/growth-map`. Database: `growth_map` table. Skills in progress, growth edges, trajectory direction, topics engaged, projects pursued. | 1d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 2.7 | **Fit analysis dashboard** | Visual fit score (gauge or ring). Strengths section with matched skills linked to supporting Memory Bank entries. Gaps section with severity badges and effort estimates. Qualification checklist with pass/partial/miss indicators. | 3d |
| 2.8 | **Material drafting UI** | Cover letter editor with AI-generated draft, inline editing, tone selector (professional / conversational / concise). Tailored bullets list with copy-individual and copy-all. Export to clipboard / .txt / .docx. Regenerate button with optional guidance input. | 3d |
| 2.9 | **Document upload** | Drag-and-drop resume upload. Processing status indicator. Preview of parsed content. Accept/edit/reject parsed experiences before saving. | 2d |
| 2.10 | **Preferences editor** | Form for all preference fields. Work arrangement toggles. Salary range input. Location preferences with search. Dealbreakers management. | 2d |
| 2.11 | **Growth Map UI** | Skills in progress editor. Growth edges identification. Trajectory direction selector. Learning signals display. | 1d |

#### Deliverables
- **Full Steadyhand wedge loop operational: Paste URL → Fit Analysis → Draft Materials**
- Fit score with strengths, gaps, and effort estimates for any parsed JD
- Tailored cover letter and resume bullet generation
- Resume import with auto-population of memory bank
- Full preference and growth map management

---

### Sprint 3 (Weeks 7-8): Conversation Capture, Consent, Embeddings, Data Export

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 3.1 | **WebSocket conversation endpoint** | `WebSocket /candidate/conversation`. Claude-powered conversational experience capture. Rate limiting: 30 msgs/min, 5 concurrent connections, 4000 token input budget. Idle timeout: 30 min. 429 frame with retry-after on limit exceeded. | 3d |
| 3.2 | **Conversation-to-Memory-Bank pipeline** | Parse conversation turns into candidate experience narratives. Run through STAR extraction + skill tagging + evidence scoring. Auto-create `MemoryEntry` records. Emit `candidate.memory_bank.added` event. Re-trigger fit analysis cache invalidation for active JDs. | 2d |
| 3.3 | **Embedding generation** | OpenAI `text-embedding-3-large` with `dimensions=1536`. Generate embeddings for each experience. Aggregate profile embedding. Store in pgvector columns. Event-triggered refresh on profile write. | 2d |
| 3.4 | **Consent management APIs** | `PUT/GET /candidate/consents`. `GET /candidate/consents/history`. Database: `consent_records`, `candidate_consent_events`. Consent types: `model_training`, `cross_party_data_share`, `match_notifications`. Immutable event append. `TrainingEligibilitySnapshot` generation. | 2d |
| 3.5 | **Profile completeness scoring** | Calculate completeness based on filled sections (memory bank entries, preferences, growth map, documents). Expose on profile response. | 1d |
| 3.6 | **Data export API** | `GET /candidate/data-export`. Full profile + consent history + all experiences + parsed JDs + material drafts in JSON. Downloadable archive. SLA: generated within 24 hours. | 1d |
| 3.7 | **Account deletion** | `DELETE /candidate/account`. Full cascade per Architecture Section 5.6. PII purge, anonymization of compliance records, S3 object deletion, Redis cache invalidation, token blocklist insertion. | 2d |
| 3.8 | **Account pause/deactivation** | `POST /candidate/account/pause`, `POST /candidate/account/reactivate`. Suppress candidate from matching pipeline. Pause all notifications. Retain profile data. Distinct from deletion — common for candidates who accept a role or take a break. | 1d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 3.9 | **Conversation interface** | Chat-style UI for experience capture. WebSocket connection management. Message history. Typing indicators. Connection state handling. Graceful reconnect on disconnect. | 3d |
| 3.10 | **Consent settings page** | Toggle controls for each consent type. Consent version display. History view showing all consent changes with timestamps. Clear explanations of what each consent controls. | 1d |
| 3.11 | **Settings and account management** | Data export request. Account deletion with confirmation flow. Account pause/reactivate toggle. Consent management (linked from above). Profile visibility settings. | 2d |
| 3.12 | **Onboarding completion tracking** | Guide new users through profile setup. Mark onboarding completed. Track `onboarding_completed_at`. | 1d |

#### Deliverables
- Conversational experience capture via WebSocket
- Consent system with immutable audit trail
- Embeddings generated and stored for all experiences
- Data export and account deletion (GDPR/CCPA compliance)
- Account pause/deactivation for job-search breaks
- Onboarding flow complete

---

### Sprint 4 (Weeks 9-10): Cognitive Protection Suite, Dashboard, Polish

#### Backend

| # | Task | Details | Est. |
|---|---|---|---|
| 4.1 | **Prep Engine** | Company research aggregation for known roles. Question prediction mapped to Memory Bank stories. Talking points generation. Calm Mode: strip to 3 key points + 1 opening story. Integrates with parsed JDs when available. | 3d |
| 4.2 | **Follow-Up Manager** | Draft thank-you notes based on interview context. Check-in message templates. Timing recommendations. All drafts require explicit human approval before send. | 2d |
| 4.3 | **Interaction event tracking** | Record candidate interactions: profile views, match card views, saves, passes, time-on-card, JD parses, fit analyses run, materials drafted. Foundation for outcome data collection needed by Phase 4 ML training. Emit `candidate.interaction.tracked` events. | 2d |
| 4.4 | **Triage Engine** | Analyze candidate's profile completeness and readiness. Generate daily briefing logic (prioritized next actions). Surface highest-fit parsed JDs. Reduce decision fatigue by batching recommendations. | 2d |
| 4.5 | **Emotional Intelligence layer** | Detect candidate activity patterns. Reduce prompt volume during low-activity periods. Adjust tone after rejections (no toxic positivity). Never shame inactivity. Configurable sensitivity. | 2d |

#### Frontend

| # | Task | Details | Est. |
|---|---|---|---|
| 4.6 | **Dashboard / home screen** | Profile completeness overview. Recent parsed JDs with fit scores. Triage engine recommendations. Quick actions (paste JD URL, add experience, update preferences). | 2d |
| 4.7 | **Prep mode UI** | Pre-interview prep view. Story suggestions mapped to predicted questions. Calm Mode toggle. Minimal, focused design. | 2d |
| 4.8 | **Follow-Up Manager UI** | Draft review interface. Edit before send. Timing recommendations display. Approval confirmation. | 1d |
| 4.9 | **Responsive design pass** | Mobile-responsive layouts. Loading states. Error handling. Empty states. | 2d |
| 4.10 | **Accessibility audit and fixes** | WCAG 2.1 AA compliance audit (axe-core + manual testing). Fix identified issues. Keyboard navigation verification. Screen reader testing. | 2d |
| 4.11 | **End-to-end polish** | Cross-browser testing. Animation and transition refinement. Error state consistency. Empty state illustrations. Final design QA pass. | 2d |

#### Deliverables
- Prep Engine with Calm Mode operational
- Follow-Up Manager with human approval gate
- Candidate dashboard with triage recommendations and JD fit overview
- Emotional intelligence layer active
- Interaction event tracking for future ML training data
- WCAG 2.1 AA accessibility audit completed and issues fixed
- Polished, production-quality candidate experience

---

## 3. Data Model Deliverables (Phase 1)

All tables from Architecture Section 2.4.1:
- `candidates`
- `candidate_consent_events`
- `experiences` (with pgvector index)
- `candidate_preferences`
- `growth_map`
- `profile_documents`
- `parsed_jds` (new — stores scraped + structured job descriptions, keyed by URL hash)
- `material_drafts` (new — stores generated cover letters, tailored bullets per candidate×JD)

Governance tables (shared, deployed in Phase 0 but populated in Phase 1):
- `consent_records`
- `audit_events`
- `training_eligibility_snapshots`

---

## 4. API Endpoints Delivered

```
POST   /candidate/profile
GET    /candidate/profile
PATCH  /candidate/profile

POST   /candidate/memory-bank
GET    /candidate/memory-bank
PATCH  /candidate/memory-bank/:id
DELETE /candidate/memory-bank/:id

POST   /candidate/jd-parse
GET    /candidate/jd/:jdId
GET    /candidate/jds
POST   /candidate/jd/:jdId/fit-analysis
GET    /candidate/jd/:jdId/fit-analysis
POST   /candidate/jd/:jdId/draft-materials
GET    /candidate/jd/:jdId/drafts

GET    /candidate/preferences
PUT    /candidate/preferences

GET    /candidate/growth-map
PUT    /candidate/growth-map

PUT    /candidate/consents
GET    /candidate/consents
GET    /candidate/consents/history

GET    /candidate/data-export
DELETE /candidate/account
POST   /candidate/account/pause
POST   /candidate/account/reactivate

WebSocket /candidate/conversation
```

### API Request/Response Contracts

#### Candidate Profile

```yaml
POST /api/v1/candidate/profile
  Request:
    {
      "firstName": "string",
      "lastName": "string",
      "headline": "string",
      "location": { "city": "string", "state": "string", "country": "string" }
    }
  Response: 201
    {
      "id": "uuid",
      "email": "string",
      "profileCompletenessScore": 0.15,
      "createdAt": "timestamp"
    }

GET /api/v1/candidate/profile
  Response: 200
    {
      "id": "uuid",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "headline": "string",
      "location": {},
      "profileCompletenessScore": 0.75,
      "visibility": "matches_only",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }

PATCH /api/v1/candidate/profile
  Request:
    { "headline": "string", "location": {} }
  Response: 200
    { "id": "uuid", "profileCompletenessScore": 0.78, "updatedAt": "timestamp" }
```

#### Memory Bank

```yaml
POST /api/v1/candidate/memory-bank
  Request:
    {
      "title": "string",
      "company": "string",
      "startDate": "date",
      "endDate": "date",
      "isCurrent": false,
      "rawDescription": "string"
    }
  Response: 201
    {
      "id": "uuid",
      "title": "string",
      "situation": "string",
      "task": "string",
      "action": "string",
      "result": "string",
      "skillsDemonstrated": ["string"],
      "themes": ["string"],
      "evidenceStrength": 0.85,
      "createdAt": "timestamp"
    }

GET /api/v1/candidate/memory-bank
  Query: page (default: 1), limit (default: 20), sortBy (default: "createdAt")
  Response: 200
    {
      "data": [{ "id": "uuid", "title": "string", "company": "string", "skillsDemonstrated": ["string"], "evidenceStrength": 0.85 }],
      "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
    }

DELETE /api/v1/candidate/memory-bank/:id
  Response: 204
```

#### Conversation (WebSocket)

```yaml
WebSocket /api/v1/candidate/conversation

  Client → Server:
    { "type": "message", "content": "string", "context": { "currentExperienceId": "uuid (optional)" } }

  Server → Client (message):
    { "type": "message", "content": "string", "metadata": { "suggestions": ["string"] } }

  Server → Client (streaming):
    { "type": "chunk", "content": "string", "sequence": 1 }
    { "type": "complete", "structuredOutput": { "experienceId": "uuid", "situation": "...", "task": "...", "action": "...", "result": "..." } }
```

#### Preferences

```yaml
GET /api/v1/candidate/preferences
  Response: 200
    {
      "roleTypes": ["full-time", "contract"],
      "seniorityLevels": ["senior", "staff"],
      "industries": ["fintech", "healthcare"],
      "workArrangements": ["remote", "hybrid"],
      "workStylePreferences": { "async": true, "collaborative": true },
      "minSalaryExpectation": 150000,
      "maxSalaryExpectation": 200000,
      "salaryCurrency": "USD",
      "locations": ["San Francisco", "Remote"],
      "willingToRelocate": false,
      "growthAreas": ["management", "system design"],
      "dealbreakers": ["no visa sponsorship"]
    }

PUT /api/v1/candidate/preferences
  Request: { "roleTypes": ["full-time"], "minSalaryExpectation": 160000 }
  Response: 200 { "success": true, "updatedAt": "timestamp" }
```

#### Consents

```yaml
PUT /api/v1/candidate/consents
  Request: { "modelTraining": true, "crossPartyDataShare": true, "matchNotifications": true }
  Response: 200
    {
      "consents": {
        "modelTraining": { "value": true, "version": "1.0", "updatedAt": "timestamp" },
        "crossPartyDataShare": { "value": true, "version": "1.0", "updatedAt": "timestamp" }
      }
    }

GET /api/v1/candidate/consents
  Response: 200
    { "consents": { "modelTraining": { "value": true, "version": "1.0", "grantedAt": "timestamp" } } }

GET /api/v1/candidate/consents/history
  Query: page, limit
  Response: 200
    { "data": [{ "consentType": "model_training", "value": true, "version": "1.0", "changedAt": "timestamp", "source": "settings" }] }
```

#### Data Export and Account Management

```yaml
GET /api/v1/candidate/data-export
  Response: 200 (application/zip)
  Contains: profile.json, memory-bank.json, preferences.json, growth-map.json, consent-history.json, parsed-jds.json, material-drafts.json, documents/

DELETE /api/v1/candidate/account
  Request: { "confirmation": "DELETE MY ACCOUNT", "reason": "string (optional)" }
  Response: 200
    { "message": "Account deletion initiated", "deletionId": "uuid", "estimatedCompletionTime": "timestamp" }
```

#### JD URL Parser (Wedge Entry Point)

```yaml
POST /api/v1/candidate/jd-parse
  Request:
    { "url": "https://example.com/jobs/senior-engineer" }
  Response: 201
    {
      "id": "uuid",
      "url": "string",
      "title": "Senior Software Engineer",
      "company": "Acme Corp",
      "location": "San Francisco, CA (Hybrid)",
      "seniority": "senior",
      "requirements": {
        "mustHave": ["5+ years backend experience", "Distributed systems"],
        "niceToHave": ["Kubernetes", "ML experience"]
      },
      "responsibilities": ["Design and build core platform services", "Mentor junior engineers"],
      "compensationRange": { "min": 180000, "max": 240000, "currency": "USD" },
      "workArrangement": "hybrid",
      "parsedAt": "timestamp",
      "source": "firecrawl"
    }

GET /api/v1/candidate/jd/:jdId
  Response: 200
    { ... same as above ... }

GET /api/v1/candidate/jds
  Query: page (default: 1), limit (default: 20)
  Response: 200
    {
      "data": [{ "id": "uuid", "title": "string", "company": "string", "fitScore": 82, "parsedAt": "timestamp" }],
      "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
    }
```

#### Fit & Effort Analysis

```yaml
POST /api/v1/candidate/jd/:jdId/fit-analysis
  Request: {} (uses authenticated candidate's profile)
  Response: 200
    {
      "jdId": "uuid",
      "candidateId": "uuid",
      "fitScore": 82,
      "strengths": [
        { "skill": "Distributed systems", "evidenceStrength": 0.91, "experienceId": "uuid", "summary": "Led migration to event-driven architecture at Acme" }
      ],
      "gaps": [
        { "requirement": "Kubernetes experience", "severity": "nice_to_have", "effortCategory": "quick_win", "learningSuggestion": "Container orchestration fundamentals" }
      ],
      "qualificationChecklist": [
        { "requirement": "5+ years backend", "status": "pass", "evidence": "7 years across 3 roles" },
        { "requirement": "ML experience", "status": "partial", "evidence": "Coursework, no production" }
      ],
      "analyzedAt": "timestamp"
    }
```

#### Material Drafting

```yaml
POST /api/v1/candidate/jd/:jdId/draft-materials
  Request:
    {
      "type": "cover_letter | bullets | both",
      "guidance": "string (optional — user hint for tone or focus)"
    }
  Response: 201
    {
      "id": "uuid",
      "jdId": "uuid",
      "coverLetter": "string (markdown, if requested)",
      "tailoredBullets": [
        { "keyword": "distributed systems", "bullet": "Architected event-driven pipeline processing 2M events/day..." }
      ],
      "generatedAt": "timestamp"
    }

GET /api/v1/candidate/jd/:jdId/drafts
  Response: 200
    { "data": [{ "id": "uuid", "type": "cover_letter", "generatedAt": "timestamp", "preview": "first 200 chars..." }] }
```

---

## 5. AI Pipeline Deliverables

| Component | Model | Input | Output |
|---|---|---|---|
| STAR Extractor | Claude (structured output) | Raw narrative text | `{ situation, task, action, result }` JSON |
| Skill Tagger | Claude + taxonomy mapper | Experience text | `{ explicit: string[], implicit: string[] }` |
| Theme Classifier | Claude (zero-shot) | Experience text | `string[]` from taxonomy |
| Evidence Scorer | Heuristic + Claude verification | Structured experience | `float (0-1)` |
| **JD Parser** | Firecrawl/Jina (scrape) + Claude (extract) | Raw HTML from JD URL | Structured JD: title, company, requirements, responsibilities |
| **Fit Analyzer** | Claude (structured output) | Candidate profile + parsed JD | Fit score, strengths, gaps, qualification checklist |
| **Effort Estimator** | Heuristic + Claude | Identified skill gaps | Ramp-up category, learning suggestions |
| **Material Drafter** | Claude | Memory Bank + parsed JD + user guidance | Cover letter (markdown), tailored resume bullets |
| Embedding Generator | OpenAI text-embedding-3-large | Experience text / profile aggregate | `float[1536]` |
| Conversation Agent | Claude via AI Gateway | User messages + context | Structured experience narratives |
| Document Parser | Claude | Resume text | Structured roles, companies, dates, descriptions |
| Prep Engine | Claude | Memory Bank + role context | Talking points, predicted questions, story matches |

---

## 6. Event Contracts Introduced

| Event | Producer | Consumers (Phase 1) |
|---|---|---|
| `candidate.profile.updated` | Steadyhand | Fit analysis cache invalidation |
| `candidate.memory_bank.added` | Steadyhand | Embedding updater, fit analysis cache invalidation |
| `candidate.jd.parsed` | JD Parser | (Triggers fit analysis availability) |
| `candidate.fit_analysis.completed` | Fit Analyzer | (Dashboard display; analytics) |
| `candidate.materials.drafted` | Material Drafter | (Analytics; interaction tracking) |
| `candidate.interaction.tracked` | Steadyhand | (Analytics; ML training data in Phase 4) |
| `consent.updated` | Consent Manager | Audit ledger, Training eligibility |

---

## 7. Testing Requirements

| Category | Tool | Scope | Coverage Target |
|---|---|---|---|
| Unit tests | Vitest (TS) / pytest (Python) | STAR extraction, skill tagging, evidence scoring, consent state machine, fit score calculation, effort categorization | 100% for consent, 80%+ for others |
| Integration tests | Vitest + Supertest + testcontainers | Auth flow, profile CRUD, memory bank CRUD, JD URL parse pipeline, fit analysis pipeline, material drafting pipeline, document import pipeline, embedding generation | 80%+ |
| E2E tests | Playwright | Sign up -> paste JD URL -> view fit analysis -> generate cover letter -> export. Sign up -> add experience via conversation -> view structured output | Key happy paths |
| AI output tests | Vitest + golden test sets | Golden test sets for STAR extraction, skill tagging, theme classification, JD parsing, fit analysis, material drafting | All golden sets passing |
| Security tests | Vitest + Supertest | Auth token handling, consent enforcement, account deletion cascade | 100% for consent and deletion |

---

## 8. Exit Criteria

From Architecture Section 10.5:

- [ ] **Wedge loop functional end-to-end: Paste JD URL -> Fit Analysis -> Draft Materials**
- [ ] JD URL parser handles top-10 job board formats (LinkedIn, Indeed, Greenhouse, Lever, etc.)
- [ ] Fit analysis produces scored output with strengths, gaps, and effort estimates
- [ ] Material drafting generates coherent, tailored cover letters and resume bullets
- [ ] Candidate profile completion >= 60% (among test users)
- [ ] Consent write/read audited (immutable event trail verified)
- [ ] 0 unauthorized outbound actions
- [ ] Resume import functional (PDF + DOCX)
- [ ] Conversation capture working end-to-end
- [ ] All candidate API endpoints operational
- [ ] Embedding generation and storage verified
- [ ] Account deletion cascade verified (all PII purged, compliance records retained anonymized)
- [ ] Account pause/reactivation verified (profile suppressed from matching, data retained)
- [ ] WCAG 2.1 AA accessibility audit completed with no Critical issues
- [ ] Interaction event tracking verified (events emitting correctly)
- [ ] AI gateway operational with fallback behavior tested

---

## 9. Key Risks (Phase 1)

| Risk | Impact | Mitigation |
|---|---|---|
| JD scraping fragility | Broken parses on layout changes, poor first impression | Firecrawl primary + Jina fallback, golden URL test suite across top job boards, cache parsed results |
| Fit analysis hallucination | Overstated strengths or missed gaps erode trust | Structured output schema enforcement, human-reviewable qualification checklist, golden test sets |
| Material drafting quality | Generic/unusable output defeats wedge value prop | Prompt iteration with real JD/profile pairs, tone selector, user guidance input, regeneration support |
| STAR extraction quality | Poor profile quality downstream | Golden test sets, prompt iteration, evidence scoring as quality gate |
| Resume parsing accuracy | Bad first impression, manual cleanup burden | Human review of parsed output before saving, feedback loop |
| WebSocket reliability | Conversation loss, frustration | Message persistence, reconnect logic, conversation history |
| LLM latency | Slow JD parse / fit analysis, poor UX | Streaming responses, optimistic UI, timeout handling, result caching |
| Consent complexity | Compliance gaps | Immutable event log, automated tests for every consent transition |
| Deferred encryption | PII at rest without app-level encryption in Phase 1 | PostgreSQL TDE + TLS in transit; app-level AES added in Phase 2 before cross-party data flows |

---

## 10. Sprint Acceptance Criteria

### Sprint 1 Exit Checks
- Candidate can sign up, create profile, and paste a JD URL to see structured output
- JD parser successfully handles URLs from >= 5 major job boards
- AI gateway is operational with prompt versioning and cost tracking
- No outbound communication path exists without explicit action token

### Sprint 2 Exit Checks
- **Full wedge loop operational:** Paste URL -> Fit Analysis -> Draft Materials
- Fit score correlates with manual assessor judgment on golden test set (>= 80% agreement)
- Generated cover letters are coherent, personalized, and reference specific candidate experiences
- Resume import populates memory bank with structured STAR entries (validator pass rate >= 99%)

### Sprint 3 Exit Checks
- Conversational experience capture produces valid STAR entries end-to-end
- Consent writes are immutable and queryable; audit trail complete for 100% of transitions
- Embeddings refresh on profile write events and are < 1 hour stale
- Data export includes all candidate data (profile, JDs, drafts, experiences, consent history)

### Sprint 4 Exit Checks
- Prep Engine produces actionable output for test scenarios
- Follow-Up Manager drafts require explicit human approval before any send action
- Dashboard surfaces parsed JDs with fit scores and triage recommendations
- Interaction event tracking verified (events persisting correctly)
- WCAG 2.1 AA audit completed with no Critical issues

## 11. Auth Implementation Reference

### OAuth Provider Configuration

```typescript
const oauthProviders = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: '/auth/google/callback',
    scopes: ['email', 'profile']
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackUrl: '/auth/linkedin/callback',
    scopes: ['r_emailaddress', 'r_liteprofile']
  }
};

interface TokenPayload {
  sub: string;          // User ID
  email: string;
  type: 'candidate' | 'employer';
  roleId?: string;      // For employer users
  iat: number;
  exp: number;
}

function generateTokens(userId: string, email: string, type: string): Tokens {
  const accessToken = jwt.sign(
    { sub: userId, email, type },
    privateKey,
    { algorithm: 'RS256', expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    privateKey,
    { algorithm: 'RS256', expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}
```

### Token Revocation

```typescript
class TokenRevocationService {
  private redis: RedisClient;

  async revokeToken(tokenId: string): Promise<void> {
    await this.redis.setex(`revoked:${tokenId}`, 900, '1'); // 15-min TTL
  }

  async isTokenRevoked(tokenId: string): Promise<boolean> {
    return (await this.redis.get(`revoked:${tokenId}`)) === '1';
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.redis.set(`user_revoked:${userId}`, Date.now().toString());
  }
}

async function authMiddleware(req, res, next) {
  const token = extractToken(req);
  const decoded = jwt.verify(token, publicKey);

  if (await tokenRevocation.isTokenRevoked(decoded.jti)) {
    return res.status(401).json({ error: 'Token revoked' });
  }

  const userRevokedAt = await redis.get(`user_revoked:${decoded.sub}`);
  if (userRevokedAt && decoded.iat < parseInt(userRevokedAt)) {
    return res.status(401).json({ error: 'Token revoked' });
  }

  req.user = decoded;
  next();
}
```

### PII Encryption

> **Deferred to Phase 2.** Application-level AES-256-GCM encryption for PII fields is explicitly deferred from the MVP to reduce Sprint 1-2 scope. Phase 1 relies on PostgreSQL TDE (Transparent Data Encryption) at rest and TLS in transit. The `EncryptionService` implementation and per-field encryption will be delivered in Phase 2 alongside the Aggregation + Matching work, where cross-party data handling makes application-level encryption a hard requirement.

### Consent Enforcement

```typescript
class ConsentEnforcement {
  async checkConsent(subjectId: string, consentType: ConsentType): Promise<boolean> {
    const consent = await db.query(
      `SELECT status FROM consent_records WHERE subject_id = $1 AND consent_type = $2 ORDER BY granted_at DESC LIMIT 1`,
      [subjectId, consentType]
    );
    return consent.rows[0]?.status === 'granted';
  }

  async requireConsent(subjectId: string, consentType: ConsentType): Promise<void> {
    if (!(await this.checkConsent(subjectId, consentType))) {
      throw new ConsentError(`Missing consent: ${consentType}`, 'MISSING_CONSENT');
    }
  }
}
```
