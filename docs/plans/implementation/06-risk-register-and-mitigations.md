# Risk Register and Mitigations

**Scope:** All risks across the Resonance implementation, categorized by domain.
**Review cadence:** Reviewed at every phase transition.

---

## 1. Technical Risks

### 1.1 AI/ML Risks

| ID | Risk | Severity | Likelihood | Phase | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| T-001 | STAR extraction quality too low for reliable profiles | High | Medium | P1 | Poor candidate profiles → bad matches downstream | Golden test sets with 50+ examples. Prompt iteration budget (3 rounds). Evidence scoring as quality gate. Human review of edge cases. | ML Engineer |
| T-002 | Resume parsing inaccuracy | Medium | High | P1 | Bad first impression, manual cleanup burden on candidates | Human-in-the-loop: parsed output shown for review before saving. Feedback loop to improve prompts. Support multiple resume formats. | ML Engineer |
| T-003 | LLM provider outage or degradation | High | Medium | All | Conversation capture, STAR extraction, explainability all fail | AI gateway with Claude primary / OpenAI fallback. Circuit breaker per provider. Graceful degradation: queue work for retry, show cached data. | Backend Lead |
| T-004 | LLM response quality drift over time | Medium | Medium | All | Silent degradation of extraction and reasoning quality | Output schema validation on every response. Golden test regression suite. Prompt version pinning. Drift monitoring on output distributions. | ML Engineer |
| T-005 | Embedding quality insufficient for recall | High | Medium | P2 | Candidates miss good matches; poor ranking | Evaluation on held-out test set before launch. A/B testing embedding models. Fallback to keyword-based recall layer. | ML Engineer |
| T-006 | Two-tower model latency exceeds SLO | Medium | Medium | P4 | Scoring pipeline breaches 30s target | Model quantization (int8), ONNX Runtime, request batching, embedding cache. Fallback to MVP algorithm if needed. | ML Engineer |
| T-007 | Algorithmic bias in matching | Critical | Medium | P2-P4 | System reproduces or amplifies inequality | No demographic signals in online inference. Continuous fairness audits. Disparity alerts. Adversarial debiasing. Third-party audit before launch. | ML Engineer + Tech Lead |
| T-008 | Calibration drift between model versions | Medium | High | P4 | Confidence scores misleading to users | Automated weekly recalibration. Drift alerts with auto-rollback. Known-good tuple fallback. | ML Engineer |
| T-009a | LLM cost overrun | High | Medium | All | Budget blown on inference costs, project viability threatened | Per-request cost tracking from Phase 0. Budget threshold alerts (80%/90%/100%). Prompt optimization (shorter context where possible). Model tiering: cheaper models for low-stakes tasks. Monthly cost reviews. | Tech Lead + DevOps |
| T-009b | Insufficient ML training data at Phase 4 start | High | Medium | P4 | Two-tower model quality poor, scoring unreliable | Outcome data instrumentation added in Phase 2 (task 6.10) and Phase 3 (task 8.11). ML engineer prototypes model during Phase 2-3 with synthetic data. Minimum viable dataset threshold defined before Phase 4 entry. | ML Engineer |

### 1.2 Data Risks

| ID | Risk | Severity | Likelihood | Phase | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| T-009 | pgvector performance degrades at scale | Medium | Low | P2+ | Slow vector search, matching latency breach | Monitor query latency. ADR-013 (Pinecone) deferred decision ready. Repository interface allows swap. | Platform Lead |
| T-010 | Database migration failure in production | High | Low | All | Downtime, data corruption | Pre-deploy migration execution. Rollback scripts for every migration. Test migrations against production-like data in staging. | DevOps |
| T-011 | CQRS read model inconsistency | Medium | Medium | P2+ | Users see stale or incorrect match data | Propagation lag monitoring (< 5s for decisions, < 5 min for scoring). Fallback to write path query. Rebuild capability from events. | Backend Lead |
| T-012 | Data retention enforcement gaps | Medium | Medium | P3+ | Compliance violation | Automated weekly retention job with audit log. Alerting on enforcement failures. Quarterly compliance review. | DevOps + Tech Lead |
| T-013 | PII encryption key rotation issues | High | Low | All | Encrypted data becomes unreadable | KMS automatic rotation. Key version tracking. Migration tool for re-encryption on rotation. DR-tested key access. | DevOps |

### 1.3 Infrastructure Risks

| ID | Risk | Severity | Likelihood | Phase | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| T-014 | AWS region outage | High | Low | All | Full service outage | DR region (us-west-2). RPO 1h / RTO 4h. Quarterly failover drills. Cross-region S3 replication. | DevOps |
| T-015 | Redis cluster failure | Medium | Low | All | Queue processing halts, cache unavailable | Cluster mode with 3 nodes. AOF persistence. Application degradation path (slower but functional without cache). | DevOps |
| T-016 | BullMQ DLQ overflow | Medium | Medium | P2+ | Failed jobs pile up, stale data, consent gaps | Per-queue DLQ monitoring with alerts. Consent DLQ is P0. 7-day escalation for unresolved DLQ jobs. Idempotent job design for safe replay. | Backend Lead |
| T-017 | WebSocket connection scaling | Medium | Medium | P1+ | Conversation experience degrades under load | 1000 connections per instance target. Horizontal scaling. Connection pooling. Load testing before each phase exit. | Backend Lead |
| T-018 | Third-party API rate limiting | Medium | High | P2 | Job board ingestion throttled or blocked | Rate limit handling with backoff. Circuit breaker per connector. Multiple source strategy. Ingestion during off-peak hours. | Backend Lead |
| T-019 | Email deliverability failures | High | Medium | P3+ | Introduction notifications land in spam, users miss critical matches | SPF/DKIM/DMARC configuration in Phase 3 (task 8.12). Dedicated sending domain. Warm-up schedule. Bounce rate monitoring with alerts. Transactional vs marketing stream separation. | DevOps + Backend Lead |
| T-020 | Feature flag misconfiguration | Medium | Medium | All | Wrong features exposed to wrong users, broken rollouts | Feature flag infrastructure in Phase 0 (tasks 0.19-0.20). Flag state audit logging. Required flag review in deploy checklist. Emergency kill-switch per flag. Integration tests verify flag behavior for both states. | Backend Lead |

---

## 2. Product Risks

| ID | Risk | Severity | Likelihood | Phase | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| P-001 | Cold start: no employers, no matches | High | High | P2-P3 | Candidates see no value, churn | Steadyhand works standalone (cognitive protection, profile building). Aggregation (Tier 2-3) provides matches without employer adoption. Employer-side launches only when candidate base is sufficient. | Product |
| P-002 | Low match quality erodes trust | High | Medium | P2+ | Users disengage, negative word-of-mouth | Conservative surfacing (only Strong/Promising). Transparent explainability. Outcome feedback loop for improvement. | Product + ML |
| P-003 | Candidate profile abandonment | Medium | High | P1 | Incomplete profiles → poor matches | Onboarding designed for progressive disclosure. Resume import for quick bootstrap. Profile completeness scoring with nudges. | Product + Frontend |
| P-004 | Employer gaming (misrepresented roles) | Medium | Medium | P3+ | Candidates waste time, trust erosion | Post-match feedback. Negative feedback reduces match priority. Moderation for flagged employers. | Product + Backend |
| P-005 | Candidate fabrication of experiences | Medium | Medium | P1+ | Employer trust erosion | Evidence scoring (specificity over vagueness). Evidence strength displayed. System encourages detail over fabrication. | ML Engineer |
| P-006 | Double opt-in creates too much friction | Medium | Medium | P3 | Low introduction conversion rate | Clear UX explaining the process. Save option as holding state. Match expiry nudges. | Product + Frontend |

---

## 3. Security and Compliance Risks

| ID | Risk | Severity | Likelihood | Phase | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| S-001 | Privacy breach (candidate data exposed) | Critical | Low | All | Trust destroyed, legal liability | PII encryption at app layer. Row-level security. Network isolation. WAF. Security audit before launch. Incident response runbooks. | Tech Lead + DevOps |
| S-002 | Unauthorized introduction (guardrail bypass) | Critical | Low | P3+ | Trust destroyed, core principle violated | Policy engine as non-bypassable gate (backend enforcement, not UI). Zero tolerance SLO. Audit trail for every attempt. P0 alert on any violation. | Tech Lead |
| S-003 | Consent event lost or corrupted | Critical | Low | P1+ | Compliance violation (GDPR/CCPA) | Immutable append-only consent events. Consent DLQ is P0. Event replay capability. Quarterly audit of consent completeness. | Backend Lead |
| S-004 | Row-level security misconfiguration | Critical | Low | P3 | Employer data leaked across tenants | Integration tests verify zero-row return without session variable. Security review for all employer-scoped queries. Automated RLS verification in CI. | Backend Lead |
| S-005 | Token blocklist race condition | High | Low | P1+ | Deleted user retains access briefly | Blocklist check before JWT validation (not after). Redis blocklist with appropriate TTL. Integration test for deletion → immediate access denial. | Backend Lead |
| S-006 | Model training with non-consented data | Critical | Low | P4 | Legal liability, trust violation | Training pipeline only uses `training_eligible=true` snapshots. Consent revocation honored in next cycle. Training lineage auditable per model version. | ML Engineer |
| S-007 | WCAG 2.1 AA accessibility non-compliance | Medium | Medium | All | Legal liability (ADA), exclusion of users with disabilities | WCAG 2.1 AA standard defined in Phase 0. Accessibility audit at Phase 1 Sprint 4 exit. axe-core in CI pipeline. Keyboard navigation and screen reader testing. Remediation sprint buffer if audit fails. | Frontend Lead |

---

## 4. Organizational and Process Risks

| ID | Risk | Severity | Likelihood | Phase | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| O-001 | Scope creep within phases | Medium | High | All | Phase delays, missed exit criteria | Phase exit criteria defined upfront. Strict scope boundaries. Deferred items tracked explicitly. Weekly scope review. | Tech Lead |
| O-002 | Team too small for timeline | High | Medium | All | Missed deadlines, burnout, quality decline | Timeline calibrated for 7-person team. Adjust timelines if team is smaller. Prioritize ruthlessly. Cut scope before extending timeline. | Tech Lead |
| O-003 | Key person dependency | High | Medium | All | Critical knowledge loss if someone leaves | Documentation-first culture. Code review required. No single-owner modules. Knowledge sharing sessions. | Tech Lead |
| O-004 | Integration complexity between phases | Medium | Medium | P2+ | Phases take longer than estimated due to integration work | Phase plans include integration testing time. Sprint buffer days. Cross-phase integration tests in CI. | Tech Lead |

---

## 5. External Dependency Risks

| ID | Risk | Severity | Likelihood | Phase | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| E-001 | Anthropic Claude API pricing/terms change | Medium | Medium | All | Cost model changes, feature availability | AI gateway abstraction allows provider switch. OpenAI fallback ready. Monitor provider announcements. | Tech Lead |
| E-002 | OpenAI embedding API changes | Medium | Low | All | Embedding dimension or quality changes | Gateway-level dimension enforcement (1536). Abstraction layer. Migration plan for dimension changes. | ML Engineer |
| E-003 | Job board API access revoked or restricted | High | Medium | P2+ | Opportunity coverage drops | Multi-source strategy. Career page scraping as fallback. Candidate submissions. Direct employer postings as highest quality. | Backend Lead |
| E-004 | OAuth provider policy changes | Low | Low | P1+ | Login flow disruption | Multiple OAuth providers (Google, LinkedIn, GitHub). Email/password fallback (add if needed). | Backend Lead |
| E-005 | AWS service outage | Medium | Low | All | Service disruption | Multi-AZ deployment. DR region. RPO/RTO targets. Quarterly DR drills. | DevOps |

---

## 6. Risk Heat Map

```
                High Likelihood
                     │
        ┌────────────┼────────────┐
        │   P-001    │   T-018   │
        │   P-003    │   T-004   │
        │   O-001    │   E-003   │
        │            │            │
Medium  ├────────────┼────────────┤  High
Severity│   P-006    │   T-007   │  Severity
        │   T-011    │   P-002   │
        │   T-012    │   T-001   │
        │   T-020    │   O-002   │
        │   S-007    │   T-009a  │
        │            │   T-009b  │
        │            │   T-019   │
        ├────────────┼────────────┤
        │   E-004    │   S-001   │
        │            │   S-002   │
        │            │   S-003   │
        └────────────┼────────────┘
                     │
                Low Likelihood
```

---

## 7. Risk Review Schedule

| Event | Action |
|---|---|
| **Weekly standup** | Review any newly identified risks. Update likelihood/severity for active risks. |
| **Sprint retrospective** | Assess risk mitigation effectiveness. Identify emerging risks from sprint work. |
| **Phase transition** | Full risk register review. Retire resolved risks. Re-assess all active risks. Identify new risks for upcoming phase. |
| **Incident** | Post-incident review adds any new risks discovered. Update mitigations based on learnings. |

---

## 8. Dependency Matrix

Critical path dependencies between workstreams:

| Dependency | Blocker For | Required By | Risk If Late |
|---|---|---|---|
| AI Gateway (P1 Sprint 1) | All AI features | All phases | All AI-dependent features blocked |
| Auth system (P1 Sprint 1) | All authenticated endpoints | All phases | No user-facing work can proceed |
| Embedding pipeline (P1 Sprint 2) | Matching (P2) | Phase 2 start | Matching cannot begin |
| Consent system (P1 Sprint 2) | Introduction guardrails (P3) | Phase 3 | Compliance risk |
| Database schema (P0) | All data access | Phase 1 start | All development blocked |
| Aggregation connectors (P2 Sprint 5) | Job matching (P2 Sprint 6) | Mid-Phase 2 | No postings to match against |
| Policy engine (P3 Sprint 8) | Introduction broker (P3 Sprint 8) | Mid-Phase 3 | Introductions cannot be gated |
| Introduction state machine (P3) | Outcome tracking (P4) | Phase 4 start | Calibration loop cannot close |
| Fairness monitoring (P4) | Launch | Pre-launch hardening | Launch without fairness assurance |
