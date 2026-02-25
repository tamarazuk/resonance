import OpenAI from "openai"

const EMBEDDING_MODEL = "text-embedding-3-small"
const EMBEDDING_DIMENSIONS = 1536

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data[0]?.embedding ?? []
}

export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) return []

  const response = await getClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding)
}

