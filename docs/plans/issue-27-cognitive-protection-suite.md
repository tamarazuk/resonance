# Issue #27: Cognitive Protection Suite — Implementation Plan

**Issue:** https://github.com/tamarazuk/resonance/issues/27
**Branch:** `feat/issue-27-cognitive-protection`
**Scope:** Prep Engine (with Calm Mode), Follow-Up Manager, Emotional Intelligence layer + their UIs. Company research uses Firecrawl with LLM fallback.

---

## 1. Database Changes

### New table: `prep_packets`

Stores generated interview prep data per application.

| Column                    | Type                    | Notes                                                                         |
| ------------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `id`                      | uuid PK                 |                                                                               |
| `userId`                  | uuid FK -> users        |                                                                               |
| `applicationId`           | uuid FK -> applications |                                                                               |
| `companyResearch`         | jsonb                   | `{ overview, culture, recentNews, industry, size }`                           |
| `predictedQuestions`      | jsonb                   | Array of `{ question, category, suggestedStoryId?, suggestedStoryPreview? }`  |
| `talkingPoints`           | jsonb                   | Array of `{ point, supportingExperience? }`                                   |
| `calmModeData`            | jsonb                   | `{ keyPoints: string[3], openingStory: { title, preview }, groundingPrompt }` |
| `createdAt` / `updatedAt` | timestamp               |                                                                               |

### New table: `follow_up_drafts`

Stores follow-up message drafts tied to applications.

| Column                    | Type                    | Notes                                    |
| ------------------------- | ----------------------- | ---------------------------------------- |
| `id`                      | uuid PK                 |                                          |
| `userId`                  | uuid FK -> users        |                                          |
| `applicationId`           | uuid FK -> applications |                                          |
| `type`                    | enum                    | `thank_you`, `check_in`, `negotiation`   |
| `content`                 | text                    | The drafted message                      |
| `suggestedSendAt`         | timestamp               | When to send                             |
| `status`                  | enum                    | `draft`, `approved`, `sent`, `dismissed` |
| `createdAt` / `updatedAt` | timestamp               |                                          |

### Schema update to `users`

Add `emotionalIntelligenceEnabled` boolean (default true) to let users toggle the EI layer.

---

## 2. Backend: Prep Engine API

### `POST /api/applications/[id]/prep`

Generates a prep packet for an interview.

Flow:

1. Fetch the application's `parsedJD` and user's top experiences (reuse `rankExperiencesByFit`)
2. **Company research:** Try Firecrawl on the company's website (derive URL from `parsedJD.company` or `externalUrl`). On failure, fall back to LLM knowledge.
3. **Question prediction:** Use GPT-4o with the JD + company research to predict likely interview questions, then map each to the most relevant Memory Bank story via embedding similarity.
4. **Talking points:** Generate 5-7 talking points grounded in the user's experiences.
5. **Calm Mode data:** Distill everything down to 3 key points, 1 opening story, and a grounding prompt.
6. Save as a `prep_packets` row. Return the packet.

### `GET /api/applications/[id]/prep`

Retrieve existing prep packet.

### New files

- `lib/llm/prompts/prep-engine.ts` — system/user prompts for question prediction, talking points, and calm mode distillation
- `lib/analysis/company-research.ts` — Firecrawl scrape + LLM fallback for company context

---

## 3. Backend: Follow-Up Manager API

### `POST /api/applications/[id]/follow-up`

Generates a follow-up draft.

- Input: `{ type: "thank_you" | "check_in" | "negotiation" }`
- Uses the application context (company, role, interview stage) + user's tone from existing experiences
- Returns a draft with suggested send timing
- All drafts start as `status: "draft"` — nothing sends without explicit approval

### `GET /api/applications/[id]/follow-ups`

List follow-up drafts for an application.

### `PUT /api/applications/[id]/follow-ups/[followUpId]`

Update draft content or status (approve/dismiss).

### New files

- `lib/llm/prompts/follow-up.ts`

---

## 4. Backend: Emotional Intelligence Layer

Cross-cutting concern that modifies existing behavior rather than adding new routes.

### New file: `lib/emotional-intelligence.ts`

- `analyzeUserState(userId)` — queries recent activity patterns:
  - Count of rejections in last 7 days
  - Days since last activity
  - Application volume trends
- Returns a `UserEmotionalContext` object: `{ recentRejections, daysSinceActive, activityTrend, suggestedTone }`

### Integration points

- **Triage API (`/api/triage`):** Adjust action item language based on emotional context. After rejections: softer wording, no urgency pressure. During inactivity: welcoming back without shaming.
- **Chat system prompt:** Append emotional context so the AI adjusts tone (e.g., "The user received 2 rejections this week. Be supportive without being patronizing.")
- **Dashboard:** Optional gentle check-in message when returning after inactivity.

### User control

Toggle via `emotionalIntelligenceEnabled` on user preferences. Respects the existing settings page pattern.

---

## 5. Frontend: Prep Mode UI

### New route: `/dashboard/applications/[id]/prep`

Sections:

- **Company Brief** — overview, culture notes, industry context
- **Predicted Questions** — each with a matched Memory Bank story expandable inline
- **Talking Points** — bulleted list of grounded talking points
- **Calm Mode toggle** — switches the view to the distilled version: 3 key points + 1 opening story + optional grounding exercise. Minimal, focused design with extra whitespace and larger type.

### Entry point

Add a "Prep for Interview" button on the application detail page (`/dashboard/applications/[id]`) when the application status is `phone_screen`, `technical_interview`, or `final_interview`.

### New components

- `components/prep/PrepView.tsx` — main prep layout (client component for Calm Mode toggle)
- `components/prep/CompanyBrief.tsx` — company research card
- `components/prep/PredictedQuestions.tsx` — questions with story matches
- `components/prep/TalkingPoints.tsx` — talking points list
- `components/prep/CalmMode.tsx` — the stripped-down calm view

---

## 6. Frontend: Follow-Up Manager UI

### Integration into application detail page

Add a "Follow-Ups" tab to `ApplicationTabs`.

- Shows list of drafts with status badges
- "Generate Thank You" / "Generate Check-In" buttons
- Each draft is editable inline
- "Approve" button changes status (no actual sending — just marks as approved)
- Timing recommendation displayed as a subtle note

### New components

- `components/applications/FollowUpList.tsx` — list of drafts
- `components/applications/FollowUpDraft.tsx` — single draft with edit/approve/dismiss

---

## 7. Frontend: Emotional Intelligence Integration

- **Triage cards:** Dynamic copy based on emotional context (fetched alongside triage actions)
- **Dashboard:** Gentle welcome-back message component when `daysSinceActive > 3`
- **Settings page:** Add "Emotional Intelligence" toggle under a new "Wellbeing" card

---

## 8. Types & Validation

Add to `packages/types`:

- `PrepPacket`, `PredictedQuestion`, `TalkingPoint`, `CalmModeData`, `CompanyResearch` interfaces
- `FollowUpDraft`, `FollowUpType`, `FollowUpStatus` types
- `UserEmotionalContext` interface
- Zod schemas: `createFollowUpSchema`, `updateFollowUpSchema`
- Update `TriageAction` to include optional `emotionalContext` field
- Update `UserPreferences` to include `emotionalIntelligenceEnabled`

---

## Files Modified/Created Summary

| Area                   | Files                                                                        | Action                                                         |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| DB schema              | `packages/db/src/schema.ts`                                                  | Add `prepPackets`, `followUpDrafts` tables, enums, user column |
| DB operations          | `packages/db/src/operations.ts`                                              | Add CRUD for new tables                                        |
| DB migration           | `packages/db/drizzle/`                                                       | New migration                                                  |
| Types                  | `packages/types/src/index.ts`                                                | Add interfaces, schemas                                        |
| API - Prep             | `app/api/applications/[id]/prep/route.ts`                                    | New                                                            |
| API - Follow-ups       | `app/api/applications/[id]/follow-ups/route.ts`                              | New                                                            |
| API - Follow-up detail | `app/api/applications/[id]/follow-ups/[followUpId]/route.ts`                 | New                                                            |
| API - Triage           | `app/api/triage/route.ts`                                                    | Modify (EI integration)                                        |
| API - Chat             | `app/api/chat/route.ts`                                                      | Modify (EI context in prompt)                                  |
| API - Preferences      | `app/api/preferences/route.ts`                                               | Modify (new field)                                             |
| LLM prompts            | `lib/llm/prompts/prep-engine.ts`, `lib/llm/prompts/follow-up.ts`             | New                                                            |
| Lib                    | `lib/analysis/company-research.ts`, `lib/emotional-intelligence.ts`          | New                                                            |
| Components             | `components/prep/*` (4 files), `components/applications/FollowUp*` (2 files) | New                                                            |
| Pages                  | `app/dashboard/applications/[id]/prep/page.tsx`                              | New                                                            |
| Existing pages         | Application detail page, Dashboard, Settings                                 | Modify                                                         |

**Estimated scope:** ~15 files modified/created across backend and frontend.
