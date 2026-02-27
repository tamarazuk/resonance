import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { db, applications, and, eq } from "@resonance/db";
import { auth } from "@/lib/auth";
import { rankExperiencesByFit } from "@/lib/analysis/fit";

type RouteParams = { params: Promise<{ id: string }> };

const SYSTEM_PROMPT = `You are an expert resume writer and career coach.

Given a job description, candidate experiences, and fit analysis, write a compelling cover letter.

Guidelines:
- Write 3-4 professional paragraphs
- Opening: Hook connecting candidate to company/role with enthusiasm
- Body 1-2: Highlight matching experiences with specific results and quantifiable achievements
- Closing: Express enthusiasm, summarize fit, and include a call to action

Write naturally without any JSON formatting - just write the cover letter text directly.`;

export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

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

  let ranked;
  try {
    ranked = await rankExperiencesByFit(application.parsedJD, userId, 5);
  } catch {
    return NextResponse.json(
      { error: "Failed to rank experiences" },
      { status: 500 },
    );
  }

  const topExperiences = ranked.map((s) => s.experience);

  const experienceText = topExperiences
    .map((exp, i) => {
      const star = exp.starStructure;
      return star
        ? `${i + 1}. ${star.action} → ${star.result}`
        : `${i + 1}. ${exp.rawInput}`;
    })
    .join("\n");

  const userPrompt = `## Job Description
Title: ${application.parsedJD.title}
Company: ${application.parsedJD.company}
Key Skills: ${application.parsedJD.skills.join(", ")}
Requirements: ${application.parsedJD.requirements.join("; ")}

## Candidate Experiences
${experienceText}

## Fit Analysis
Score: ${application.fitAnalysis?.overallScore ?? "N/A"}/100
Strengths: ${application.fitAnalysis?.strengths.join(", ") ?? "N/A"}
Matching Skills: ${application.fitAnalysis?.matchingSkills.join(", ") ?? "N/A"}

Please write a professional cover letter tailored to this position.`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.4,
  });

  const stream = result.textStream;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let accumulatedText = "";

      try {
        for await (const chunk of stream) {
          accumulatedText += chunk;

          const sseData = JSON.stringify({
            type: "text",
            value: chunk,
            accumulated: accumulatedText,
          });
          controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        }

        const paragraphs = accumulatedText
          .split("\n\n")
          .filter((p) => p.trim())
          .map((p) => p.replace(/\n/g, " ").trim());

        const finishData = JSON.stringify({
          type: "finish",
          paragraphs,
        });
        controller.enqueue(encoder.encode(`data: ${finishData}\n\n`));
      } catch (error) {
        const errorData = JSON.stringify({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while streaming the cover letter.",
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
