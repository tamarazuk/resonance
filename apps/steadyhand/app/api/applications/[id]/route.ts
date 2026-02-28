import { NextResponse } from "next/server";
import { db, applications, and, eq } from "@resonance/db";
import { updateApplicationSchema } from "@resonance/types";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/applications/[id] — get a single application by ID. */
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [application] = await db
    .select()
    .from(applications)
    .where(
      and(eq(applications.id, id), eq(applications.userId, session.user.id)),
    );

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(application);
}

/** DELETE /api/applications/[id] — delete an application. */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(applications)
    .where(
      and(eq(applications.id, id), eq(applications.userId, session.user.id)),
    )
    .returning({ id: applications.id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}

/** PATCH /api/applications/[id] — update application fields (status). */
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: { body: ["Invalid JSON body"] },
      },
      { status: 400 },
    );
  }

  const parsed = updateApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!parsed.data.status) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: { status: ["Provide at least one updatable field"] },
      },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(applications)
    .set({
      status: parsed.data.status,
      updatedAt: new Date(),
    })
    .where(
      and(eq(applications.id, id), eq(applications.userId, session.user.id)),
    )
    .returning({
      id: applications.id,
      status: applications.status,
      updatedAt: applications.updatedAt,
    });

  if (!updated) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}
