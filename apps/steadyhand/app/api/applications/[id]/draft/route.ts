import { NextResponse } from "next/server";
import { db, applications, and, eq } from "@resonance/db";
import { auth } from "@/lib/auth";
import { analyzeJobFit } from "@/lib/analysis/fit";
import { generateMaterials } from "@/lib/drafting";

type RouteParams = { params: Promise<{ id: string }> };

interface DraftRequestBody {
  coverLetterParagraphs?: string[];
}

/**
 * POST /api/applications/[id]/draft — generate tailored materials.
 * Runs fit analysis + drafting pipeline and persists results to the application row.
 *
 * Optional body:
 * - coverLetterParagraphs: Save existing cover letter paragraphs without regenerating
 */
export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  const body: DraftRequestBody = await req.json().catch(() => ({}));

  // Fetch the application
  const [application] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  // If only saving existing cover letter paragraphs (no regeneration needed)
  if (body.coverLetterParagraphs !== undefined) {
    if (
      !Array.isArray(body.coverLetterParagraphs) ||
      !body.coverLetterParagraphs.every((p) => typeof p === "string")
    ) {
      return NextResponse.json(
        { error: "Invalid coverLetterParagraphs: must be an array of strings" },
        { status: 400 },
      );
    }

    const existingMaterials = application.draftedMaterials;
    const [updated] = await db
      .update(applications)
      .set({
        draftedMaterials: {
          resumeBullets: existingMaterials?.resumeBullets ?? [],
          coverLetterParagraphs: body.coverLetterParagraphs,
        },
      })
      .where(eq(applications.id, id))
      .returning();

    return NextResponse.json(updated);
  }

  if (!application.parsedJD) {
    return NextResponse.json(
      { error: "Job description has not been parsed yet" },
      { status: 422 },
    );
  }

  // Run fit analysis (ranks experiences via pgvector cosine distance in SQL)
  const fitResult = await analyzeJobFit(application.parsedJD, userId);

  if (!fitResult.success || !fitResult.data) {
    return NextResponse.json(
      { error: "Fit analysis failed", details: fitResult.error },
      { status: 500 },
    );
  }

  // 3. Generate drafted materials (also ranks experiences internally)
  const draftResult = await generateMaterials({
    parsedJD: application.parsedJD,
    userId,
    fitAnalysis: fitResult.data,
  });

  if (!draftResult.success || !draftResult.data) {
    return NextResponse.json(
      { error: "Material generation failed", details: draftResult.error },
      { status: 500 },
    );
  }

  // 4. Persist results to the application row
  const [updated] = await db
    .update(applications)
    .set({
      fitAnalysis: fitResult.data,
      draftedMaterials: draftResult.data,
    })
    .where(eq(applications.id, id))
    .returning();

  return NextResponse.json(updated);
}
