import type { ParsedJD, Experience, FitAnalysis, LLMResponse } from "@resonance/types"
import { db, experiences, eq, cosineDistance, asc } from "@resonance/db"
import { generateEmbedding } from "../llm/embeddings"
import { analyzeFit as llmAnalyzeFit } from "../llm/prompts/fit-analysis"

interface ScoredExperience {
  experience: Experience
  similarityScore: number
}

function jdToEmbeddingText(parsedJD: ParsedJD): string {
  return [
    parsedJD.title,
    parsedJD.requirements.join(". "),
    parsedJD.responsibilities.join(". "),
    parsedJD.skills.join(", "),
  ].join("\n")
}

/** Map a flat DB row to the nested Experience interface. */
function toExperience(row: typeof experiences.$inferSelect): Experience {
  return {
    id: row.id,
    userId: row.userId,
    rawInput: row.rawInput,
    starStructure:
      row.situation && row.task && row.action && row.result
        ? { situation: row.situation, task: row.task, action: row.action, result: row.result }
        : null,
    skills: row.skills,
    embedding: row.embedding,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/**
 * Rank a user's experiences by semantic similarity to a job description.
 *
 * Uses pgvector's cosine distance operator (`<=>`) in SQL so ranking happens
 * entirely in Postgres — no need to fetch all rows into JS.
 *
 * Experiences without embeddings are excluded from ranking.
 */
export async function rankExperiencesByFit(
  parsedJD: ParsedJD,
  userId: string,
  limit = 10,
): Promise<ScoredExperience[]> {
  const jdText = jdToEmbeddingText(parsedJD)
  const jdEmbedding = await generateEmbedding(jdText)

  const distance = cosineDistance(experiences.embedding, jdEmbedding)

  const rows = await db
    .select({
      experience: experiences,
      distance,
    })
    .from(experiences)
    .where(eq(experiences.userId, userId))
    .orderBy(asc(distance))
    .limit(limit)

  return rows.map((row) => ({
    experience: toExperience(row.experience),
    // Convert distance (0 = identical) to similarity (1 = identical)
    similarityScore: 1 - Number(row.distance),
  }))
}

export async function analyzeJobFit(
  parsedJD: ParsedJD,
  userId: string,
): Promise<LLMResponse<FitAnalysis>> {
  const ranked = await rankExperiencesByFit(parsedJD, userId)
  const topExperiences = ranked.map((s) => s.experience)

  return llmAnalyzeFit(parsedJD, topExperiences)
}
