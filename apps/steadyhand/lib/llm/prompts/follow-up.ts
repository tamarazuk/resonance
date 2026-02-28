import { z } from "zod";
import type { ParsedJD, FollowUpType, LLMResponse } from "@resonance/types";
import { completeStructured } from "../client";

const followUpDraftSchema = z.object({
  content: z.string(),
  suggestedDelay: z.string(),
});

interface FollowUpDraftResult {
  content: string;
  suggestedDelay: string;
}

const SYSTEM_PROMPTS: Record<FollowUpType, string> = {
  thank_you: `You are a professional career coach helping a candidate write a thank-you message after an interview.

Write a concise, genuine thank-you message that:
- References the specific role and company
- Mentions something specific from the interview when context is available
- Reaffirms interest in the role
- Is professional but warm, not overly formal
- Is 3-5 sentences long

Also suggest when to send it (e.g., "within 24 hours").

Respond with valid JSON: { "content": "...", "suggestedDelay": "..." }`,

  check_in: `You are a professional career coach helping a candidate write a follow-up check-in message.

Write a polite, professional check-in message that:
- References the specific role and company
- Expresses continued interest
- Asks about next steps or timeline
- Is brief and respectful of the recipient's time
- Is 2-4 sentences long

Also suggest the appropriate timing (e.g., "1 week after interview").

Respond with valid JSON: { "content": "...", "suggestedDelay": "..." }`,

  negotiation: `You are a professional career coach helping a candidate prepare a negotiation message.

Write a professional, confident negotiation message that:
- Expresses enthusiasm for the role and company
- States the candidate's case clearly
- Is collaborative in tone, not adversarial
- Leaves room for discussion
- Is 4-6 sentences long

Also suggest the timing (e.g., "within 48 hours of receiving offer").

Respond with valid JSON: { "content": "...", "suggestedDelay": "..." }`,
};

export async function generateFollowUp(
  parsedJD: ParsedJD,
  type: FollowUpType,
  interviewStage: string,
): Promise<LLMResponse<FollowUpDraftResult>> {
  const userPrompt = `## Role Details
Title: ${parsedJD.title}
Company: ${parsedJD.company}
Current Stage: ${interviewStage}

Write a ${type.replace("_", " ")} message for this situation.`;

  return completeStructured<FollowUpDraftResult>({
    systemPrompt: SYSTEM_PROMPTS[type],
    userPrompt,
    temperature: 0.5,
    parse: (raw) => followUpDraftSchema.parse(JSON.parse(raw)),
  });
}
