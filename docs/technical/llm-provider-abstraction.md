# LLM Provider Abstraction Plan

> **Goal:** Enable seamless switching between multiple LLM providers (OpenAI, GLM-5, Groq, and others) with minimal code changes and configuration-based selection.

---

## Overview

### Current State
- Hardcoded dependency on OpenAI API
- Single provider for all LLM operations:
  - STAR structuring (chat completion)
  - JD parsing (chat completion)
  - Fit analysis (chat completion)
  - Cover letter drafting (chat completion)
  - Embeddings generation (text-embedding-3-small)

### Target State
- Provider-agnostic abstraction layer
- Configuration-driven provider selection
- Support for multiple providers:
  - **OpenAI** (gpt-4o, text-embedding-3-small)
  - **GLM-5** (glm-4, glm-embedding)
  - **Groq** (llama-3.1-70b-versatile, llama-3.1-8b-instant)
  - **Future:** Google Gemini, Anthropic Claude, local models
- Environment variable configuration
- Graceful fallbacks and error handling
- Cost tracking per provider

---

## Architecture Design

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  (STAR structuring, JD parsing, fit analysis, etc.)    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              LLM Service Abstraction                     │
│  - Unified interface for completions & embeddings       │
│  - Type-safe request/response models                    │
│  - Retry logic & error handling                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Provider Factory                            │
│  - Reads LLM_PROVIDER from env                          │
│  - Instantiates correct provider adapter                │
│  - Manages provider-specific configuration              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
   ┌────▼───┐   ┌───▼────┐   ┌───▼────┐   ┌───▼────┐
   │ OpenAI │   │  GLM5  │   │  Groq  │   │ Future │
   │ Adapter│   │Adapter │   │Adapter │   │  ...   │
   └────────┘   └────────┘   └────────┘   └────────┘
```

### Key Components

#### 1. Provider Interface (lib/llm/types.ts)
```typescript
interface LLMProvider {
  // Chat completions
  complete(params: CompletionParams): Promise<CompletionResponse>
  completeStream(params: CompletionParams): AsyncIterator<CompletionChunk>
  
  // Embeddings
  embed(texts: string[]): Promise<number[][]>
  
  // Provider info
  getName(): string
  getModelInfo(): ModelInfo
}
```

#### 2. Provider Factory (lib/llm/factory.ts)
```typescript
function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config)
    case 'glm5':
      return new GLM5Provider(config)
    case 'groq':
      return new GroqProvider(config)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
```

#### 3. Provider Adapters (lib/llm/providers/*)
- `openai.ts` - OpenAI implementation
- `glm5.ts` - GLM-5 implementation (OpenAI-compatible)
- `groq.ts` - Groq implementation (OpenAI-compatible)
- `base.ts` - Shared functionality

---

## Provider Support Matrix

| Provider | Chat Models | Embedding Models | API Format | Cost | Free Tier |
|----------|-------------|------------------|------------|------|-----------|
| **OpenAI** | gpt-4o, gpt-4o-mini | text-embedding-3-small | Native | $$$ | $5-18 credits (3 months) |
| **GLM-5** | glm-4, glm-4-flash | glm-embedding | OpenAI-compatible | $ | Affordable pricing |
| **Groq** | llama-3.1-70b, llama-3.1-8b | N/A (use other) | OpenAI-compatible | FREE | 14M tokens/week |
| **Together** | multiple | multiple | OpenAI-compatible | $ | Free credits |
| **Ollama** | llama-3.1, mistral | nomic-embedtext | OpenAI-compatible | FREE | Local (unlimited) |

### Recommended Configurations

#### Budget Configuration (FREE)
```
LLM_PROVIDER=mixed
LLM_CHAT_PROVIDER=groq          # Free, fast
LLM_EMBEDDING_PROVIDER=local    # Use local embedding or skip
```

#### Budget Configuration (Cheap)
```
LLM_PROVIDER=mixed
LLM_CHAT_PROVIDER=groq          # Free for chat
LLM_EMBEDDING_PROVIDER=openai   # $0.02/1M tokens (very cheap)
```

#### GLM-5 Configuration (Cost-Effective)
```
LLM_PROVIDER=glm5
GLM5_API_KEY=your_key
GLM5_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
```

#### OpenAI Configuration (Premium)
```
LLM_PROVIDER=openai
OPENAI_API_KEY=your_key
```

---

## Implementation Plan

### Phase 1: Foundation (Priority: HIGH)

#### Step 1.1: Create Type Definitions
**File:** `lib/llm/types.ts`

Define interfaces for:
- `LLMProvider` interface
- `CompletionParams` / `CompletionResponse`
- `EmbeddingParams` / `EmbeddingResponse`
- `ProviderConfig` / `ModelConfig`
- `ProviderType` enum

#### Step 1.2: Create Provider Factory
**File:** `lib/llm/factory.ts`

Implement:
- Provider factory function
- Configuration parsing from environment
- Provider validation
- Default provider selection

#### Step 1.3: Create Base Provider Class
**File:** `lib/llm/providers/base.ts`

Implement:
- Abstract base class implementing `LLMProvider`
- Shared error handling
- Retry logic with exponential backoff
- Token counting utilities
- Cost tracking (optional)

### Phase 2: Provider Implementations (Priority: HIGH)

#### Step 2.1: OpenAI Provider
**File:** `lib/llm/providers/openai.ts`

- Refactor existing OpenAI code into adapter
- Support streaming and non-streaming
- Embedding support
- Error mapping

#### Step 2.2: GLM-5 Provider
**File:** `lib/llm/providers/glm5.ts`

- OpenAI-compatible implementation
- Custom base URL: `https://open.bigmodel.cn/api/paas/v4/`
- Model mapping: glm-4, glm-4-flash
- Embedding support via glm-embedding

#### Step 2.3: Groq Provider
**File:** `lib/llm/providers/groq.ts`

- OpenAI-compatible implementation
- Custom base URL: `https://api.groq.com/openai/v1`
- Model mapping: llama-3.1-70b-versatile, llama-3.1-8b-instant
- No native embeddings (fallback to other provider)

### Phase 3: Configuration System (Priority: MEDIUM)

#### Step 3.1: Environment Variables
**File:** `.env.example` (update)

```bash
# LLM Provider Configuration
LLM_PROVIDER=openai  # Options: openai, glm5, groq, mixed

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxx
OPENAI_MODEL=gpt-4o  # Optional: defaults to gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# GLM-5 Configuration
GLM5_API_KEY=xxx
GLM5_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
GLM5_MODEL=glm-4  # Optional: defaults to glm-4

# Groq Configuration
GROQ_API_KEY=gsk_xxx
GROQ_MODEL=llama-3.1-70b-versatile

# Mixed Provider Configuration (when LLM_PROVIDER=mixed)
LLM_CHAT_PROVIDER=groq
LLM_EMBEDDING_PROVIDER=openai
```

#### Step 3.2: Configuration Validation
**File:** `lib/llm/config.ts`

- Environment variable validation
- Required vs optional config per provider
- Helpful error messages for missing config

### Phase 4: Application Integration (Priority: MEDIUM)

#### Step 4.1: Update LLM Client
**File:** `lib/llm/client.ts`

Replace hardcoded OpenAI with:
```typescript
import { createProvider } from './factory'

const provider = createProvider({
  provider: process.env.LLM_PROVIDER || 'openai',
  // ... provider-specific config
})

// Use provider.complete(), provider.embed(), etc.
```

#### Step 4.2: Update Feature Modules
**Files:**
- `lib/llm/prompts/star.ts`
- `lib/llm/prompts/jd-parser.ts`
- `lib/llm/prompts/fit-analysis.ts`
- `lib/llm/prompts/drafting.ts`
- `lib/llm/embeddings.ts`

Replace direct OpenAI calls with provider abstraction

#### Step 4.3: Update API Routes
**Files:**
- `app/api/experiences/route.ts`
- `app/api/applications/route.ts`
- `app/api/applications/[id]/draft/route.ts`

Ensure streaming works with all providers

### Phase 5: Testing & Validation (Priority: MEDIUM)

#### Step 5.1: Provider Tests
**File:** `lib/llm/__tests__/providers.test.ts`

Test:
- Each provider instantiation
- Completion calls
- Embedding calls
- Error handling
- Configuration validation

#### Step 5.2: Integration Tests
**File:** `lib/llm/__tests__/integration.test.ts`

Test:
- Full STAR structuring flow
- JD parsing flow
- Fit analysis flow
- Cover letter generation

#### Step 5.3: Manual Testing Checklist

For each provider:
- [ ] Can create experience (STAR formatting)
- [ ] Can parse job description
- [ ] Can generate fit analysis
- [ ] Can generate cover letter
- [ ] Can generate embeddings
- [ ] Streaming works correctly
- [ ] Error messages are helpful

---

## File Structure

```
lib/llm/
├── types.ts                    # Interfaces and types
├── factory.ts                  # Provider factory
├── config.ts                   # Configuration validation
├── client.ts                   # Main LLM client (refactored)
├── providers/
│   ├── base.ts                 # Abstract base class
│   ├── openai.ts               # OpenAI adapter
│   ├── glm5.ts                 # GLM-5 adapter
│   ├── groq.ts                 # Groq adapter
│   └── index.ts                # Export all providers
├── prompts/
│   ├── star.ts                 # STAR formatting (update)
│   ├── jd-parser.ts            # JD parsing (update)
│   ├── fit-analysis.ts         # Fit analysis (update)
│   └── drafting.ts             # Cover letter (update)
├── embeddings.ts               # Embeddings (update)
└── __tests__/
    ├── providers.test.ts       # Provider tests
    └── integration.test.ts     # Integration tests
```

---

## Environment Variables Reference

### Core Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_PROVIDER` | No | `openai` | Primary LLM provider |
| `LLM_CHAT_PROVIDER` | No | - | Chat model provider (for mixed mode) |
| `LLM_EMBEDDING_PROVIDER` | No | - | Embedding provider (for mixed mode) |

### OpenAI Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o` | Chat model to use |
| `OPENAI_EMBEDDING_MODEL` | No | `text-embedding-3-small` | Embedding model |
| `OPENAI_BASE_URL` | No | - | Custom base URL (for proxies) |

*Required when `LLM_PROVIDER=openai` or `LLM_EMBEDDING_PROVIDER=openai`

### GLM-5 Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GLM5_API_KEY` | Yes* | - | GLM-5 API key |
| `GLM5_BASE_URL` | No | `https://open.bigmodel.cn/api/paas/v4/` | GLM API endpoint |
| `GLM5_MODEL` | No | `glm-4` | Chat model to use |
| `GLM5_EMBEDDING_MODEL` | No | `glm-embedding` | Embedding model |

*Required when `LLM_PROVIDER=glm5`

### Groq Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes* | - | Groq API key |
| `GROQ_MODEL` | No | `llama-3.1-70b-versatile` | Chat model to use |
| `GROQ_BASE_URL` | No | `https://api.groq.com/openai/v1` | Groq API endpoint |

*Required when `LLM_PROVIDER=groq` or `LLM_CHAT_PROVIDER=groq`

---

## Cost Analysis

### Monthly Cost Estimates (Light Usage - 100 JD analyses/month)

| Provider | Chat Cost | Embedding Cost | Total/Month |
|----------|-----------|----------------|-------------|
| **OpenAI** | ~$2.00 | ~$0.20 | ~$2.20 |
| **GLM-5** | ~$0.50 | ~$0.10 | ~$0.60 |
| **Groq + OpenAI embeddings** | $0.00 | ~$0.20 | ~$0.20 |
| **Groq only (no embeddings)** | $0.00 | $0.00 | $0.00 |

### Monthly Cost Estimates (Heavy Usage - 500 JD analyses/month)

| Provider | Chat Cost | Embedding Cost | Total/Month |
|----------|-----------|----------------|-------------|
| **OpenAI** | ~$10.00 | ~$1.00 | ~$11.00 |
| **GLM-5** | ~$2.50 | ~$0.50 | ~$3.00 |
| **Groq + OpenAI embeddings** | $0.00 | ~$1.00 | ~$1.00 |
| **Groq only (no embeddings)** | $0.00 | $0.00 | $0.00 |

**Note:** Embeddings are very cheap. Even with OpenAI, 1M tokens = $0.02. You'd need to process ~50,000 job descriptions to spend $1 on embeddings.

---

## Migration Strategy

### Phase 1: Parallel Implementation
- Keep existing OpenAI code working
- Add new abstraction layer alongside
- No breaking changes to features

### Phase 2: Gradual Migration
- Migrate one feature at a time:
  1. STAR formatting (low risk)
  2. JD parsing (medium risk)
  3. Fit analysis (medium risk)
  4. Cover letter generation (high risk)
  5. Embeddings (low risk)

### Phase 3: Cutover
- Update default provider in `.env.example`
- Remove hardcoded OpenAI references
- Update documentation

### Rollback Plan
- If issues arise, set `LLM_PROVIDER=openai`
- All existing functionality continues to work
- No database changes required

---

## Edge Cases & Considerations

### 1. Embedding Compatibility
- **Problem:** Different embedding models have different dimensions
- **Solution:** 
  - Option A: Use same provider for all embeddings (recommended)
  - Option B: Store embedding model metadata, re-embed on provider switch
  - Option C: Use provider-agnostic embeddings (e.g., local model)

### 2. Streaming Compatibility
- **Problem:** Not all providers support streaming
- **Solution:** 
  - Implement fallback to non-streaming
  - Check `supportsStreaming()` on provider
  - Graceful degradation

### 3. Model Context Windows
- **Problem:** Different models have different context limits
- **Solution:**
  - Track context window per provider
  - Implement automatic chunking for long inputs
  - Warn user if input exceeds limits

### 4. Response Format Differences
- **Problem:** JSON mode quality varies by provider
- **Solution:**
  - Provider-specific prompt tuning
  - Robust JSON parsing with retries
  - Fallback to text parsing

### 5. Rate Limits
- **Problem:** Different providers have different rate limits
- **Solution:**
  - Implement exponential backoff
  - Track rate limits per provider
  - Queue requests if needed

---

## Future Enhancements

### Phase 6: Advanced Features (Nice to Have)

1. **Automatic Provider Fallback**
   - Try primary provider, fall back to secondary on failure
   - Configuration: `LLM_FALLBACK_PROVIDER=glm5`

2. **Cost Tracking**
   - Log token usage per request
   - Calculate costs per provider
   - Dashboard showing monthly spend

3. **A/B Testing**
   - Route percentage of traffic to different providers
   - Compare quality and cost
   - Configuration: `LLM_AB_TEST_SPLIT=0.5`

4. **Local Model Support**
   - Ollama integration for completely free usage
   - Configuration: `LLM_PROVIDER=ollama`

5. **Model Selection per Task**
   - Use cheaper model for simple tasks
   - Use expensive model for complex analysis
   - Configuration: `STAR_MODEL=glm-4-flash`, `FIT_MODEL=gpt-4o`

6. **Response Caching**
   - Cache identical requests
   - Reduce API calls and costs
   - Use Redis or database for cache storage

---

## Success Criteria

### Must Have (MVP)
- [ ] Can switch providers via environment variable
- [ ] OpenAI, GLM-5, and Groq all work
- [ ] All existing features continue to work
- [ ] Clear error messages for missing configuration
- [ ] Documentation updated

### Should Have
- [ ] Streaming works for all providers
- [ ] Embeddings work with all providers
- [ ] Mixed provider mode works (Groq for chat, OpenAI for embeddings)
- [ ] Cost estimates in documentation
- [ ] Integration tests pass for all providers

### Nice to Have
- [ ] Automatic provider fallback
- [ ] Cost tracking dashboard
- [ ] A/B testing support
- [ ] Local model support (Ollama)
- [ ] Response caching

---

## Timeline Estimate

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Foundation | 2-3 hours | HIGH |
| Phase 2: Provider Implementations | 3-4 hours | HIGH |
| Phase 3: Configuration System | 1-2 hours | MEDIUM |
| Phase 4: Application Integration | 2-3 hours | MEDIUM |
| Phase 5: Testing & Validation | 2-3 hours | MEDIUM |
| **Total** | **10-15 hours** | |

**Can be done incrementally:** Start with OpenAI + Groq support (Phase 1-2), then add GLM-5 and advanced features later.

---

## Next Steps

1. **Review this plan** and decide on priorities
2. **Choose initial providers** (recommend: OpenAI + Groq)
3. **Obtain API keys:**
   - Groq: https://console.groq.com/
   - GLM-5: https://open.bigmodel.cn/
4. **Begin Phase 1 implementation**
5. **Test with your chosen providers**
6. **Iterate based on results**

---

## Questions to Resolve

Before starting implementation, clarify:

1. **Embedding strategy:** 
   - Use same provider for chat and embeddings?
   - Allow mixed providers?
   - Use local embeddings?

2. **Streaming priority:**
   - Is streaming essential for MVP?
   - Can we start with non-streaming and add later?

3. **Provider priority:**
   - Which 2 providers to implement first?
   - Recommendation: OpenAI (existing) + Groq (free)

4. **Cost tolerance:**
   - What's the maximum monthly budget?
   - Should we implement cost tracking from day 1?

5. **Testing approach:**
   - Manual testing only?
   - Automated integration tests?
   - Mock provider for unit tests?

---

## Conclusion

This abstraction layer will give you:
- ✅ **Flexibility:** Switch providers based on cost/quality needs
- ✅ **Cost control:** Use free providers (Groq) when budget is tight
- ✅ **Future-proof:** Easy to add new providers as they emerge
- ✅ **Reliability:** Fallback options if one provider has issues
- ✅ **Testing:** Compare providers to find the best fit

The implementation is straightforward and can be done incrementally, starting with the providers you have access to today.