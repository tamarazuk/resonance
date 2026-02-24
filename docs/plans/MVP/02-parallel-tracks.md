# Steadyhand MVP — Parallel Execution Tracks

> 4 isolated development tracks designed for simultaneous AI agent execution.
> Each track owns distinct directories and has clearly defined input/output contracts.

---

## Track Map

```
Day  1 ──────── 2 ──────── 3 ──────── 4 ──────── 5 ──────── 6 ──────── 7
     │          │          │          │          │          │          │
 ┌───┴──────────┴──────────┴──────────┴───┐  ┌──┴──────────┴──────────┴───┐
 │        PARALLEL DEVELOPMENT            │  │   INTEGRATION & POLISH     │
 └────────────────────────────────────────┘  └────────────────────────────┘

 Track A ■■■■■■■■■■■■■■■□□□□□□□□□□□□□░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 Track B ■■■■■■■■■■■■■■■■■■■■■■■■■■■■□□□□□□░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 Track C ■■■■■■■■■■■■■■■■■■■■■■■■■■■■□□□□□□░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 Track D ░░░░░░░■■■■■■■■■■■■■■■■■■■■■■■■■■■░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

 ■ = active dev   □ = integration handoff   ░ = polish / idle
```

---

## Track A — Foundation: Database, Auth & API Skeleton

**Owner:** Agent 1
**Dependencies:** None (all other tracks depend on Track A's outputs)
**Owns:** `lib/db/`, `lib/auth/`, `app/api/`, `docker-compose.yml`, `drizzle.config.ts`

### Contract (what other tracks consume)

- Typed DB client (`lib/db/client.ts`) — available end of Day 1
- Auth middleware + session helpers (`lib/auth/`) — available end of Day 2
- API route stubs with correct request/response types — available end of Day 2
- Fully implemented CRUD API routes — available end of Day 3

### Day-by-Day Deliverables

#### Day 1: Scaffold & Data Layer

- Project scaffold: `create-next-app` with App Router, TypeScript strict mode
- PostgreSQL + pgvector provisioned via Docker Compose (local dev)
- Install and configure Drizzle ORM with pgvector support
- **Define Drizzle schema FIRST (`lib/db/schema.ts`) — this is the single source of truth for all table definitions.** Schema includes:
  - `users` table (id, email, password_hash, full_name, headline, timestamps)
  - `experiences` table (id, user_id FK, raw_input, STAR fields, skills array, vector embedding, timestamps)
  - `applications` table (id, user_id FK, external_url, raw_content, parsed_jd JSONB, vector embedding, fit/analysis fields, status enum, timestamps)
  - Extension declarations for `pgcrypto` and `vector`
- **Auto-generate SQL migrations from Drizzle schema** via `npx drizzle-kit generate:pg` — never hand-write migration SQL
- Apply generated migrations to local DB via `npx drizzle-kit push:pg` (or `migrate` in code)
- Typed DB client with connection pooling (`lib/db/client.ts`)
- Bcrypt password hashing utility (`lib/auth/password.ts`)
- Install and configure NextAuth.js v5 with Credentials provider
- NextAuth `[...nextauth]` API route (`app/api/auth/[...nextauth]/route.ts`)

**Exit criteria:** `docker compose up` gives working DB with schema. `drizzle-kit generate:pg` produces migration files from schema. NextAuth route responds. **No hand-written SQL migrations exist — all migrations are generated from the Drizzle schema.**

#### Day 2: Auth Flows & API Stubs

- Auth API: `POST /api/auth/signup` (creates user with hashed password)
- Session middleware that extracts `userId` from JWT and injects into route handlers
- Auth guard middleware on all `/api/*` (except auth routes) and `/dashboard/*` routes
- Stub ALL API routes with correct types (empty 200 responses):
  - `GET /api/experiences` — list user's experiences
  - `POST /api/experiences` — create experience
  - `GET /api/experiences/[id]` — get single experience
  - `PUT /api/experiences/[id]` — update experience
  - `DELETE /api/experiences/[id]` — delete experience
  - `POST /api/applications` — create application (accepts URL)
  - `GET /api/applications` — list user's applications
  - `GET /api/applications/[id]` — get single application
  - `DELETE /api/applications/[id]` — delete application
  - `POST /api/applications/[id]/draft` — generate materials

**Exit criteria:** Signup -> login -> access protected route works E2E. All stubs return typed 200s.

#### Day 3: Experience CRUD & Application Creation

- Implement full CRUD for `/api/experiences` (DB reads/writes, Zod input validation)
- Implement `POST /api/applications` (accepts URL, saves row with `status: 'pending'`)
- Implement `GET /api/applications` and `GET /api/applications/[id]`
- Row-level access enforcement on all queries (filter by `session.user.id`)

**Exit criteria:** Experiences can be created, read, updated, deleted via API. Applications can be created and listed.

#### Day 4: Pipeline Integration

- Wire Track B's LLM pipelines into experience mutations:
  - `POST /api/experiences` → calls STAR structurer + embedding generator → saves structured data + embedding
- Wire Track B's pipelines into application mutations:
  - `POST /api/applications` → calls scraper → JD parser → embedding → fit analysis → saves all fields
  - `POST /api/applications/[id]/draft` → calls material drafter → updates row
- Add streaming support for long-running LLM calls (cover letter generation)
- Status transition management for applications (`pending` → `parsing` → `analyzed` → `drafted`)

**Exit criteria:** Full pipeline works: create experience → structured + embedded. Create application → scraped + parsed + analyzed. Draft → cover letter + bullets generated.

---

## Track B — LLM Pipelines: Scraper, Structuring, Embeddings, Analysis

**Owner:** Agent 2
**Dependencies:** None for Days 1-3 (pure utility functions). Day 4 depends on Track A's DB client for integration.
**Owns:** `lib/llm/`, `lib/scraper/`, `lib/analysis/`, `lib/drafting/`

### Contract (what other tracks consume)

All exports are **pure functions** with typed inputs/outputs. No direct DB access.

```typescript
// lib/llm/prompts/star.ts
structureExperience(rawText: string): Promise<StarStructureOutput>

// lib/llm/embeddings.ts
generateEmbedding(text: string): Promise<number[]>

// lib/scraper/index.ts
scrapeJobPosting(url: string): Promise<{ markdown: string; metadata?: { title?: string; description?: string } }>

// lib/llm/prompts/jd-parser.ts
parseJobDescription(cleanText: string): Promise<ParsedJD>

// lib/analysis/fit.ts
analyzeFit(jdEmbedding: number[], experiences: { id: string; embedding: number[]; star: StarStructureOutput }[]): Promise<FitAnalysis>

// lib/drafting/index.ts
draftMaterials(jd: ParsedJD, topExperiences: Experience[], profile: User): Promise<DraftedMaterials>
```

### Day-by-Day Deliverables

#### Day 1: LLM Client & STAR Structuring

- LLM client abstraction (`lib/llm/client.ts`):
  - Wraps OpenAI/Anthropic SDK
  - Retry with exponential backoff (3 attempts)
  - Configurable timeout (default 30s)
  - Streaming support via Vercel AI SDK
  - Structured output mode with JSON schema enforcement
- STAR structuring prompt (`lib/llm/prompts/star.ts`):
  - Takes raw experience text
  - Returns `StarStructureOutput` (title, situation, task, action, result, skills[])
  - Zod validation on LLM response
  - Handles edge cases: too-short input, non-professional content
- Embedding utility (`lib/llm/embeddings.ts`):
  - Wraps OpenAI `text-embedding-3-small`
  - Returns `number[]` of dimension 1536
  - Handles empty/whitespace input
- All functions unit-testable with mocked API responses

**Exit criteria:** `structureExperience("raw text")` and `generateEmbedding("text")` return correctly typed outputs against live OpenAI API.

#### Day 2: JD Scraper & Parser

- JD Scraper (`lib/scraper/index.ts`):
  - Integrate **Firecrawl** managed scraping API via `@mendable/firecrawl-js` SDK
  - Single API call: `firecrawl.scrapeUrl(url, { formats: ['markdown'] })`
  - Firecrawl handles all anti-bot bypass (Cloudflare, DataDome), JS rendering, and content extraction — **no custom HTML parsing or heuristic extraction logic needed**
  - Return `{ markdown, metadata }` (markdown is clean, LLM-ready text; metadata includes page title/description if available)
  - Error handling: Firecrawl API errors, timeout, credit exhaustion, unsupported URLs
  - Fallback chain: Firecrawl failure → prompt user to paste JD text manually (textarea fallback built in Track D)
  - Environment: `FIRECRAWL_API_KEY` stored in `.env.local` (server-side only)
- JD Parser prompt (`lib/llm/prompts/jd-parser.ts`):
  - Takes markdown content from Firecrawl (or raw pasted text from fallback)
  - Returns `ParsedJD` (title, company, location, requirements[], responsibilities[], qualifications[], rawCleanText)
  - Zod validation on LLM response
  - Handles ambiguous/partial job posts gracefully
- End-to-end pipeline: URL → Firecrawl markdown → LLM structured JD
- Test against real job URLs:
  - LinkedIn job posting
  - Greenhouse hosted page
  - Lever hosted page
  - Ashby hosted page
  - Plain HTML careers page

**Exit criteria:** `scrapeJobPosting(url)` + `parseJobDescription(markdown)` returns structured JD for at least 4 of 5 test URLs. Integration is a thin API wrapper, not a custom scraping engine.

#### Day 3: Fit Analysis & Material Drafting

- Fit Analysis engine (`lib/analysis/fit.ts`):
  1. Cosine similarity calculation between JD embedding and each experience embedding
  2. Top-K experience ranking (K = min(5, total experiences))
  3. LLM fit analysis prompt:
     - Input: structured JD + top-K STAR experiences + candidate profile
     - Output: `FitAnalysis` (fitScore, effortEstimate with gaps/strengths/reasoning, topExperiences with scores)
  4. Score calibration: fitScore is LLM-assessed (0.0-1.0), not raw cosine similarity
- Material Drafting (`lib/drafting/index.ts`):
  1. Cover letter prompt:
     - Input: structured JD + top experiences + candidate profile
     - Output: tailored cover letter (3-4 paragraphs)
     - Streaming-compatible for real-time UI rendering
  2. Bullet selection and rewriting:
     - Input: all experiences + JD requirements
     - Output: ranked list of `TailoredBullet[]` (original text, rewritten text, relevance score)
     - Selects top 6-8 most relevant bullets
- All functions remain pure: `(input) => Promise<output>`

**Exit criteria:** `analyzeFit()` returns calibrated scores. `draftMaterials()` returns a coherent cover letter and relevant tailored bullets.

#### Day 4: Integration with Track A

- Wire all pipeline functions into Track A's API route handlers
- Ensure all async operations handle errors gracefully (LLM failures, Firecrawl API failures)
- Add streaming response support for `POST /api/applications/[id]/draft`
- Prompt refinement based on real data flowing through the full pipeline
- Handle edge cases discovered during integration:
  - Empty/insufficient experience bank
  - JD too short for meaningful analysis
  - LLM returning malformed JSON despite structured output mode
  - Firecrawl returning sparse markdown for login-walled pages

**Exit criteria:** All pipelines produce quality output when triggered via API routes with real user data.

---

## Track C — Frontend: Shell, Auth UI & Memory Bank

**Owner:** Agent 3
**Dependencies:** Track A's auth contract (can mock until Day 3). No dependency on Track B.
**Owns:** `components/`, `app/(auth)/`, `app/dashboard/` (except applications), `app/layout.tsx`, `tailwind.config.ts`

### Contract (what other tracks consume)

- Shared UI component library (`components/ui/`) — available end of Day 1
- App shell layout with sidebar nav — available end of Day 1
- Typed API client utility (`lib/api/client.ts`) — available end of Day 4

### Day-by-Day Deliverables

#### Day 1: Design System & App Shell

- Tailwind configuration:
  - Color tokens (primary, secondary, muted, destructive, success)
  - Typography scale (heading sizes, body, caption)
  - Spacing and border-radius tokens
- Radix UI primitives installed: Dialog, DropdownMenu, Toast, Tabs, Tooltip
- Shared components (`components/ui/`):
  - `Button` (variants: primary, secondary, ghost, destructive; sizes: sm, md, lg)
  - `Input`, `Textarea` (with label, error state, helper text)
  - `Card` (with header, content, footer slots)
  - `Badge` (variants: default, success, warning, error)
  - `EmptyState` (icon + message + CTA)
  - `LoadingSpinner`, `Skeleton`
  - `Toast` notifications (via Radix)
- App shell layout (`app/dashboard/layout.tsx`):
  - Sidebar navigation (Memory Bank, Applications links)
  - Top bar (user name, logout)
  - Main content area with max-width container
- All pages stubbed with placeholder content:
  - `/login`, `/signup`
  - `/dashboard` (home)
  - `/dashboard/memory` (Memory Bank)
  - `/dashboard/applications` (Applications list)

**Exit criteria:** All routes render. Shared components are visible and consistent. Design language is cohesive.

#### Day 2: Auth Pages & Memory Bank List

- Login page (`app/(auth)/login/page.tsx`):
  - Email + password form
  - Client-side validation (Zod)
  - Error states (invalid credentials, server error)
  - Link to signup
  - Post-login redirect to `/dashboard`
- Signup page (`app/(auth)/signup/page.tsx`):
  - Email + password + full name + optional headline
  - Client-side validation
  - Error states (email taken, validation errors)
  - Post-signup redirect to `/dashboard`
- Dashboard home (`app/dashboard/page.tsx`):
  - Welcome message with user's name
  - Quick stats: experience count, application count
  - Quick action CTAs: "Add Experience", "New Application"
- Memory Bank list view (`app/dashboard/memory/page.tsx`):
  - Grid/list of experience cards
  - Each card shows: title, skills badges, STAR preview (truncated)
  - Empty state with "Add your first experience" CTA
  - Loading skeleton state

**Exit criteria:** User can sign up, log in, see dashboard home, see Memory Bank list (empty state or with data).

#### Day 3: Memory Bank CRUD UI

- "Add Experience" flow:
  - Trigger: button on Memory Bank page
  - Opens modal/drawer with large textarea for raw experience input
  - Placeholder text with example input
  - Submit → loading state ("Structuring your experience with AI...")
  - On success: display structured STAR result in a review card
  - User can edit any STAR field before confirming save
  - On confirm: save to DB, close modal, add to list with optimistic update
- Experience detail view:
  - Full STAR breakdown (Situation, Task, Action, Result as labeled sections)
  - Skills badges
  - Raw input collapsible
  - Edit button → inline editing of all fields
  - Delete button → confirmation dialog → remove with optimistic update
- Error handling:
  - LLM structuring failure → show error, allow retry
  - Network error → toast notification with retry

**Exit criteria:** User can enter raw text → see AI-structured STAR result → edit → save. Can view, edit, and delete experiences.

#### Day 4: Polish & API Client

- Memory Bank interaction polish:
  - Inline editing with save/cancel
  - Delete confirmation dialog
  - Empty states for all scenarios
  - Skeleton loaders during data fetches
  - Optimistic UI updates on all mutations
- Typed API client utility (`lib/api/client.ts`):
  - Fetch wrappers with automatic JSON parsing
  - Auth token injection
  - Error response type handling
  - Request/response type safety using shared interfaces from `lib/types/`
- Responsive adjustments: sidebar collapses on smaller screens

**Exit criteria:** Memory Bank is production-quality UX. API client is usable by Track D.

---

## Track D — Application Flow UI: JD Parser, Fit Analysis & Drafting

**Owner:** Agent 4
**Dependencies:** Track C's component library (Day 1), Track A's API routes (Day 3+), Track B's pipeline types (Day 3+)
**Owns:** `app/dashboard/applications/`, `components/applications/`

### Contract

Builds on Track C's design system. Consumes Track B's outputs via Track A's API routes.

### Day-by-Day Deliverables

#### Day 2: Applications List & URL Input

- Applications list page (`app/dashboard/applications/page.tsx`):
  - Table or card list of saved applications
  - Each row shows: company name, job title, fit score badge, status badge, date
  - Sortable by date or fit score
  - Empty state: "Analyze your first job posting" CTA
  - Loading skeleton
- "New Application" flow:
  - URL input form with validation (must be valid URL)
  - Optional: textarea fallback for manual JD paste (critical fallback for scraper failures)
  - Submit button with loading state

**Exit criteria:** User sees applications list and can submit a URL. (Backend may not be wired yet — can mock.)

#### Day 3: Parsed JD Display & Fit Analysis

- JD parsing status UI:
  - Progress indicator during scrape + parse ("Fetching job posting...", "Analyzing requirements...")
  - Error state with retry option if scraping fails
  - Fallback: prompt user to paste JD text manually
- Parsed JD display (`components/applications/ParsedJD.tsx`):
  - Job title, company, location header
  - Requirements list (bulleted)
  - Responsibilities list (bulleted)
  - Qualifications list (bulleted)
  - Collapsible raw clean text
- Fit Analysis display (`components/applications/FitAnalysis.tsx`):
  - Fit score visualization: circular gauge or horizontal bar (color-coded: red/yellow/green)
  - Effort estimate badge (Low / Medium / High with color)
  - Strengths list (green checkmarks)
  - Gaps list (orange warning icons)
  - Reasoning paragraph (LLM-generated explanation)
  - Top matched experiences with similarity scores

**Exit criteria:** After URL submission, user sees structured JD and fit analysis with clear visual hierarchy.

#### Day 4: Material Drafting & Application Detail Page

- Material generation trigger:
  - "Generate Materials" CTA button on analyzed applications
  - Only enabled when status is `analyzed`
  - Loading state with streaming text indicator
- Cover letter display (`components/applications/CoverLetter.tsx`):
  - Rendered markdown/formatted text
  - "Copy to Clipboard" button
  - Edit-in-place textarea toggle
  - Streaming text display during generation (text appears word-by-word)
- Selected bullets display (`components/applications/SelectedBullets.tsx`):
  - Ranked list ordered by relevance score
  - Each bullet shows: relevance score bar, original text (muted), tailored text (emphasized)
  - Toggle between original and tailored views
  - "Copy All" button for easy export
- Application detail page (`app/dashboard/applications/[id]/page.tsx`):
  - Unified view bringing all pieces together as a vertical flow:
    1. Header: job title, company, URL link, status badge
    2. Parsed JD section (collapsible after first view)
    3. Fit Analysis section
    4. Generated Materials section (cover letter + bullets)
  - Tab or accordion navigation between sections
  - Action bar: "Regenerate Analysis", "Generate Materials", "Archive"

**Exit criteria:** Complete application flow works: URL → Parse → Analyze → Draft → Display. All states (loading, error, success) handled.

---

## Integration Points & Handoff Protocol

| From | To | What | When |
|------|----|------|------|
| Track A | All | Shared TypeScript types (`lib/types/`) | End of Day 1 |
| Track A | Track C, D | Auth middleware + session helpers | End of Day 2 |
| Track A | Track C, D | API route stubs with types | End of Day 2 |
| Track B | Track A | Pipeline function signatures | End of Day 1 |
| Track B | Track A | Implemented pipeline functions | End of Day 3 |
| Track C | Track D | UI component library (`components/ui/`) | End of Day 1 |
| Track C | Track D | API client utility (`lib/api/client.ts`) | End of Day 4 |

### Conflict Avoidance

Each track owns distinct directories. No two tracks should modify the same file.

```
Track A owns: lib/db/, lib/auth/, app/api/, docker-compose.yml, drizzle.config.ts
Track B owns: lib/llm/, lib/scraper/, lib/analysis/, lib/drafting/
Track C owns: components/ui/, components/layout/, components/memory/,
              app/(auth)/, app/dashboard/layout.tsx, app/dashboard/page.tsx,
              app/dashboard/memory/, lib/api/, tailwind.config.ts
Track D owns: components/applications/, app/dashboard/applications/
```

Shared file (`lib/types/index.ts`) is frozen after Day 1 consensus. Any changes require all-track notification.
