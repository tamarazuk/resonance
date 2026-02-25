import Firecrawl from "@mendable/firecrawl-js"

let _client: Firecrawl | null = null

function getClient(): Firecrawl {
  if (!_client) {
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY environment variable is not set")
    }
    _client = new Firecrawl({ apiKey })
  }
  return _client
}

export interface ScrapeResult {
  success: boolean
  markdown?: string
  rawHtml?: string
  error?: string
}

export async function scrapeJobPosting(url: string): Promise<ScrapeResult> {
  try {
    const doc = await getClient().scrape(url, {
      formats: ["markdown", "rawHtml"],
    })

    return {
      success: true,
      markdown: doc.markdown,
      rawHtml: doc.rawHtml,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown scraper error",
    }
  }
}
