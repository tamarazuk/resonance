import { streamText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { db, experiences } from "@resonance/db"
import { auth } from "@/lib/auth"
import { generateEmbedding } from "@/lib/llm/embeddings"

const SYSTEM_PROMPT = `You are a warm, insightful career coach helping professionals capture and refine their work experiences.

Your role:
- Have a natural conversation about the user's career.
- Listen for professional stories, accomplishments, and experiences.
- When the user shares a meaningful experience, use the saveExperienceToMemoryBank tool to extract STAR-structured data and save it.
- After saving, briefly confirm what you captured and ask a follow-up to draw out more detail or move to the next experience.
- If the user's story is vague, ask clarifying questions before saving (e.g., "What was the measurable outcome?" or "Can you walk me through your specific role?").

Guidelines:
- Don't save trivial statements — only substantive professional experiences.
- Extract concrete, quantifiable results when possible.
- Identify relevant skills demonstrated in each story.
- Be encouraging but honest. Help the user articulate impact clearly.
- You can discuss career strategy, interview prep, and job search topics too.`

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages } = await req.json()
  const userId = session.user.id

  const result = streamText({
    model: openai("gpt-4o"),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      saveExperienceToMemoryBank: tool({
        description:
          "Extract a professional experience from the conversation, " +
          "structure it in STAR format (Situation, Task, Action, Result), " +
          "generate an embedding, and save it to the user's Memory Bank. " +
          "Only call this when the user has shared a substantive professional experience.",
        inputSchema: z.object({
          rawInput: z
            .string()
            .describe("The user's original story, summarized faithfully in 2-4 sentences"),
          situation: z
            .string()
            .describe("The context and background of the experience"),
          task: z
            .string()
            .describe("What was required or the challenge faced"),
          action: z
            .string()
            .describe("Specific steps the user took (first person)"),
          result: z
            .string()
            .describe("Quantifiable outcomes and impact achieved"),
          skills: z
            .array(z.string())
            .describe("Technical and soft skills demonstrated in this experience"),
        }),
        execute: async ({ rawInput, situation, task, action, result, skills }) => {
          // Build the full text for embedding from the STAR fields
          const embeddingText = [
            `Situation: ${situation}`,
            `Task: ${task}`,
            `Action: ${action}`,
            `Result: ${result}`,
            `Skills: ${skills.join(", ")}`,
          ].join("\n")

          const embedding = await generateEmbedding(embeddingText)

          const [saved] = await db
            .insert(experiences)
            .values({
              userId,
              rawInput,
              situation,
              task,
              action,
              result,
              skills,
              embedding: JSON.stringify(embedding),
            })
            .returning({ id: experiences.id })

          return {
            success: true,
            experienceId: saved!.id,
            summary: `Saved: "${rawInput.slice(0, 80)}${rawInput.length > 80 ? "..." : ""}"`,
            skillCount: skills.length,
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
