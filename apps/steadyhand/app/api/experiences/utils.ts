import type { experiences } from "@resonance/db";
import type { Experience as ExperienceType } from "@resonance/types";

/** Normalize blank/whitespace-only STAR strings to null. */
export function normalizeStar(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Map flat DB columns to the nested Experience interface. */
export function toExperience(
  row: typeof experiences.$inferSelect,
): ExperienceType {
  const situation = normalizeStar(row.situation);
  const task = normalizeStar(row.task);
  const action = normalizeStar(row.action);
  const result = normalizeStar(row.result);

  const hasAnyStarField =
    situation !== null || task !== null || action !== null || result !== null;

  return {
    id: row.id,
    userId: row.userId,
    rawInput: row.rawInput,
    starStructure: hasAnyStarField
      ? {
          situation: situation ?? "",
          task: task ?? "",
          action: action ?? "",
          result: result ?? "",
        }
      : null,
    skills: row.skills,
    embedding: row.embedding ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
