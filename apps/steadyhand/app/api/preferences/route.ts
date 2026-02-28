import { NextResponse } from "next/server";
import { db, users, eq } from "@resonance/db";
import type { UserPreferences } from "@resonance/types";
import { auth } from "@/lib/auth";
import { updatePreferencesSchema } from "@resonance/types";

function toPreferences(row: typeof users.$inferSelect): UserPreferences {
  return {
    consentAnalytics: row.consentAnalytics,
    consentAiTraining: row.consentAiTraining,
    consentMarketing: row.consentMarketing,
    emotionalIntelligenceEnabled: row.emotionalIntelligenceEnabled,
  };
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(toPreferences(row));
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updatePreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const updates = parsed.data;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "At least one preference field is required" },
      { status: 400 },
    );
  }

  const [row] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, session.user.id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(toPreferences(row));
}
