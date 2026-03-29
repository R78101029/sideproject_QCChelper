'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import { getPerspectiveLabel, getNextPerspective, type PressureTestPerspective } from '@/lib/iqcc/pressure-test'
import type { PressureTestRound, Countermeasure } from '@/types'

interface Props {
  projectId: string
  countermeasures: Countermeasure[]
  pressureTests: PressureTestRound[]
  onUpdate: (tests: PressureTestRound[]) => void
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export default function PressureTestPanel({ projectId, countermeasures, pressureTests, onUpdate }: Props) {
  const [selectedCmId, setSelectedCmId] = useState(countermeasures[0]?.id || '')
  const [perspective, setPerspective] = useState<PressureTestPerspective>('verifier')
  const [round, setRound] = useState(1)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [lastReview, setLastReview] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const selectedCm = countermeasures.find((c) => c.id === selectedCmId)
  const cmTests = pressureTests.filter((t) => t.proposal === selectedCmId || true)

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming || !selectedCm) return
    const userMsg = text.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          stepNumber: 7,
          message: userMsg,
          mode: 'pressure_test',
          metadata: {
            perspective,
            countermeasure: {
              what: selectedCm.what,
              why: selectedCm.why,
              who: selectedCm.who,
              how: selectedCm.how,
            },
            rootCauseName: selectedCm.root_cause_name,
            round,
            previousReview: lastReview,
          },
        }),
      })

      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

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
              fullText += parsed.text
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

      setLastReview(fullText)
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = { ...last, content: 'AI 服務暫時無法使用。' }
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  const startReview = () => {
    if (!selectedCm) return
    setMessages([])
    sendMessage(`請以「${getPerspectiveLabel(perspective)}」的角度，審查以下對策方案：\n\n對策：${selectedCm.what}\n方法：${selectedCm.how}`)
  }

  const saveRoundAndContinue = () => {
    const newRound: PressureTestRound = {
      round,
      proposal: selectedCmId,
      ai_review: lastReview || '',
      ai_perspective: getPerspectiveLabel(perspective),
      risks_identified: [],
      team_response: input || '（待填寫）',
      status: 'revised',
      created_at: new Date().toISOString(),
    }
    onUpdate([...pressureTests, newRound])
    setRound((r) => r + 1)
    setPerspective(getNextPerspective(perspective))
    setMessages([])
    setLastReview(null)
  }

  const closeLoop = () => {
    const newRound: PressureTestRound = {
      round,
      proposal: selectedCmId,
      ai_review: lastReview || '',
      ai_perspective: getPerspectiveLabel(perspective),
      risks_identified: [],
      team_response: '方案定案',
      status: 'approved',
      created_at: new Date().toISOString(),
    }
    onUpdate([...pressureTests, newRound])
  }

  return (
    <div className="space-y-4">
      {/* Countermeasure selector */}
      <Card>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Select
              label="選擇要測試的對策"
              value={selectedCmId}
              onChange={(e) => { setSelectedCmId(e.target.value); setMessages([]); setRound(1); setLastReview(null) }}
              options={countermeasures.map((c) => ({
                value: c.id,
                label: c.what || '(未命名對策)',
              }))}
            />
          </div>
          <div>
            <Select
              label="AI 審查視角"
              value={perspective}
              onChange={(e) => setPerspective(e.target.value as PressureTestPerspective)}
              options={[
                { value: 'verifier', label: 'IMO 級驗證官' },
                { value: 'nurse', label: '臨床護理師' },
                { value: 'legal', label: '法務顧問' },
                { value: 'patient', label: '病患/家屬' },
              ]}
            />
          </div>
          <Button type="button" onClick={startReview} disabled={!selectedCmId}>
            開始第 {round} 輪審查
          </Button>
        </div>
      </Card>

      {/* Historical rounds */}
      {cmTests.length > 0 && (
        <Card title="歷史審查紀錄">
          {cmTests.map((t, i) => (
            <div key={i} className="mb-3 rounded-md border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  第 {t.round} 輪 — {t.ai_perspective}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {t.status === 'approved' ? '定案' : '已修正'}
                </span>
              </div>
              <p className="mt-1 line-clamp-3 text-xs text-gray-500">{t.ai_review.slice(0, 200)}…</p>
            </div>
          ))}
        </Card>
      )}

      {/* Chat area */}
      <Card>
        <div ref={scrollRef} className="h-[350px] space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-400">選擇對策和審查視角，點擊「開始審查」</p>
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
            placeholder="回覆審查意見 / 說明修正內容…"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            disabled={streaming}
          />
          <Button type="button" size="sm" onClick={() => sendMessage(input)} loading={streaming}>
            送出
          </Button>
        </div>
      </Card>

      {/* Actions */}
      {lastReview && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={saveRoundAndContinue}>
            記錄本輪，繼續下一輪
          </Button>
          <Button type="button" onClick={closeLoop}>
            關閉迴圈，確認定案
          </Button>
        </div>
      )}
    </div>
  )
}
