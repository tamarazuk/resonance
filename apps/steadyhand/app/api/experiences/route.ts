import { NextResponse } from "next/server";
import { db, experiences, desc, eq } from "@resonance/db";
import { createExperienceSchema } from "@resonance/types";
import { auth } from "@/lib/auth";
import { generateEmbedding } from "@/lib/llm/embeddings";
import { toExperience } from "./utils";

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

  const body = await req.json();
  const parsed = createExperienceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { rawInput } = parsed.data;
  const situation: string | undefined = body.situation;
  const task: string | undefined = body.task;
  const action: string | undefined = body.action;
  const result: string | undefined = body.result;
  const skills: string[] = Array.isArray(body.skills) ? body.skills : [];

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
    embedding = await generateEmbedding(embeddingText);
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

  return NextResponse.json(toExperience(created!), { status: 201 });
}
