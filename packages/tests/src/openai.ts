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
}

function generateEmbeddingVector(dimensions = 1536): number[] {
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    vector.push(Math.random() * 2 - 1);
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
    created: Date.now(),
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
  const { dimensions = 1536 } = options;
  return generateEmbeddingVector(dimensions);
}

export function createMockEmbeddings(
  texts: string[],
  dimensions = 1536,
): { index: number; embedding: number[] }[] {
  return texts.map((_, index) => ({
    index,
    embedding: generateEmbeddingVector(dimensions),
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
