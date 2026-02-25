import type { ParsedJD, Experience, FitAnalysis, LLMResponse } from "@resonance/types"
import { generateEmbedding, cosineSimilarity } from "../llm/embeddings"
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

export async function rankExperiencesByFit(
  parsedJD: ParsedJD,
  experiences: Experience[],
): Promise<ScoredExperience[]> {
  const jdText = jdToEmbeddingText(parsedJD)
  const jdEmbedding = await generateEmbedding(jdText)

  const scored: ScoredExperience[] = []

  for (const experience of experiences) {
    if (experience.embedding) {
      scored.push({
        experience,
        similarityScore: cosineSimilarity(jdEmbedding, experience.embedding),
      })
    } else {
      const expEmbedding = await generateEmbedding(experience.rawInput)
      scored.push({
        experience,
        similarityScore: cosineSimilarity(jdEmbedding, expEmbedding),
      })
    }
  }

  return scored.sort((a, b) => b.similarityScore - a.similarityScore)
}

export async function analyzeJobFit(
  parsedJD: ParsedJD,
  experiences: Experience[],
): Promise<LLMResponse<FitAnalysis>> {
  const ranked = await rankExperiencesByFit(parsedJD, experiences)
  const topExperiences = ranked.slice(0, 10).map((s) => s.experience)

  return llmAnalyzeFit(parsedJD, topExperiences)
}
