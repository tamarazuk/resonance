import type {
  ParsedJD,
  Experience,
  FitAnalysis,
  DraftedMaterials,
  LLMResponse,
} from "@resonance/types"
import { rankExperiencesByFit } from "../analysis/fit"
import { draftMaterials } from "../llm/prompts/drafting"

export interface DraftingInput {
  parsedJD: ParsedJD
  experiences: Experience[]
  fitAnalysis: FitAnalysis
  maxExperiences?: number
}

export async function generateMaterials(
  input: DraftingInput,
): Promise<LLMResponse<DraftedMaterials>> {
  const { parsedJD, experiences, fitAnalysis, maxExperiences = 5 } = input

  const ranked = await rankExperiencesByFit(parsedJD, experiences)
  const topExperiences = ranked
    .slice(0, maxExperiences)
    .map((s) => s.experience)

  return draftMaterials(parsedJD, topExperiences, fitAnalysis)
}
