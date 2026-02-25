# Resonance Monorepo Scaffolding Plan

## Overview

**Goal:** Turborepo monorepo with Steadyhand as the active Next.js app, shared packages for code that will be reused across future apps (Clearview, etc.), and local dev infrastructure.

**Final directory structure:**

```
resonance/
├── apps/
│   ├── steadyhand/              # Next.js 16 App Router (the MVP)
│   └── storybook/               # Storybook for shared UI development
├── packages/
│   ├── db/                      # Drizzle schema + client + migrations
│   ├── types/                   # Shared TS interfaces + Zod schemas
│   ├── ui/                      # Shared React component library
│   ├── eslint-config/           # Shared ESLint config
│   └── typescript-config/       # Shared tsconfig bases
├── e2e/                         # Playwright E2E tests
├── docker-compose.yml           # PostgreSQL + pgvector (local dev)
├── vitest.workspace.ts          # Monorepo-wide vitest config
├── playwright.config.ts         # E2E test config
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

1. Install husky + lint-staged + prettier:
   ```sh
   pnpm add -D husky lint-staged prettier
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
- `react-library.json` — extends base, adds `"jsx": "react-jsx"` for React packages that aren't Next.js apps (used by `packages/ui`)
- `library.json` — extends base, for non-React packages (db, types)

### Step 2.2 — `packages/eslint-config`

Shared ESLint flat configs.

```sh
mkdir -p packages/eslint-config
```

Create `packages/eslint-config/package.json` with `"name": "@resonance/eslint-config"`, then install deps:
```sh
pnpm --filter @resonance/eslint-config add -D eslint typescript-eslint eslint-config-prettier @next/eslint-plugin-next
```

> **Note:** `eslint-plugin-prettier` is intentionally omitted — Prettier runs via lint-staged (Step 1.3), not inside ESLint. `eslint-config-prettier` only disables conflicting rules.

Create flat config files:
- Base config (TypeScript + Prettier conflict resolution)
- Next.js config (extends base + Next.js rules)
- Library config (extends base, no React rules)

Each consuming workspace needs `@resonance/eslint-config@workspace:*` as a devDep and its own `eslint.config.mjs` importing the appropriate config:
```sh
pnpm --filter @resonance/types add -D @resonance/eslint-config@workspace:*
pnpm --filter @resonance/db add -D @resonance/eslint-config@workspace:*
pnpm --filter @resonance/ui add -D @resonance/eslint-config@workspace:*
pnpm --filter steadyhand add -D @resonance/eslint-config@workspace:*
```

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

### Step 2.5 — `packages/ui` + Next.js app scaffold (via shadcn)

Shared React component library using [shadcn/ui](https://ui.shadcn.com) with [Base UI](https://base-ui.com) primitives + Tailwind v4. shadcn copies components into your codebase — you own the code and can customize freely.

`shadcn init` configures both `packages/ui` and the app workspace in one pass, so this step also scaffolds the Next.js app.

1. Scaffold the Next.js app:
   ```sh
   pnpm create next-app@latest apps/steadyhand \
     --app --typescript --tailwind --no-src-dir \
     --import-alias "@/*"
   ```
   This creates Next.js 16 with App Router, Turbopack (default), and Tailwind v4.

2. From the **monorepo root**, initialize shadcn:
   ```sh
   pnpm dlx shadcn@latest init
   ```
   When prompted:
   - Select **"Next.js (Monorepo)"**
   - Choose **Base UI** as the primitive library
   - Tailwind v4 CSS-first config (no `tailwind.config.ts`)

   This creates:
   - `packages/ui/` — shared components, utils (`cn()`), `components.json`
   - `apps/steadyhand/components.json` — app-level config pointing to `@resonance/ui`

3. Add the shared typescript-config dev dependency to the UI package:
   ```sh
   pnpm --filter @resonance/ui add -D @resonance/typescript-config@workspace:*
   ```

4. Add remaining workspace dependencies to the app:
   ```sh
   pnpm --filter steadyhand add \
     @resonance/db@workspace:* \
     @resonance/types@workspace:*
   ```
   (`@resonance/ui` is already linked by `shadcn init`)

5. Add Base UI components needed for MVP Day 1:
   ```sh
   cd apps/steadyhand
   pnpm dlx shadcn@latest add button input textarea card badge \
     dialog tabs tooltip separator
   ```
   The CLI installs primitives (Base UI-backed) into `packages/ui` and updates imports automatically.

6. Custom components to create manually in `packages/ui/src/`:
   - `EmptyState`, `LoadingSpinner`, `Skeleton` (no shadcn equivalent — write by hand)
   - `Toast` — add `sonner` for toast notifications:
     ```sh
     pnpm dlx shadcn@latest add sonner
     ```

**Import pattern from apps:**
```ts
import { Button } from "@resonance/ui/components/button"
import { cn } from "@resonance/ui/lib/utils"
```

**Both `components.json` files must have matching** `style`, `iconLibrary`, and `baseColor` values.

### Step 2.6 — Testing infrastructure

Unit and component testing setup across the monorepo. E2E testing (Playwright) is added later in Step 3.7.

1. Install root-level testing deps:
   ```sh
   pnpm add -D vitest @vitest/coverage-v8
   ```

2. Install component testing deps in `packages/ui`:
   ```sh
   pnpm --filter @resonance/ui add -D @testing-library/react @testing-library/jest-dom happy-dom
   ```

3. Install component testing deps in the app (for app-specific component tests):
   ```sh
   pnpm --filter steadyhand add -D @testing-library/react @testing-library/jest-dom happy-dom
   ```

4. Create `vitest.workspace.ts` at the monorepo root:
   ```ts
   import { defineWorkspace } from "vitest/config"

   export default defineWorkspace([
     "packages/*/vitest.config.ts",
     "apps/*/vitest.config.ts",
   ])
   ```

5. Create per-package `vitest.config.ts` files:
   - `packages/ui/vitest.config.ts` — `environment: "happy-dom"`, setup file importing `@testing-library/jest-dom`
   - `packages/types/vitest.config.ts` — `environment: "node"` (pure logic tests)
   - `packages/db/vitest.config.ts` — `environment: "node"` (optional: `@electric-sql/pglite` for integration tests)
   - `apps/steadyhand/vitest.config.ts` — `environment: "happy-dom"`, path aliases matching `@/*`

6. Add `test` task to `turbo.json`:
   ```json
   {
     "test": {
       "dependsOn": ["^build"]
     }
   }
   ```

7. Add root script:
   ```json
   {
     "scripts": {
       "test": "turbo test"
     }
   }
   ```

**Test file convention:** `*.test.ts` / `*.test.tsx` co-located with source files.

### Step 2.7 — Storybook

Dedicated Storybook app for developing and documenting shared UI components in isolation.

1. Create the Storybook app workspace:
   ```sh
   mkdir -p apps/storybook/.storybook
   ```

2. Create `apps/storybook/package.json`:
   ```json
   {
     "name": "storybook",
     "version": "0.0.0",
     "private": true,
     "scripts": {
       "storybook": "storybook dev -p 6006",
       "build": "storybook build"
     }
   }
   ```

3. Install Storybook deps:
   ```sh
   pnpm --filter storybook add -D storybook @storybook/react-vite \
     @storybook/addon-essentials @storybook/addon-interactions \
     @storybook/test @resonance/ui@workspace:*
   ```

   > **Note:** Do not install `react` and `react-dom` directly — they are peer deps provided by `@resonance/ui`. If Storybook requires them explicitly, pin the same major version used by `apps/steadyhand` to avoid duplicate React runtime errors.

4. Create `.storybook/main.ts`:
   ```ts
   import type { StorybookConfig } from "@storybook/react-vite"

   const config: StorybookConfig = {
     stories: [
       "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
     ],
     addons: [
       "@storybook/addon-essentials",
       "@storybook/addon-interactions",
     ],
     framework: "@storybook/react-vite",
   }

   export default config
   ```

5. Create `.storybook/preview.ts` — import `packages/ui` Tailwind v4 CSS so stories render with the correct theme.

6. Add `storybook` task to `turbo.json`:
   ```json
   {
     "storybook": {
       "persistent": true,
       "cache": false
     }
   }
   ```

7. Add root script:
   ```json
   {
     "scripts": {
       "storybook": "turbo storybook"
     }
   }
   ```

**Story file convention:** `*.stories.tsx` co-located with components in `packages/ui/src/`. Example: `packages/ui/src/components/button.stories.tsx`.

---

## Part 3: Steadyhand App

> **Note:** The Next.js scaffold and shadcn init were already completed in Step 2.5. The steps below continue from there.

### Step 3.1 — App-specific configuration

The app was created in Step 2.5. Verify the setup:
- `apps/steadyhand/` exists with App Router, Tailwind v4, and `components.json`
- `@resonance/ui`, `@resonance/db`, and `@resonance/types` are in `package.json` dependencies

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

### Step 3.4 — API routes (Chat-First Architecture)

The primary data-entry path is conversational. The user talks to an AI career coach, and when they share a professional story, the AI uses **tool calling** to extract, structure (STAR format), and persist the experience — all in the background during the conversation.

There is no traditional `POST /api/experiences` CRUD route. Experience creation is handled exclusively through the chat tool.

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts   # Auth.js handler
│   └── signup/route.ts          # POST — create user with hashed password
├── chat/
│   └── route.ts                 # POST — Vercel AI SDK streaming chat endpoint
├── experiences/
│   └── route.ts                 # GET (list for Memory Bank display)
└── applications/
    ├── route.ts                 # GET (list), POST (create + scrape + parse)
    ├── [id]/route.ts            # GET, DELETE
    └── [id]/draft/route.ts      # POST (generate materials)
```

**`app/api/chat/route.ts` — Chat endpoint details:**

Uses the Vercel AI SDK (`ai` package, already installed in Step 3.3).

```ts
// Pseudocode outline
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const session = await auth() // Auth.js session check

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a career coach. When the user shares a professional
      experience or story, use the saveExperienceToMemoryBank tool to
      extract STAR-structured data and save it.`,
    messages,
    tools: {
      saveExperienceToMemoryBank: {
        description:
          "Extract a professional experience from the conversation, " +
          "structure it in STAR format, generate an embedding, and " +
          "save it to the user's Memory Bank.",
        parameters: z.object({
          rawInput: z.string(),
          situation: z.string(),
          task: z.string(),
          action: z.string(),
          result: z.string(),
          skills: z.array(z.string()),
        }),
        execute: async (params) => {
          // 1. Generate embedding via lib/llm/embeddings.ts
          // 2. Insert into `experiences` table via @resonance/db
          // 3. Return confirmation to the model
        },
      },
    },
  })

  return result.toDataStreamResponse()
}
```

Install the OpenAI provider for the Vercel AI SDK:
```sh
pnpm --filter steadyhand add @ai-sdk/openai
```

**`app/api/experiences/route.ts`** — Read-only `GET` endpoint. Returns the authenticated user's saved experiences for display in the Memory Bank panel. No `POST`/`PUT`/`DELETE` — creation is handled by the chat tool, and editing/deletion can be added later as needed.

Create the directory structure:
```sh
mkdir -p apps/steadyhand/app/api/{auth/\[...nextauth\],auth/signup,chat,experiences,applications/\[id\]/draft}
```

### Step 3.5 — Page structure (Chat-First Layout)

The primary interaction model is an AI-native, chat-first interface ("Career Coach"). Traditional data-entry forms are retained as a "Manual Entry" fallback for accessibility and speed. The dashboard home is a triage view surfacing high-priority action items.

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── layout.tsx               # Standard shell with a left navigation sidebar
│   ├── page.tsx                 # "Triage Dashboard" (Home) — high-priority action items + active job applications list
│   ├── chat/
│   │   └── page.tsx             # "Career Coach" — split-screen: left col (60%) active chat, right col (40%) Context/Memory Bank sidebar
│   └── applications/
│       ├── new/page.tsx         # Centered layout: URL input to scrape a JD + "Enter Manually" text-fallback option
│       └── [id]/page.tsx        # Application detail view (Fit Analysis + Material Drafter)
├── layout.tsx                   # Root layout
└── page.tsx                     # Landing / redirect to dashboard
```

**`/dashboard/page.tsx` — Triage Dashboard (Home):**
- Shows a prioritized list of action items (e.g., pending STAR reviews, applications needing follow-up)
- Renders an `ActiveApplicationsTable` of all in-progress job applications with status indicators

**`/dashboard/chat/page.tsx` — Career Coach (Primary Interface):**
- Split-screen layout. Left column (60%) is the active chat interface with the AI career coach. Right column (40%) is the "Context/Memory Bank" sidebar displaying saved experiences as `ExperienceCard` components, updated in real-time as the chat tool saves new entries.
- The Memory Bank sidebar is the persistent context panel — not a data-entry surface. Experience creation happens through conversation or via the "Manual Entry" fallback dialog.

**`/dashboard/applications/new/page.tsx` — New Application:**
- Centered, single-column layout. Primary action is a URL input field that triggers Firecrawl to scrape and parse the job description.
- Below the URL input, a clear "Enter Manually" text link opens a traditional form dialog for pasting/typing the JD directly — the accessibility and speed fallback.

**`/dashboard/applications/[id]/page.tsx` — Application Detail:**
- Displays the parsed JD, Fit Analysis results, and the Material Drafter (cover letter + tailored bullets).

Create the directory structure:
```sh
mkdir -p apps/steadyhand/app/{"\(auth\)"/{login,signup},dashboard/{chat,applications/{new,\[id\]}}}
```

### Step 3.6 — App-specific components (Chat-First UI)

The chat interface is the primary data-entry path. Traditional form components (e.g., `ExperienceForm.tsx`) are retained as a "Manual Entry" fallback, surfaced inside a dialog rather than as standalone pages. A human-in-the-loop review step ensures AI-generated STAR stories are approved before being saved.

```
components/
├── chat/                        # Chat interface components
│   ├── ChatWindow.tsx           # Main chat container — message list + input area, uses useChat() from Vercel AI SDK
│   ├── ChatMessage.tsx          # Individual message — renders user/assistant/tool-result variants
│   └── ChatInput.tsx            # Text input with send button + UI placeholder for voice dictation (Web Speech API)
├── memory/                      # Memory Bank components (display + manual-entry fallback)
│   ├── ExperienceCard.tsx       # Compact card showing STAR summary + skills badges — used in the right sidebar of the chat split-screen
│   ├── ExperienceForm.tsx       # Traditional STAR data-entry form — used inside a "Manual Entry" dialog, not as a standalone page
│   └── StarReviewModal.tsx      # Human-in-the-loop approval dialog — displays AI-generated STAR story for user review/edit before persisting
├── dashboard/                   # Triage Dashboard components
│   ├── TriageCard.tsx           # Card for a single high-priority action item (e.g., pending review, follow-up reminder)
│   └── ActiveApplicationsTable.tsx  # Table listing active job applications with status, company, role, and last activity
├── applications/                # Application flow components
│   ├── ParsedJD.tsx
│   ├── FitAnalysis.tsx
│   ├── CoverLetter.tsx
│   └── SelectedBullets.tsx
└── layout/                      # Shell, sidebar, nav
```

**Chat component notes:**
- `ChatWindow.tsx` uses `useChat()` from `ai/react` (Vercel AI SDK) to manage message state, streaming, and tool call rendering
- `ChatMessage.tsx` handles three variants: user messages, assistant messages, and tool-result confirmations (e.g., "Saved experience: Led migration to microservices")
- `ChatInput.tsx` includes a microphone icon placeholder for future voice-to-text via the Web Speech API — important for users who prefer dictating stories aloud. The placeholder is a non-functional UI element in MVP; implementation is deferred.

**Memory component notes:**
- `ExperienceCard.tsx` is a read-only display card for the Context/Memory Bank sidebar. Shows the experience title, STAR summary, and skill badges.
- `ExperienceForm.tsx` is the traditional form for manual STAR data entry. It is **not** rendered as a standalone page — it appears inside a dialog triggered by "Manual Entry" links throughout the app. This preserves a fast, accessible fallback for users who prefer direct form input over chat.
- `StarReviewModal.tsx` is the human-in-the-loop checkpoint. When the AI chat tool extracts and structures a STAR story, this modal presents it for user review and editing before the experience is persisted to the database. Ensures data quality and user trust.

**Dashboard component notes:**
- `TriageCard.tsx` represents a single actionable item on the home dashboard (e.g., "Review AI-generated story", "Follow up with Company X").
- `ActiveApplicationsTable.tsx` renders a sortable table of in-progress job applications with columns for company, role, status, and last activity date.

Create the directory structure:
```sh
mkdir -p apps/steadyhand/components/{chat,memory,dashboard,applications,layout}
```

### Step 3.7 — E2E testing (Playwright)

End-to-end tests for critical user flows. Added after pages and auth exist so there are real flows to test.

1. Install Playwright at the root:
   ```sh
   pnpm add -D @playwright/test
   npx playwright install --with-deps chromium
   ```

2. Create `playwright.config.ts` at the monorepo root:
   ```ts
   import { defineConfig } from "@playwright/test"

   export default defineConfig({
     testDir: "./e2e",
     webServer: {
       command: "pnpm --filter steadyhand dev",
       port: 3000,
       reuseExistingServer: !process.env.CI,
     },
     use: {
       baseURL: "http://localhost:3000",
     },
   })
   ```

3. Create `e2e/` directory at the monorepo root for test files:
   ```sh
   mkdir -p e2e
   ```

4. Initial smoke tests to write:
   - `e2e/auth.spec.ts` — signup, login, logout flows
   - `e2e/dashboard.spec.ts` — authenticated navigation, redirect guards

5. Add root script:
   ```json
   {
     "scripts": {
       "test:e2e": "playwright test"
     }
   }
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
    "test": "turbo test",
    "test:e2e": "playwright test",
    "storybook": "turbo storybook",
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
| 7 | `apps/steadyhand` + `packages/ui` | Steps 2, 3 | `pnpm create next-app@latest ...` then `pnpm dlx shadcn@latest init` |
| **8** | **Testing infrastructure (vitest)** | **Steps 2, 7** | **`pnpm add -D vitest @vitest/coverage-v8`** |
| **9** | **Storybook** | **Step 7** | **`mkdir -p apps/storybook` + install storybook deps** |
| 10 | Auth setup | Step 7 | `pnpm --filter steadyhand add next-auth@5 bcryptjs` |
| 11 | LLM pipeline modules (stubs) | Steps 4, 7 | `pnpm --filter steadyhand add openai ai zod` |
| 12 | API routes (stubs) | Steps 6, 10, 11 | Create route files |
| 13 | Page structure + layouts | Step 7 | Create page files |
| **14** | **E2E testing (Playwright)** | **Steps 10, 13** | **`pnpm add -D @playwright/test`** |
| 15 | Pre-commit hooks | Step 3 | `pnpm exec husky init` (already installed) |
| 16 | Verify everything works | All | `mise run setup && pnpm dev` |

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
9. **Testing strategy:** Vitest for unit/component tests (fast, Vite-native, monorepo workspace support). `@testing-library/react` + `happy-dom` for component tests. Playwright for E2E — added later once pages and auth exist. Test files co-located with source (`*.test.tsx` alongside `*.tsx`).
10. **Storybook:** Dedicated `apps/storybook` workspace rather than embedding config in `packages/ui`. Stories co-located with components (`*.stories.tsx`). Uses `@storybook/react-vite` for fast builds.
