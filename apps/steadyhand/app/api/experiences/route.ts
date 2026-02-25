import { NextResponse } from "next/server"
import { db, experiences, desc, eq } from "@resonance/db"
import type { Experience as ExperienceType } from "@resonance/types"
import { auth } from "@/lib/auth"

/** Map flat DB columns to the nested Experience interface. */
function toExperience(row: typeof experiences.$inferSelect): ExperienceType {
  return {
    id: row.id,
    userId: row.userId,
    rawInput: row.rawInput,
    starStructure:
      row.situation && row.task && row.action && row.result
        ? { situation: row.situation, task: row.task, action: row.action, result: row.result }
        : null,
    skills: row.skills,
    embedding: row.embedding ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/** GET /api/experiences — list all experiences for the authenticated user. */
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.userId, session.user.id))
    .orderBy(desc(experiences.createdAt))

  return NextResponse.json(rows.map(toExperience))
}
