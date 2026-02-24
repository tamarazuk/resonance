# PRD Review: Resonance - AI-Native Job Matching Platform

**Reviewer:** GLM-5  
**Date:** February 2026  
**Document Version:** 2.0  
**Author:** Tamara  

---

## Executive Summary

Resonance presents a compelling vision for transforming the labor market through AI-native job matching. The PRD demonstrates strong strategic thinking, clear problem identification, and a well-articulated value proposition. The three-system architecture (Steadyhand, Clearview, and Resonance Core) is thoughtfully designed with genuine innovation in the matching approach.

**Overall Rating: 8.5/10**

**Strengths:**
- Exceptional problem definition and market understanding
- Innovative two-sided matching approach with cognitive load protection
- Strong ethical foundation and clear design principles
- Well-defined human/AI boundaries
- Comprehensive feature descriptions

**Key Gaps:**
- Missing implementation roadmap and technical architecture
- Lacks validation through user research
- Insufficient detail on data requirements and ML model specifications
- No clear MVP definition or phased rollout strategy
- Limited go-to-market and pricing strategy details

---

## Document Overview

**Structure:** 13 sections covering vision, architecture, features, ethics, business model, risks, competition, and metrics

**Length:** ~492 lines (~5,500 words)

**Scope:** Comprehensive product vision with detailed feature descriptions

**Tone:** Visionary yet pragmatic, ethically grounded, human-centric

---

## Strengths

### 1. **Exceptional Problem Definition (9.5/10)**

The PRD excels at articulating the fundamental problems in the current labor market:

- **Systems thinking**: Identifies the infrastructure failure, not just symptoms
- **Two-sided perspective**: Equally addresses candidate AND employer pain points
- **Root cause analysis**: Correctly identifies that the matching layer doesn't exist
- **Emotional resonance**: Captures the cognitive and emotional toll of job searching

**Exemplary passage:**
> "The process demands peak performance from people at their lowest capacity."

This demonstrates deep empathy and understanding of the user experience.

### 2. **Innovative Architecture (9/10)**

The three-system design (Steadyhand, Clearview, Resonance Core) is genuinely innovative:

- **Holistic approach**: Addresses both sides of the market with equal depth
- **Cognitive load protection**: Unique value proposition rarely addressed in this space
- **Memory Bank concept**: Transforms static resumes into living professional identities
- **Team Needs Graph**: Goes beyond job postings to understand actual requirements
- **Multi-dimensional matching**: Far superior to keyword-based approaches

**Why this matters:** Most job platforms optimize for one side or the other. Resonance's symmetric design is structurally different.

### 3. **Strong Ethical Foundation (9/10)**

The PRD demonstrates thoughtful ethical consideration:

- **Data dignity**: Clear stance on data ownership and portability
- **Bias awareness**: Explicit acknowledgment of algorithmic bias risks
- **Human agency**: Non-negotiable double opt-in principle
- **Inequality reduction**: Active commitment to leveling the playing field
- **Transparency**: Commitment to explainable matching

**Critical principle:**
> "No communication is sent, no introduction is made, no data is shared without explicit human approval"

This bright line protects users and builds trust.

### 4. **Clear Design Principles (9.5/10)**

Six design principles provide excellent guidance:

1. Understand deeply, match precisely
2. Protect cognitive capacity
3. Humans decide; AI discovers
4. Reduce inequality, don't amplify it
5. Transparency and trust
6. Data dignity

**Why this is strong:** These aren't just aspirational—they're operationalized throughout the document. Each feature maps back to these principles.

### 5. **Comprehensive Feature Specifications (8.5/10)**

**Candidate Engine (Steadyhand):**
- Memory Bank with structured experience capture
- Preference Map with evolution tracking
- Growth Map for trajectory matching
- Cognitive load protection features (Triage, Prep, Follow-Up managers)
- Emotional intelligence layer

**Employer Engine (Clearview):**
- Role Profile with must-have vs. nice-to-have distinction
- Culture Signal capture
- Hidden Requirements surfacing
- Posting quality analysis and bias detection

**Matching Protocol:**
- Six-dimensional matching framework
- Clear confidence scoring tiers
- Double opt-in introduction protocol

**Detail level:** Feature descriptions are specific enough to guide implementation while remaining flexible.

### 6. **Excellent Human/AI Boundary Definition (9.5/10)**

The boundary map is one of the strongest sections:

- **Explicit ownership tables**: Clear delineation of AI vs. human responsibilities
- **Non-negotiable principles**: "Every. Single. Decision." belongs to humans
- **Practical examples**: Concrete scenarios for each boundary
- **Trust-building**: Transparency about what AI does and doesn't do

**Why this matters:** Many AI products fail because they blur these lines. Resonance is explicit and intentional.

### 7. **Well-Defined Success Metrics (8/10)**

Strong framework with appropriate categories:

- **North Star**: Successful matches (not just introductions)
- **Candidate metrics**: Include cognitive load reduction and confidence
- **Employer metrics**: Focus on quality over quantity
- **System metrics**: Include fairness calibration

**Notable inclusion:** "Cognitive load reduction (self-reported)" recognizes the unique value proposition.

### 8. **Thoughtful Risk Identification (8/10)**

Good coverage of critical risks:
- Cold start problem
- False claims
- Algorithmic bias
- Employer gaming
- Privacy breach
- Incumbent competition
- Candidate fabrication

Each risk includes severity, impact, and mitigation strategies.

### 9. **Clear Competitive Positioning (8.5/10)**

Effectively differentiates from:
- LinkedIn (social network vs. matching system)
- Indeed/Glassdoor (aggregation vs. intelligence)
- AI resume tools (point solutions vs. systemic fix)
- Recruiter platforms (one-sided vs. two-sided)

**Strong insight:** "Incumbents incentivized to maintain broadcast model" — correctly identifies why existing players won't solve this problem.

### 10. **Compelling Vision Statement (9/10)**

The opening and closing vision statements are powerful and memorable:

> "A world where the right person and the right opportunity find each other — not because of luck, timing, or privilege, but because an intelligent system understood them both well enough to make the introduction."

This provides clear strategic direction and emotional resonance.

---

## Areas for Improvement

### 1. **Missing Implementation Roadmap (Critical)**

**Gap:** No timeline, phases, or MVP definition

**What's missing:**
- Phased rollout strategy (what's v1, v2, v3?)
- MVP scope definition
- Development timeline estimates
- Resource requirements
- Technical dependencies

**Recommendation:**
Add Section 14: Implementation Roadmap
- **Phase 1 (Months 1-6):** MVP with core Steadyhand features + basic matching
- **Phase 2 (Months 7-12):** Clearview employer tools + enhanced matching
- **Phase 3 (Months 13-18):** Advanced features (Growth Maps, culture signals)
- **Phase 4 (Months 19-24):** Scale and optimization

**Impact:** Without this, the PRD is a vision document, not an executable plan.

### 2. **No Technical Architecture (Critical)**

**Gap:** Missing technical specifications and architecture decisions

**What's missing:**
- System architecture diagram
- Data models for Professional Identity Graph and Team Needs Graph
- ML model specifications (what algorithms? training data sources?)
- Infrastructure requirements (cloud, scale, latency)
- Security architecture (E2E encryption implementation)
- API design for aggregators

**Recommendation:**
Add Section 15: Technical Architecture
- Data models and schemas
- ML pipeline design
- Infrastructure stack
- Security and privacy architecture
- Integration architecture
- Scalability considerations

**Impact:** Engineers cannot begin implementation without technical direction.

### 3. **Insufficient User Research Validation (High Priority)**

**Gap:** Assumptions about user needs lack validation evidence

**What's missing:**
- User research findings
- Candidate interview insights
- Employer interview insights
- Survey data on pain points
- Competitive user testing
- Persona definitions

**Recommendation:**
Add Section 2.3: User Research Summary
- Research methodology (how many interviews? what segments?)
- Key findings that validated/informed the design
- User personas with specific needs and behaviors
- Quotes and evidence from real users

**Impact:** Without validation, the product risks building features users don't actually want.

### 4. **Limited Business Model Detail (High Priority)**

**Gap:** Business model lacks specificity and financial projections

**What's missing:**
- Pricing specifics (what do employers actually pay?)
- Revenue projections (market size, conversion rates)
- Customer acquisition strategy
- Unit economics (CAC, LTV, payback period)
- Break-even analysis
- Competitive pricing analysis

**Recommendation:**
Expand Section 9 with:
- **Pricing tiers** with specific numbers (e.g., "$99/month for small teams, $499/month for enterprises")
- **Market sizing** (TAM, SAM, SOM)
- **Revenue model** projections for years 1-3
- **Customer acquisition cost** targets
- **Lifetime value** calculations
- **Break-even timeline**

**Impact:** Investors and leadership need financial viability assessment.

### 5. **Vague Data Requirements (High Priority)**

**Gap:** Insufficient detail on data needs and ML training

**What's missing:**
- Training data requirements (how many profiles to train matching models?)
- Data sources and acquisition strategies
- Feature engineering specifications
- Model performance requirements (precision, recall targets)
- Cold start solution for new users
- Feedback loop design

**Recommendation:**
Add Section 16: Data & ML Strategy
- **Training data requirements**: Minimum viable dataset sizes
- **Data sources**: Where will initial data come from?
- **Feature specifications**: What signals will the matching algorithm use?
- **Model requirements**: Performance thresholds for launch
- **Cold start handling**: How to match new users with no history
- **Continuous learning**: How models improve over time

**Impact:** ML products fail without clear data strategies.

### 6. **No Go-to-Market Strategy (High Priority)**

**Gap:** Missing customer acquisition and growth strategy

**What's missing:**
- Launch strategy (how to solve cold start problem?)
- Customer acquisition channels
- Marketing strategy
- Partnership opportunities
- Initial target market/segment
- Growth loops and viral mechanics

**Recommendation:**
Add Section 17: Go-to-Market Strategy
- **Initial market segment** (specific candidate types and employer categories)
- **Cold start solution** (how to get first 1,000 candidates and 100 employers)
- **Acquisition channels** (SEO, partnerships, community, paid?)
- **Growth strategy** (how does the product become self-sustaining?)
- **Partnership strategy** (job boards, universities, bootcamps?)
- **Launch plan** (beta, public launch, geographic expansion)

**Impact:** Great products fail without distribution strategies.

### 7. **Unclear Success Metric Targets (Medium Priority)**

**Gap:** Metrics defined but targets are missing

**What's missing:**
- Specific targets for each metric (what's "good"?)
- Industry benchmarks for comparison
- Minimum viable metrics for launch readiness
- Timeframes for achieving metrics

**Recommendation:**
Enhance Section 12 with:
- **Specific targets**:
  - "50% reduction in candidate cognitive load (vs. baseline survey)"
  - "2x improvement in time-to-fill vs. LinkedIn Recruiter"
  - "75% match satisfaction score"
- **Benchmarks**: Industry standards for comparison
- **Launch criteria**: Minimum metrics to exit beta
- **Tracking timeline**: When to measure what

**Impact:** Teams need targets to know if they're succeeding.

### 8. **Limited Scale and Operations Discussion (Medium Priority)**

**Gap:** Insufficient consideration of operational challenges at scale

**What's missing:**
- Content moderation strategy (fraudulent postings, inappropriate content)
- Customer support model
- Quality assurance processes
- International expansion considerations
- Regulatory compliance (GDPR, CCPA, EEOC)
- Operational cost structure

**Recommendation:**
Add Section 18: Operations & Scale
- **Trust & safety**: Content moderation, fraud detection
- **Customer support**: Support model, response times, escalation
- **Quality assurance**: How to maintain match quality at scale
- **International**: Localization, regulatory compliance
- **Operational costs**: Support, moderation, infrastructure at scale

**Impact:** Operational challenges kill scaling products.

### 9. **Missing Accessibility and Inclusion Details (Medium Priority)**

**Gap:** Section 8 mentions reducing inequality, but implementation details are light

**What's missing:**
- Accessibility standards (WCAG compliance)
- Inclusive design considerations
- Language support
- Accommodations for users with disabilities
- Specific bias mitigation techniques
- Diversity in training data

**Recommendation:**
Expand Section 8 or add Section 19: Accessibility & Inclusion
- **Accessibility standards**: WCAG 2.1 AA compliance commitment
- **Inclusive design**: Specific accommodations and features
- **Language support**: Initial languages, expansion plan
- **Bias mitigation**: Specific techniques (algorithmic, data, UI)
- **Diverse data**: Ensuring training data represents all users
- **Inclusive testing**: Testing with diverse user groups

**Impact:** Product risks excluding the users it aims to help.

### 10. **No Error Handling or Edge Cases (Medium Priority)**

**Gap:** Feature descriptions assume happy paths

**What's missing:**
- What happens when matching confidence is low for everyone?
- How to handle candidates with sparse profiles?
- What if employers have unrealistic requirements?
- How to handle conflicting preferences?
- Recovery from bad matches?

**Recommendation:**
Add Section 20: Edge Cases & Error Handling
- **Sparse profiles**: How to match candidates with limited history
- **Unrealistic requirements**: How to guide employers to better postings
- **Low confidence scenarios**: What to show when no strong matches exist
- **Preference conflicts**: How to handle contradictory preferences
- **Match recovery**: How to recover from introductions that go poorly
- **Gaming detection**: How to detect and handle system gaming

**Impact:** Real-world products must handle edge cases gracefully.

---

## Section-by-Section Analysis

### Section 1: Executive Summary (9/10)

**Strengths:**
- Powerful problem statement
- Clear solution overview
- Compelling differentiation

**Improvements:**
- Add quantitative evidence (how many millions? what percentage of positions?)
- Include a one-sentence "ask" (what does the reader do with this information?)

### Section 2: Vision & Design Principles (9.5/10)

**Strengths:**
- Clear, memorable vision
- Six actionable principles
- Well-articulated "why"

**Improvements:**
- Add examples of how principles influenced specific design decisions
- Include principle prioritization (are all equal?)

### Section 3: The Candidate Engine (8.5/10)

**Strengths:**
- Innovative Memory Bank concept
- Thoughtful cognitive load protection
- Growth-oriented approach

**Improvements:**
- Add user onboarding flow (how does a new user build their profile?)
- Specify time investment (how long does profile building take?)
- Address privacy controls (what can users hide?)

### Section 4: The Employer Engine (8/10)

**Strengths:**
- Addresses real job posting problems
- Team Needs Graph is innovative
- Hidden Requirements surfacing is valuable

**Improvements:**
- Add employer onboarding process
- Specify integration with existing ATS systems
- Address employer hesitation (why would they use this vs. LinkedIn?)

### Section 5: Matching Protocol (8.5/10)

**Strengths:**
- Multi-dimensional approach
- Transparent confidence scoring
- Double opt-in principle

**Improvements:**
- Add matching algorithm overview (high-level approach)
- Specify match explanation format (what exactly do users see?)
- Handle edge case: what if no strong matches exist?

### Section 6: Human/AI Boundary Map (9.5/10)

**Strengths:**
- Explicit, non-negotiable boundaries
- Clear ownership tables
- Builds trust through transparency

**Improvements:**
- Add edge cases (what if AI makes a mistake?)
- Specify override mechanisms

### Section 7: Aggregation Strategy (7.5/10)

**Strengths:**
- Multiple source strategy
- Quality tier framework
- Addresses timing gap

**Improvements:**
- Add legal considerations (can you scrape career pages?)
- Specify API integration priorities (which job boards first?)
- Address job board competitive response

### Section 8: Reducing Inequality (8/10)

**Strengths:**
- Clear commitment to equity
- Four specific approaches
- Addresses network advantage

**Improvements:**
- Add specific bias mitigation techniques
- Include diversity metrics in success criteria
- Address accessibility explicitly

### Section 9: Business Model (7/10)

**Strengths:**
- Free for candidates (correct choice)
- Outcome-aligned revenue
- Clear "what we won't do"

**Improvements:**
- Add specific pricing
- Include financial projections
- Address unit economics

### Section 10: Risks & Mitigations (8/10)

**Strengths:**
- Good risk identification
- Severity and impact ratings
- Mitigation strategies

**Improvements:**
- Add more risks (market adoption, team execution, regulatory)
- Quantify risk probability
- Add contingency plans

### Section 11: Competitive Landscape (8.5/10)

**Strengths:**
- Good competitor categorization
- Clear differentiation
- Identifies incumbent incentives

**Improvements:**
- Add more direct competitors (Hired, AngelList, etc.)
- Include competitive response scenarios
- Address network effects of incumbents

### Section 12: Success Metrics (8/10)

**Strengths:**
- Good metric categories
- North Star focus
- Includes cognitive load

**Improvements:**
- Add specific targets
- Include leading indicators
- Specify measurement frequency

### Section 13: Why This Matters (9/10)

**Strengths:**
- Compelling closing argument
- Human impact focus
- Visionary but grounded

**Improvements:**
- Add call to action
- Include next steps

---

## Recommendations (Prioritized)

### P0: Critical for Launch

1. **Define MVP scope** (what's in v1 vs. later?)
2. **Add technical architecture** (data models, system design, ML approach)
3. **Create implementation roadmap** (timeline, phases, dependencies)
4. **Specify data acquisition strategy** (how to get initial training data?)

### P1: High Priority for Investment/Funding

5. **Conduct user research validation** (interview 50+ candidates, 20+ employers)
6. **Develop detailed business model** (pricing, projections, unit economics)
7. **Create go-to-market strategy** (launch plan, acquisition, cold start solution)

### P2: Important for Execution

8. **Define success metric targets** (specific numbers, benchmarks)
9. **Add edge case handling** (what could go wrong?)
10. **Specify accessibility requirements** (WCAG, inclusive design)

### P3: Valuable for Scale

11. **Develop operations plan** (support, moderation, compliance)
12. **Add international considerations** (localization, regulatory)
13. **Create partnership strategy** (integrations, distribution)

---

## Overall Assessment

### What This PRD Gets Right

Resonance is **exceptionally strong as a vision document**. It demonstrates:

- Deep understanding of the problem space
- Innovative architectural thinking
- Strong ethical foundation
- Human-centric design philosophy
- Clear differentiation from incumbents

The three-system design (Steadyhand, Clearview, Resonance Core) is genuinely novel and addresses real pain points on both sides of the market. The emphasis on cognitive load protection is unique and valuable.

### What Needs Development

To transform this vision into an **executable product plan**, the PRD needs:

- **Technical depth**: Architecture, data models, ML specifications
- **Implementation practicality**: Roadmap, MVP definition, resource needs
- **Business viability**: Pricing, financial projections, go-to-market
- **Validation evidence**: User research, market testing, assumption validation

### Strategic Questions to Address

1. **Cold start strategy**: How will you get the first 10,000 candidates and 1,000 employers?
2. **Data acquisition**: Where will training data for matching models come from?
3. **Competitive response**: How will incumbents (LinkedIn, Indeed) respond?
4. **Regulatory landscape**: What hiring regulations apply to AI matching?
5. **International expansion**: Will this work outside the US?

### Final Verdict

**As a vision document: 9.5/10**  
Exceptional clarity, innovation, and ethical grounding.

**As an executable product plan: 6.5/10**  
Missing critical implementation and business details.

**Overall: 8.5/10**  
Strong foundation that needs development in technical, business, and go-to-market dimensions.

---

## Next Steps

1. **Week 1-2:** Conduct user research (30 candidate interviews, 15 employer interviews)
2. **Week 3-4:** Define MVP scope and technical architecture
3. **Week 5-6:** Develop business model and go-to-market strategy
4. **Week 7-8:** Create implementation roadmap with timeline and milestones
5. **Week 9-10:** Finalize PRD v3.0 with all sections complete

---

## Conclusion

Resonance has the potential to fundamentally transform how talent and opportunity connect. The vision is compelling, the architecture is innovative, and the ethical foundation is strong. With additional development in technical specifications, business model, and go-to-market strategy, this PRD can become a comprehensive blueprint for building a product that genuinely improves people's lives.

The core insight—that job matching is a compatibility problem that AI is uniquely positioned to solve—is powerful. The focus on cognitive load protection and human agency differentiates Resonance from every other player in the space.

**This is a product worth building.** Now it needs a plan for how to build it.

---

**End of Review**