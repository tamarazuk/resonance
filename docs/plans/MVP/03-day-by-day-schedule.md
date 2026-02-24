# Steadyhand MVP — Day-by-Day Schedule

> 7-day build calendar. Days 1-4 are parallel development. Days 5-7 are integration, polish, and ship.
> Sync points are mandatory checkpoints where all agents verify contract alignment.

---

## Calendar Overview

| Day | Phase | Focus |
|-----|-------|-------|
| **1** | Build | Foundations — full parallel kickoff |
| **2** | Build | Core pipelines + auth UI |
| **3** | Build | Feature depth — full CRUD + analysis |
| **4** | Build | Integration day (critical) |
| **5** | Polish | Bug fixing + prompt tuning |
| **6** | Polish | UI polish + performance |
| **7** | Ship | Final QA + deploy |

---

## Day 1 — Foundations (Full Parallel)

All 4 agents launch simultaneously. No cross-track dependencies.

| Track | Focus | Deliverables |
|-------|-------|-------------|
| **A** | Scaffold + data layer | Project init, Docker Compose, **Drizzle schema (single source of truth)**, auto-generated SQL migrations via `drizzle-kit generate:pg`, NextAuth config, password utility |
| **B** | LLM client + STAR | LLM client abstraction, STAR structuring prompt, embedding utility — all with typed I/O |
| **C** | Design system + shell | Tailwind config, Radix install, shared UI components, app shell layout, all page stubs |
| **D** | (Supporting Track C) | Help build component library or begin applications page wireframe |

### Exit Criteria
- `docker compose up` → working DB with schema (migrations auto-generated from Drizzle schema)
- NextAuth route responds to requests
- `structureExperience()` and `generateEmbedding()` return correct typed outputs
- All routes render with placeholder content
- Consistent visual design language

### Sync Point (End of Day 1)
- [ ] All agents verify project runs locally
- [ ] Agree on and freeze `lib/types/index.ts` (shared TypeScript interfaces)
- [ ] Track B confirms function signatures match what Track A will consume
- [ ] Track C confirms component API matches what Track D will use

---

## Day 2 — Core Pipelines + Auth UI

| Track | Focus | Deliverables |
|-------|-------|-------------|
| **A** | Auth flows + API stubs | Signup/login routes, session middleware, auth guards, all API route stubs with Zod schemas |
| **B** | JD scraper + parser | Firecrawl API integration (thin wrapper), JD parser prompt, tested against 5 real job URLs |
| **C** | Auth pages + dashboard | Login/signup forms, dashboard home, Memory Bank list view (empty state + cards) |
| **D** | Applications list + URL input | Applications list page, "New Application" URL input form, empty states |

### Exit Criteria
- Signup → login → access protected route works E2E
- All API route stubs return typed 200 responses
- `scrapeJobPosting(url)` + `parseJobDescription()` returns structured JD for 4/5 test URLs via Firecrawl
- Auth pages are functional and styled
- Applications list renders (can use mock data)

### Sync Point (End of Day 2)
- [ ] All agents confirm auth flow works
- [ ] Track A confirms all API route type contracts match shared interfaces
- [ ] Track B shares Firecrawl success/failure rates across test URLs
- [ ] Frontend tracks (C, D) confirm they can authenticate and call API stubs

---

## Day 3 — Feature Depth

| Track | Focus | Deliverables |
|-------|-------|-------------|
| **A** | Experience CRUD + app creation | Full CRUD for `/api/experiences`, `POST /api/applications`, row-level access |
| **B** | Fit analysis + drafting | Fit analysis engine (cosine sim + LLM scoring), cover letter prompt, bullet selection |
| **C** | Memory Bank CRUD UI | "Add Experience" modal, STAR review/edit, experience detail view, edit/delete flows |
| **D** | Parsed JD + fit display | JD parsing status UI, parsed JD structured view, fit score visualization, strengths/gaps |

### Exit Criteria
- Experiences: create → read → update → delete works via API
- Applications: create (save URL + pending status) works via API
- `analyzeFit()` returns calibrated fit scores
- `draftMaterials()` returns coherent cover letter + relevant tailored bullets
- User can enter raw text → see AI-structured STAR → edit → save in UI
- Parsed JD and fit analysis display components render with mock data

### Sync Point (End of Day 3)
- [ ] Memory Bank works end-to-end: input → LLM structure → save → display
- [ ] JD parsing works end-to-end: URL → scrape → parse → display
- [ ] Track B's pipeline functions are ready for Track A integration
- [ ] Identify any API contract mismatches before Day 4 integration

---

## Day 4 — Integration Day (Critical)

This is the most important day. All tracks converge. The goal is a working happy path.

| Track | Focus | Deliverables |
|-------|-------|-------------|
| **A** | Wire LLM pipelines into API | Experience mutations call STAR + embedding. Application mutations call scraper → parser → fit. Draft endpoint calls material generation. Streaming support. |
| **B** | Integration support | Assist Track A with pipeline wiring. Prompt refinement with real data. Edge case handling. |
| **C** | Polish Memory Bank + API client | Skeleton loaders, optimistic updates, error states. Build typed API client (`lib/api/client.ts`). |
| **D** | Material drafting UI + detail page | Cover letter display (streaming), bullet selection, application detail page (unified flow). |

### Exit Criteria — THE FULL HAPPY PATH WORKS

A user can:
1. Sign up with email/password
2. Add professional experiences (raw text → AI-structured STAR → saved)
3. Submit a job posting URL (or paste JD text)
4. See the parsed job description
5. See a fit analysis with score, strengths, and gaps
6. Generate a tailored cover letter
7. See curated, rewritten resume bullets

### Sync Point (End of Day 4)
- [ ] Happy path demo: all agents walk through the complete flow together
- [ ] Catalog all bugs, visual issues, and edge case failures
- [ ] Prioritize bug list for Day 5 (critical vs. nice-to-have)
- [ ] Identify prompts that need tuning (quality issues)

---

## Day 5 — Bug Fixing & Prompt Tuning

> All agents work from the prioritized bug list from Day 4.

### Focus Areas

**Bug Fixes (all agents):**
- Fix all integration bugs discovered in Day 4 sync
- Handle state transition edge cases (e.g., re-analyzing an already drafted application)
- Fix data consistency issues (e.g., deleted experience still referenced in application)

**Prompt Engineering (primarily Agent 2 / Track B):**
- Iterate on STAR structuring quality (too verbose? too sparse? missing skills?)
- Improve JD parsing accuracy (handling varied formats, incomplete postings)
- Calibrate fit score distribution (avoid clustering at 0.7-0.8)
- Tune cover letter tone: professional but not generic, specific but not overwrought
- Test against 10+ real job postings across domains:
  - Software Engineering (frontend, backend, fullstack)
  - Product Management
  - Design
  - Finance / Fintech
  - General business roles

**Edge Case Handling (all agents):**
- Malformed URLs → clear error message
- Scraper failures (login-walled pages, Firecrawl credit exhaustion) → prompt manual paste fallback
- LLM timeouts → retry with user-visible feedback
- Empty experience bank → meaningful fit analysis message ("Add more experiences for better analysis")
- Very short or very long JD text → graceful handling

---

## Day 6 — UI Polish & Performance

> All agents focus on making the product feel finished.

### Visual Polish
- Spacing and alignment consistency across all pages
- Typography hierarchy: headings, body text, captions, labels
- Color consistency: status badges, score colors, action buttons
- Hover states, focus rings (accessibility), active states on all interactive elements
- Transitions/animations: modal open/close, list item add/remove, skeleton → content

### Loading & Feedback States
- Skeleton screens on all data-fetching pages
- Progress indicators for multi-step LLM operations
- Optimistic updates on all mutations (create, edit, delete)
- Toast notifications for success and error states
- Streaming text animation for cover letter generation

### Performance
- Avoid redundant LLM calls (don't re-structure on edit if raw_input unchanged)
- Cache parsed JDs (don't re-scrape on page reload)
- Debounce search/filter inputs
- Lazy load application detail sections

### Final Touches
- `<title>` and `<meta>` tags on all pages
- Favicon
- 404 page
- Copy review: all microcopy, empty states, error messages, button labels, placeholder text
- Keyboard navigation: all forms navigable with Tab, modals closeable with Escape

---

## Day 7 — Final QA & Ship

### Morning: Full QA Walkthrough

Perform a complete E2E walkthrough as a brand new user:

1. **Signup flow** — Create account, verify redirect to dashboard
2. **Empty states** — Verify dashboard, Memory Bank, and Applications show helpful empty states
3. **Add 3-5 experiences** — Varied roles/projects, verify STAR structuring quality
4. **Submit 2-3 job URLs** — Different job boards, verify scraping + parsing
5. **Manual JD paste** — Verify fallback works when scraper fails
6. **Review fit analyses** — Check score calibration, strengths/gaps accuracy
7. **Generate materials** — Cover letter quality, bullet relevance
8. **Edit/delete operations** — Verify all CRUD works, data consistency
9. **Error scenarios** — Invalid URL, empty inputs, rapid-fire submissions
10. **Responsive check** — Verify layout doesn't break at tablet width

### Afternoon: Fix & Deploy

- Fix any remaining bugs from QA walkthrough (critical only — cosmetic issues are acceptable)
- Deploy to production:
  - Vercel for Next.js application
  - Managed PostgreSQL with pgvector (Supabase, Neon, or RDS)
  - Environment variables configured (LLM API keys, DB connection, NextAuth secret)
- Smoke test production environment:
  - Signup/login works
  - Experience creation + STAR structuring works
  - Application creation + JD parsing works
  - Fit analysis returns results
  - Material drafting streams correctly
- DNS / custom domain (if applicable)

### Evening: Wrap-up

- Record a 2-minute demo video or write a one-page product brief
- Document any known issues / technical debt for post-MVP
- Celebrate shipping

---

## Minimum Viable Happy Path (If Behind Schedule)

If things go wrong and you're behind by Day 5, cut to this absolute minimum:

| Must Have | Can Cut |
|-----------|---------|
| Email/password auth | Headline field on user profile |
| Add experience → STAR structuring | Edit experience after creation |
| Manual JD paste (textarea) | URL scraper |
| Fit score + strengths/gaps | Effort estimate detail |
| Cover letter generation | Bullet selection/rewriting |
| Basic list views | Sorting, filtering, search |

The irreducible core: **sign up → add experiences → paste a JD → get a fit score → get a cover letter.**

Everything else is enhancement.
