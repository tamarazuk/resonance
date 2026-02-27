import { z } from "zod";
import type {
  ParsedJD,
  Experience,
  FitAnalysis,
  LLMResponse,
} from "@resonance/types";
import { completeStructured } from "../client";

const fitAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.array(z.string()),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are an expert career fit analyst.

Given a parsed job description and a candidate's experiences, produce a fit analysis.

- overallScore: 0-100 numeric score calibrated as:
  - 90-100: Exceptional match, candidate has most required skills and strong relevant experience
  - 70-89: Strong match, candidate has many required skills and relevant experience
  - 50-69: Moderate match, candidate has some skills but gaps exist
  - 30-49: Weak match, significant skill gaps or limited relevant experience
  - 0-29: Poor match, major gaps in skills and experience
- matchingSkills: Skills the candidate has that match the JD (be specific)
- missingSkills: Key skills in the JD the candidate lacks
- recommendations: 2-3 actionable advice for the application
- strengths: Key strengths the candidate brings (specific achievements, metrics)
- gaps: Areas where the candidate falls short (be honest but constructive)

Be honest and specific. Focus on transferable skills that could bridge gaps. Respond with valid JSON.`;

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

export async function analyzeFit(
  parsedJD: ParsedJD,
  experiences: Experience[],
): Promise<LLMResponse<FitAnalysis>> {
  const userPrompt = `## Job Description
Title: ${parsedJD.title}
Company: ${parsedJD.company}
Requirements: ${parsedJD.requirements.join("; ")}
Responsibilities: ${parsedJD.responsibilities.join("; ")}
Skills needed: ${parsedJD.skills.join(", ")}

## Candidate Experiences
${formatExperiences(experiences)}`;

  return completeStructured<FitAnalysis>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
    parse: (raw) => fitAnalysisSchema.parse(JSON.parse(raw)),
  });
}
