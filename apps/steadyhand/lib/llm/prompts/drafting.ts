import { z } from "zod";
import type {
  ParsedJD,
  Experience,
  FitAnalysis,
  TailoredBullet,
  DraftedMaterials,
  LLMResponse,
} from "@resonance/types";
import { completeStructured } from "../client";

const draftedMaterialsSchema = z.object({
  resumeBullets: z.array(
    z.object({
      original: z.string(),
      tailored: z.string(),
      keywords: z.array(z.string()),
    }),
  ),
  coverLetterParagraphs: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are an expert resume writer and career coach.

Given a job description, candidate experiences, and fit analysis, produce tailored application materials.

For resumeBullets: Rewrite each experience as a concise, impactful resume bullet point tailored to the job.
- original: The original experience description
- tailored: Rewritten bullet optimized for this role (start with action verbs, quantify results where possible)
- keywords: Relevant keywords from the JD woven in naturally

For coverLetterParagraphs: Write 3-4 professional paragraphs with a confident but genuine tone.
- Opening: Hook connecting candidate to company/role - show you've researched the company
- Body 1-2: Highlight matching experiences with specific results and achievements
- Closing: Express genuine enthusiasm for the role and include a call to action

Tone: Professional, confident, and genuine. Avoid being too salesy or generic. Show personality while remaining professional. Focus on what you can contribute, not just what you want.

Respond with valid JSON.`;

export async function draftMaterials(
  parsedJD: ParsedJD,
  experiences: Experience[],
  fitAnalysis: FitAnalysis,
): Promise<LLMResponse<DraftedMaterials>> {
  const experienceText = experiences
    .map((exp, i) => {
      const star = exp.starStructure;
      return star
        ? `${i + 1}. ${star.action} → ${star.result}`
        : `${i + 1}. ${exp.rawInput}`;
    })
    .join("\n");

  const userPrompt = `## Job Description
Title: ${parsedJD.title}
Company: ${parsedJD.company}
Key Skills: ${parsedJD.skills.join(", ")}
Requirements: ${parsedJD.requirements.join("; ")}

## Candidate Experiences
${experienceText}

## Fit Analysis
Score: ${fitAnalysis.overallScore}/100
Strengths: ${fitAnalysis.strengths.join(", ")}
Gaps: ${fitAnalysis.gaps.join(", ")}
Matching Skills: ${fitAnalysis.matchingSkills.join(", ")}`;

  return completeStructured<DraftedMaterials>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.4,
    parse: (raw) => {
      const parsed = draftedMaterialsSchema.parse(JSON.parse(raw));
      return {
        resumeBullets: parsed.resumeBullets as TailoredBullet[],
        coverLetterParagraphs: parsed.coverLetterParagraphs,
      };
    },
  });
}
