import { NextResponse } from "next/server"
import { db, applications, and, eq } from "@resonance/db"
import { auth } from "@/lib/auth"

type RouteParams = { params: Promise<{ id: string }> }

/** GET /api/applications/[id] — get a single application by ID. */
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

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

  return NextResponse.json(application)
}

/** DELETE /api/applications/[id] — delete an application. */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [deleted] = await db
    .delete(applications)
    .where(
      and(
        eq(applications.id, id),
        eq(applications.userId, session.user.id),
      ),
    )
    .returning({ id: applications.id })

  if (!deleted) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}
