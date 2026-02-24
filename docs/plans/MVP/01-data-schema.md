# Steadyhand MVP — Data Schema

> Minimal schema covering Users, Experiences (Memory Bank), and Applications (JD + fit + drafts).
> Designed for PostgreSQL with `pgvector` and `pgcrypto` extensions.

---

## SQL Migration (Reference Spec)

> **Note:** The Drizzle schema (`lib/db/schema.ts`) is the **single source of truth** for all table definitions. SQL migration files are auto-generated via `drizzle-kit generate:pg` — never hand-written. The SQL below serves as a **reference specification** for the intended schema shape and is used to validate the Drizzle output.

```sql
-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,               -- bcrypt via app-layer (cost factor 12)
    full_name       TEXT NOT NULL,
    headline        TEXT,                         -- e.g. "Senior Backend Engineer"
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);

-- ============================================================
-- EXPERIENCES (Memory Bank)
-- ============================================================
CREATE TABLE experiences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_input       TEXT NOT NULL,                -- original free-text from candidate
    title           TEXT,                          -- LLM-extracted role/project title
    situation       TEXT,                          -- STAR: Situation
    task            TEXT,                          -- STAR: Task
    action          TEXT,                          -- STAR: Action
    result          TEXT,                          -- STAR: Result
    skills          TEXT[] DEFAULT '{}',           -- LLM-extracted skill tags
    embedding       vector(1536),                 -- text-embedding-3-small output
    structured_at   TIMESTAMPTZ,                  -- null until LLM processing completes
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_experiences_user ON experiences (user_id);

-- NOTE: Do NOT add an IVFFlat index at MVP scale (<1K rows).
-- IVFFlat requires at minimum (lists * 10) rows to be effective.
-- Exact nearest-neighbor search is fast enough for this scale.
-- Add HNSW index later if row count grows past ~5K:
--   CREATE INDEX idx_experiences_embedding ON experiences
--       USING hnsw (embedding vector_cosine_ops)
--       WITH (m = 16, ef_construction = 64);

-- ============================================================
-- APPLICATIONS (Saved External JDs + Generated Materials)
-- ============================================================
CREATE TABLE applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_url        TEXT NOT NULL,
    raw_html            TEXT,                      -- scraped page content (markdown from Firecrawl, or raw pasted text)
    parsed_jd           JSONB,                     -- structured extraction (see ParsedJD type)
    jd_embedding        vector(1536),
    fit_score           REAL,                      -- 0.0 - 1.0 composite score
    effort_estimate     JSONB,                     -- { level, gaps[], strengths[], reasoning }
    fit_analysis        JSONB,                     -- full LLM fit analysis payload
    cover_letter_draft  TEXT,
    selected_bullets    JSONB,                     -- [{ experience_id, original, tailored, relevance_score }]
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','parsing','analyzed','drafted','archived')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_user ON applications (user_id);
CREATE INDEX idx_applications_status ON applications (user_id, status);
```

---

## Security Notes

| Concern | Approach |
|---------|----------|
| **Password storage** | Bcrypt with cost factor 12 at the application layer (via `bcryptjs`). Never store plaintext. |
| **Encryption at rest** | `raw_html` and PII fields protected by PostgreSQL disk-level encryption (managed DB default — e.g., Supabase, RDS). |
| **Row-level access** | All API queries filter by `session.user.id`. No cross-user data access possible at the query layer. |
| **API keys** | All LLM API keys server-side only via `process.env`. Never exposed in client bundles. |
| **Input sanitization** | All user inputs validated via Zod schemas before DB writes. HTML content from scraper is never rendered raw in the frontend. |
| **PII encryption at application layer** | **DEFERRED TO PHASE 2 (Intentional Technical Debt).** The master architecture mandates AES-256-GCM application-level encryption for PII fields (`full_name`, `email`, `headline`, `raw_input`, STAR fields) before database insertion. The MVP intentionally omits this and stores these fields as raw `TEXT`/`JSONB`, relying solely on managed PostgreSQL disk-level encryption (e.g., Supabase/RDS storage encryption at rest). **Accepted risk:** PII is readable in plaintext at the database query layer. This tradeoff accelerates the 7-day timeline by avoiding encryption key management, encrypted field indexing complexity, and query-time decryption overhead. **Phase 2 remediation:** Implement `lib/crypto/` module with AES-256-GCM encrypt/decrypt, per-user derived keys via HKDF, and migrate existing rows. |

---

## Shared TypeScript Interfaces

> These types are the contract between all parallel tracks. Frozen after Day 1.
> Located at `lib/types/index.ts`.

```typescript
// ── User ──

export interface User {
  id: string;
  email: string;
  fullName: string;
  headline: string | null;
}

// ── Experience (Memory Bank) ──

export interface Experience {
  id: string;
  userId: string;
  rawInput: string;
  title: string | null;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  skills: string[];
  structuredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Input shape for the STAR structuring LLM call */
export interface StarStructureInput {
  rawText: string;
}

/** Output shape from the STAR structuring LLM call */
export interface StarStructureOutput {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  skills: string[];
}

// ── Parsed Job Description ──

export interface ParsedJD {
  title: string;
  company: string;
  location: string | null;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  rawCleanText: string;
}

// ── Fit Analysis ──

export interface FitAnalysis {
  fitScore: number;              // 0.0 - 1.0
  effortEstimate: EffortEstimate;
  topExperiences: {
    experienceId: string;
    similarityScore: number;
  }[];
}

export interface EffortEstimate {
  level: 'low' | 'medium' | 'high';
  gaps: string[];
  strengths: string[];
  reasoning: string;
}

// ── Drafted Materials ──

export interface DraftedMaterials {
  coverLetter: string;
  selectedBullets: TailoredBullet[];
}

export interface TailoredBullet {
  experienceId: string;
  original: string;
  tailored: string;
  relevanceScore: number;
}

// ── Application (aggregate) ──

export interface Application {
  id: string;
  userId: string;
  externalUrl: string;
  rawHtml: string | null;
  parsedJd: ParsedJD | null;
  jdEmbedding: number[] | null;
  fitScore: number | null;
  effortEstimate: EffortEstimate | null;
  fitAnalysis: FitAnalysis | null;
  coverLetterDraft: string | null;
  selectedBullets: TailoredBullet[] | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus =
  | 'pending'
  | 'parsing'
  | 'analyzed'
  | 'drafted'
  | 'archived';
```

---

## Zod Validation Schemas (API Layer)

> Located alongside API routes or in a shared `lib/validation/` directory.

```typescript
import { z } from 'zod';

// ── Auth ──

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(200),
  headline: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Experiences ──

export const createExperienceSchema = z.object({
  rawInput: z.string().min(20).max(5000),
});

export const updateExperienceSchema = z.object({
  rawInput: z.string().min(20).max(5000).optional(),
  title: z.string().max(200).optional(),
  situation: z.string().max(2000).optional(),
  task: z.string().max(2000).optional(),
  action: z.string().max(2000).optional(),
  result: z.string().max(2000).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
});

// ── Applications ──

export const createApplicationSchema = z.object({
  externalUrl: z.string().url().max(2000),
});
```
