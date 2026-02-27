import { z } from "zod";
import type { ParsedJD, LLMResponse } from "@resonance/types";
import { completeStructured } from "../client";

const parsedJDSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
  benefits: z.array(z.string()),
  salary: z.string().nullable(),
});

const SYSTEM_PROMPT = `You are an expert job description parser.

Given raw text from a job posting, extract structured information. Be thorough but concise.

- title: Job title (extract from the text, clean up any formatting)
- company: Company name (look for "at X" or "X is hiring" patterns)
- location: Location or null if remote/not specified (note if position is remote/hybrid)
- requirements: List of qualifications and requirements (combine education, experience, skills)
- responsibilities: List of key responsibilities (start with action verbs)
- skills: List of technical and soft skills mentioned (include tools, technologies, methodologies)
- benefits: List of benefits and perks (401k, PTO, health, etc.)
- salary: Salary range as string or null if not mentioned

If any field cannot be determined, use an empty array for arrays or null for nullable fields. Be specific - extract actual skill names, not generic categories.

Respond with valid JSON matching the schema above.`;

export async function parseJobDescription(
  cleanText: string,
): Promise<LLMResponse<ParsedJD>> {
  return completeStructured<ParsedJD>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: cleanText,
    temperature: 0.1,
    parse: (raw) => parsedJDSchema.parse(JSON.parse(raw)),
  });
}
