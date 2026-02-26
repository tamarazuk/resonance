import type { experiences } from "@resonance/db";
import type { Experience as ExperienceType } from "@resonance/types";

/** Map flat DB columns to the nested Experience interface. */
export function toExperience(
  row: typeof experiences.$inferSelect,
): ExperienceType {
  const hasAnyStarField =
    row.situation !== null ||
    row.task !== null ||
    row.action !== null ||
    row.result !== null;

  return {
    id: row.id,
    userId: row.userId,
    rawInput: row.rawInput,
    starStructure: hasAnyStarField
      ? {
          situation: row.situation ?? "",
          task: row.task ?? "",
          action: row.action ?? "",
          result: row.result ?? "",
        }
      : null,
    skills: row.skills,
    embedding: row.embedding ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
