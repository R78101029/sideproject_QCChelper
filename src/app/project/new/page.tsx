'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    circleName: '',
    department: '',
    periodStart: '',
    periodEnd: '',
    themeType: 'reduction',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/project/${data.data.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-gray-900">建立新專案</h1>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="專案名稱"
              placeholder="例：降低住院病人跌倒發生率"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              id="circleName"
              label="圈名"
              placeholder="例：安心圈"
              value={form.circleName}
              onChange={(e) => setForm({ ...form, circleName: e.target.value })}
              required
            />
            <Input
              id="department"
              label="科別"
              placeholder="例：護理部"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="periodStart"
                label="活動起始日"
                type="date"
                value={form.periodStart}
                onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
              />
              <Input
                id="periodEnd"
                label="活動結束日"
                type="date"
                value={form.periodEnd}
                onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
              />
            </div>
            <Select
              id="themeType"
              label="改善類型"
              value={form.themeType}
              onChange={(e) => setForm({ ...form, themeType: e.target.value })}
              options={[
                { value: 'reduction', label: '降低類（降低不良率）' },
                { value: 'improvement', label: '提升類（提升達成率）' },
              ]}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => router.back()}>
                取消
              </Button>
              <Button type="submit" loading={loading}>
                建立
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
