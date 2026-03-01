import { NextResponse } from "next/server";
import { db, applications, followUpDrafts, and, eq, desc } from "@resonance/db";
import { auth } from "@/lib/auth";
import { createFollowUpSchema } from "@resonance/types";
import { generateFollowUp } from "@/lib/llm/prompts/follow-up";
import { addHours } from "date-fns";

type RouteParams = { params: Promise<{ id: string }> };

function parseSuggestedDelayHours(suggestedDelay: string): number | null {
  const normalized = suggestedDelay.trim().toLowerCase();
  const match = normalized.match(
    /(\d+)\s*(hour|hours|hr|hrs|day|days|week|weeks|minute|minutes|min|mins)/,
  );

  if (match) {
    const amount = Number.parseInt(match[1], 10);
    const unit = match[2];

    if (Number.isNaN(amount) || amount <= 0) {
      return null;
    }

    if (unit.startsWith("week")) {
      return amount * 24 * 7;
    }

    if (unit.startsWith("day")) {
      return amount * 24;
    }

    if (unit.startsWith("hour") || unit === "hr" || unit === "hrs") {
      return amount;
    }

    if (unit.startsWith("min") || unit.startsWith("minute")) {
      return Math.max(1, Math.ceil(amount / 60));
    }
  }

  if (normalized.includes("tomorrow")) {
    return 24;
  }

  if (normalized.includes("next week")) {
    return 24 * 7;
  }

  return null;
}

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

/** POST /api/applications/[id]/follow-ups — generate a follow-up draft. */
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

  const parsedDelayHours = parseSuggestedDelayHours(result.data.suggestedDelay);
  const suggestedSendAt = addHours(new Date(), parsedDelayHours ?? 24);

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
