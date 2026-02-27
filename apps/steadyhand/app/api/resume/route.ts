import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { auth } from "@/lib/auth";

const EXTRACT_EXPERIENCES_SYSTEM_PROMPT = `You are an expert resume parser. Your task is to extract professional work experiences from resume text.

For each experience, extract:
- rawInput: A 2-4 sentence summary of the role/responsibility/achievement, written in first person
- situation: The context/background of the work
- task: The challenge or objective
- action: What you specifically did, written in first person (use "I"/"me"/"my" and convert any third-person or name-based descriptions into first-person)
- result: Measurable outcomes and impact
- skills: Technical and soft skills demonstrated

Return a JSON array of experiences. Focus on substantive roles with clear accomplishments. Ensure that all descriptions are written from the candidate's first-person perspective, even if the original resume is written in third person.`;

const EXTRACT_EXPERIENCES_USER_PROMPT = `Extract all professional work experiences from this resume text. Return a JSON array with the structure described above.

Resume text:
---RESUME_START---
{resumeText}
---RESUME_END---`;

const ExperienceSchema = z.object({
  rawInput: z.string().min(10),
  situation: z.string().optional(),
  task: z.string().optional(),
  action: z.string().optional(),
  result: z.string().optional(),
  skills: z.array(z.string()),
});

const ExperiencesResponseSchema = z.array(ExperienceSchema);
const LLM_TIMEOUT_MS = 30_000;
const PDF_SIGNATURE = "%PDF";
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

function hasPdfSignature(buffer: Buffer): boolean {
  return (
    buffer.length >= PDF_SIGNATURE.length &&
    buffer.subarray(0, PDF_SIGNATURE.length).toString("ascii") === PDF_SIGNATURE
  );
}

function hasZipSignature(buffer: Buffer): boolean {
  return (
    buffer.length >= ZIP_SIGNATURE.length &&
    buffer.subarray(0, 4).equals(ZIP_SIGNATURE)
  );
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // @ts-expect-error pdf-parse ESM types are incomplete
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const extractionMessages = result.messages ?? [];
    const extractionWarnings = extractionMessages.filter(
      (message) => message.type === "warning",
    );
    const extractionErrors = extractionMessages.filter(
      (message) => message.type === "error",
    );

    if (extractionWarnings.length > 0) {
      console.warn("Mammoth extraction warnings", {
        count: extractionWarnings.length,
      });
    }

    if (extractionErrors.length > 0) {
      console.error("Mammoth extraction errors", {
        count: extractionErrors.length,
      });
    }
    return result.value;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to extract text from DOCX: ${errorMessage}`);
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are allowed" },
        { status: 400 },
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "application/pdf" && !hasPdfSignature(buffer)) {
      return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
    }

    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      !hasZipSignature(buffer)
    ) {
      return NextResponse.json({ error: "Invalid DOCX file" }, { status: 400 });
    }

    let resumeText: string;

    if (file.type === "application/pdf") {
      resumeText = await extractTextFromPDF(buffer);
    } else {
      resumeText = await extractTextFromDOCX(buffer);
    }

    if (!resumeText || resumeText.trim().length < 200) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from file. The resume may be image-based or corrupted.",
        },
        { status: 400 },
      );
    }

    const userPrompt = EXTRACT_EXPERIENCES_USER_PROMPT.replace(
      "{resumeText}",
      resumeText.replace(/---RESUME_START---|---RESUME_END---/g, ""),
    );

    const { text: content } = await generateText({
      model: openai("gpt-4o"),
      system: EXTRACT_EXPERIENCES_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.3,
      abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    });

    if (!content) {
      return NextResponse.json(
        { error: "Failed to parse resume" },
        { status: 500 },
      );
    }

    const jsonContent = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse resume - invalid JSON response" },
        { status: 500 },
      );
    }

    const validation = ExperiencesResponseSchema.safeParse(parsed);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Failed to parse resume - invalid experience format" },
        { status: 400 },
      );
    }

    const experiences = validation.data;

    return NextResponse.json({ experiences });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      return NextResponse.json(
        { error: "Resume parsing timed out. Please try again." },
        { status: 504 },
      );
    }

    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error("Resume parsing error", { errorName });
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 },
    );
  }
}
