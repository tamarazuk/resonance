import type {
  ParsedJD,
  FitAnalysis,
  DraftedMaterials,
  LLMResponse,
} from "@resonance/types"
import { rankExperiencesByFit } from "../analysis/fit"
import { draftMaterials } from "../llm/prompts/drafting"

export interface DraftingInput {
  parsedJD: ParsedJD
  userId: string
  fitAnalysis: FitAnalysis
  maxExperiences?: number
}

export async function generateMaterials(
  input: DraftingInput,
): Promise<LLMResponse<DraftedMaterials>> {
  const { parsedJD, userId, fitAnalysis, maxExperiences = 5 } = input

  const ranked = await rankExperiencesByFit(parsedJD, userId, maxExperiences)
  const topExperiences = ranked.map((s) => s.experience)

  return draftMaterials(parsedJD, topExperiences, fitAnalysis)
}
