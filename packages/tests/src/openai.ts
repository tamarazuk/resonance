import type { LLMResponse } from "@resonance/types";

export interface MockChatCompletionOptions {
  content?: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface MockEmbeddingOptions {
  text?: string;
  dimensions?: number;
  seed?: number;
  rng?: () => number;
}

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates mock embedding vectors.
 * Defaults to Math.random() but supports deterministic output via seed/rng.
 */
function generateEmbeddingVector(
  dimensions = 1536,
  rng: () => number = Math.random,
): number[] {
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    vector.push(rng() * 2 - 1);
  }
  return vector;
}

export function createMockChatCompletion(
  options: MockChatCompletionOptions = {},
) {
  const {
    content = "Mocked response",
    model = "gpt-4o-mini",
    usage = {},
  } = options;

  return {
    id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: usage.promptTokens ?? 10,
      completion_tokens: usage.completionTokens ?? 20,
      total_tokens: usage.totalTokens ?? 30,
    },
  };
}

export function createMockEmbedding(
  options: MockEmbeddingOptions = {},
): number[] {
  const { dimensions = 1536, seed, rng } = options;
  const random =
    rng ?? (seed === undefined ? Math.random : createSeededRng(seed));
  return generateEmbeddingVector(dimensions, random);
}

export function createMockEmbeddings(
  texts: string[],
  dimensions = 1536,
  options: Pick<MockEmbeddingOptions, "seed" | "rng"> = {},
): { index: number; embedding: number[] }[] {
  const random =
    options.rng ??
    (options.seed === undefined ? Math.random : createSeededRng(options.seed));
  return texts.map((_, index) => ({
    index,
    embedding: generateEmbeddingVector(dimensions, random),
  }));
}

export function createMockOpenAI(): {
  chat: {
    completions: {
      create: (
        options?: Record<string, unknown>,
      ) => Promise<ReturnType<typeof createMockChatCompletion>>;
    };
  };
  embeddings: {
    create: (options: {
      input: string | string[];
      dimensions?: number;
    }) => Promise<{
      object: string;
      data: { index: number; embedding: number[] }[];
      model: string;
      usage: { prompt_tokens: number; total_tokens: number };
    }>;
  };
} {
  const chat = {
    completions: {
      /**
       * Creates a mock chat completion response.
       * @remarks This is a simplified mock that ignores input options and returns
       * a default response. For tests requiring custom behavior, use `createMockChatCompletion`
       * directly with desired options.
       */
      create: async (): Promise<
        ReturnType<typeof createMockChatCompletion>
      > => {
        return createMockChatCompletion();
      },
    },
  };

  const embeddings = {
    create: async ({
      input,
      dimensions,
    }: {
      input: string | string[];
      dimensions?: number;
    }) => {
      const texts = Array.isArray(input) ? input : [input];
      return {
        object: "list",
        data: createMockEmbeddings(texts, dimensions),
        model: "text-embedding-3-small",
        usage: {
          prompt_tokens: texts.length * 10,
          total_tokens: texts.length * 10,
        },
      };
    },
  };

  return { chat, embeddings };
}

export function mockSuccessfulResponse<T>(
  data: T,
  tokensUsed?: number,
): LLMResponse<T> {
  return { success: true, data, tokensUsed };
}

export function mockFailedResponse(error: string): LLMResponse<never> {
  return { success: false, error };
}
