import { NextResponse } from "next/server";
import { db, followUpDrafts, and, eq } from "@resonance/db";
import { auth } from "@/lib/auth";
import { updateFollowUpSchema } from "@resonance/types";

type RouteParams = { params: Promise<{ id: string; followUpId: string }> };

/** PUT /api/applications/[id]/follow-ups/[followUpId] — update a draft. */
export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { followUpId } = await params;
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateFollowUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const [updated] = await db
    .update(followUpDrafts)
    .set(updates)
    .where(
      and(eq(followUpDrafts.id, followUpId), eq(followUpDrafts.userId, userId)),
    )
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Follow-up draft not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}
