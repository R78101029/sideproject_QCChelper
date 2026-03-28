'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

const STEP_NAMES = [
  '組圈', '主題選定', '活動計畫', '現況把握', '目標設定',
  '解析', '對策擬定', '對策實施', '效果確認', '標準化',
]

interface StepStatus {
  stepNumber: number
  status: string
  updatedAt: string | null
}

export default function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [steps, setSteps] = useState<StepStatus[]>([])
  const [projectName, setProjectName] = useState('')
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/projects/${id}/steps`).then((r) => r.json()),
    ]).then(([projRes, stepsRes]) => {
      if (projRes.success) setProjectName(projRes.data.name)
      if (stepsRes.success) setSteps(stepsRes.data)
      setLoading(false)
    })
  }, [id])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch(`/api/projects/${id}/export/pdf`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        toast('error', err.error || 'PDF 匯出失敗')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QCC報告_${projectName || id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast('success', 'PDF 匯出成功')
    } catch {
      toast('error', 'PDF 匯出失敗，請確認 Browserless 服務已啟動')
    } finally {
      setExporting(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">載入中…</p>
      </div>
    )
  }

  const statusIcon = (status: string) => {
    if (status === 'completed') return '✓'
    if (status === 'in_progress') return '…'
    return '—'
  }

  const statusColor = (status: string) => {
    if (status === 'completed') return 'text-green-600'
    if (status === 'in_progress') return 'text-blue-600'
    return 'text-gray-400'
  }

  const completedCount = steps.filter((s) => s.status === 'completed').length

  return (
    <AppLayout
      projectId={id}
      projectName={projectName}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-gray-900">匯出報告</h1>

        <Card title="步驟填寫狀態" description="缺漏欄位將在報告中顯示「（待補充）」">
          <div className="space-y-2">
            {STEP_NAMES.map((name, i) => {
              const n = i + 1
              const step = steps.find((s) => s.stepNumber === n)
              const status = step?.status || 'not_started'
              return (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {n}. {name}
                  </span>
                  <span className={`text-sm font-medium ${statusColor(status)}`}>
                    {statusIcon(status)}{' '}
                    {status === 'completed' ? '已完成' : status === 'in_progress' ? '進行中' : '未開始'}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-500">
            完成 {completedCount} / 10 步驟
          </div>
        </Card>

        <div className="mt-6 rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          即使有步驟尚未完成，仍可匯出報告。缺漏欄位會顯示「（待補充）」。
        </div>

        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={handleExport} loading={exporting}>
            {exporting ? '正在產生 PDF…' : '匯出 PDF 報告'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
