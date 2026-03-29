'use client'

import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'

interface Props {
  label: string
  projectId: string
  stepNumber: number
  mode: 'report_generation' | 'background_scan'
  message: string
  metadata?: Record<string, unknown>
  onResult?: (text: string) => void
}

export default function AiActionButton({ label, projectId, stepNumber, mode, message, metadata, onResult }: Props) {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setResult('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, stepNumber, message, mode, metadata }),
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
              setResult(fullText)
            }
          } catch { /* skip */ }
        }
      }

      onResult?.(fullText)
    } catch {
      setResult('AI 服務暫時無法使用。請檢查 ANTHROPIC_API_KEY 是否已設定。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => { setOpen(true); handleGenerate() }}>
        {label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={label}>
        <div className="max-h-[500px] overflow-y-auto">
          {loading && !result && (
            <p className="text-sm text-gray-500">AI 生成中…</p>
          )}
          {result && (
            <div className="whitespace-pre-wrap text-sm text-gray-800">{result}</div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
            關閉
          </Button>
          {result && (
            <Button type="button" size="sm" onClick={() => { navigator.clipboard.writeText(result); }}>
              複製內容
            </Button>
          )}
        </div>
      </Modal>
    </>
  )
}
