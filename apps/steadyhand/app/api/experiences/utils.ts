import type { experiences } from "@resonance/db";
import type { Experience as ExperienceType } from "@resonance/types";

/** Map flat DB columns to the nested Experience interface. */
export function toExperience(
  row: typeof experiences.$inferSelect,
): ExperienceType {
  return {
    id: row.id,
    userId: row.userId,
    rawInput: row.rawInput,
    starStructure:
      row.situation && row.task && row.action && row.result
        ? {
            situation: row.situation,
            task: row.task,
            action: row.action,
            result: row.result,
          }
        : null,
    skills: row.skills,
    embedding: row.embedding ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
