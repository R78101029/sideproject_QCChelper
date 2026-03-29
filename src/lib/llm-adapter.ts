// LLM Adapter — abstraction layer for multiple LLM providers
// LLM_PROVIDER env var: 'claude' (default) | 'ollama' | 'openai-compatible'

export interface LLMMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LLMAdapter {
  stream(messages: LLMMessage[], systemPrompt: string): ReadableStream<Uint8Array>
  chat(systemPrompt: string, userMessage: string): Promise<string>
}

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude'

// ─── Claude Adapter ───────────────────────────────────────────────

function createClaudeAdapter(): LLMAdapter {
  // Lazy import to avoid loading when not needed
  return {
    stream(messages, systemPrompt) {
      // Re-use existing streamChat from claude.ts
      const { streamChat } = require('./claude')
      return streamChat({ messages, systemPrompt })
    },
    async chat(systemPrompt, userMessage) {
      const { chatOnce } = require('./claude')
      return chatOnce(systemPrompt, userMessage)
    },
  }
}

// ─── Ollama Adapter ───────────────────────────────────────────────

function createOllamaAdapter(): LLMAdapter {
  const baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3'
  const encoder = new TextEncoder()

  return {
    stream(messages, systemPrompt) {
      return new ReadableStream({
        async start(controller) {
          try {
            const res = await fetch(`${baseUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...messages.map((m) => ({ role: m.role, content: m.content })),
                ],
                stream: true,
              }),
            })

            const reader = res.body?.getReader()
            if (!reader) { controller.close(); return }
            const decoder = new TextDecoder()

            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              const lines = decoder.decode(value).split('\n').filter(Boolean)
              for (const line of lines) {
                try {
                  const parsed = JSON.parse(line)
                  if (parsed.message?.content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.message.content })}\n\n`))
                  }
                } catch { /* skip */ }
              }
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Ollama 連線失敗'
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
            controller.close()
          }
        },
      })
    },
    async chat(systemPrompt, userMessage) {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          stream: false,
        }),
      })
      const data = await res.json()
      return data.message?.content || ''
    },
  }
}

// ─── OpenAI-compatible Adapter (vLLM, etc.) ───────────────────────

function createOpenAICompatibleAdapter(): LLMAdapter {
  const baseUrl = process.env.OPENAI_COMPATIBLE_URL || 'http://localhost:8000/v1'
  const model = process.env.OPENAI_COMPATIBLE_MODEL || 'default'
  const apiKey = process.env.OPENAI_COMPATIBLE_API_KEY || ''
  const encoder = new TextEncoder()

  return {
    stream(messages, systemPrompt) {
      return new ReadableStream({
        async start(controller) {
          try {
            const res = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...messages.map((m) => ({ role: m.role, content: m.content })),
                ],
                stream: true,
              }),
            })

            const reader = res.body?.getReader()
            if (!reader) { controller.close(); return }
            const decoder = new TextDecoder()

            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '))
              for (const line of lines) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                try {
                  const parsed = JSON.parse(data)
                  const text = parsed.choices?.[0]?.delta?.content
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                  }
                } catch { /* skip */ }
              }
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'LLM 連線失敗'
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
            controller.close()
          }
        },
      })
    },
    async chat(systemPrompt, userMessage) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      })
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  }
}

// ─── Factory ──────────────────────────────────────────────────────

let cachedAdapter: LLMAdapter | null = null

export function getLLMAdapter(): LLMAdapter {
  if (cachedAdapter) return cachedAdapter

  switch (LLM_PROVIDER) {
    case 'ollama':
      cachedAdapter = createOllamaAdapter()
      break
    case 'openai-compatible':
    case 'vllm':
      cachedAdapter = createOpenAICompatibleAdapter()
      break
    case 'claude':
    default:
      cachedAdapter = createClaudeAdapter()
  }

  return cachedAdapter
}
