# Resonance

**AI-native job matching that works for humans.**

Resonance is an intelligent matching system that connects job seekers and employers through deep mutual understanding rather than keyword search and broadcast posting. Instead of making people work harder to find each other, it builds a system intelligent enough to find the alignment for them.

> Because talent discovery shouldn't depend on who sees the posting first.

---

## The Problem

The labor market is running on infrastructure designed for newspaper classifieds. Candidates exhaust themselves applying to hundreds of positions. Employers receive hundreds of unqualified applications. The matching layer between them doesn't exist — LinkedIn is keyword-based and shallow, job boards are passive billboards, and recruiters are expensive and network-dependent.

The result is a massive, ongoing misallocation of human potential.

## The Solution

Resonance operates as three interconnected systems:

| System                                 | Purpose                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Steadyhand** (Candidate Engine)      | Builds a rich professional identity, delivers fit analysis and tailored materials for any job posting |
| **Clearview** (Employer Engine)        | Helps companies articulate what they truly need beyond the job posting                                |
| **Resonance Core** (Matching Protocol) | Six-dimension matching with double opt-in introductions — humans decide, AI discovers                 |

The key insight: Steadyhand delivers standalone value from day one. A candidate can paste any job description from anywhere on the internet and immediately receive fit analysis, effort estimation, and tailored application materials. No employer participation required.

---

## MVP: Steadyhand Single-Player Mode

**This repository is the MVP** — a 7-day build focused on the Steadyhand candidate engine as a standalone product.

### What It Does

```
Paste a job URL  ──>  AI scrapes & parses the JD
                         │
Add your experiences     │
(raw text ──> AI ──> STAR format)
                         │
              ┌──────────┴──────────┐
              │   Fit Analysis      │
              │  - Capability match │
              │  - Gaps & strengths │
              │  - Effort estimate  │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │  Tailored Materials │
              │  - Cover letter     │
              │  - Resume bullets   │
              └─────────────────────┘
```

### Core Features

1. **Memory Bank** — CRUD for professional experiences. Raw text is LLM-structured into STAR format (Situation, Task, Action, Result) with extracted skills. Each entry is vector-embedded via `pgvector` for semantic search.

2. **External JD URL Parser** — Submit any job posting URL. Firecrawl handles JS rendering and anti-bot bypass; the LLM extracts structured requirements, responsibilities, and qualifications. Manual paste fallback for login-walled pages.

3. **Fit & Effort Estimation** — Cosine similarity between JD embeddings and Memory Bank embeddings, combined with LLM-generated qualitative analysis. Shows strengths, gaps, and an honest effort estimate.

4. **Material Drafting** — Generates a tailored cover letter drawing on your specific experiences, plus curated resume bullets rewritten for the target role. Streamed in real-time.

---

## 📝 A Note to Evaluators: Vision vs. Execution

I approached this project not just as a coding assessment, but as a real-world product launch.

> _A Senior engineer focuses on building the system right. A Staff engineer focuses on ensuring the right system is being built._

To demonstrate this, I separated my process into two distinct phases:

1. **The Vision (Docs):** Before writing code, I authored a comprehensive [Product Requirements Document](docs/prd/resonance-prd-v2.docx.md) and a [25-week end-state Architecture Plan](docs/plans/implementation/00-implementation-overview.md). I did this to prove I can design for scale, handle multi-tenant data isolation, and manage complex cryptographic pipelines.

2. **The Execution (Code):** Big Design Up Front (BDUF) is useless if it prevents shipping. Given the 6-day deadline, attempting to build the full architecture would result in an over-engineered, half-finished app. Instead, I ruthlessly scoped this repository to the **"Single-Player Wedge"**—delivering day-one utility to candidates without requiring a single employer on the platform. This is not a hacked-together prototype; it is a deliberately scoped, execution-ready slice of the broader vision.

---

## ⚖️ Intentional Technical Debt (Scope Decisions)

| End-State Architecture               | MVP Implementation                    | Prioritization Rationale                                                             |
| ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------ |
| Fastify + separate Python ML service | Next.js API routes (monolith)         | One runtime, one deploy target — no service mesh at this scale                       |
| TypeORM with CQRS                    | Drizzle ORM (direct queries)          | Type-safe, lightweight, native pgvector — no read/write separation needed yet        |
| Redis + BullMQ job queues            | Request-scoped LLM calls              | <1K rows, <100 concurrent users — async queues add complexity without value          |
| OAuth + social login                 | Email/password (NextAuth Credentials) | Proves auth works; OAuth is additive, not architectural                              |
| AES-256-GCM PII encryption           | PostgreSQL disk-level encryption      | Documented technical debt with Phase 2 remediation plan                              |
| Conversation capture (WebSocket)     | Manual text input                     | Core STAR structuring works the same; input method is a UX enhancement               |
| Prep Engine, Follow-Up Manager       | Fit analysis + material drafting      | Focused on the activation hook: the moment a candidate sees their first fit analysis |
| AWS multi-region with DR             | Vercel + managed Postgres             | Right-sized infrastructure for an MVP                                                |

_"Crucially, the boundaries of these shortcuts are strictly defined. Nothing here needs to be thrown away when the platform scales to the target architecture."_

The irreducible core: **sign up, add experiences, paste a JD, get a fit score, get a cover letter.**

---

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                   Next.js App Router                  │
│                                                       │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │ Auth UI  │   │ Memory Bank  │   │ Applications  │  │
│  │ (login/  │   │ (CRUD +      │   │ (JD parse +   │  │
│  │ signup)  │   │  STAR view)  │   │  fit + draft) │  │
│  └────┬─────┘   └──────┬───────┘   └───────┬───────┘  │
│       │               │                  │            │
│  ─────┴───────────────┴──────────────────┴──────────  │
│                    API Routes                         │
│             (NextAuth + Zod validation)               │
│  ───────────────────────────────────────────────────  │
│                                                       │
│  ┌────────────┐   ┌────────────┐   ┌────────────────┐ │
│  │ LLM Client │   │ Scraper    │   │ Fit Analysis   │ │
│  │ (STAR,     │   │ (Firecrawl │   │ (cosine sim +  │ │
│  │ embed,     │   │ API +      │   │ LLM scoring +  │ │
│  │ draft)     │   │ LLM parse) │   │ gap analysis)  │ │
│  └────────────┘   └────────────┘   └────────────────┘ │
│                                                       │
│  ───────────────────────────────────────────────────  │
│              Drizzle ORM + pg driver                  │
└─────────────────────┬─────────────────────────────────┘
                      │
              ┌───────┴────────┐
              │  PostgreSQL    │
              │  + pgvector    │
              │  + pgcrypto    │
              └────────────────┘
```

### Tech Stack

| Layer          | Technology                                                                |
| -------------- | ------------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)                                        |
| Language       | TypeScript (strict mode)                                                  |
| Database       | PostgreSQL + pgvector + pgcrypto                                          |
| ORM            | Drizzle (type-safe, native vector support)                                |
| Auth           | Auth.js v5 (Credentials provider, JWT sessions)                           |
| LLM            | OpenAI gpt-4o (structuring/analysis), text-embedding-3-small (embeddings) |
| Scraping       | Firecrawl (managed, handles JS rendering + anti-bot)                      |
| Streaming      | Vercel AI SDK                                                             |
| Validation     | Zod (shared between API and frontend)                                     |
| UI             | Tailwind CSS v4 + shadcn/ui (Base UI primitives)                          |
| Monorepo       | Turborepo + pnpm workspaces                                               |
| Toolchain      | mise (Node.js 24, pnpm 10)                                                |
| Infrastructure | Docker Compose (local dev), Vercel (production)                           |

### Monorepo Structure

```
resonance/
├── apps/
│   └── steadyhand/              # Next.js app (the MVP)
│       ├── app/                  # App Router pages & API routes
│       ├── components/           # App-specific components
│       └── lib/                  # LLM pipelines, scraper, analysis
├── packages/
│   ├── db/                      # Drizzle schema + client + migrations
│   ├── types/                   # Shared TS interfaces + Zod schemas
│   ├── ui/                      # Shared React component library (shadcn)
│   ├── eslint-config/           # Shared ESLint config
│   └── typescript-config/       # Shared tsconfig bases
├── docs/
│   ├── prd/                     # Product Requirements Document (v2)
│   ├── architecture/            # Full system architecture plan
│   └── plans/
│       ├── implementation/      # Full 25-week phased implementation plan
│       └── MVP/                 # 7-day MVP plan with parallel tracks
├── docker-compose.yml
├── turbo.json
└── mise.toml
```

---

## Getting Started

### Prerequisites

- Node.js 24
- pnpm 10
- [Docker](https://www.docker.com/) (for local PostgreSQL + pgvector)
- [mise](https://mise.jdx.dev/) (optional convenience wrapper for local tasks)

### Setup

```sh
# Option A: with mise
mise install

# Install deps, start DB, apply schema — all in one command
mise run setup
```

```sh
# Option B: without mise
pnpm install
docker compose up -d
pnpm db:push
```

### Worktrees (OpenCode)

When OpenCode creates a new worktree, set its init command to:

```sh
mise run worktree:init
```

What this does:

- Installs dependencies
- Starts the shared Docker Postgres container
- Creates a worktree-specific database (for schema/data isolation)
- Writes that database URL into `.env.local`
- Applies the latest schema to that worktree database

Optional manual cleanup before deleting a worktree:

```sh
mise run worktree:clean
```

### Database Troubleshooting (PG18 + stale local volume)

If `POST /api/auth/signup` or login routes fail with `ECONNREFUSED`, check Docker first.

Symptom:

- `docker compose ps` shows `resonance-postgres` constantly restarting.

Cause:

- Local `postgres_data` volume was created before the move from `pg16` to `pg18`, and PG18 rejects that old layout.

Fix:

```sh
# Preferred: one command runbook
mise run db:reinit

# Equivalent manual commands
docker compose down -v
docker compose up -d
pnpm db:push
```

Verify:

```sh
docker compose ps
docker compose exec -T postgres pg_isready -U resonance -d resonance_dev
pnpm db:push
```

### Development

```sh
# With mise (starts Docker + steadyhand through portless)
mise run dev
```

```sh
# Without mise
docker compose up -d
pnpm dev            # steadyhand
pnpm storybook:dev  # storybook

# Run both app dev servers via Turborepo (no portless domains)
pnpm dev:all
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable            | Purpose                               |
| ------------------- | ------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string          |
| `AUTH_SECRET`       | Auth.js session encryption            |
| `OPENAI_API_KEY`    | LLM structuring, analysis, embeddings |
| `FIRECRAWL_API_KEY` | Job posting URL scraping              |

---

## Design Principles

These aren't aspirational — they're enforced in the code:

- **Humans decide, AI discovers.** No application is submitted, no communication sent, no data shared without explicit human approval.
- **Depth over breadth.** Multi-dimensional matching on capabilities, values, working styles, and growth trajectories — not keyword overlap.
- **Protect cognitive capacity.** Every feature must reduce mental load, not add to it. Job searching is hard enough.
- **Capability over credentials.** A self-taught developer with shipped products matches the same as a CS graduate from a top university.
- **Data dignity.** Users own their data. Candidate profiles are portable. Nothing is sold to third parties. Free for candidates, always.
- **Transparency.** Both sides understand why a match was suggested. No black-box scoring.

---

## Full Product Roadmap

The MVP validates the core value loop. The full plan extends to a two-sided marketplace:

| Phase                                   | Duration | Scope                                                                                                  |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| **Phase 1** — Steadyhand MVP            | 8 weeks  | Full candidate engine: conversation capture, prep engine, follow-up manager, cognitive load protection |
| **Phase 2** — Aggregation + Matching    | 4 weeks  | Job aggregation from multiple sources, basic matching pipeline, candidate match feed                   |
| **Phase 3** — Clearview + Double Opt-In | 5 weeks  | Employer engine, role profiles, double opt-in introduction protocol                                    |
| **Phase 4** — Resonance Core Full       | 4 weeks  | Six-dimension scoring, fairness monitoring, ops console                                                |

Detailed plans for each phase are in [`docs/plans/implementation/`](docs/plans/implementation/).

---

## Documentation

| Document                                                                       | Description                                              |
| ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| [Product Requirements](docs/prd/resonance-prd-v2.docx.md)                      | Full PRD covering both sides of the marketplace          |
| [System Architecture](docs/architecture/resonance-architecture.md)             | End-state architecture for all three engines             |
| [Implementation Plan](docs/plans/implementation/00-implementation-overview.md) | 25-week phased roadmap with milestones and exit criteria |
| [MVP Plan](docs/plans/MVP/00-mvp-overview.md)                                  | 7-day build plan with parallel execution tracks          |
| [MVP Data Schema](docs/plans/MVP/01-data-schema.md)                            | Database schema, TypeScript interfaces, Zod validation   |
| [Parallel Tracks](docs/plans/MVP/02-parallel-tracks.md)                        | 4-track parallel development strategy                    |
| [Day-by-Day Schedule](docs/plans/MVP/03-day-by-day-schedule.md)                | Detailed daily deliverables and sync points              |

---

## License

This project is not open source. All rights reserved.
