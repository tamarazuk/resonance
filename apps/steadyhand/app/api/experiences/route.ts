import { NextResponse } from "next/server";
import { db, experiences, desc, eq } from "@resonance/db";
import { createExperienceSchema } from "@resonance/types";
import { auth } from "@/lib/auth";
import { generateEmbedding } from "@/lib/llm/embeddings";
import { normalizeStar, toExperience } from "./utils";

/** GET /api/experiences — list all experiences for the authenticated user. */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.userId, session.user.id))
    .orderBy(desc(experiences.createdAt));

  return NextResponse.json(rows.map(toExperience));
}

/** POST /api/experiences — create a new experience from manual entry. */
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const parsed = createExperienceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const {
    rawInput,
    starStructure,
    situation: flatSituation,
    task: flatTask,
    action: flatAction,
    result: flatResult,
    skills: parsedSkills,
  } = parsed.data;

  const situation = normalizeStar(starStructure?.situation ?? flatSituation);
  const task = normalizeStar(starStructure?.task ?? flatTask);
  const action = normalizeStar(starStructure?.action ?? flatAction);
  const result = normalizeStar(starStructure?.result ?? flatResult);
  const skills = (parsedSkills ?? [])
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);

  // Generate embedding if all STAR fields are provided
  const hasAllStarFields = situation && task && action && result;
  let embedding: number[] | undefined;
  if (hasAllStarFields) {
    const embeddingText = [
      `Situation: ${situation}`,
      `Task: ${task}`,
      `Action: ${action}`,
      `Result: ${result}`,
      `Skills: ${skills.join(", ")}`,
    ].join("\n");
    try {
      embedding = await generateEmbedding(embeddingText);
    } catch (error) {
      console.error("Failed to generate embedding for new experience", error);
      embedding = undefined;
    }
  }

  const [created] = await db
    .insert(experiences)
    .values({
      userId: session.user.id,
      rawInput,
      situation: situation ?? null,
      task: task ?? null,
      action: action ?? null,
      result: result ?? null,
      skills,
      embedding: embedding ?? null,
    })
    .returning();

  if (!created) {
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 },
    );
  }

  return NextResponse.json(toExperience(created), { status: 201 });
}
