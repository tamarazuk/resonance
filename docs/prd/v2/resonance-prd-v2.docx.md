

PRODUCT REQUIREMENTS DOCUMENT

**Resonance**

*AI-Native Job Matching That Works for Humans*

Because talent discovery shouldn’t depend on who sees the posting first.

Author: Tamara

February 2026 • Version 2.0

# **1\. Executive Summary**

## **1.1 The Problem: A System Designed to Fail Both Sides**

The labor market is experiencing a paradox at unprecedented scale: millions of people are desperately searching for work while millions of positions go unfilled for months. This is not a supply-demand mismatch. It is an infrastructure failure.

**The Candidate Experience Is Broken**

Job seekers face a fragmented, exhausting, and dehumanizing process. They must discover opportunities scattered across hundreds of company career pages, LinkedIn, Indeed, niche job boards, and word-of-mouth channels. For each opportunity, they must research the company, tailor their resume, write a cover letter, and often complete redundant application forms — all while managing the cognitive and emotional toll of rejection, financial pressure, and life responsibilities. The process demands peak performance from people at their lowest capacity.

**The Employer Experience Is Equally Broken**

Companies post a job and wait. They receive hundreds of applications, the vast majority of which are poor fits — because the posting was either too vague, too aspirational, or discoverable only by people who happened to be looking at the right board at the right time. Hiring managers spend hours reviewing unqualified candidates. The best candidates often never see the posting because it was buried on a careers page for two weeks before reaching LinkedIn. Meanwhile, a perfect-fit candidate is actively searching but looking in a different direction.

**The Matching Layer Doesn’t Exist**

There is no system that deeply understands both sides — what a candidate truly offers and what a team truly needs — and brokers intelligent introductions between them. LinkedIn’s matching is keyword-based and shallow. Job boards are passive billboards. Recruiters are expensive, biased toward existing networks, and operate at low scale. The infrastructure connecting talent to opportunity is fundamentally built on broadcasting, not matching.

| The Core Thesis *What if we stopped asking candidates to find jobs and companies to find candidates, and instead built an intelligent matching layer that understands both sides deeply enough to introduce them to each other? Not keyword matching. Not spray-and-pray applications. A system that treats job matching the way we should: as a nuanced, high-stakes compatibility problem that AI is uniquely positioned to solve.* |
| :---- |

## **1.2 The Solution: Resonance**

Resonance is an AI-native matching system that connects job seekers and employers through deep mutual understanding rather than keyword search and broadcast posting. It operates as three interconnected systems:

1. **The Candidate Engine (Steadyhand):** An AI system that builds a rich, structured understanding of who a person is professionally — their skills, experiences, stories, preferences, and growth areas — and protects their cognitive capacity throughout the search process.

2. **The Employer Engine (Clearview):** An AI system that helps companies articulate what they actually need — beyond the job posting — and builds a structured representation of team needs, culture, growth opportunities, and real requirements vs. nice-to-haves.

3. **The Matching Protocol (Resonance Core):** An intelligent layer that translates between candidate and employer representations, identifies genuine alignment, and brokers mutual introductions when the match quality exceeds a high confidence threshold.

The name Resonance captures the core metaphor: when two things are naturally aligned, they amplify each other. The system’s job is to find where that natural alignment exists and bring both parties together.

## **1.3 What Makes This Different**

* **Depth over breadth:** Rather than matching on keywords and job titles, Resonance matches on capabilities, values, working styles, growth trajectories, and genuine needs. A backend engineer who led a design system initiative might be a perfect fit for a frontend-heavy role — Resonance sees that; keyword matching never would.

* **Two-sided intelligence:** Both candidates and employers get AI-powered support. The system isn’t just a better job board — it’s a better way for both sides to understand themselves and find each other.

* **Continuous, not transactional:** Profiles are living, growing representations. A match that doesn’t exist today might emerge next month as a candidate gains new experience or a team’s needs shift.

* **Human agency at every boundary:** The AI identifies matches; humans decide whether to connect. No auto-applications, no unsolicited outreach, no decisions made without explicit consent from both sides.

# **2\. Vision & Design Principles**

## **2.1 Product Vision**

A world where the right person and the right opportunity find each other — not because of luck, timing, or privilege, but because an intelligent system understood them both well enough to make the introduction.

## **2.2 Design Principles**

**Principle 1: Understand deeply, match precisely**

The quality of a match is only as good as the depth of understanding on both sides. Resonance invests heavily in building rich representations of candidates and employers before attempting to match. A shallow profile produces shallow matches. The system should resist the temptation to match early and poorly.

**Principle 2: Protect cognitive capacity**

Job searching and hiring are both cognitively devastating processes. Every feature must pass the test: does this reduce mental load or add to it? For candidates, this means the system handles the overhead of search so they can show up as their best selves. For employers, this means fewer but better candidates to evaluate, not more noise.

**Principle 3: Humans decide; AI discovers**

The AI’s role is to discover alignment that neither side would have found on their own. The human’s role is to decide whether to act on that discovery. Nothing happens without consent from both sides.

**Principle 4: Reduce inequality, don’t amplify it**

The current system advantages people with large networks, prestigious credentials, and the luxury of time. Resonance matches on demonstrated capability and genuine fit, not on pedigree. The system must actively counteract the biases embedded in traditional hiring.

**Principle 5: Transparency and trust**

Both sides should understand why a match was suggested. No black-box scoring. Candidates know what signals made them a strong fit. Employers know what evidence supports the match. Trust is the foundation of a two-sided marketplace; opacity destroys it.

**Principle 6: Data dignity**

Users own their data. Period. Candidate profiles are portable. Employer data is confidential. Nothing is sold to third parties. The business model aligns incentives with successful matches, not data exploitation.

# **3\. The Candidate Engine: Steadyhand**

Steadyhand is the candidate-facing half of Resonance. It serves two purposes: building a deep, structured professional profile that feeds into the matching system, and protecting the candidate’s cognitive capacity throughout their search.

## **3.1 The Professional Identity Graph**

Rather than a static resume, Steadyhand builds a living, multidimensional representation of who the candidate is professionally:

**3.1.1 The Memory Bank**

A persistent, growing repository of the candidate’s professional experiences, captured through conversation, reflection prompts, document imports, and post-event debriefs. Each experience is structured across multiple dimensions:

* **Skills demonstrated:** Both explicit (React, TypeScript, system design) and implicit (navigating ambiguity, cross-functional collaboration, managing up).

* **STAR structure:** Situation, Task, Action, Result — automatically structured from natural language input.

* **Themes:** Leadership, conflict resolution, technical depth, mentorship, resilience, innovation.

* **Context:** Company stage, team size, industry, constraints faced.

* **Evidence strength:** How specific and well-documented the experience is. Vague claims rank lower than specific stories.

**3.1.2 The Preference Map**

An evolving picture of what the candidate wants, needs, and values:

* Role type, seniority, and scope preferences

* Industry and mission alignment

* Work style: remote, hybrid, async, collaborative, autonomous

* Compensation requirements and flexibility

* Growth goals: what they want to learn or move toward

* Dealbreakers and non-negotiables

**3.1.3 The Growth Map**

A forward-looking dimension that tracks where the candidate is heading, not just where they’ve been:

* Skills actively being developed

* Areas identified as growth edges

* Career trajectory aspirations (3–5 year direction)

* Learning patterns: what topics they engage with, what projects they pursue

The Growth Map is particularly powerful for matching. A candidate actively learning infrastructure engineering might be an excellent fit for a role that requires some DevOps experience — even if their resume doesn’t reflect it yet.

## **3.2 Cognitive Load Protection**

Beyond profile building, Steadyhand actively protects the candidate’s mental capacity:

**The Triage Engine**

Analyzes incoming opportunities and prioritizes by fit, effort, and timing. Generates daily briefings that reduce decision fatigue: “Today, focus on the Acme Corp application. The three other roles can wait until Thursday.”

**The Prep Engine**

Before interviews: company research, predicted questions mapped to Memory Bank stories, talking points. Includes a Calm Mode for the critical 30 minutes before an interview — strips information to three key points, one opening story, and an optional grounding exercise.

**The Follow-Up Manager**

Drafts thank-you notes, check-in messages, and negotiation talking points with appropriate timing.

**The Emotional Intelligence Layer**

Adapts to the candidate’s state. Reduces pressure after rejections. Adjusts prompt volume during high-stress periods. Never shames inactivity. Acknowledges difficulty without toxic positivity.

# **4\. The Employer Engine: Clearview**

Clearview is the employer-facing half of Resonance. It helps companies articulate what they truly need and builds structured representations for precise matching.

## **4.1 The Problem with Job Postings**

Job postings are terrible representations of what a team actually needs. They are typically:

* **Aspirational:** “10+ years of experience” when 5 would be fine.

* **Copy-pasted:** HR templates that don’t reflect the specific team’s real needs.

* **Vague:** “Fast-paced environment” tells candidates nothing useful.

* **Incomplete:** They describe the role but not the team, the culture, or the growth opportunity.

* **Biased:** Language patterns that unconsciously discourage underrepresented candidates.

## **4.2 The Team Needs Graph**

**4.2.1 The Role Profile**

An AI-guided process helps hiring managers articulate:

* **Must-have vs. nice-to-have:** The AI actively challenges requirements. “You listed 12\. If you could only have 5, which would they be?”

* **Real day-to-day work:** What the person will actually do in months 1–3, 3–6, and 6–12.

* **Team composition:** Who’s already on the team? What’s the actual gap?

* **Success criteria:** What does great performance look like in 6 months?

* **Growth opportunity:** What will this person learn? Where can they go from here?

**4.2.2 The Culture Signal**

* Decision-making style: consensus, top-down, distributed

* Communication: async-first, meeting-heavy, documentation culture

* Pace: sprint-based, steady, seasonal peaks

* Autonomy level: high ownership vs. close collaboration

* Values in practice: what actually gets rewarded?

**4.2.3 The Hidden Requirements**

Every role has unwritten requirements. Clearview surfaces these:

* Political dynamics: competing stakeholders to navigate?

* Legacy challenges: technical debt to manage?

* Team dynamics: new team being formed or established one?

* Timeline pressure: specific deadline driving this hire?

## **4.3 Employer Benefits Beyond Matching**

* **Posting quality analysis:** AI reviews for clarity, inclusivity, accuracy.

* **Requirement calibration:** Are requirements realistic for the compensation offered?

* **Bias detection:** Flags language patterns that may introduce bias.

* **Pipeline insights:** How does this role compare to similar ones in the market?

# **5\. The Matching Protocol: Resonance Core**

The matching protocol is the heart of the system. It translates between candidate and employer representations to find genuine alignment.

## **5.1 Multi-Dimensional Matching**

**Dimension 1: Capability Alignment**

Does the candidate have the skills the team actually needs? This goes beyond keywords: “built a design system used by 40 engineers” matches “platform engineering experience” even if neither used those words.

**Dimension 2: Growth Trajectory**

Is this role aligned with where the candidate wants to go? A senior engineer wanting management shouldn’t match a pure IC role, even if skills fit.

**Dimension 3: Culture Compatibility**

Does the candidate’s working style align with the team’s reality? An async engineer matched with a meeting-heavy team will struggle regardless of technical fit.

**Dimension 4: Values and Mission**

For candidates with mission preferences, does the company’s actual work align? Not company PR — the lived reality.

**Dimension 5: Practical Compatibility**

Compensation, location, work arrangement, visa, timeline — practical factors that make or break otherwise perfect matches.

**Dimension 6: Mutual Advantage**

The strongest matches are where both sides get something rare. Resonance prioritizes matches where both sides would be genuinely excited, not just adequate.

## **5.2 Match Confidence Scoring**

| Level | Score | Action | Meaning |
| :---- | :---- | :---- | :---- |
| **Strong Match** | 85–100% | Surface to both sides | High alignment. Worth a conversation. |
| **Promising** | 70–84% | Surface with caveats | Strong in some dimensions, gaps noted. |
| **Stretch** | 55–69% | Candidate-initiated only | Interesting but significant gaps. |
| **Weak** | Below 55% | Not surfaced | Insufficient alignment. |

Critically, reasoning behind each score is visible to both parties. Transparency builds trust.

## **5.3 The Double Opt-In Introduction Protocol**

1. **Candidate receives:** Match summary with reasoning. They choose: explore, save, or pass.

2. **Employer receives:** Match summary with evidence. They choose: invite, save, or pass.

3. **Mutual interest:** Introduction facilitated. Candidate gets interview prep; employer gets evaluation framework.

4. **One-sided interest:** Nothing happens. The other party is never notified.

| The Double Opt-In Principle *No introduction happens unless both sides independently express interest. This is non-negotiable. It protects candidates from recruiter spam and employers from unqualified cold applications.* |
| :---- |

# **6\. Human/AI Boundary Map**

The boundary between AI and human responsibility is the most critical architectural decision. It must be bright, consistent, and non-negotiable.

## **6.1 Candidate-Side Boundaries**

| Action | AI Owns | Human Owns |
| :---- | :---- | :---- |
| **Profile building** | Structuring, tagging, organizing from natural language | What to share, what’s private, how to frame |
| **Job discovery** | Finding and scoring opportunities across all sources | Which matches to explore or ignore |
| **Applications** | Drafting tailored materials from Memory Bank | Final approval, voice, truth of claims |
| **Interview prep** | Research, question prediction, story matching | How to show up, which stories to tell |
| **Match responses** | Presenting match info and opportunity summary | Explore, save, or pass decision |
| **Career decisions** | Data, modeling, scenario analysis | Every. Single. Decision. |

## **6.2 Employer-Side Boundaries**

| Action | AI Owns | Human Owns |
| :---- | :---- | :---- |
| **Role definition** | Challenging assumptions, structuring needs, bias detection | What the team actually needs, final requirements |
| **Candidate discovery** | Matching, scoring, evidence presentation | Which candidates to engage |
| **Posting optimization** | Language analysis, inclusivity, calibration | Final content and distribution |
| **Hiring decisions** | Evaluation frameworks, interview suggestions | All hiring decisions, offer terms |

| The Bright Line (System-Wide) *No communication is sent, no introduction is made, no data is shared without explicit human approval from the relevant party. The AI discovers and recommends. Humans decide and act.* |
| :---- |

# **7\. The Aggregation Strategy**

For Resonance to work, it needs comprehensive coverage of available opportunities.

**Source 1: Direct Employer Posting (Highest Quality)**

Companies post through Clearview, producing the richest data. Incentive: matched with pre-vetted, high-fit candidates instead of hundreds of unqualified applications.

**Source 2: Job Board API Ingestion**

Integration with major job board APIs to ingest postings automatically. AI processes these into structured profiles with lower confidence than direct postings.

**Source 3: Career Page Monitoring**

Automated monitoring of company career pages for new postings. Solves the critical timing gap where roles appear on a company’s careers page days or weeks before they reach major job boards. Companies can claim and enrich auto-detected postings through Clearview.

**Source 4: Candidate-Contributed Discovery**

Candidates share postings they find. Multiple submissions of the same posting increase its priority. This creates a crowdsourced discovery layer that catches opportunities the automated systems miss.

| Tier | Source | Data Quality | Confidence | Experience |
| :---- | :---- | :---- | :---- | :---- |
| **Tier 1** | Direct / Clearview | Full Team Needs Graph | Highest | Rich reasoning, culture insights |
| **Tier 2** | Job board API | Structured posting | Medium | Good reasoning, gaps noted |
| **Tier 3** | Career page scrape | Unstructured text | Lower | Basic assessment, caveats |
| **Tier 4** | Candidate-submitted | Varies | Varies | Community-sourced flag |

# **8\. How Resonance Reduces Inequality**

## **8.1 Capability Over Credentials**

Resonance evaluates what people can do, evidenced by specific experiences, not where they went to school. A self-taught developer with shipped products matches the same as a computer science graduate from a prestigious university.

## **8.2 Eliminating the Network Advantage**

Today, the best opportunities circulate through personal networks before they ever reach a job board. Resonance surfaces opportunities based on fit, not connections. A candidate in one city with no connections in another can still be matched with a remote role if the fit is genuine.

## **8.3 Protecting Those Who Need It Most**

The people most harmed by the cognitive demands of job searching are those with the fewest resources: single parents, people managing health challenges, immigrants navigating unfamiliar systems, people without financial safety nets. Steadyhand provides the kind of support that previously required a personal career coach or a well-connected mentor.

## **8.4 Bias-Aware Matching**

* Postings analyzed for gendered language, unrealistic requirements, exclusionary patterns

* No demographic signals in matching

* Outcome tracking flags when certain profiles are systematically undermatched

* Regular algorithmic audits

# **9\. Business Model**

## **9.1 Principles**

* Free for candidates. Always. Non-negotiable.

* Revenue from the employer side, aligned with successful outcomes.

* No data selling. No advertising. No misaligned incentives.

## **9.2 Revenue Streams**

**Employer Subscriptions**

Companies pay for access to the matching system and Clearview tools. Tiered by volume: small teams pay less, enterprises pay more.

**Success-Based Fees**

Optional model: employers pay a fee when a Resonance match results in a hire. This aligns incentives perfectly — Resonance only makes money when matches actually work.

**Premium Employer Tools**

Advanced analytics: hiring funnel optimization, market benchmarking, team composition analysis, retention prediction.

## **9.3 What Resonance Will Never Do**

* Charge candidates for access or visibility

* Sell user data to third parties

* Allow pay-for-placement in candidate feeds

* Run advertisements

* Use candidate data for model training without explicit consent

# **10\. Risks & Mitigations**

| Risk | Severity | Impact | Mitigation |
| :---- | :---- | :---- | :---- |
| Cold start problem | High | Neither side joins without the other | Build candidate value first (Steadyhand works standalone). Employer side launches when candidate base is sufficient. |
| False candidate claims | Critical | Credibility damage, legal risk | Mandatory human approval. AI flags confidence. Evidence-based profiles. |
| Algorithmic bias | Critical | System reproduces inequality | No demographic signals. Continuous audits. Outcome tracking. |
| Employer gaming | Medium | Candidates waste time on misrepresented roles | Post-match feedback. Negative feedback reduces match priority. |
| Privacy breach | Critical | Trust destroyed | Local-first architecture. E2E encryption. Zero-knowledge matching. Regular audits. |
| Incumbent competition | Medium | Market share risk | Incumbents incentivized to maintain broadcast model. Resonance aligns revenue with match quality. |
| Candidate fabrication | Medium | Employer trust erodes | Evidence-based profiles score specificity. Vague claims rank lower. System encourages detail over fabrication. |

# **11\. Competitive Landscape**

**LinkedIn**

A social network with job features. Keyword-based matching. Incentivizes engagement and time-on-platform over match quality. Increasingly noisy for both candidates and employers.

**Indeed / Glassdoor**

Aggregation-focused. Rudimentary matching. Monetizes posting volume, not quality.

**AI Resume Tools**

Point solutions for one step in a broken process. They optimize a single artifact but don’t address the systemic failure of how talent and opportunity find each other.

**Recruiter Platforms**

Employer-side only. Expensive. Perpetuate network-based sourcing. Candidates have no agency in the process.

**What Resonance Offers That None Do**

* Deep understanding of both sides, not keyword matching

* Two-sided intelligence and support

* Cognitive load protection as a first-class feature

* Double opt-in matching that respects both parties

* Transparent reasoning behind every match

* Revenue aligned with match quality, not engagement or data

# **12\. Success Metrics**

## **12.1 North Star**

Successful matches: introductions resulting in mutual satisfaction and progression to interview stage or beyond.

## **12.2 Candidate Metrics**

* Cognitive load reduction (self-reported stress and decision fatigue)

* Memory Bank growth over time

* Interview confidence scores (post-debrief)

* Match quality satisfaction

* Time-to-offer vs. market benchmarks

## **12.3 Employer Metrics**

* Match quality satisfaction

* Time-to-fill vs. market benchmarks

* Candidate quality vs. traditional applicant pools

* Bias reduction in matched candidate pools

## **12.4 System Metrics**

* Confidence calibration accuracy: do high-confidence matches perform better?

* Coverage: percentage of available opportunities indexed

* Fairness: outcome distribution across candidate demographics

* Network effects: does adding participants improve match quality?

# **13\. Why This Matters**

The labor market is one of the most important systems in human society. It determines who gets meaningful work, financial security, and the opportunity to grow. And it’s running on infrastructure designed for newspaper classifieds and paper resumes.

The human cost is staggering. Talented people spend months in demoralizing searches, performing below their ability because the process exhausts them before they arrive. Companies miss perfect candidates because a posting was on the wrong board or used the wrong keywords. The result is a massive, ongoing misallocation of human potential.

Resonance represents a fundamentally different approach: instead of making people work harder to find each other, build a system intelligent enough to find the alignment for them. Protect cognitive capacity for the things that require human judgment — the interview, the career decision, the gut feeling about fit — and let AI handle everything else.

This is what AI-native means. Not AI sprinkled onto the same broken process. A process redesigned from scratch around what AI is good at and what humans are good at, with a bright line between the two.

The right person and the right opportunity should find each other. Not because of luck, timing, or privilege. Because a system was smart enough to see the resonance.

*End of Document*