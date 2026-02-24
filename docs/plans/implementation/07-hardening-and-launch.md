# Hardening + Launch Prep

**Duration:** 2 weeks (1 sprint)
**Depends on:** Phase 4 (Resonance Core Full)
**Enables:** Production launch

---

## 1. Phase Goal

Validate production readiness through security audits, load testing, disaster recovery drills, and operational runbook verification. Resolve all findings. Exit with a signed-off go-live checklist.

---

## 2. Sprint Breakdown

### Sprint 11 (Weeks 24-25): Hardening + Launch Prep

#### Security

| # | Task | Details | Est. |
|---|---|---|---|
| 11.1 | **Penetration testing** | Engage third-party security firm (or internal red-team exercise). Scope: auth flows, consent system, policy engine bypass attempts, row-level security, PII encryption, API fuzzing. All Critical/High findings must be resolved before launch. | 3d (engagement) |
| 11.2 | **Security audit — auth and consent** | Manual review of all auth middleware, token lifecycle, consent state machine, policy engine. Verify blocklist check ordering (before JWT validation). Verify consent revocation cascade completeness. | 2d |
| 11.3 | **Dependency vulnerability sweep** | Run Snyk/Trivy on all production dependencies. Resolve all Critical and High vulnerabilities. Document accepted Medium/Low risks with justification. | 1d |
| 11.4 | **PII encryption audit** | Verify all fields listed in Architecture Section 5.3.1 are encrypted at application layer. Verify KMS key rotation is functional. Verify encrypted fields are not logged or exposed in error responses. | 1d |

#### Load Testing

| # | Task | Details | Est. |
|---|---|---|---|
| 11.5 | **Load test — API layer** | k6 or Artillery test suite. Targets: 500 concurrent candidates, 100 concurrent employers, 50 concurrent ops users. Validate p95 latency < 500ms for all REST endpoints. Validate WebSocket at 1000 concurrent connections. | 2d |
| 11.6 | **Load test — matching pipeline** | Simulate 10,000 candidate profiles and 5,000 job postings. Validate end-to-end scoring completes within 30s SLO. Validate pgvector ANN query p95 < 200ms at target data volume. Validate hourly backfill completes within 45 minutes. | 1d |
| 11.7 | **Load test — event pipeline** | Flood event queues with 10x normal throughput. Validate BullMQ processing keeps up. Validate CQRS read model projection lag stays under 5 minutes. Validate DLQ behavior under backpressure. | 1d |
| 11.8 | **Capacity planning report** | Document resource utilization at target load. Identify scaling bottlenecks. Define auto-scaling policies for ECS/EKS tasks. Publish cost projection at 1x, 5x, 10x user targets. | 1d |

#### Disaster Recovery

| # | Task | Details | Est. |
|---|---|---|---|
| 11.9 | **DR failover drill** | Execute full failover to us-west-2. Promote read replica. Deploy application to DR region. Verify all services operational. Measure actual RTO against 4-hour target. Document issues found. | 1d |
| 11.10 | **Backup restore drill** | Restore PostgreSQL from latest snapshot. Verify data integrity. Measure actual RPO against 1-hour target. | 0.5d |
| 11.11 | **Model rollback drill** | Execute model rollback from canary to last known-good tuple. Verify scoring pipeline resumes with previous model. Verify audit event emitted. | 0.5d |

#### Operational Readiness

| # | Task | Details | Est. |
|---|---|---|---|
| 11.12 | **Incident response runbooks** | Author runbooks for: unauthorized introduction detected (P0), consent DLQ overflow (P0), database failover (P0), LLM provider outage (P1), PII exposure incident (P0), model drift rollback (P1), read model corruption rebuild (P1). Each runbook: detection, triage, resolution steps, escalation path, post-incident review template. | 2d |
| 11.13 | **Alerting verification** | Trigger every P0 and P1 alert in staging. Verify PagerDuty routing. Verify Slack channel delivery. Verify escalation timers. Document on-call rotation and responsibilities. | 1d |
| 11.14 | **SLO verification** | Verify all SLOs from Architecture Section 6.9 are met under load test conditions. Document any SLOs that require adjustment with rationale. Publish SLO dashboard for stakeholders. | 0.5d |
| 11.15 | **Ops console smoke test** | Verify all ops console modules functional: moderation queue, consent audit viewer, dispute management, fairness reports, system health dashboard. Verify ops team can execute all core workflows. | 0.5d |

#### Production Environment

| # | Task | Details | Est. |
|---|---|---|---|
| 11.16 | **Production environment parity check** | Verify production infrastructure matches staging IaC. Verify all environment variables, secrets, and feature flags configured. Verify DNS, TLS certificates, and CDN configuration. | 1d |
| 11.17 | **Data migration plan** | If migrating from staging data: document migration procedure, validation queries, and rollback plan. If clean start: document seed data requirements (admin accounts, feature flags, default config). | 0.5d |
| 11.18 | **Go-live checklist** | Compile checklist from all exit criteria across all phases. Require sign-off from Tech Lead, Product, DevOps, and ML Engineer. Publish launch date and rollback window. | 0.5d |

---

## 3. Go-Live Checklist

All items must be checked before production launch:

### Security
- [ ] Penetration test completed, all Critical/High findings resolved
- [ ] Auth and consent security audit completed
- [ ] All Critical/High dependency vulnerabilities resolved
- [ ] PII encryption audit passed
- [ ] WAF rules verified in production

### Performance
- [ ] API load test passed (p95 < 500ms at target concurrency)
- [ ] WebSocket load test passed (1000 concurrent connections)
- [ ] Matching pipeline load test passed (scoring < 30s SLO)
- [ ] pgvector query load test passed (p95 < 200ms)
- [ ] Event pipeline load test passed (read model lag < 5 min)

### Disaster Recovery
- [ ] DR failover drill completed (RTO < 4 hours verified)
- [ ] Backup restore drill completed (RPO < 1 hour verified)
- [ ] Model rollback drill completed

### Operations
- [ ] All P0/P1 incident runbooks authored and reviewed
- [ ] All P0/P1 alerts verified firing and routing correctly
- [ ] On-call rotation established
- [ ] Ops console smoke tested by ops team
- [ ] SLO dashboard published

### Compliance
- [ ] All phase exit criteria from Phases 0-4 re-verified
- [ ] Data retention enforcement job running and audited
- [ ] Consent system audit trail verified complete
- [ ] GDPR/CCPA data export and deletion flows verified
- [ ] Privacy policy and terms of service published

### Infrastructure
- [ ] Production environment matches IaC
- [ ] All secrets rotated (no staging secrets in production)
- [ ] Feature flags configured for production (conservative defaults)
- [ ] CDN, DNS, TLS all operational
- [ ] Auto-scaling policies configured and tested
- [ ] Monitoring dashboards operational

### Sign-offs
- [ ] Tech Lead sign-off
- [ ] Product sign-off
- [ ] DevOps sign-off
- [ ] ML Engineer sign-off

---

## 4. Rollback Plan

If critical issues are discovered post-launch:

| Timeframe | Action |
|---|---|
| **First 24 hours** | Canary at 5% traffic. Monitor all SLOs. Rollback instantly on any P0 alert. |
| **24-72 hours** | Promote to 50% traffic. Continue monitoring. Rollback on sustained P1 violations. |
| **72+ hours** | Promote to 100% traffic. Normal operations. |
| **Any time** | Full rollback: revert deployment, DNS switch, communicate to affected users. |

Rollback triggers:
- Any unauthorized introduction (P0 — immediate rollback)
- Consent system failure (P0 — immediate rollback)
- Error rate > 1% sustained for 15 minutes
- p95 latency > 2x SLO for 30 minutes
- Data integrity issue detected

---

## 5. Exit Criteria

- [ ] All go-live checklist items checked and signed off
- [ ] Rollback plan documented and tested
- [ ] On-call rotation active
- [ ] Launch communication sent to stakeholders
- [ ] Post-launch monitoring plan in place (24/7 for first week)

---

## 6. Post-Launch 90-Day Stabilization Plan

### Days 0–30: Stabilize and Observe

**Cadence:** Daily triage standup, weekly SLO review

| Focus Area | Actions |
|---|---|
| Incident response | Daily triage of P0/P1 alerts; refine runbooks based on real incidents |
| SLO validation | Verify all SLOs from Architecture Section 6.9 hold under production traffic |
| Onboarding funnel | Tighten candidate onboarding and profile completion funnel based on real drop-off data |
| Score tuning | Tune Phase 2 score weights using explicit and implicit feedback from live matches |
| Queue health | Monitor DLQ depth, job failure rates, and projection lag under real load |
| Cost monitoring | Validate LLM cost-per-user and cost-per-match against budget thresholds |

### Days 31–60: Tune and Expand

**Cadence:** Biweekly match quality review, weekly calibration check

| Focus Area | Actions |
|---|---|
| Match quality | Review match quality metrics (acceptance rate, feedback scores, outcome tracking) |
| Calibration | Run calibration review by confidence bucket; adjust thresholds if bucket reliability is off |
| Aggregation expansion | Expand Tier 2 connectors and improve dedupe accuracy based on real duplicate patterns |
| Employer experience | Refine employer decision reason taxonomy from real usage patterns |
| Consent operations | Review consent revocation cascade success rate; harden any failure patterns found |
| Performance | Identify and address any latency or throughput bottlenecks revealed under sustained load |

### Days 61–90: Calibrate and Report

**Cadence:** Monthly governance review, final stabilization retrospective

| Focus Area | Actions |
|---|---|
| Fairness audit | Complete first formal fairness and trust report with remediation actions |
| Calibration report | Improve calibration by confidence bucket using 60+ days of outcome data |
| Trust report | Publish first transparency/trust report: consent stats, policy denial rates, dispute outcomes |
| Retrospective | Full stabilization retrospective — document lessons learned, update runbooks and architecture |
| Handoff | Transition from stabilization mode to normal operations cadence |

### Stabilization Exit Criteria

- [ ] All SLOs met for 30 consecutive days
- [ ] No P0 incidents in the last 14 days
- [ ] Match acceptance rate trending positive (week-over-week)
- [ ] Fairness audit complete with no unresolved disparity findings
- [ ] Calibration report shows acceptable bucket reliability across all confidence tiers
- [ ] All incident runbooks updated with lessons from real incidents
- [ ] LLM costs within budget thresholds for 30 consecutive days
- [ ] Formal stabilization retrospective completed and published
