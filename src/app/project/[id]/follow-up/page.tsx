'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'

interface FollowUp {
  id: string
  followUpType: string
  scheduledDate: string
  actualDate: string | null
  status: string
  followUpRate: number | null
  isSustained: boolean | null
  notes: string | null
}

const typeLabels: Record<string, string> = {
  three_month: '3 個月追蹤',
  six_month: '6 個月追蹤',
  twelve_month: '12 個月追蹤',
}

export default function FollowUpPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ followUpRate: '', isSustained: '', notes: '' })

  const loadData = () => {
    fetch(`/api/projects/${id}/follow-up`).then((r) => r.json()).then((res) => { if (res.success) setFollowUps(res.data) })
  }

  useEffect(() => { loadData() }, [id])

  const handleGenerate = async () => {
    const res = await fetch(`/api/projects/${id}/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoGenerate: true }),
    })
    const data = await res.json()
    if (data.success) {
      toast('success', '已建立追蹤排程')
      loadData()
    } else {
      toast('error', data.error)
    }
  }

  const handleSubmit = async (followUpId: string) => {
    const res = await fetch(`/api/projects/${id}/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        followUpId,
        followUpRate: form.followUpRate ? parseFloat(form.followUpRate) : null,
        isSustained: form.isSustained === 'true' ? true : form.isSustained === 'false' ? false : null,
        notes: form.notes,
      }),
    })
    const data = await res.json()
    if (data.success) {
      toast('success', '追蹤已更新')
      setEditId(null)
      loadData()
    }
  }

  const handleContinue = async () => {
    const res = await fetch(`/api/projects/${id}/continue`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      toast('success', '延續專案已建立')
      router.push(`/project/${data.data.id}`)
    }
  }

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }

  return (
    <AppLayout projectId={id} onLogout={handleLogout}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">改善後追蹤</h1>
          <div className="flex gap-2">
            {followUps.length === 0 && (
              <Button onClick={handleGenerate} variant="secondary">建立追蹤排程</Button>
            )}
            <Button onClick={handleContinue}>建立延續專案</Button>
          </div>
        </div>

        {followUps.length === 0 ? (
          <Card>
            <p className="py-8 text-center text-gray-500">尚未建立追蹤排程。點擊「建立追蹤排程」自動產生 3/6/12 個月追蹤。</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {followUps.map((fu) => (
              <Card key={fu.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{typeLabels[fu.followUpType] || fu.followUpType}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      預定：{new Date(fu.scheduledDate).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    fu.status === 'completed' ? 'bg-green-100 text-green-700'
                    : fu.status === 'skipped' ? 'bg-gray-100 text-gray-500'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {fu.status === 'completed' ? '已完成' : fu.status === 'skipped' ? '略過' : '待回填'}
                  </span>
                </div>

                {fu.status === 'completed' && (
                  <div className="mt-2 text-sm text-gray-600">
                    {fu.followUpRate != null && <p>追蹤指標：{fu.followUpRate}</p>}
                    {fu.isSustained != null && <p>效果持續：{fu.isSustained ? '是' : '否'}</p>}
                    {fu.notes && <p>備註：{fu.notes}</p>}
                  </div>
                )}

                {fu.status === 'pending' && editId !== fu.id && (
                  <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => setEditId(fu.id)}>
                    填寫追蹤
                  </Button>
                )}

                {editId === fu.id && (
                  <div className="mt-3 space-y-3 rounded-md border border-gray-200 p-3">
                    <Input label="追蹤指標值" type="number" step="0.01" value={form.followUpRate} onChange={(e) => setForm({ ...form, followUpRate: e.target.value })} />
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">效果是否持續</label>
                      <select className="rounded border border-gray-300 px-3 py-1.5 text-sm" value={form.isSustained} onChange={(e) => setForm({ ...form, isSustained: e.target.value })}>
                        <option value="">未評估</option>
                        <option value="true">是</option>
                        <option value="false">否</option>
                      </select>
                    </div>
                    <Textarea label="備註" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSubmit(fu.id)}>儲存</Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditId(null)}>取消</Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
