import { z } from "zod";
import type {
  ParsedJD,
  Experience,
  CompanyResearch,
  PredictedQuestion,
  TalkingPoint,
  CalmModeData,
  LLMResponse,
} from "@resonance/types";
import { completeStructured } from "../client";

// ==================== Question Prediction ====================

const predictedQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      category: z.string(),
    }),
  ),
});

const QUESTION_PREDICTION_SYSTEM_PROMPT = `You are an expert interview coach who predicts likely interview questions.

Given a job description and company research, predict 8-10 interview questions the candidate is likely to face. Include a mix of:
- Behavioral questions ("Tell me about a time when...")
- Technical/skill-based questions
- Role-specific questions
- Culture-fit questions

For each question, assign a category: "behavioral", "technical", "situational", "culture_fit", or "role_specific".

Focus on questions that are highly specific to this role and company, not generic ones. Respond with valid JSON: { "questions": [{ "question": "...", "category": "..." }] }`;

export async function predictQuestions(
  parsedJD: ParsedJD,
  companyResearch: CompanyResearch | null,
): Promise<LLMResponse<PredictedQuestion[]>> {
  const companyContext = companyResearch
    ? `\n## Company Research\nOverview: ${companyResearch.overview}\nCulture: ${companyResearch.culture}\nIndustry: ${companyResearch.industry}`
    : "";

  const userPrompt = `## Job Description
Title: ${parsedJD.title}
Company: ${parsedJD.company}
Requirements: ${parsedJD.requirements.join("; ")}
Responsibilities: ${parsedJD.responsibilities.join("; ")}
Skills needed: ${parsedJD.skills.join(", ")}
${companyContext}`;

  return completeStructured<PredictedQuestion[]>({
    systemPrompt: QUESTION_PREDICTION_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.4,
    parse: (raw) => {
      try {
        const parsed = predictedQuestionsSchema.parse(JSON.parse(raw));
        return parsed.questions;
      } catch {
        throw new Error("Invalid predicted questions JSON response");
      }
    },
  });
}

// ==================== Talking Points ====================

const talkingPointsSchema = z.object({
  talkingPoints: z.array(
    z.object({
      point: z.string(),
      supportingExperience: z.string().optional(),
    }),
  ),
});

const TALKING_POINTS_SYSTEM_PROMPT = `You are an expert interview coach helping a candidate prepare talking points.

Given a job description, company research, and the candidate's experiences, generate 5-7 compelling talking points. Each talking point should:
- Be a concise statement the candidate can use during the interview
- Be grounded in the candidate's actual experience when possible
- Address key requirements or responsibilities from the JD
- Optionally reference a supporting experience

Respond with valid JSON: { "talkingPoints": [{ "point": "...", "supportingExperience": "..." }] }`;

function formatExperiences(experiences: Experience[]): string {
  return experiences
    .map((exp, i) => {
      const star = exp.starStructure;
      const starText = star
        ? `\n  Situation: ${star.situation}\n  Task: ${star.task}\n  Action: ${star.action}\n  Result: ${star.result}`
        : "";
      return `Experience ${i + 1}:\n  Raw: ${exp.rawInput}${starText}\n  Skills: ${exp.skills.join(", ")}`;
    })
    .join("\n\n");
}

export async function generateTalkingPoints(
  parsedJD: ParsedJD,
  companyResearch: CompanyResearch | null,
  experiences: Experience[],
): Promise<LLMResponse<TalkingPoint[]>> {
  const companyContext = companyResearch
    ? `\n## Company Research\nOverview: ${companyResearch.overview}\nCulture: ${companyResearch.culture}`
    : "";

  const userPrompt = `## Job Description
Title: ${parsedJD.title}
Company: ${parsedJD.company}
Requirements: ${parsedJD.requirements.join("; ")}
Responsibilities: ${parsedJD.responsibilities.join("; ")}
${companyContext}

## Candidate Experiences
${formatExperiences(experiences)}`;

  return completeStructured<TalkingPoint[]>({
    systemPrompt: TALKING_POINTS_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.4,
    parse: (raw) => {
      try {
        const parsed = talkingPointsSchema.parse(JSON.parse(raw));
        return parsed.talkingPoints;
      } catch {
        throw new Error("Invalid talking points JSON response");
      }
    },
  });
}

// ==================== Calm Mode Distillation ====================

const calmModeSchema = z.object({
  keyPoints: z.tuple([z.string(), z.string(), z.string()]),
  openingStory: z.object({
    title: z.string(),
    preview: z.string(),
  }),
  groundingPrompt: z.string(),
});

const CALM_MODE_SYSTEM_PROMPT = `You are a supportive interview coach helping a nervous candidate distill their prep into the absolute essentials.

Given interview prep data (talking points and candidate experiences), create a "calm mode" view with:

1. keyPoints: Exactly 3 short, memorable key points the candidate should remember. Each should be 1 sentence max.
2. openingStory: The single best story for the candidate to open with. Include a short title and a 1-2 sentence preview they can glance at.
3. groundingPrompt: A brief, calming prompt to read before the interview (2-3 sentences). This should be warm, grounding, and remind them they're prepared.

Keep everything concise — this will be displayed in a minimal, distraction-free view. Respond with valid JSON.`;

export async function distillCalmMode(
  talkingPoints: TalkingPoint[],
  experiences: Experience[],
  companyName: string,
): Promise<LLMResponse<CalmModeData>> {
  const userPrompt = `## Company: ${companyName}

## Talking Points
${talkingPoints.map((tp, i) => `${i + 1}. ${tp.point}${tp.supportingExperience ? ` (backed by: ${tp.supportingExperience})` : ""}`).join("\n")}

## Candidate's Top Experiences
${formatExperiences(experiences.slice(0, 3))}`;

  return completeStructured<CalmModeData>({
    systemPrompt: CALM_MODE_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
    parse: (raw) => calmModeSchema.parse(JSON.parse(raw)),
  });
}
