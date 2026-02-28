import { NextResponse } from "next/server";
import { db, applications, followUpDrafts, and, eq, desc } from "@resonance/db";
import { auth } from "@/lib/auth";
import { createFollowUpSchema } from "@resonance/types";
import { generateFollowUp } from "@/lib/llm/prompts/follow-up";
import { addHours } from "date-fns";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/applications/[id]/follow-ups — list follow-up drafts. */
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const drafts = await db
    .select()
    .from(followUpDrafts)
    .where(
      and(
        eq(followUpDrafts.applicationId, id),
        eq(followUpDrafts.userId, session.user.id),
      ),
    )
    .orderBy(desc(followUpDrafts.createdAt));

  return NextResponse.json(drafts);
}

/** POST /api/applications/[id]/follow-up — generate a follow-up draft. */
export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createFollowUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

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

  if (!application.parsedJD) {
    return NextResponse.json(
      { error: "Job description has not been parsed yet" },
      { status: 422 },
    );
  }

  // Generate the follow-up draft
  const result = await generateFollowUp(
    application.parsedJD,
    parsed.data.type,
    application.status,
  );

  if (!result.success || !result.data) {
    return NextResponse.json(
      { error: "Failed to generate follow-up", details: result.error },
      { status: 500 },
    );
  }

  // Parse suggested delay into a timestamp
  const suggestedSendAt = addHours(new Date(), 24); // Default 24h from now

  // Save the draft
  const [draft] = await db
    .insert(followUpDrafts)
    .values({
      userId,
      applicationId: id,
      type: parsed.data.type,
      content: result.data.content,
      suggestedSendAt,
      status: "draft",
    })
    .returning();

  return NextResponse.json(draft, { status: 201 });
}
