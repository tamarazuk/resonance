This is a really well-crafted PRD, Tamara. Let me share my thoughts on both the idea and the technical implementation.

---

## Thoughts on the Idea

**What's strong:**

The core thesis is compelling and well-articulated. The labor market really does have a matching infrastructure problem, not a supply/demand problem, and framing it that way is the right starting point. A few things stood out to me as particularly sharp:

The **double opt-in protocol** is a genuinely differentiating design choice. Most platforms optimize for volume of connections (which benefits the platform's engagement metrics), while this optimizes for quality of introductions. That's a hard tradeoff to commit to, and the fact that it's called out as non-negotiable signals real conviction.

The **cognitive load protection** framing is excellent. Treating candidate mental health as a first-class product concern rather than an afterthought gives Steadyhand standalone value even before the matching layer exists — which directly addresses the cold start problem. The Triage Engine, Calm Mode, and Emotional Intelligence Layer aren't gimmicks; they're the kind of features that would drive genuine word-of-mouth.

The **Human/AI Boundary Map** in Section 6 is unusually mature for a v2 PRD. Many AI-native product docs hand-wave on this. Having explicit tables for what the AI owns vs. what humans own shows you've thought carefully about where trust breaks down.

The **tiered aggregation strategy** is smart. Starting with career page monitoring and job board APIs means you don't need employer buy-in on day one, and direct Clearview postings become the premium incentive layer.

**Where I'd push back or want more detail:**

The **"zero-knowledge matching"** mentioned in the risk table (Section 10) is a bold claim. True zero-knowledge matching — where the system can identify alignment without either party's raw data being visible to the platform — is cryptographically complex and would meaningfully constrain the kinds of deep semantic matching described in Section 5. I'd want to see this fleshed out: is this aspirational, or is there a concrete architecture in mind? If it's aspirational, I'd reframe it as "privacy-preserving matching" and define the actual privacy guarantees.

The **evidence-based profile** approach to preventing fabrication (Sections 3.1.1 and 10) is a good start, but specificity alone doesn't prove truthfulness. Someone can fabricate a very specific, STAR-structured story. You might want to explore lightweight verification — employer confirmations, portfolio links, GitHub activity, credential verification integrations — as a complement to the evidence-scoring heuristic.

The **business model** is clean in principle but thin on unit economics. Employer subscriptions + success fees is the right structure, but the PRD doesn't address pricing tiers, expected ACV, or how you'd handle the tension between subscription revenue (which incentivizes keeping roles open) and success fees (which incentivizes fast fills). A section on go-to-market sequencing — which employer segments you target first, how you price for SMBs vs. enterprise — would strengthen this considerably.

The **competitive moat** section undersells the difficulty of competing with LinkedIn. LinkedIn's matching may be shallow, but their data moat (700M+ profiles, employer relationships, social graph) is enormous. The PRD should address more directly how Resonance builds defensibility over time — probably through the depth of the Professional Identity Graph and the quality signal from double opt-in outcomes creating a data flywheel that LinkedIn's engagement-optimized model can't replicate.

Finally, **Section 8 (Reducing Inequality)** reads more like a values statement than a product specification. The bias-aware matching bullet points are good, but I'd want to see specific algorithmic audit protocols, what fairness metrics you'd track (demographic parity? equalized odds?), and how you'd handle the inevitable tension between "no demographic signals in matching" and the need to measure demographic outcomes.

---

## Recommended Tech Stacks

Here's what I'd recommend across the major subsystems:

### 1. Candidate Engine (Steadyhand) & Employer Engine (Clearview)

These are conversational AI interfaces that build structured knowledge graphs from natural language.

**LLM / AI Layer:** Claude API (Sonnet for real-time conversation, Opus for complex profile synthesis and matching reasoning). Use structured tool calling to extract STAR structures, skills, and preferences from natural conversation. Consider fine-tuned smaller models later for cost optimization on high-volume tasks like tagging and classification.

**Backend:** Python (FastAPI) or TypeScript (Node/Hono). FastAPI is the stronger choice here given the heavy AI/ML integration — the Python ecosystem for embeddings, vector operations, and ML tooling is unmatched. Use Pydantic for data validation of the structured profile schemas.

**Profile Graph / Knowledge Store:** Neo4j or a property graph layer on top of PostgreSQL (Apache AGE). The Professional Identity Graph, Team Needs Graph, and Preference Maps are inherently graph-structured — skills relate to experiences, experiences relate to themes, preferences relate to constraints. A graph database makes multi-dimensional matching queries far more natural than relational joins. If you want to stay simpler early on, PostgreSQL with JSONB columns can get you surprisingly far.

**Vector Store (for semantic matching):** Pinecone, Weaviate, or pgvector (PostgreSQL extension). You'll need vector embeddings of experiences, skills, and role descriptions to do the kind of semantic matching described in Section 5 (e.g., "built a design system" matching "platform engineering experience"). pgvector keeps your stack simpler; Pinecone/Weaviate scale better for large candidate pools.

**Conversational State Management:** Redis for session state, with conversation histories persisted to PostgreSQL or a document store.

### 2. Matching Protocol (Resonance Core)

This is the most technically complex subsystem — multi-dimensional matching with explainable confidence scoring.

**Matching Engine:** Custom Python service. Each matching dimension (capability, growth trajectory, culture, values, practical, mutual advantage) would be a separate scoring module. Use embedding similarity for semantic dimensions, rule-based logic for practical compatibility (salary, location, visa), and a learned weighting layer that combines dimension scores into the final confidence score.

**Explainability:** This is critical per your design principles. Use Claude to generate natural-language match explanations from the structured score breakdown. The model can translate "capability_score: 0.87, evidence: [experience_id_42, experience_id_17]" into "Their experience building a design system used by 40 engineers maps directly to your platform engineering needs."

**Batch Matching Pipeline:** Apache Airflow or Temporal for orchestrating periodic matching runs across the full candidate-employer space. Early on, you could do this with simple cron jobs + a task queue (Celery or BullMQ), but this will need to scale to millions of pairwise comparisons.

**Matching Data Layer:** A combination of the graph DB (for relationship traversal), vector store (for semantic similarity), and a caching layer (Redis) for pre-computed match scores.

### 3. Aggregation Layer (Section 7)

**Job Board API Ingestion:** Python workers consuming APIs from Indeed, LinkedIn (where available), Greenhouse, Lever, Ashby, etc. Use Celery or Temporal for task orchestration.

**Career Page Monitoring:** A web scraping pipeline — Playwright or Scrapy for crawling, with an LLM pass (Claude Haiku for cost efficiency) to extract structured role data from unstructured career pages. Store raw + structured versions. Schedule with Airflow.

**Deduplication:** Fuzzy matching (company name + role title + location) plus embedding similarity to catch reposts and cross-platform duplicates.

### 4. Frontend

**Web App:** Next.js (React) with TypeScript. The candidate and employer experiences are distinct enough that they could be separate apps sharing a component library, or a single app with role-based routing.

**Mobile:** React Native or (if you want to move faster with a smaller team) a Progressive Web App first. Given that the Calm Mode and Triage Engine briefings are mobile-first use cases, you'll want a mobile experience relatively early.

**UI Framework:** Tailwind CSS + shadcn/ui for rapid, polished development. The conversational interfaces (Memory Bank building, Clearview role definition) would benefit from a chat-style UI component.

### 5. Infrastructure & Platform

**Cloud:** AWS or GCP. GCP has a slight edge if you're leaning into their AI/ML tooling (Vertex AI, BigQuery for analytics). AWS is the safer default for general infrastructure.

**Auth:** Auth0 or Clerk. You need separate auth flows for candidates and employers, plus role-based access within employer orgs.

**Database:** PostgreSQL as the primary relational store (with pgvector extension if you go that route), Redis for caching/sessions, and your graph DB of choice.

**CI/CD:** GitHub Actions → Docker containers → Kubernetes (EKS/GKE) or a simpler platform like Railway/Render early on.

**Observability:** Datadog or Grafana Cloud for metrics/logs/traces. Given the AI-heavy architecture, you'll also want LLM-specific observability — Langfuse or Braintrust for tracking prompt performance, latency, cost, and quality.

**Privacy/Encryption:** End-to-end encryption for candidate data at rest and in transit. Consider a privacy-preserving architecture where candidate PII is stored separately from the profile graph used for matching, with access mediated by consent tokens.

### 6. Quick Reference Summary

| Subsystem | Core Stack |
|---|---|
| **AI/LLM** | Claude API (Sonnet + Opus), embeddings model (Voyage or OpenAI) |
| **Backend** | Python / FastAPI, Pydantic, Celery or Temporal |
| **Profile Graph** | Neo4j or PostgreSQL + Apache AGE |
| **Vector Search** | pgvector (simple) or Pinecone/Weaviate (scale) |
| **Matching Engine** | Custom Python, multi-dimensional scoring pipeline |
| **Aggregation** | Playwright + Scrapy, Airflow, Claude Haiku for parsing |
| **Frontend** | Next.js, TypeScript, Tailwind, shadcn/ui |
| **Mobile** | PWA first, React Native later |
| **Infra** | AWS/GCP, PostgreSQL, Redis, Kubernetes |
| **Auth** | Clerk or Auth0 |
| **Observability** | Datadog + Langfuse |

---

Overall, this is one of the more thoughtful AI product PRDs I've seen. The core insight — that matching is a compatibility problem, not a search problem — is the right framing, and the product architecture follows logically from it. The areas I'd strengthen are the privacy architecture specifics, the business model economics, and the competitive defensibility narrative. The tech is very buildable with a strong small team. Happy to go deeper on any of these areas.
