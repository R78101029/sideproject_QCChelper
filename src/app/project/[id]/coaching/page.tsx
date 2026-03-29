'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'

interface Suggestion {
  id: string
  content: string
  stepNumber: number | null
  status: string
}

interface CoachingRecord {
  id: string
  coachingDate: string
  advisorName: string
  summary: string | null
  suggestions: Suggestion[]
  createdAt: string
}

export default function CoachingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [records, setRecords] = useState<CoachingRecord[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    coachingDate: new Date().toISOString().split('T')[0],
    advisorName: '',
    summary: '',
    suggestions: [{ content: '', stepNumber: '' }],
  })

  useEffect(() => {
    fetch(`/api/projects/${id}/coaching`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setRecords(res.data) })
  }, [id])

  const addSuggestion = () => {
    setForm({ ...form, suggestions: [...form.suggestions, { content: '', stepNumber: '' }] })
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${id}/coaching`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          suggestions: form.suggestions
            .filter((s) => s.content.trim())
            .map((s) => ({ content: s.content, stepNumber: s.stepNumber ? parseInt(s.stepNumber) : null })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast('success', '輔導紀錄已建立')
        setShowCreate(false)
        setRecords((prev) => [data.data, ...prev])
        setForm({ coachingDate: new Date().toISOString().split('T')[0], advisorName: '', summary: '', suggestions: [{ content: '', stepNumber: '' }] })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <AppLayout projectId={id} onLogout={handleLogout}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">輔導紀錄</h1>
          <Button onClick={() => setShowCreate(true)}>新增紀錄</Button>
        </div>

        {records.length === 0 ? (
          <Card>
            <p className="py-8 text-center text-gray-500">尚無輔導紀錄</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((r) => (
              <Card key={r.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{r.advisorName}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(r.coachingDate).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                </div>
                {r.summary && <p className="mb-3 text-sm text-gray-700">{r.summary}</p>}
                {r.suggestions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">建議事項</p>
                    {r.suggestions.map((s) => (
                      <div key={s.id} className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm">
                        <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                          s.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {s.status === 'done' ? '已完成' : '待處理'}
                        </span>
                        <span className="text-gray-700">{s.content}</span>
                        {s.stepNumber && <span className="text-gray-400">（步驟{s.stepNumber}）</span>}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="新增輔導紀錄">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="輔導日期" type="date" value={form.coachingDate} onChange={(e) => setForm({ ...form, coachingDate: e.target.value })} />
              <Input label="輔導老師" value={form.advisorName} onChange={(e) => setForm({ ...form, advisorName: e.target.value })} />
            </div>
            <Textarea label="本次摘要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} />
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">建議事項</p>
              {form.suggestions.map((s, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input
                    className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
                    value={s.content}
                    placeholder="建議內容"
                    onChange={(e) => {
                      const sugs = [...form.suggestions]
                      sugs[i] = { ...sugs[i], content: e.target.value }
                      setForm({ ...form, suggestions: sugs })
                    }}
                  />
                  <select
                    className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
                    value={s.stepNumber}
                    onChange={(e) => {
                      const sugs = [...form.suggestions]
                      sugs[i] = { ...sugs[i], stepNumber: e.target.value }
                      setForm({ ...form, suggestions: sugs })
                    }}
                  >
                    <option value="">步驟</option>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>步驟{i + 1}</option>
                    ))}
                  </select>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={addSuggestion}>+ 新增建議</Button>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>取消</Button>
            <Button onClick={handleCreate} loading={loading}>建立</Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  )
}
