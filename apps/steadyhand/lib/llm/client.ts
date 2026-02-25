import OpenAI from "openai"
import type { LLMResponse } from "@resonance/types"

const DEFAULT_MODEL = "gpt-4o-mini"
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 500

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < retries - 1) {
        const delay = INITIAL_BACKOFF_MS * 2 ** attempt
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

export interface CompletionOptions {
  model?: string
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

export async function complete(
  options: CompletionOptions,
): Promise<LLMResponse<string>> {
  const {
    model = DEFAULT_MODEL,
    systemPrompt,
    userPrompt,
    temperature = 0.3,
    maxTokens,
  } = options

  try {
    const response = await withRetry(() =>
      getClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
    )

    return {
      success: true,
      data: response.choices[0]?.message?.content ?? "",
      tokensUsed: response.usage?.total_tokens,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown LLM error",
    }
  }
}

export interface StructuredOutputOptions<T> {
  model?: string
  systemPrompt: string
  userPrompt: string
  temperature?: number
  parse: (raw: string) => T
}

export async function completeStructured<T>(
  options: StructuredOutputOptions<T>,
): Promise<LLMResponse<T>> {
  const result = await complete({
    model: options.model,
    systemPrompt: options.systemPrompt,
    userPrompt: options.userPrompt,
    temperature: options.temperature,
  })

  if (!result.success || result.data === undefined) {
    return { success: false, error: result.error }
  }

  try {
    const parsed = options.parse(result.data)
    return { success: true, data: parsed, tokensUsed: result.tokensUsed }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse LLM output",
    }
  }
}

export async function* streamCompletion(
  options: CompletionOptions,
): AsyncGenerator<string, void, unknown> {
  const {
    model = DEFAULT_MODEL,
    systemPrompt,
    userPrompt,
    temperature = 0.3,
  } = options

  const stream = await withRetry(() =>
    getClient().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      stream: true,
    }),
  )

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}
