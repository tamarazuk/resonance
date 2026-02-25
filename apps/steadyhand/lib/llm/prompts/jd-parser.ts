import { z } from "zod"
import type { ParsedJD, LLMResponse } from "@resonance/types"
import { completeStructured } from "../client"

const parsedJDSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
  benefits: z.array(z.string()),
  salary: z.string().nullable(),
})

const SYSTEM_PROMPT = `You are an expert job description parser.

Given raw text from a job posting, extract structured information. Be thorough but concise.

- title: Job title
- company: Company name
- location: Location or null if remote/not specified
- requirements: List of qualifications and requirements
- responsibilities: List of key responsibilities
- skills: List of technical and soft skills mentioned
- benefits: List of benefits and perks
- salary: Salary range as string or null if not mentioned

Respond with valid JSON matching the schema above.`

export async function parseJobDescription(
  cleanText: string,
): Promise<LLMResponse<ParsedJD>> {
  return completeStructured<ParsedJD>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: cleanText,
    temperature: 0.1,
    parse: (raw) => parsedJDSchema.parse(JSON.parse(raw)),
  })
}
