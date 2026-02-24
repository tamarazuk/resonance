# Infrastructure and DevOps Plan

**Scope:** Cross-cutting concerns that span all phases.
**Owner:** DevOps / Platform Engineer (with support from Tech Lead)

---

## 1. Phase 0: Foundation (Weeks 1-2)

Phase 0 is a prerequisite for all subsequent phases. It establishes the repository, CI/CD pipeline, infrastructure, and local development environment.

### 1.1 Repository Setup

| # | Task | Details | Est. |
|---|---|---|---|
| 0.1 | **Monorepo structure** | Modular monolith organized by domain: `packages/steadyhand`, `packages/clearview`, `packages/resonance-core`, `packages/aggregation`, `packages/governance`, `packages/shared`. Shared utilities, types, and config in `packages/shared`. Turborepo or Nx for task orchestration. | 1d |
| 0.2 | **TypeScript project setup** | TypeScript 5+ strict mode. ESLint + Prettier configuration. Path aliases for domain modules. Shared tsconfig with per-package overrides. | 0.5d |
| 0.3 | **Python project setup** | Python 3.12+ for ML/inference services. Ruff for linting. Poetry or uv for dependency management. Separate directory: `services/ml/`. | 0.5d |
| 0.4 | **Next.js frontend setup** | Next.js 16+ with App Router. Tailwind CSS + Radix UI. React Query + Zustand. React Hook Form + Zod. Vitest + React Testing Library. | 1d |
| 0.5 | **Shared type definitions** | Zod schemas for all API request/response contracts. Shared between frontend and backend. Event payload schemas. Database entity types. | 1d |

### 1.2 CI/CD Pipeline

| # | Task | Details | Est. |
|---|---|---|---|
| 0.6 | **GitHub Actions — PR workflow** | Lint (ESLint + Prettier for TS, Ruff for Python). Type check (`tsc --noEmit`). Unit tests (Vitest, pytest). Integration tests (testcontainers for DB). Security scan (Snyk or Trivy). | 1d |
| 0.7 | **GitHub Actions — merge to main** | Build Docker image, tag with commit SHA. Push to ECR. Deploy to staging (automatic). Run E2E tests against staging (Playwright). Manual approval gate for production. | 1d |
| 0.8 | **Production deployment pipeline** | Canary deploy (5% traffic, 30 min). Automated metric checks (error rate, latency). Promote or rollback. Database migrations as pre-deploy step. | 1d |
| 0.9 | **Pre-commit hooks** | Husky + lint-staged. Lint, format, and type-check on commit. Conventional commit message enforcement. | 0.5d |

### 1.3 Infrastructure Provisioning

| # | Task | Details | Est. |
|---|---|---|---|
| 0.10 | **AWS account setup** | VPC with private subnets. NAT gateways. VPC endpoints for AWS services. Network ACLs and security groups. | 1d |
| 0.11 | **PostgreSQL (RDS)** | Instance: db.r6g.xlarge (4 vCPU, 32 GB). 500 GB gp3 storage. Multi-AZ: yes. Read replica: 1. Extensions: pgvector, pg_trgm, PostGIS. Tuning: shared_buffers=8GB, effective_cache_size=24GB, work_mem=256MB, max_connections=200. PgBouncer for connection pooling (pool_size=20 per app instance). | 1d |
| 0.12 | **Redis (ElastiCache)** | Instance: cache.r6g.large (2 vCPU, 13 GB). 3 nodes, cluster mode. AOF + RDB persistence. Encryption at-rest and in-transit. | 0.5d |
| 0.13 | **S3 + CloudFront** | Versioning enabled. Lifecycle: IA after 90 days, Glacier after 1 year. SSE-S3 encryption. CloudFront for static assets. CORS configuration. | 0.5d |
| 0.14 | **ALB + WAF** | Application Load Balancer. WAF rules (SQL injection, XSS, rate limiting). DDoS protection (AWS Shield Standard). | 0.5d |
| 0.15 | **Secrets management** | AWS Secrets Manager. Separate keys per data classification tier (via KMS). Automatic key rotation. Cross-region replication for DR. | 0.5d |
| 0.16 | **IaC setup** | Terraform or AWS CDK for all infrastructure. State stored in S3 + DynamoDB lock. Environment separation (staging, production). | 1d |

### 1.4 Database Migrations

| # | Task | Details | Est. |
|---|---|---|---|
| 0.17 | **Migration framework** | TypeORM migrations (TS backend). Version-controlled migration files. Rollback support. Pre-deploy execution in CI/CD. | 0.5d |
| 0.18 | **Initial schema deployment** | All tables from Architecture Section 2.4 (candidates, experiences, preferences, growth_map, profile_documents, employers, employer_users, roles, job_postings, matches, match_feedback, consent_records, policy_decision_logs, audit_events, training_eligibility_snapshots). Indexes. Row-level security policies. | 1d |

### 1.5 Feature Flag Infrastructure

| # | Task | Details | Est. |
|---|---|---|---|
| 0.19 | **Feature flag service** | DB-backed feature flag system (Unleash, or simple PostgreSQL-backed implementation). Supports: boolean flags, percentage rollouts, user-segment targeting. Admin API for flag management. SDK for backend (Node.js) and frontend (React). Required for: canary deployments, model governance gates, calendar integration (Phase 3), gradual feature rollouts. | 1d |
| 0.20 | **Default flag configuration** | Define initial flags for all known feature-gated features. Conservative defaults (off) for production. All flags on for staging/development. | 0.5d |

### 1.6 API Conventions

| # | Task | Details | Est. |
|---|---|---|---|
| 0.21 | **API versioning strategy** | URL-prefix versioning: `/v1/candidate/...`, `/v1/employer/...`. Version bump policy: breaking changes require new version, additive changes allowed within version. Deprecation policy: old version supported for 6 months after new version launch. Document in API conventions guide. | 0.5d |
| 0.22 | **OpenAPI spec generation** | Fastify OpenAPI plugin (`@fastify/swagger`) for automatic spec generation from route schemas. Zod-to-OpenAPI bridge for request/response validation + documentation. Swagger UI served at `/docs` in non-production environments. Spec published as CI artifact. | 0.5d |

### 1.7 Local Development Environment

| # | Task | Details | Est. |
|---|---|---|---|
| 0.23 | **Docker Compose** | PostgreSQL (with pgvector), Redis, MinIO (S3-compatible). Seed data for development. | 0.5d |
| 0.24 | **Development commands** | `npm run dev` (API server), `npm run web` (frontend), `npm run test:watch`. `.env.example` with all required variables. | 0.5d |
| 0.25 | **External service mocks** | LLM Gateway: local mock server with golden response fixtures. Job board APIs: recorded response fixtures (VCR-style). SendGrid: local SMTP trap (Mailpit). | 1d |
| 0.26 | **Documentation** | Setup guide in repo README. Architecture overview with links to full docs. Contribution guidelines. | 0.5d |

### Phase 0 Exit Criteria

- [ ] Repository scaffolded with all domain packages
- [ ] CI pipeline green (lint, typecheck, tests)
- [ ] Staging environment operational (API + frontend deployable)
- [ ] Database provisioned with all tables and indexes
- [ ] Local dev setup documented and working for all team members
- [ ] IaC covers all infrastructure components
- [ ] Feature flag infrastructure operational with default flags configured
- [ ] API versioning (`/v1/`) and OpenAPI spec generation working
- [ ] Swagger UI accessible in staging

---

## 2. Authentication and Authorization (Phase 1+)

### 2.1 Auth Architecture

```
Client → API Gateway → Auth Middleware → Route Handler
                           │
                    ┌──────┴──────┐
                    │ JWT Verify  │
                    │ (RS256)     │
                    ├─────────────┤
                    │ Blocklist   │
                    │ Check       │
                    │ (Redis)     │
                    ├─────────────┤
                    │ RBAC Check  │
                    │ (role +     │
                    │  permissions)│
                    ├─────────────┤
                    │ Tenant      │
                    │ Context     │
                    │ (employer_id│
                    │  session    │
                    │  variable)  │
                    └─────────────┘
```

### 2.2 Token Configuration

| Parameter | Value |
|---|---|
| Algorithm | RS256 |
| Access token TTL | 15 minutes |
| Refresh token TTL | 7 days |
| Storage | HttpOnly, Secure cookies |
| Blocklist | Redis (entries expire after access token TTL) |
| Revocation triggers | Account deletion, admin removal, consent cascade |

### 2.3 RBAC Model

| Entity | Roles | Permissions |
|---|---|---|
| Candidate | `candidate` | Full access to own profile, preferences, matches, consent |
| Employer Admin | `admin` | Organization management, all roles, all matches, team management |
| Employer Recruiter | `recruiter` | Role management, match viewing, decision recording |
| Employer Hiring Manager | `hiring_manager` | Own role management, match viewing, decision recording |
| Internal Ops | `ops_admin` | Operations console access, moderation, dispute resolution |

---

## 3. Observability (All Phases)

### 3.1 Logging

| Tool | Scope |
|---|---|
| Pino (Node.js) | Structured JSON logs for all API services |
| structlog (Python) | Structured JSON logs for ML services |
| Centralized aggregation | Datadog or Loki |

Log standards:
- Every log entry includes `trace_id`, `request_id`, `user_id` (if authenticated), `timestamp`
- Sensitive data (PII) never logged — only references (e.g., `candidate_id`, not email)
- Log levels: `error` (actionable failures), `warn` (degraded state), `info` (significant events), `debug` (dev-only)

### 3.2 Metrics

| Tool | Scope |
|---|---|
| Prometheus | Service metrics collection |
| Grafana | Dashboards for system health, business KPIs, ML performance |

Key metrics:
- API latency histograms (p50, p95, p99) per endpoint
- Error rate (5xx) per service
- Queue depth and processing time per BullMQ queue
- CQRS read model projection lag
- Embedding staleness (age of most recent embedding update)
- Match scoring pipeline end-to-end latency
- Active WebSocket connections
- LLM API call latency and cost

### 3.3 Distributed Tracing

| Tool | Scope |
|---|---|
| OpenTelemetry SDK | Instrumentation across all services |
| Jaeger or Datadog APM | Trace visualization |

Standards:
- Trace IDs propagated through all event-driven workflows
- Span annotations for AI gateway calls (model, prompt version, token count, latency)
- Async event chains linked by trace ID

### 3.4 Alerting

| Severity | Channel | Examples |
|---|---|---|
| P0 (Critical) | PagerDuty | Unauthorized intro attempt, consent DLQ failure, data breach indicator |
| P1 (High) | PagerDuty | p95 latency > SLO, error rate > 0.1%, read model lag > 5 min, DLQ depth > 50 |
| P2 (Medium) | Slack | Queue depth growing, cache miss rate elevated, drift detection, DLQ depth > 20 |
| P3 (Info) | Email (daily) | System health summary, match quality trends, cost tracking |

---

## 4. Security (All Phases)

### 4.1 Encryption

| Scope | Method | Phase |
|---|---|---|
| At rest (DB) | RDS-managed encryption via AWS KMS | Phase 1 (launch) |
| At rest (S3) | SSE-S3 | Phase 1 (launch) |
| At rest (PII fields) | Application-level AES-256-GCM before storage | **Phase 2/3** (see §4.2) |
| In transit | TLS 1.3 for all connections | Phase 1 (launch) |
| Service-to-service | mTLS when service extraction occurs | Phase 3+ |
| Key management | AWS KMS with customer-managed CMKs, automatic rotation | Phase 1 (launch) |

### 4.2 PII Handling

> **Intentional Technical Debt — Approved by Engineering Leadership**
>
> To meet the 7-day Phase 1 MVP timeline, engineering leadership made a deliberate
> decision to defer application-level field encryption for PII columns. This is a
> tracked security trade-off, not an oversight. It is logged in the technical-debt
> register and scheduled for remediation in Phase 2/3.

#### Phase 1 (Current — MVP Launch)

PII fields listed below are protected by **PostgreSQL disk-level encryption only**
(RDS-managed, AWS KMS with customer-managed CMKs). This provides encryption at rest
for the entire database volume and satisfies baseline compliance for early GTM while
the user base is small and access is tightly controlled.

Mitigating controls during Phase 1:
- All database access restricted to private VPC subnets (no public endpoint)
- IAM-authenticated RDS connections; no shared credentials
- Row-level security policies enforced for tenant isolation
- Application logs never contain raw PII (only opaque identifiers)
- Access to production database limited to on-call engineers via break-glass procedure
- Audit logging enabled for all data-access operations

#### Phase 2/3 (Scheduled Remediation)

Application-level AES-256-GCM encryption will be implemented for the following
fields (per Architecture Section 5.3.1):

- `candidates.email`
- `experiences.raw_description`, `situation`, `task`, `action`, `result`
- `candidate_preferences.min_salary_expectation`, `max_salary_expectation`
- `employer_users.email`
- `profile_documents.parsed_text`, `file_url`

Implementation plan:
- Encryption/decryption middleware added to the data access layer
- Separate KMS keys per data classification tier
- Encrypted fields queryable only by exact lookup (not range or pattern)
- **Retroactive migration**: all existing plaintext PII rows will be encrypted
  in-place via a backfill migration, verified by a completeness check, and the
  migration will be a Phase 2/3 exit criterion
- Migration will run as an online, zero-downtime operation with progress tracking
  and automatic resume on failure

### 4.3 Network Security

- VPC with private subnets for all data and application services
- NAT gateways for outbound traffic
- VPC endpoints for AWS services (S3, KMS, SQS)
- Security groups: least-privilege, explicit allow rules
- WAF rules: SQL injection, XSS, rate limiting
- DDoS protection: AWS Shield Standard

### 4.4 Vulnerability Management

- Automated scanning: Snyk or Trivy in CI/CD pipeline
- Dependency updates: Dependabot or Renovate for automated PRs
- Security review: required for auth, consent, and policy changes
- Penetration testing: before launch (Phase 4 hardening)

---

## 5. Caching Strategy

```
Layer 1: CDN (CloudFront)
  ├── Static frontend assets (1 year, cache-busted)
  └── Public API responses (5 min TTL)

Layer 2: Application Cache (Redis)
  ├── User sessions
  ├── Profile data (15 min TTL, invalidate on write)
  ├── Match feed results (5 min TTL, invalidate on score event)
  ├── Hot embeddings (1 hour TTL)
  └── Rate limiting counters

Layer 3: Database Query Cache
  ├── Prepared statements (PostgreSQL native)
  └── PgBouncer connection pooling (pool_size=20)

Layer 4: Browser Cache
  ├── Static assets (immutable, 1 year)
  └── API responses (private, max-age=300)

Invalidation:
  ├── Event-driven: profile/match events → targeted invalidation
  ├── Time-based: TTL expiration as fallback
  └── Manual: admin flush for incident response
```

---

## 6. Queue and Async Processing

### 6.1 BullMQ Queues

| Queue Name | Purpose | Retry Policy | DLQ |
|---|---|---|---|
| `embedding-generation` | Generate/refresh embeddings on profile/role updates | 3 retries, exponential backoff | `embedding-dlq` |
| `match-scoring` | Score candidate-role pairs on trigger events | 3 retries, exponential backoff | `matching-dlq` |
| `aggregation-ingestion` | Ingest postings from APIs and scrapers | 3 retries, exponential backoff | `aggregation-dlq` |
| `aggregation-moderation` | Tier-4 moderation processing | 3 retries, exponential backoff | `moderation-dlq` |
| `consent-processing` | Consent state changes and cascades | 3 retries, exponential backoff | `consent-dlq` (P0 alert) |
| `notification-dispatch` | Send emails and notifications | 3 retries, exponential backoff | `notification-dlq` |
| `hourly-backfill` | Stale match rescoring, stuck workflow recovery | 3 retries | `backfill-dlq` |
| `read-model-projection` | Update CQRS read models from events | 3 retries, exponential backoff | `projection-dlq` |

### 6.2 Job Design Principles

- All jobs are idempotent (safe to replay from DLQ)
- Jobs carry minimal payload (IDs + metadata, not full data)
- Idempotency key: `event_id` for event-triggered jobs
- Job timeout: 60 seconds default, 300 seconds for scoring
- Concurrency: configurable per queue per environment

---

## 7. Disaster Recovery

### 7.1 Backup Strategy

| Resource | Method | Frequency | Retention |
|---|---|---|---|
| PostgreSQL | RDS automated snapshots + WAL archiving | Daily + continuous | 7 days |
| Redis | AOF persistence + RDB snapshots | Continuous + periodic | Per cluster config |
| S3 | Cross-region replication to us-west-2 | Continuous | Per lifecycle policy |
| Secrets | AWS Secrets Manager cross-region replication | Continuous | Active |
| Code | Git (GitHub) | On push | Indefinite |

### 7.2 Recovery Objectives

| Metric | Target |
|---|---|
| RPO (Recovery Point Objective) | 1 hour |
| RTO (Recovery Time Objective) | 4 hours |

### 7.3 Failover Process

1. DNS failover (Route 53 health checks)
2. Promote read replica to primary database
3. Deploy application to DR region (pre-built images in us-west-2 ECR)
4. Update service endpoints and verify health
5. Notify operations team and begin incident tracking

### 7.4 DR Testing

- Quarterly failover drills
- Annual full-region failover exercise
- DR drill is a Phase 4 exit criterion

---

## 8. Data Retention Enforcement

| Data Category | Active Retention | Inactive Retention | Deletion |
|---|---|---|---|
| Candidate profiles | While account active | Soft delete after 2 years inactivity | Hard delete after 5 years |
| Match data | 2 years | Anonymized for analytics | Per retention policy |
| Activity logs | 1 year | — | Purged after 1 year |
| Active roles | While active | — | — |
| Closed roles | 3 years | — | Purged after 3 years |
| Aggregated analytics | Indefinite (anonymized) | — | — |
| Consent events | Indefinite (compliance) | — | Never deleted |
| Policy decision logs | 5 years | — | Purged after 5 years |
| Introduction state history | 3 years | — | Purged after 3 years |

Implementation: scheduled job (weekly) that enforces retention policies, marks records for deletion, and emits audit events for all deletions.

### 8.1 Data Retention SQL Implementation

```sql
-- Function to soft-delete inactive candidates
CREATE OR REPLACE FUNCTION soft_delete_inactive_candidates()
RETURNS void AS $$
BEGIN
  UPDATE candidates
  SET profile_status = 'soft_deleted'
  WHERE last_active_at < NOW() - INTERVAL '2 years'
    AND profile_status != 'soft_deleted';
END;
$$ LANGUAGE plpgsql;

-- Function to hard-delete old soft-deleted candidates
CREATE OR REPLACE FUNCTION hard_delete_old_candidates()
RETURNS void AS $$
BEGIN
  DELETE FROM candidates
  WHERE profile_status = 'soft_deleted'
    AND updated_at < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;

-- Function to archive old matches
CREATE OR REPLACE FUNCTION archive_old_matches()
RETURNS void AS $$
BEGIN
  UPDATE matches
  SET candidate_status = 'archived',
      employer_status = 'archived'
  WHERE created_at < NOW() - INTERVAL '2 years'
    AND candidate_status NOT IN ('archived', 'hired');
END;
$$ LANGUAGE plpgsql;

-- Function to purge expired activity logs
CREATE OR REPLACE FUNCTION purge_expired_activity_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_events
  WHERE category = 'activity'
    AND timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Scheduled jobs (using pg_cron or external scheduler)
-- SELECT cron.schedule('soft-delete-inactive', '0 2 * * 0',
--   'SELECT soft_delete_inactive_candidates()');
-- SELECT cron.schedule('hard-delete-old', '0 3 * * 0',
--   'SELECT hard_delete_old_candidates()');
-- SELECT cron.schedule('archive-old-matches', '0 4 * * 0',
--   'SELECT archive_old_matches()');
-- SELECT cron.schedule('purge-activity-logs', '0 5 * * 0',
--   'SELECT purge_expired_activity_logs()');
```

Notes:
- All deletion functions must emit audit events before deleting records (implemented in the application-layer wrapper that calls these functions).
- Consent events (`consent_records`) are never deleted — they are retained indefinitely for compliance.
- Policy decision logs are purged after 5 years via a separate scheduled function (not shown) with the same pattern.
- Introduction state history is purged after 3 years.
- Closed roles are purged after 3 years.

---

## 9. SLO Monitoring Dashboard

Deployed in Phase 1, refined through Phase 4:

| Category | Metric | Target | Alert Threshold |
|---|---|---|---|
| Availability | API uptime | 99.9% | < 99.5% → P1 |
| Latency (API) | p95 response time | 500ms | > 1s → P2 |
| Latency (matching) | End-to-end scoring | < 30s | > 60s → P2 |
| Latency (conversation) | p95 first token | < 3s | > 5s → P2 |
| Latency (vector search) | p95 query time | < 200ms | > 500ms → P2 |
| Error rate | 5xx rate | < 0.1% | > 0.5% → P1 |
| Guardrails | Unauthorized intros | 0 | Any → P0 |
| Queue health | Job failure rate | < 0.5% | > 1% → P2 |
| Queue health | DLQ depth | < 50 | > 20 → P2, > 50 → P1 |
| Data freshness | Read model lag | < 5 min | > 30s → P2, > 5 min → P1 |

---

## 10. LLM Cost Controls

### 10.1 Cost Tracking

| Metric | Granularity | Storage |
|---|---|---|
| Token usage (input + output) | Per request | `ai_gateway_logs` table |
| Cost per request | Per request | Computed from token usage + model pricing |
| Cost per user per day | Per user | Aggregated metric |
| Cost per feature | Per feature (STAR extraction, explainability, prep, etc.) | Aggregated metric |

### 10.2 Budget Thresholds

| Scope | Soft Limit (Alert) | Hard Limit (Throttle) |
|---|---|---|
| Per user per day | $2.00 | $5.00 |
| Per user per month | $30.00 | $50.00 |
| Platform monthly | 80% of budget | 95% of budget |

When a hard limit is reached:
- Queue non-critical LLM requests (explainability, prep engine) for batch processing
- Continue serving critical requests (consent checks, policy evaluation)
- Alert ops team immediately
- Do not degrade the candidate experience silently — show a clear message

### 10.3 Cost Optimization

- Cache frequently repeated LLM calls (e.g., same resume parsed twice)
- Batch similar requests where possible
- Use smaller models for classification tasks (skill tagging, theme classification)
- Monitor cost per match and cost per introduction as business KPIs

---

## 11. Load Testing Targets

Concrete targets for each phase, validated during hardening:

| Phase | Metric | Target |
|---|---|---|
| **Phase 1** | Concurrent candidates | 500 |
| **Phase 1** | WebSocket connections | 1,000 |
| **Phase 1** | API p95 latency | < 500ms |
| **Phase 1** | Conversation first token p95 | < 3s |
| **Phase 2** | Candidate profiles in DB | 10,000 |
| **Phase 2** | Job postings in DB | 5,000 |
| **Phase 2** | pgvector ANN query p95 | < 200ms |
| **Phase 2** | Match scoring pipeline e2e | < 30s |
| **Phase 2** | Hourly backfill completion | < 45 min |
| **Phase 3** | Concurrent employers | 100 |
| **Phase 3** | Introduction state transitions/sec | 50 |
| **Phase 3** | Read model projection lag (decisions) | < 5s |
| **Phase 4** | Two-tower inference p95 | < 500ms |
| **Phase 4** | Full scoring pipeline e2e | < 30s |
| **Phase 4** | Concurrent ops console users | 50 |
| **Hardening** | 10x burst throughput (event queues) | All queues process without DLQ overflow |

Tools: k6 or Artillery for API load tests, custom scripts for pipeline throughput tests.

---

## 12. Incident Response Runbooks

Runbooks are authored incrementally as their corresponding systems are built:

| Runbook | Phase Authored | Trigger | Severity |
|---|---|---|---|
| Unauthorized introduction detected | P3 | P0 alert: any intro without both decisions | P0 |
| Consent DLQ overflow | P1 | P0 alert: consent DLQ depth > 0 | P0 |
| PII exposure incident | P1 | Manual report or WAF alert | P0 |
| Database failover | P0 | RDS health check failure | P0 |
| LLM provider outage | P1 | Circuit breaker open on all providers | P1 |
| Model drift rollback | P4 | Drift detection alert | P1 |
| Read model corruption rebuild | P2 | Data inconsistency detected | P1 |
| Notification leak investigation | P3 | User report of one-sided decision exposure | P0 |
| Row-level security breach | P3 | Employer data cross-contamination detected | P0 |

Each runbook includes: detection criteria, triage steps, resolution procedure, escalation path, post-incident review template, and communication templates.

All runbooks must be reviewed and drill-tested during the Hardening phase.

---

## 13. Database Partitioning Strategy

Append-only and high-growth tables require partitioning to maintain query performance:

| Table | Partition Strategy | Partition Key | Retention |
|---|---|---|---|
| `audit_events` | Range (monthly) | `created_at` | 1 year active, then archive |
| `consent_records` | Range (yearly) | `created_at` | Indefinite (compliance) |
| `policy_decision_logs` | Range (monthly) | `created_at` | 5 years |
| `match_interaction_events` | Range (monthly) | `created_at` | 2 years active, then archive for ML |
| `introduction_outcomes` | Range (quarterly) | `created_at` | 3 years |
| `ai_gateway_logs` | Range (weekly) | `created_at` | 90 days active, then purge |

Implementation:
- PostgreSQL native declarative partitioning (`PARTITION BY RANGE`)
- Automated partition creation via scheduled job (create next month's partition in advance)
- Old partitions detached and archived to S3 (Parquet format) before deletion
- Partition pruning verified in query plans for all queries against partitioned tables
- Deploy partitioning in Phase 0 for `audit_events` and `consent_records`; extend as tables are introduced

---

## 14. Accessibility Standards

### 14.1 Target

WCAG 2.1 Level AA compliance for all user-facing interfaces.

### 14.2 Enforcement

| Method | Phase | Scope |
|---|---|---|
| axe-core in CI | P0 (setup), all phases (enforce) | Automated accessibility checks on every PR |
| Radix UI primitives | All | Accessible-by-default components for common patterns |
| Keyboard navigation testing | Per sprint | Manual verification of all interactive elements |
| Screen reader testing | Phase exit gates | VoiceOver (macOS) and NVDA (Windows) testing at phase boundaries |
| Color contrast verification | Per sprint | All text meets 4.5:1 contrast ratio minimum |

### 14.3 Key Requirements

- All form inputs have associated labels
- All images have alt text (or are marked decorative)
- Focus management for modals, dialogs, and route transitions
- Skip navigation link on all pages
- ARIA landmarks for page regions
- Error messages associated with form fields
- No information conveyed by color alone (confidence badges must include text/icon)

---

## 15. Database Schema Reference

Complete CREATE TABLE statements for all tables. This schema is the source of truth; migrations must be generated from these definitions.

### 15.1 Candidate Tables

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,

  profile_status VARCHAR(50) DEFAULT 'incomplete',
  profile_completeness_score DECIMAL(5,4) DEFAULT 0.0000,

  visibility VARCHAR(50) DEFAULT 'matches_only',
  allow_contact BOOLEAN DEFAULT false,
  match_notification_opt_in BOOLEAN DEFAULT true,
  model_training_opt_in BOOLEAN DEFAULT false,
  model_training_opt_in_at TIMESTAMP WITH TIME ZONE,
  model_training_opt_out_at TIMESTAMP WITH TIME ZONE,
  consent_version VARCHAR(50),

  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  last_match_notification_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE candidate_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,
  consent_value BOOLEAN NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) NOT NULL
);

CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  raw_description TEXT,

  skills_demonstrated JSONB DEFAULT '[]',
  themes JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  evidence_strength DECIMAL(5,4) DEFAULT 0.0000,

  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  embedding vector(1536)
);

CREATE INDEX idx_experiences_candidate ON experiences(candidate_id);
CREATE INDEX idx_experiences_embedding ON experiences
  USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE candidate_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL UNIQUE
    REFERENCES candidates(id) ON DELETE CASCADE,

  role_types JSONB DEFAULT '[]',
  seniority_levels JSONB DEFAULT '[]',
  industries JSONB DEFAULT '[]',

  work_arrangements JSONB DEFAULT '[]',
  work_style_preferences JSONB DEFAULT '{}',

  min_salary_expectation INTEGER,
  max_salary_expectation INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  equity_preference VARCHAR(50),

  locations JSONB DEFAULT '[]',
  willing_to_relocate BOOLEAN DEFAULT false,

  growth_areas JSONB DEFAULT '[]',
  career_trajectory TEXT,

  dealbreakers JSONB DEFAULT '[]',
  non_negotiables JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE growth_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL UNIQUE
    REFERENCES candidates(id) ON DELETE CASCADE,

  skills_in_progress JSONB DEFAULT '[]',
  identified_growth_edges JSONB DEFAULT '[]',

  short_term_goals TEXT,
  long_term_goals TEXT,
  trajectory_direction VARCHAR(100),

  topics_engaged JSONB DEFAULT '[]',
  projects_pursued JSONB DEFAULT '[]',

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profile_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL
    REFERENCES candidates(id) ON DELETE CASCADE,

  document_type VARCHAR(50),
  file_name VARCHAR(255),
  file_url TEXT,
  file_size INTEGER,

  parsed_text TEXT,
  parsed_structured JSONB DEFAULT '{}',

  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_status VARCHAR(50) DEFAULT 'pending'
);
```

### 15.2 Employer Tables

```sql
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),

  size VARCHAR(50),
  industry VARCHAR(100),
  founded_year INTEGER,
  headquarters_location JSONB,

  subscription_tier VARCHAR(50),
  subscription_status VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE employer_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL
    REFERENCES employers(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,

  role VARCHAR(100),
  permissions JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL
    REFERENCES employers(id) ON DELETE CASCADE,
  created_by UUID REFERENCES employer_users(id),

  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location JSONB,

  must_have_requirements JSONB DEFAULT '[]',
  nice_to_have_requirements JSONB DEFAULT '[]',
  seniority_level VARCHAR(50),

  months_1_3_responsibilities TEXT,
  months_3_6_responsibilities TEXT,
  months_6_12_responsibilities TEXT,

  success_criteria_6_months TEXT,

  team_composition JSONB DEFAULT '{}',
  team_gap_description TEXT,

  growth_opportunities JSONB DEFAULT '[]',
  career_path TEXT,

  decision_making_style VARCHAR(100),
  communication_style VARCHAR(100),
  pace VARCHAR(100),
  autonomy_level VARCHAR(100),
  values_in_practice JSONB DEFAULT '[]',

  hidden_requirements JSONB DEFAULT '{}',

  salary_range_min INTEGER,
  salary_range_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  equity_offered BOOLEAN,
  benefits_summary JSONB DEFAULT '{}',

  status VARCHAR(50) DEFAULT 'draft',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  embedding vector(1536)
);

CREATE INDEX idx_roles_employer ON roles(employer_id);
CREATE INDEX idx_roles_embedding ON roles
  USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  source VARCHAR(50),
  source_id VARCHAR(255),
  source_url TEXT,
  role_id UUID REFERENCES roles(id),

  title VARCHAR(255),
  company_name VARCHAR(255),
  description TEXT,
  requirements JSONB DEFAULT '{}',

  location JSONB,
  work_arrangement VARCHAR(50),

  salary_min INTEGER,
  salary_max INTEGER,

  data_quality_tier INTEGER,
  confidence_score DECIMAL(3,2),

  embedding vector(1536),

  posted_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_postings_source ON job_postings(source, source_id);
CREATE INDEX idx_postings_embedding ON job_postings
  USING ivfflat (embedding vector_cosine_ops);
```

### 15.3 Matching Tables

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  role_id UUID REFERENCES roles(id),
  job_posting_id UUID REFERENCES job_postings(id),

  CONSTRAINT match_has_target
    CHECK (role_id IS NOT NULL OR job_posting_id IS NOT NULL),

  overall_score DECIMAL(5,2),
  capability_alignment_score DECIMAL(5,2),
  growth_trajectory_score DECIMAL(5,2),
  culture_compatibility_score DECIMAL(5,2),
  values_alignment_score DECIMAL(5,2),
  practical_compatibility_score DECIMAL(5,2),
  mutual_advantage_score DECIMAL(5,2),

  match_tier VARCHAR(50),

  match_reasoning TEXT,
  strengths JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',

  candidate_status VARCHAR(50),
  employer_status VARCHAR(50),
  candidate_responded_at TIMESTAMP WITH TIME ZONE,
  employer_responded_at TIMESTAMP WITH TIME ZONE,

  introduction_status VARCHAR(50),
  introduction_unlocked_at TIMESTAMP WITH TIME ZONE,
  introduced_at TIMESTAMP WITH TIME ZONE,

  outcome VARCHAR(50),
  outcome_at TIMESTAMP WITH TIME ZONE,

  last_scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stale BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matches_candidate ON matches(candidate_id);
CREATE INDEX idx_matches_role ON matches(role_id);
CREATE INDEX idx_matches_score ON matches(overall_score DESC);
CREATE INDEX idx_matches_stale ON matches(stale) WHERE stale = true;

CREATE TABLE match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),

  user_type VARCHAR(50),
  feedback_type VARCHAR(50),

  rating INTEGER,
  feedback_text TEXT,

  action_taken VARCHAR(100),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 15.4 Governance Tables

```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type VARCHAR(50) NOT NULL,
  subject_id UUID NOT NULL,
  consent_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  evidence_ref TEXT
);

CREATE TABLE policy_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  input_refs JSONB DEFAULT '[]',
  outcome VARCHAR(50) NOT NULL,
  reason_code VARCHAR(100) NOT NULL,
  actor_id UUID,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  subject_id UUID NOT NULL,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE training_eligibility_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  training_eligible BOOLEAN NOT NULL,
  consent_version VARCHAR(50) NOT NULL,
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 15.5 Indexes

```sql
CREATE INDEX idx_consent_records_lookup
  ON consent_records(subject_type, subject_id, consent_type);
CREATE INDEX idx_audit_events_category
  ON audit_events(category, subject_id);
CREATE INDEX idx_audit_events_timestamp
  ON audit_events(timestamp);
CREATE INDEX idx_policy_decision_logs_policy
  ON policy_decision_logs(policy_name, evaluated_at);
CREATE INDEX idx_training_eligibility_candidate
  ON training_eligibility_snapshots(candidate_id, effective_from);
```

### 15.6 Row-Level Security

```sql
-- Enable RLS on employer-scoped tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY employer_isolation_policy ON roles
  USING (employer_id = current_setting('app.current_employer_id')::UUID);

-- Application must set the session variable before employer queries:
-- SET LOCAL app.current_employer_id = '<employer_uuid>';
```

### 15.7 Migration Strategy

**Tool:** Prisma Migrate

**Process:**
1. Create migration for each schema change
2. Test migration on local database
3. Test migration on staging database
4. Run migration as pre-deploy step in production
5. Verify migration success before proceeding with deployment

**Rules:**
- All migrations are versioned and timestamped
- Migrations are reversible where possible
- Complex migrations include rollback scripts
- Pre-deploy checks block unsafe migrations (enforced in Phase 4 hardening, see WS-01 EP-007)
