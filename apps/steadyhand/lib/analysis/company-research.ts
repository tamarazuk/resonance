import { z } from "zod";
import type { CompanyResearch, LLMResponse } from "@resonance/types";
import { completeStructured } from "../llm/client";
import Firecrawl from "@mendable/firecrawl-js";

let _client: Firecrawl | null = null;

function getFirecrawlClient(): Firecrawl | null {
  if (!_client) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) return null;
    _client = new Firecrawl({ apiKey });
  }
  return _client;
}

const companyResearchSchema = z.object({
  overview: z.string(),
  culture: z.string(),
  recentNews: z.string(),
  industry: z.string(),
  size: z.string(),
});

const SYSTEM_PROMPT = `You are a company research analyst helping a job candidate prepare for an interview.

Given information about a company (either from their website or from your general knowledge), produce a concise research brief covering:

- overview: 2-3 sentence summary of what the company does, their mission, and market position
- culture: What their work culture is like, values they emphasize, team dynamics
- recentNews: Any recent developments, product launches, funding, or notable events (say "No recent news available" if unknown)
- industry: The industry/sector they operate in and key trends
- size: Approximate company size (employees, stage like startup/enterprise)

Be factual and concise. If information is limited, note what's uncertain rather than fabricating. Respond with valid JSON.`;

/**
 * Attempt to scrape a company website via Firecrawl for research context.
 * Returns the scraped markdown content, or null on failure.
 */
async function scrapeCompanyWebsite(
  companyName: string,
): Promise<string | null> {
  const client = getFirecrawlClient();
  if (!client) return null;

  // Try common URL patterns
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
  const urlsToTry = [`https://www.${slug}.com`, `https://${slug}.com`];

  for (const url of urlsToTry) {
    try {
      const doc = await client.scrape(url, {
        formats: ["markdown"],
      });
      if (doc.markdown && doc.markdown.length > 100) {
        // Truncate to avoid token overflow
        return doc.markdown.slice(0, 4000);
      }
    } catch {
      // Try next URL
    }
  }

  return null;
}

/**
 * Research a company using Firecrawl scraping with LLM fallback.
 *
 * 1. Try to scrape the company website via Firecrawl
 * 2. Pass scraped content (or just the company name) to the LLM for structured analysis
 */
export async function researchCompany(
  companyName: string,
  companyUrl?: string,
): Promise<LLMResponse<CompanyResearch>> {
  // Try scraping the company website
  let scrapedContent: string | null = null;

  if (companyUrl) {
    const client = getFirecrawlClient();
    if (client) {
      try {
        const doc = await client.scrape(companyUrl, {
          formats: ["markdown"],
        });
        if (doc.markdown && doc.markdown.length > 100) {
          scrapedContent = doc.markdown.slice(0, 4000);
        }
      } catch {
        // Fall through to company name scraping
      }
    }
  }

  if (!scrapedContent) {
    scrapedContent = await scrapeCompanyWebsite(companyName);
  }

  const userPrompt = scrapedContent
    ? `## Company: ${companyName}

## Website Content (scraped)
${scrapedContent}

Based on the above website content, produce a research brief about ${companyName}.`
    : `## Company: ${companyName}

I don't have website content available. Based on your knowledge of ${companyName}, produce a research brief. Be clear about what you're uncertain about.`;

  return completeStructured<CompanyResearch>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
    parse: (raw) => companyResearchSchema.parse(JSON.parse(raw)),
  });
}
