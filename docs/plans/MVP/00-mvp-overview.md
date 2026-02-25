# Steadyhand MVP — Overview

> **Timeline:** 7 days | **Execution model:** Parallel AI agent tracks | **Ship target:** Working single-player product

## Product Summary

Steadyhand is a standalone AI-native candidate profiling and job application assistant. The MVP delivers the "single-player wedge" — a candidate can build a structured memory bank of their professional experiences, paste or scrape an external job posting, receive an AI-powered fit analysis, and generate tailored application materials.

---

## Scope Definition

### IN Scope (4 Core Features)

| #   | Feature                     | Description                                                                                                                                                                                                                       |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Memory Bank**             | CRUD for professional experiences. LLM structures raw input into STAR format. Vector embeddings generated and stored via `pgvector`.                                                                                              |
| 2   | **External JD URL Parser**  | Backend accepts a URL, fetches page content via Firecrawl managed scraping API (handles JS rendering, anti-bot bypass), LLM extracts structured job description (title, company, requirements, responsibilities, qualifications). |
| 3   | **Fit & Effort Estimation** | Cosine similarity between JD embedding and Memory Bank embeddings. LLM generates qualitative fit analysis + effort estimate (gap analysis).                                                                                       |
| 4   | **Material Drafting**       | LLM generates tailored cover letter. Selects and rewrites top resume bullets ranked by relevance to the JD.                                                                                                                       |

**Supporting infrastructure (also in scope):**

- Next.js App Router (TypeScript strict mode)
- PostgreSQL + pgvector
- Email/password auth via NextAuth.js (Credentials provider, JWT sessions)
- Tailwind CSS + Radix UI component primitives
- Vercel AI SDK for LLM streaming

### OUT of Scope

- Employer-side features (Clearview) — no company accounts, no ATS
- Two-sided matching protocol (Resonance Core)
- CQRS / event sourcing / read-write model separation
- Background job queues (all LLM work is request-scoped or simple polling)
- OAuth social login (email/password only)
- Resume PDF upload and parsing (manual text input only)
- Payment / billing
- Email notifications
- Multi-tenancy
- Mobile-native apps
- Rate limiting beyond basic middleware
- Automated test suites (manual QA in Days 5-7)

---

## Key Technical Decisions

| Decision          | Choice                                                                            | Rationale                                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ORM**           | Drizzle                                                                           | Type-safe, lightweight, native pgvector support via `drizzle-orm/pg-core`.                                                                                                                                |
| **Auth**          | NextAuth.js v5 (Credentials)                                                      | Minimal config. JWT session strategy. No OAuth complexity for MVP.                                                                                                                                        |
| **LLM**           | OpenAI `gpt-4o` for structuring/analysis, `text-embedding-3-small` for embeddings | Best cost/quality tradeoff. Claude as fallback for drafting if tone is better.                                                                                                                            |
| **Scraping**      | Firecrawl managed scraping API (`@mendable/firecrawl-js`)                         | Handles JS rendering, Cloudflare/DataDome anti-bot, and dynamic SPAs out of the box. Returns clean markdown — no `cheerio` heuristics or custom HTML parsing needed. Graceful fallback to raw text paste. |
| **Embedding dim** | 1536 (`text-embedding-3-small`)                                                   | Standard dimension. Exact nearest-neighbor search sufficient at MVP scale (<1K rows).                                                                                                                     |
| **Streaming**     | Vercel AI SDK (`ai` package)                                                      | Native Next.js streaming for cover letter generation.                                                                                                                                                     |
| **Validation**    | Zod                                                                               | Shared schemas between API validation and frontend forms.                                                                                                                                                 |

---

## Risk Register & Mitigations

| Risk                                                | Likelihood | Impact | Mitigation                                                                                                                                                                                                                                        |
| --------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scraper blocked by JS-rendered pages / anti-bot** | Low        | Medium | Firecrawl handles JS rendering and anti-bot (Cloudflare, DataDome) natively. Residual risk: Firecrawl may still fail on some sites (e.g., login-walled pages). Fallback: manual paste of JD text into a textarea, built on Day 1 as the baseline. |
| **LLM output quality inconsistent**                 | Medium     | High   | Structured output mode (`response_format: { type: "json_schema" }`). Zod validation on all LLM responses. Retry with temperature adjustment on parse failure.                                                                                     |
| **Integration merge conflicts across tracks**       | Medium     | Medium | All tracks work in isolated directories (`lib/llm/`, `lib/scraper/`, `lib/analysis/`, `app/(auth)/`, `app/dashboard/`). Shared types in `lib/types/` are frozen after Day 1.                                                                      |
| **pgvector index performance**                      | Low        | Low    | Exact nearest-neighbor (no index) is fine for <1K rows. Add HNSW index later if needed — do NOT use IVFFlat at small scale (requires `lists * 10` minimum rows).                                                                                  |
| **Scope creep**                                     | High       | High   | If any feature isn't working by end of Day 4, cut it. The minimum viable happy path is: experiences + manual JD paste + fit score + cover letter. Scraper and bullet selection are enhancements.                                                  |
| **LLM API latency / timeouts**                      | Medium     | Medium | Streaming responses for long generations. 30s timeout with retry. Show progress indicators in UI.                                                                                                                                                 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App Router                 │
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Auth UI  │  │ Memory Bank  │  │ Applications  │ │
│  │ (login/  │  │ (CRUD +      │  │ (JD parse +   │ │
│  │  signup) │  │  STAR view)  │  │  fit + draft) │ │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘ │
│       │               │                  │          │
│  ─────┴───────────────┴──────────────────┴────────  │
│                    API Routes                        │
│             (NextAuth + Zod validation)              │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ LLM Client │ │ Scraper    │ │ Fit Analysis   │  │
│  │ (STAR,     │ │ (Firecrawl │ │ (cosine sim +  │  │
│  │  embed,    │ │  API +     │ │  LLM scoring + │  │
│  │  draft)    │ │  LLM parse)│ │  gap analysis) │  │
│  └────────────┘ └────────────┘ └────────────────┘  │
│                                                     │
│  ─────────────────────────────────────────────────  │
│              Drizzle ORM + pg driver                 │
└─────────────────────┬───────────────────────────────┘
                      │
              ┌───────┴────────┐
              │  PostgreSQL    │
              │  + pgvector    │
              │  + pgcrypto    │
              └────────────────┘
```

---

## File Structure (Target)

```
steadyhand/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── memory/
│   │   │   └── page.tsx                # Memory Bank list + add
│   │   └── applications/
│   │       ├── page.tsx                # Applications list
│   │       └── [id]/page.tsx           # Application detail (JD + fit + drafts)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── experiences/
│   │   │   ├── route.ts                # GET (list), POST (create)
│   │   │   └── [id]/route.ts           # GET, PUT, DELETE
│   │   └── applications/
│   │       ├── route.ts                # GET (list), POST (create + parse)
│   │       ├── [id]/route.ts           # GET, DELETE
│   │       └── [id]/draft/route.ts     # POST (generate materials)
│   ├── layout.tsx
│   └── page.tsx                        # Landing / redirect
├── lib/
│   ├── types/index.ts                  # Shared TypeScript interfaces (frozen Day 1)
│   ├── db/
│   │   ├── client.ts                   # Drizzle client
│   │   ├── schema.ts                   # Drizzle schema definitions
│   │   └── migrations/                 # SQL migrations
│   ├── auth/
│   │   ├── config.ts                   # NextAuth configuration
│   │   └── helpers.ts                  # Auth guard utilities
│   ├── llm/
│   │   ├── client.ts                   # OpenAI/Anthropic wrapper with retry
│   │   ├── embeddings.ts               # Embedding generation
│   │   └── prompts/
│   │       ├── star.ts                 # STAR structuring prompt
│   │       ├── jd-parser.ts            # JD extraction prompt
│   │       ├── fit-analysis.ts         # Fit scoring prompt
│   │       └── drafting.ts             # Cover letter + bullet prompts
│   ├── scraper/
│   │   └── index.ts                    # Firecrawl API integration
│   ├── analysis/
│   │   └── fit.ts                      # Cosine similarity + LLM fit engine
│   ├── drafting/
│   │   └── index.ts                    # Material generation orchestrator
│   └── api/
│       └── client.ts                   # Typed fetch wrappers for frontend
├── components/
│   ├── ui/                             # Shared primitives (Button, Input, Card, etc.)
│   ├── memory/                         # Memory Bank specific components
│   ├── applications/                   # Application flow components
│   └── layout/                         # Shell, sidebar, nav
├── docker-compose.yml                  # Local PostgreSQL + pgvector
├── drizzle.config.ts
├── tailwind.config.ts
└── package.json
```
