Reviewed both files and the idea is strong.

Files reviewed:
- [resonance-prd-v2.docx.md](/Users/tamarazuk/Downloads/resonance-prd-v2.docx.md)
- [resonance-prd-v2.docx](/Users/tamarazuk/Downloads/resonance-prd-v2.docx)

**Product Read**
- Big vision is excellent: clear thesis, strong principles, and a real wedge (cognitive load + matching quality).
- Biggest risk is scope explosion: two-sided marketplace + trust/safety + ingestion + matching + calibration is too much for early proof.
- For a one-week “AI Builder” submission, lead with a single wedge: `Steadyhand + Resonance Core-lite` (candidate-first, transparent matching, explicit human approval gate).

**What To Build In 1 Week**
1. Candidate graph from resume + story bank + preferences.
2. Job ingestion from URLs + normalized role cards.
3. Match scoring across 4-6 dimensions with visible reasoning.
4. “Apply plan” output: top 3 roles, effort estimate, tailored draft.
5. Hard human boundary: no send/apply without explicit user approval.

**Best Stack (1-week MVP, speed-first)**
- Frontend: `Next.js + TypeScript + Tailwind + shadcn/ui`
- Backend/API: `Next.js route handlers` (or `tRPC`) to stay single-repo/single-runtime
- DB: `Postgres (Supabase or Neon) + pgvector`
- Queue/jobs: `Inngest` (faster than self-managing Redis/Bull in week 1)
- LLM layer: `Vercel AI SDK` with provider abstraction (`OpenAI`/`Anthropic`)
- Parsing/ingestion: existing repo approach (`trafilatura`/Playwright worker), called from API jobs
- Observability: `Sentry + PostHog`
- Auth (if needed): `Clerk` (or skip auth for demo)

**Best Stack (long-term Resonance platform)**
- App layer: `Next.js + TypeScript`
- Core services: `NestJS` or `FastAPI` microservices for ingestion/matching/eval
- Workflow orchestration: `Temporal` for durable multi-step pipelines
- Data: `Postgres + pgvector` first; add `OpenSearch` for heavy retrieval later
- Event bus: `Kafka`/`Redpanda` when throughput requires decoupling
- ML/quality: `Langfuse` + offline eval harness + calibration dashboards
- Privacy/security: field-level encryption, strict tenant isolation, auditable consent logs

**Recommendation**
- Keep the big PRD as vision.
- Submit a tight demo called `Resonance Lite` showing one broken workflow fixed end-to-end with transparent reasoning and human control.
- This matches Wealthsimple’s prompt better than trying to fake full marketplace depth.

If you want, I can draft the exact 7-day build plan and the 500-word submission narrative from this PRD.
