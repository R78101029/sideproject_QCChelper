'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { getStageLabel, type GuidedStage } from '@/lib/iqcc/guided-analysis'
import type { CausalVerification } from '@/types'

interface Props {
  projectId: string
  stepData: Record<string, unknown>
  onImportResults: (results: CausalVerification[]) => void
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export default function GuidedAnalysisPanel({ projectId, stepData, onImportResults }: Props) {
  const [stage, setStage] = useState<GuidedStage>(1)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [fiveWhyDepth, setFiveWhyDepth] = useState(0)
  const [currentCause, setCurrentCause] = useState('')
  const [previousAnswers, setPreviousAnswers] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return
    const userMsg = text.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    setStreaming(true)

    // Track 5-Why answers
    if (stage === 2) {
      setPreviousAnswers((prev) => [...prev, userMsg])
      setFiveWhyDepth((d) => d + 1)
    }

    try {
      const rootCauses = stage === 3
        ? getAllSmallCauses(stepData).filter((sc) => {
            const confirmed = (stepData as Record<string, unknown>).confirmed_root_causes as string[] || []
            return confirmed.includes(sc.id)
          })
        : []

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          stepNumber: 6,
          message: userMsg,
          mode: 'guided_analysis',
          metadata: {
            stage,
            currentCause,
            depth: fiveWhyDepth,
            previousAnswers,
            rootCauses,
          },
        }),
      })

      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: last.content + parsed.text }
                }
                return updated
              })
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = { ...last, content: 'AI 服務暫時無法使用。請檢查 ANTHROPIC_API_KEY 是否已設定。' }
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  const startStage = (s: GuidedStage) => {
    setStage(s)
    setMessages([])
    if (s === 1) {
      sendMessage('請分析步驟四的柏拉圖數據，找出關鍵少數。')
    } else if (s === 2) {
      setFiveWhyDepth(0)
      setPreviousAnswers([])
    } else if (s === 3) {
      sendMessage('請對所有確認的真因進行因果假設驗證。')
    }
  }

  return (
    <div className="space-y-4">
      {/* Stage progress */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as GuidedStage[]).map((s) => (
          <button
            key={s}
            onClick={() => startStage(s)}
            className={`flex-1 rounded-md px-3 py-2 text-center text-sm ${
              stage === s
                ? 'bg-blue-600 text-white'
                : s < stage
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {s}/3 {getStageLabel(s)}
          </button>
        ))}
      </div>

      {/* Stage 2 special: cause selector */}
      {stage === 2 && (
        <Card>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">追問對象：</span>
            <input
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
              value={currentCause}
              onChange={(e) => setCurrentCause(e.target.value)}
              placeholder="輸入要追問的原因（如：環境因素）"
            />
            <Button
              size="sm"
              onClick={() => {
                if (currentCause) {
                  setFiveWhyDepth(0)
                  setPreviousAnswers([])
                  sendMessage(`我想追問「${currentCause}」的根本原因。`)
                }
              }}
              disabled={!currentCause}
            >
              開始 5-Why
            </Button>
          </div>
          {fiveWhyDepth > 0 && (
            <p className="mt-2 text-xs text-gray-500">已追問 {fiveWhyDepth} 層</p>
          )}
        </Card>
      )}

      {/* Chat area */}
      <Card>
        <div ref={scrollRef} className="h-[400px] space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-400">
                {stage === 1 && '點擊上方「1/3 柏拉圖分析」開始'}
                {stage === 2 && '輸入要追問的原因，開始 5-Why 分析'}
                {stage === 3 && '點擊「3/3 因果假設驗證」開始'}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content || '...'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2 border-t border-gray-200 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="回覆 AI 的問題…"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            disabled={streaming}
          />
          <Button size="sm" onClick={() => sendMessage(input)} loading={streaming}>
            送出
          </Button>
        </div>
      </Card>

      {/* Import button */}
      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            // Parse AI responses for causal verification results
            // For now, create placeholder entries from confirmed causes
            const causes = getAllSmallCauses(stepData)
            const confirmed = (stepData as Record<string, unknown>).confirmed_root_causes as string[] || []
            const results: CausalVerification[] = confirmed.map((id) => {
              const cause = causes.find((c) => c.id === id)
              return {
                cause_id: id,
                cause_name: cause?.name || '',
                hypothesis: '',
                data_support: '',
                data_against: '',
                conclusion: 'confirmed' as const,
                ai_analysis: null,
              }
            })
            onImportResults(results)
          }}
        >
          將分析結果匯入主表單
        </Button>
      </div>
    </div>
  )
}

function getAllSmallCauses(stepData: Record<string, unknown>) {
  const d = stepData as { main_categories?: Array<{ medium_causes: Array<{ small_causes: Array<{ id: string; name: string }> }> }> }
  const causes: Array<{ id: string; name: string }> = []
  for (const cat of d.main_categories || []) {
    for (const med of cat.medium_causes) {
      for (const sc of med.small_causes) {
        causes.push({ id: sc.id, name: sc.name })
      }
    }
  }
  return causes
}
