// Claude API integration — MVP: direct call, Phase 2: mode-based workflows
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface StreamChatOptions {
  messages: ChatMessage[]
  systemPrompt: string
  mode?: string // Phase 1: 'freeform' only; Phase 2: guided_analysis, pressure_test, etc.
}

/**
 * Stream a chat response from Claude.
 * Returns a ReadableStream of text chunks.
 */
export function streamChat({ messages, systemPrompt }: StreamChatOptions): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            controller.enqueue(encoder.encode(chunk))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI 服務暫時無法使用'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`))
        controller.close()
      }
    },
  })
}

/**
 * Non-streaming chat for quick responses (e.g., summaries).
 */
export async function chatOnce(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
