import { NextResponse } from "next/server";
import { db, experiences, and, eq } from "@resonance/db";
import { updateExperienceSchema } from "@resonance/types";
import { auth } from "@/lib/auth";
import { generateEmbedding } from "@/lib/llm/embeddings";
import { normalizeStar, toExperience } from "../utils";

type RouteParams = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET /api/experiences/[id] — get a single experience by ID. */
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { error: "Invalid experience ID" },
      { status: 400 },
    );
  }

  const [experience] = await db
    .select()
    .from(experiences)
    .where(
      and(eq(experiences.id, id), eq(experiences.userId, session.user.id)),
    );

  if (!experience) {
    return NextResponse.json(
      { error: "Experience not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(toExperience(experience));
}

/** PUT /api/experiences/[id] — update an experience. */
export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { error: "Invalid experience ID" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const parsed = updateExperienceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Fetch existing row to compare STAR fields for embedding regeneration
  const [existing] = await db
    .select()
    .from(experiences)
    .where(
      and(eq(experiences.id, id), eq(experiences.userId, session.user.id)),
    );

  if (!existing) {
    return NextResponse.json(
      { error: "Experience not found" },
      { status: 404 },
    );
  }

  const { rawInput, starStructure, skills } = parsed.data;

  // Flatten starStructure back to individual DB columns, normalizing blanks
  const situation = normalizeStar(
    starStructure?.situation ?? existing.situation,
  );
  const task = normalizeStar(starStructure?.task ?? existing.task);
  const action = normalizeStar(starStructure?.action ?? existing.action);
  const result = normalizeStar(starStructure?.result ?? existing.result);

  // Decision: Only regenerate the embedding when STAR fields change.
  // Embeddings are derived from semantic content (situation, task, action,
  // result). Changes to skills or rawInput alone don't alter the vector
  // representation used for similarity search in fit analysis and drafting.
  // If skills are later included in embedding text, update this logic.
  const starFieldsChanged =
    starStructure !== undefined &&
    (situation !== existing.situation ||
      task !== existing.task ||
      action !== existing.action ||
      result !== existing.result);

  let embedding = existing.embedding;
  if (starFieldsChanged) {
    if (situation && task && action && result) {
      const resolvedSkills = skills ?? existing.skills;
      const embeddingText = [
        `Situation: ${situation}`,
        `Task: ${task}`,
        `Action: ${action}`,
        `Result: ${result}`,
        `Skills: ${resolvedSkills.join(", ")}`,
      ].join("\n");
      try {
        embedding = await generateEmbedding(embeddingText);
      } catch {
        embedding = null;
      }
    } else {
      embedding = null;
    }
  }

  const [updated] = await db
    .update(experiences)
    .set({
      ...(rawInput !== undefined && { rawInput }),
      situation,
      task,
      action,
      result,
      ...(skills !== undefined && { skills }),
      embedding,
    })
    .where(and(eq(experiences.id, id), eq(experiences.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Experience not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(toExperience(updated));
}

/** DELETE /api/experiences/[id] — delete an experience. */
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { error: "Invalid experience ID" },
      { status: 400 },
    );
  }

  const [deleted] = await db
    .delete(experiences)
    .where(and(eq(experiences.id, id), eq(experiences.userId, session.user.id)))
    .returning({ id: experiences.id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Experience not found" },
      { status: 404 },
    );
  }

  return new Response(null, { status: 204 });
}
