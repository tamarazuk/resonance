import { NextResponse } from "next/server"
import { db, applications, experiences, and, eq } from "@resonance/db"
import type { Experience as ExperienceType } from "@resonance/types"
import { auth } from "@/lib/auth"
import { analyzeJobFit } from "@/lib/analysis/fit"
import { generateMaterials } from "@/lib/drafting"

type RouteParams = { params: Promise<{ id: string }> }

/** Map flat DB experience rows to the nested Experience interface for pipeline consumption. */
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
    embedding: row.embedding ? (JSON.parse(row.embedding) as number[]) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/**
 * POST /api/applications/[id]/draft — generate tailored materials.
 * Runs fit analysis + drafting pipeline and persists results to the application row.
 */
export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // 1. Fetch the application
  const [application] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, id),
        eq(applications.userId, session.user.id),
      ),
    )

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  if (!application.parsedJD) {
    return NextResponse.json(
      { error: "Job description has not been parsed yet" },
      { status: 422 },
    )
  }

  // 2. Fetch all user experiences for ranking
  const expRows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.userId, session.user.id))

  const userExperiences = expRows.map(toExperience)

  if (userExperiences.length === 0) {
    return NextResponse.json(
      { error: "No experiences in Memory Bank. Chat with your career coach first." },
      { status: 422 },
    )
  }

  // 3. Run fit analysis
  const fitResult = await analyzeJobFit(application.parsedJD, userExperiences)

  if (!fitResult.success || !fitResult.data) {
    return NextResponse.json(
      { error: "Fit analysis failed", details: fitResult.error },
      { status: 500 },
    )
  }

  // 4. Generate drafted materials
  const draftResult = await generateMaterials({
    parsedJD: application.parsedJD,
    experiences: userExperiences,
    fitAnalysis: fitResult.data,
  })

  if (!draftResult.success || !draftResult.data) {
    return NextResponse.json(
      { error: "Material generation failed", details: draftResult.error },
      { status: 500 },
    )
  }

  // 5. Persist results to the application row
  const [updated] = await db
    .update(applications)
    .set({
      fitAnalysis: fitResult.data,
      draftedMaterials: draftResult.data,
    })
    .where(eq(applications.id, id))
    .returning()

  return NextResponse.json(updated)
}
