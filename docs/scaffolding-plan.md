# Resonance Monorepo Scaffolding Plan

## Overview

**Goal:** Turborepo monorepo with Steadyhand as the active Next.js app, shared packages for code that will be reused across future apps (Clearview, etc.), and local dev infrastructure.

**Final directory structure:**

```
resonance/
├── apps/
│   └── steadyhand/              # Next.js 16 App Router (the MVP)
├── packages/
│   ├── db/                      # Drizzle schema + client + migrations
│   ├── types/                   # Shared TS interfaces + Zod schemas
│   ├── ui/                      # Shared React component library
│   ├── eslint-config/           # Shared ESLint config
│   └── typescript-config/       # Shared tsconfig bases
├── docker-compose.yml           # PostgreSQL + pgvector (local dev)
├── turbo.json
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml
├── .env.example
└── docs/                        # (already exists)
```

---

## Part 1: Monorepo Root Setup

### Step 1.1 — Initialize pnpm workspace + Turborepo

1. Install toolchain via mise (if not already):
   ```sh
   mise install
   ```
2. Initialize root `package.json`:
   ```sh
   pnpm init
   ```
   Then set `"private": true` and add `"pnpm": { "onlyBuiltDependencies": [] }` (pnpm 10 no longer runs lifecycle scripts by default — add package names here as needed).
3. Create `pnpm-workspace.yaml` defining workspaces:
   ```yaml
   packages:
     - "apps/*"
     - "packages/*"
   ```
4. Create the workspace directory structure:
   ```sh
   mkdir -p apps packages
   ```
5. Install Turborepo:
   ```sh
   pnpm add -D turbo
   ```
6. Create `turbo.json` with task pipeline:
   - `build` — depends on `^build` (topological)
   - `dev` — persistent, no cache
   - `lint` — no dependencies
   - `typecheck` — depends on `^build`
   - `db:generate` — for Drizzle migration generation
   - `db:push` — for applying migrations

### Step 1.2 — Root tooling config

1. `mise.toml` already exists — pins Node.js 24 LTS + pnpm 10, provides env loading and dev tasks
2. `.npmrc` — no special hoisting config needed (pnpm defaults to strict isolation)
3. Root `.gitignore` (node_modules, .next, .env*, dist, .turbo, drizzle meta)
4. `.env.example` at root with all required env vars:
   - `DATABASE_URL`, `AUTH_SECRET`
   - `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

### Step 1.3 — Pre-commit hooks

1. Install husky + lint-staged:
   ```sh
   pnpm add -D husky lint-staged
   ```
2. Initialize husky:
   ```sh
   pnpm exec husky init
   ```
   This creates `.husky/pre-commit`. Edit it to run `pnpm exec lint-staged`.
3. Configure `lint-staged` in root `package.json` (or `.lintstagedrc`):
   ```json
   {
     "lint-staged": {
       "*.{ts,tsx}": ["eslint --fix"],
       "*.{ts,tsx,json,css,md}": ["prettier --write"]
     }
   }
   ```
4. Optional — conventional commit enforcement:
   ```sh
   pnpm add -D @commitlint/cli @commitlint/config-conventional
   ```
   Create `commitlint.config.js` and add a `.husky/commit-msg` hook:
   ```sh
   echo 'pnpm exec commitlint --edit "$1"' > .husky/commit-msg
   ```

---

## Part 2: Shared Packages

### Step 2.1 — `packages/typescript-config`

Shared tsconfig bases. No build step. Other packages extend from these.

```sh
mkdir -p packages/typescript-config
```

Create `packages/typescript-config/package.json`:
```json
{
  "name": "@resonance/typescript-config",
  "version": "0.0.0",
  "private": true
}
```

Then create these tsconfig files:
- `base.json` — strict mode, ES2022 target, `"moduleResolution": "bundler"`, `"module": "ESNext"`
- `nextjs.json` — extends base, adds JSX + Next.js plugin
- `library.json` — extends base, for non-React packages (db, types)

### Step 2.2 — `packages/eslint-config`

Shared ESLint flat configs.

```sh
mkdir -p packages/eslint-config
```

Create `packages/eslint-config/package.json` with `"name": "@resonance/eslint-config"`, then install deps:
```sh
pnpm --filter @resonance/eslint-config add -D eslint typescript-eslint eslint-config-prettier eslint-plugin-prettier @next/eslint-plugin-next
```

Create flat config files:
- Base config (TypeScript + Prettier)
- Next.js config (extends base + Next.js rules)
- Library config (extends base, no React rules)

### Step 2.3 — `packages/types`

This is the "frozen Day 1" contract from the MVP plan.

```sh
mkdir -p packages/types/src
```

Create `packages/types/package.json` with `"name": "@resonance/types"`, `"main"` and `"types"` pointing to source (no build step needed in monorepo with TS path resolution, or use `tsup` for compilation).

Install deps:
```sh
pnpm --filter @resonance/types add zod
pnpm --filter @resonance/types add -D @resonance/typescript-config@workspace:*
```

Contents:
- **TypeScript interfaces:** `User`, `Experience`, `StarStructureOutput`, `ParsedJD`, `FitAnalysis`, `EffortEstimate`, `DraftedMaterials`, `TailoredBullet`, `Application`, `ApplicationStatus`
- **Zod validation schemas:** `signupSchema`, `loginSchema`, `createExperienceSchema`, `updateExperienceSchema`, `createApplicationSchema`
- Exports both TS types and Zod schemas

### Step 2.4 — `packages/db`

Drizzle schema + client. Shared because future Clearview app will need the same DB.

```sh
mkdir -p packages/db/src
```

Create `packages/db/package.json` with `"name": "@resonance/db"`, then install deps:
```sh
pnpm --filter @resonance/db add drizzle-orm postgres
pnpm --filter @resonance/db add -D drizzle-kit @resonance/typescript-config@workspace:* @resonance/types@workspace:*
```

**Contents:**
- `schema.ts` — Drizzle table definitions:
  - `users` (id, email, password_hash, full_name, headline, timestamps)
  - `experiences` (id, user_id FK, raw_input, STAR fields, skills array, vector(1536) embedding, timestamps)
  - `applications` (id, user_id FK, external_url, raw_html, parsed_jd JSONB, vector embedding, fit/analysis fields, status enum, timestamps)
  - pgcrypto + vector extension declarations
- `client.ts` — Drizzle client with connection pooling via `postgres` (or `@neondatabase/serverless` if deploying to Vercel)
- `index.ts` — barrel export
- `drizzle.config.ts` — Drizzle Kit config (reads `DATABASE_URL` from env)

Optional testing dep: `@electric-sql/pglite`

### Step 2.5 — `packages/ui`

Shared React component library using Radix UI + Tailwind.

```sh
mkdir -p packages/ui/src
```

Create `packages/ui/package.json` with `"name": "@resonance/ui"`, then install deps:
```sh
pnpm --filter @resonance/ui add react react-dom \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-toast @radix-ui/react-tabs @radix-ui/react-tooltip \
  class-variance-authority clsx tailwind-merge
pnpm --filter @resonance/ui add -D @resonance/typescript-config@workspace:* tailwindcss
```

**Contents:**
- Shared CSS theme file (`theme.css`) exporting design tokens via Tailwind v4's `@theme` directive (color tokens, typography scale, spacing, border-radius). Apps import this file in their own CSS with `@import "@resonance/ui/theme.css"`.
- Base components from MVP Track C Day 1:
  - `Button` (variants: primary, secondary, ghost, destructive)
  - `Input`, `Textarea` (with label, error, helper text)
  - `Card` (header, content, footer)
  - `Badge` (default, success, warning, error)
  - `EmptyState`, `LoadingSpinner`, `Skeleton`
  - `Toast` (via Radix Toast)

---

## Part 3: Steadyhand App

### Step 3.1 — Next.js app scaffold

1. Create the app:
   ```sh
   pnpm create next-app@latest apps/steadyhand \
     --app --typescript --tailwind --no-src-dir \
     --import-alias "@/*"
   ```
   This scaffolds Next.js 16 with App Router, Turbopack (default), and Tailwind v4.

2. Add workspace dependencies:
   ```sh
   pnpm --filter steadyhand add \
     @resonance/db@workspace:* \
     @resonance/types@workspace:* \
     @resonance/ui@workspace:*
   ```

3. In the app's global CSS, import Tailwind and the shared theme:
   ```css
   @import "tailwindcss";
   @import "@resonance/ui/theme.css";
   ```
   Add `@source` directives if needed to scan `@resonance/ui` package for class detection.

### Step 3.2 — Auth setup (Auth.js v5)

Install deps:
```sh
pnpm --filter steadyhand add next-auth@5 bcryptjs
pnpm --filter steadyhand add -D @types/bcryptjs
```

**Files to create inside `apps/steadyhand`:**

- `lib/auth/config.ts` — Auth.js config:
  - Credentials provider (email + password)
  - JWT session strategy
  - Callbacks for session/jwt to include userId
- `lib/auth/middleware.ts` — Auth guard utilities (session extraction, protected route helpers)
  - **Next.js 16 note:** `cookies()`, `headers()`, and `params` are fully async — all route handlers and middleware must `await` them
- `app/api/auth/[...nextauth]/route.ts` — Auth.js catch-all route
- `middleware.ts` — Next.js middleware for auth guards on `/dashboard/*`

**Environment:** Uses `AUTH_SECRET` (v5 naming). `AUTH_URL` is auto-detected on Vercel — only needed for custom deployments.

Generate a secret for local dev:
```sh
npx auth secret
```

### Step 3.3 — LLM pipeline modules

Install deps:
```sh
pnpm --filter steadyhand add openai ai @mendable/firecrawl-js zod
```

All inside `apps/steadyhand/lib/`:

| Module | File | Purpose |
|--------|------|---------|
| LLM Client | `lib/llm/client.ts` | OpenAI wrapper, retry with backoff, streaming support, structured output |
| Embeddings | `lib/llm/embeddings.ts` | OpenAI embeddings wrapper (currently `text-embedding-3-small`, 1536 dims — swap if newer model available) |
| STAR prompt | `lib/llm/prompts/star.ts` | Raw text -> `StarStructureOutput` |
| JD parser prompt | `lib/llm/prompts/jd-parser.ts` | Clean text -> `ParsedJD` |
| Fit analysis prompt | `lib/llm/prompts/fit-analysis.ts` | JD + experiences -> `FitAnalysis` |
| Drafting prompt | `lib/llm/prompts/drafting.ts` | Cover letter + bullet rewriting |
| Scraper | `lib/scraper/index.ts` | Firecrawl API integration |
| Fit engine | `lib/analysis/fit.ts` | Cosine similarity + LLM scoring orchestration |
| Drafting | `lib/drafting/index.ts` | Material generation orchestrator |
| API client | `lib/api/client.ts` | Typed fetch wrappers for frontend |

Create the directory structure:
```sh
mkdir -p apps/steadyhand/lib/{llm/prompts,scraper,analysis,drafting,api}
```

### Step 3.4 — API routes

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts   # Auth.js handler
│   └── signup/route.ts          # POST — create user with hashed password
├── experiences/
│   ├── route.ts                 # GET (list), POST (create + STAR + embed)
│   └── [id]/route.ts            # GET, PUT, DELETE
└── applications/
    ├── route.ts                 # GET (list), POST (create + scrape + parse)
    ├── [id]/route.ts            # GET, DELETE
    └── [id]/draft/route.ts      # POST (generate materials)
```

Create the directory structure:
```sh
mkdir -p apps/steadyhand/app/api/{auth/\[...nextauth\],auth/signup,experiences/\[id\],applications/\[id\]/draft}
```

### Step 3.5 — Page structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── layout.tsx               # Sidebar nav + topbar shell
│   ├── page.tsx                 # Dashboard home
│   ├── memory/
│   │   └── page.tsx             # Memory Bank list + add
│   └── applications/
│       ├── page.tsx             # Applications list
│       └── [id]/page.tsx        # Application detail (JD + fit + drafts)
├── layout.tsx                   # Root layout
└── page.tsx                     # Landing / redirect to dashboard
```

Create the directory structure:
```sh
mkdir -p apps/steadyhand/app/{"\(auth\)"/{login,signup},dashboard/{memory,applications/\[id\]}}
```

### Step 3.6 — App-specific components

```
components/
├── ui/                          # App-specific UI (or re-exports from @resonance/ui)
├── memory/                      # Memory Bank components
├── applications/                # Application flow components
│   ├── ParsedJD.tsx
│   ├── FitAnalysis.tsx
│   ├── CoverLetter.tsx
│   └── SelectedBullets.tsx
└── layout/                      # Shell, sidebar, nav
```

Create the directory structure:
```sh
mkdir -p apps/steadyhand/components/{ui,memory,applications,layout}
```

---

## Part 4: Local Dev Infrastructure

### Step 4.1 — Docker Compose

At the monorepo root, create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg18
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: resonance
      POSTGRES_PASSWORD: resonance
      POSTGRES_DB: resonance_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

No Redis needed for MVP (no BullMQ, no background jobs).

Verify Docker setup:
```sh
docker compose up -d
docker compose exec postgres psql -U resonance -d resonance_dev -c "SELECT 1;"
```

### Step 4.2 — Root scripts

In root `package.json`:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:generate": "turbo db:generate",
    "db:push": "turbo db:push",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down"
  }
}
```

Note: `mise run` tasks wrap these for convenience (e.g., `mise run setup` does install + docker + db:push in one command).

### Step 4.3 — Drizzle migration workflow

1. Define schema in `packages/db/schema.ts` (single source of truth)
2. Generate migrations:
   ```sh
   pnpm db:generate
   ```
3. Apply to local DB:
   ```sh
   pnpm db:push
   ```
4. Open Drizzle Studio to inspect data:
   ```sh
   mise run db:studio
   ```
5. **Never hand-write SQL migrations** (per MVP plan)

---

## Execution Order (Recommended)

| Step | What | Depends on | Key commands |
|------|------|------------|--------------|
| 1 | Root monorepo setup | Nothing | `mise install && pnpm init && pnpm add -D turbo` |
| 2 | `packages/typescript-config` | Step 1 | `mkdir -p packages/typescript-config` + create tsconfigs |
| 3 | `packages/eslint-config` | Step 2 | `mkdir -p packages/eslint-config` + install eslint deps |
| 4 | `packages/types` | Step 2 | `pnpm --filter @resonance/types add zod` |
| 5 | Docker Compose + `.env.example` | Step 1 | `docker compose up -d` |
| 6 | `packages/db` | Steps 2, 4, 5 | `pnpm --filter @resonance/db add drizzle-orm postgres` |
| 7 | `packages/ui` | Steps 2, 3 | Install Radix + CVA deps |
| 8 | `apps/steadyhand` | Steps 2, 3, 7 | `pnpm create next-app@latest apps/steadyhand ...` |
| 9 | Auth setup | Step 8 | `pnpm --filter steadyhand add next-auth@5 bcryptjs` |
| 10 | LLM pipeline modules (stubs) | Steps 4, 8 | `pnpm --filter steadyhand add openai ai zod` |
| 11 | API routes (stubs) | Steps 6, 9, 10 | Create route files |
| 12 | Page structure + layouts | Steps 7, 8 | Create page files |
| 13 | Pre-commit hooks | Step 3 | `pnpm add -D husky lint-staged && pnpm exec husky init` |
| 14 | Verify everything works | All | `mise run setup && pnpm dev` |

---

## Key Decisions & Notes

1. **Package naming convention:** `@resonance/db`, `@resonance/types`, `@resonance/ui`, etc.
2. **No build step for types/db packages:** Use TypeScript path resolution in the monorepo. If deployment to Vercel causes issues, add `tsup` build step.
3. **Tailwind v4 (CSS-first config):** Using Tailwind v4's CSS-based configuration throughout. Shared design tokens live in `packages/ui/theme.css` via `@theme` directives. Apps import this CSS file — no `tailwind.config.ts` needed. Fully compatible with Next.js 16.
4. **No placeholder packages for Clearview/matching/governance:** Don't scaffold empty packages. Add them when you start those phases. The Turborepo structure already supports adding `apps/clearview` or `packages/matching` later.
5. **Drizzle vs. TypeORM:** The MVP plan specifies Drizzle (type-safe, lightweight, native pgvector). The full implementation plan mentions TypeORM. **Stick with Drizzle** — it's the better choice for this stack.
6. **Auth.js v5 (next-auth@5):** Stable with full App Router support. Uses `AUTH_SECRET` env var (not the legacy `NEXTAUTH_SECRET`). `AUTH_URL` is auto-detected on Vercel.
7. **Next.js 16:** Turbopack is the default bundler. All request APIs (`cookies()`, `headers()`, `params`) are fully async — no synchronous access. Route handlers and middleware must `await` them. Use `npx @next/codemod@canary upgrade latest` if migrating existing code.
8. **pnpm 10:** Dependency lifecycle scripts are disabled by default. Any deps needing post-install scripts (e.g., native bindings) must be listed in `pnpm.onlyBuiltDependencies` in root `package.json`.
