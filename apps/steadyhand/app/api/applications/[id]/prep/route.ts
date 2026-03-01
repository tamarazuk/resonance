import { NextResponse } from "next/server";
import { db, applications, prepPackets, and, eq } from "@resonance/db";
import { auth } from "@/lib/auth";
import { rankExperiencesByFit } from "@/lib/analysis/fit";
import { researchCompany } from "@/lib/analysis/company-research";
import {
  predictQuestions,
  generateTalkingPoints,
  distillCalmMode,
} from "@/lib/llm/prompts/prep-engine";

type RouteParams = { params: Promise<{ id: string }> };

const PREP_PIPELINE_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

/** GET /api/applications/[id]/prep — retrieve existing prep packet. */
export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [packet] = await db
    .select()
    .from(prepPackets)
    .where(
      and(
        eq(prepPackets.applicationId, id),
        eq(prepPackets.userId, session.user.id),
      ),
    );

  if (!packet) {
    return NextResponse.json(
      { error: "No prep packet found" },
      { status: 404 },
    );
  }

  return NextResponse.json(packet);
}

/** POST /api/applications/[id]/prep — generate a prep packet for an interview. */
export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

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

  const parsedJD = application.parsedJD;

  let companyResearch:
    | Awaited<ReturnType<typeof researchCompany>>["data"]
    | null;
  let topExperiences: Awaited<
    ReturnType<typeof rankExperiencesByFit>
  >[number]["experience"][];
  let predictedQuestionsList: Awaited<
    ReturnType<typeof predictQuestions>
  >["data"] = [];
  let talkingPointsList: Awaited<
    ReturnType<typeof generateTalkingPoints>
  >["data"] = [];
  let calmModeData: Awaited<ReturnType<typeof distillCalmMode>>["data"] | null;

  try {
    // 1. Company research (Firecrawl + LLM fallback)
    const companyResult = await withTimeout(
      researchCompany(
        parsedJD.company,
        application.externalUrl !== "manual_entry"
          ? application.externalUrl
          : undefined,
      ),
      PREP_PIPELINE_TIMEOUT_MS,
      "Company research",
    );
    companyResearch = companyResult.success ? companyResult.data! : null;

    // 2. Rank user experiences by fit
    const rankedExperiences = await rankExperiencesByFit(parsedJD, userId);
    topExperiences = rankedExperiences.map((s) => s.experience);

    // 3. Predict interview questions
    const questionsResult = await withTimeout(
      predictQuestions(parsedJD, companyResearch),
      PREP_PIPELINE_TIMEOUT_MS,
      "Question prediction",
    );
    predictedQuestionsList = questionsResult.success
      ? questionsResult.data!
      : [];

    // Map predicted questions to closest Memory Bank stories
    if (predictedQuestionsList.length > 0 && topExperiences.length > 0) {
      predictedQuestionsList = predictedQuestionsList.map((q) => {
        // Simple heuristic: assign the first relevant experience
        const bestMatch = topExperiences[0];
        return {
          ...q,
          suggestedStoryId: bestMatch?.id,
          suggestedStoryPreview: bestMatch?.rawInput?.slice(0, 100),
        };
      });
    }

    // 4. Generate talking points
    const talkingPointsResult = await withTimeout(
      generateTalkingPoints(parsedJD, companyResearch, topExperiences),
      PREP_PIPELINE_TIMEOUT_MS,
      "Talking points generation",
    );
    talkingPointsList = talkingPointsResult.success
      ? talkingPointsResult.data!
      : [];

    // 5. Calm Mode distillation
    const calmModeResult = await withTimeout(
      distillCalmMode(talkingPointsList, topExperiences, parsedJD.company),
      PREP_PIPELINE_TIMEOUT_MS,
      "Calm mode distillation",
    );
    calmModeData = calmModeResult.success ? calmModeResult.data! : null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate prep packet";
    const status = message.includes("timed out") ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  // 6. Upsert the prep packet
  const [packet] = await db
    .insert(prepPackets)
    .values({
      userId,
      applicationId: id,
      companyResearch,
      predictedQuestions: predictedQuestionsList,
      talkingPoints: talkingPointsList,
      calmModeData,
    })
    .onConflictDoUpdate({
      target: [prepPackets.userId, prepPackets.applicationId],
      set: {
        companyResearch,
        predictedQuestions: predictedQuestionsList,
        talkingPoints: talkingPointsList,
        calmModeData,
      },
    })
    .returning();

  return NextResponse.json(packet);
}
