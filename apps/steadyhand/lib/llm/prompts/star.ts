import { z } from "zod"
import type { StarStructureOutput, LLMResponse } from "@resonance/types"
import { completeStructured } from "../client"

const starSchema = z.object({
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
})

const SYSTEM_PROMPT = `You are an expert career coach specializing in the STAR method (Situation, Task, Action, Result).

Given a raw experience description, restructure it into STAR format. Each field should be a clear, concise paragraph.

- Situation: Context and background
- Task: What was required or the challenge faced
- Action: Specific steps taken (use first person)
- Result: Quantifiable outcomes and impact

Respond with valid JSON matching this schema:
{
  "situation": "string",
  "task": "string",
  "action": "string",
  "result": "string"
}`

export async function structureAsSTAR(
  rawInput: string,
): Promise<LLMResponse<StarStructureOutput>> {
  return completeStructured<StarStructureOutput>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: rawInput,
    temperature: 0.2,
    parse: (raw) => starSchema.parse(JSON.parse(raw)),
  })
}
