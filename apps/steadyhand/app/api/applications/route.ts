import { NextResponse } from "next/server"
import { db, applications, desc, eq } from "@resonance/db"
import { createApplicationSchema } from "@resonance/types"
import { auth } from "@/lib/auth"
import { scrapeJobPosting } from "@/lib/scraper"
import { parseJobDescription } from "@/lib/llm/prompts/jd-parser"
import { generateEmbedding } from "@/lib/llm/embeddings"

/** GET /api/applications — list all applications for the authenticated user. */
export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, session.user.id))
    .orderBy(desc(applications.createdAt))

  return NextResponse.json(rows)
}

/**
 * POST /api/applications — create a new application.
 * Scrapes the job posting URL, parses the JD via LLM, and generates an embedding.
 */
export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createApplicationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { externalUrl } = parsed.data

  // 1. Scrape the job posting
  const scrapeResult = await scrapeJobPosting(externalUrl)

  if (!scrapeResult.success || !scrapeResult.markdown) {
    return NextResponse.json(
      { error: "Failed to scrape job posting", details: scrapeResult.error },
      { status: 422 },
    )
  }

  // 2. Parse the JD via LLM
  const parseResult = await parseJobDescription(scrapeResult.markdown)

  if (!parseResult.success || !parseResult.data) {
    return NextResponse.json(
      { error: "Failed to parse job description", details: parseResult.error },
      { status: 422 },
    )
  }

  // 3. Generate embedding from parsed JD
  const embeddingText = [
    parseResult.data.title,
    parseResult.data.requirements.join(". "),
    parseResult.data.responsibilities.join(". "),
    parseResult.data.skills.join(", "),
  ].join("\n")

  const embedding = await generateEmbedding(embeddingText)

  // 4. Insert into DB
  const [application] = await db
    .insert(applications)
    .values({
      userId: session.user.id,
      externalUrl,
      rawHtml: scrapeResult.rawHtml ?? null,
      parsedJD: parseResult.data,
      embedding,
    })
    .returning()

  return NextResponse.json(application, { status: 201 })
}
