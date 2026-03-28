'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ParetoChart from '@/components/charts/ParetoChart'
import type { Step4Data } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step4Form({ data, onChange, projectId }: Props) {
  const d = data as unknown as Step4Data
  const [uploading, setUploading] = useState(false)

  const update = (patch: Partial<Step4Data>) => {
    onChange({ ...data, ...patch })
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      formData.append('stepNumber', '4')

      const res = await fetch('/api/analyze/csv', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()

      if (result.success) {
        update({
          categories: result.data.categories,
          pareto_sorted: result.data.pareto_sorted,
          vital_few: result.data.vital_few,
          total_checks: result.data.total_checks,
        })
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <Card title="查檢期間">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="check_period_start"
            label="起始日"
            type="date"
            value={d.check_period_start || ''}
            onChange={(e) => update({ check_period_start: e.target.value || null })}
          />
          <Input
            id="check_period_end"
            label="結束日"
            type="date"
            value={d.check_period_end || ''}
            onChange={(e) => update({ check_period_end: e.target.value || null })}
          />
        </div>
      </Card>

      <Card title="數據上傳">
        <p className="mb-3 text-xs text-gray-400">
          請確認 CSV 檔案不含病患個資（姓名、身分證字號、病歷號等）。僅上傳匿名化統計數據。
        </p>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
            選擇 CSV 檔案
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </label>
          {uploading && <span className="text-sm text-gray-500">解析中…</span>}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          CSV 格式：第一欄為分類名稱，第二欄為次數（或僅一欄分類名稱，系統自動計次）
        </p>
      </Card>

      <Card title="統計數據">
        <div className="space-y-4">
          <Input
            id="total_checks"
            label="查檢總數（分母）"
            type="number"
            value={d.total_checks || 0}
            onChange={(e) => update({ total_checks: parseInt(e.target.value) || 0 })}
          />

          {(d.categories || []).length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">缺失分類統計</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left text-gray-500">分類</th>
                      <th className="px-3 py-2 text-right text-gray-500">次數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.pareto_sorted || d.categories || []).map((c, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-right">{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Input
            id="current_rate"
            label="現狀值（不良率 %）"
            type="number"
            step="0.01"
            value={d.current_rate ?? ''}
            onChange={(e) => update({ current_rate: e.target.value ? parseFloat(e.target.value) : null })}
            hint="此值會自動同步至專案 KPI"
          />

          <Textarea
            id="description"
            label="現況描述"
            value={d.description || ''}
            onChange={(e) => update({ description: e.target.value })}
            rows={3}
          />
        </div>
      </Card>

      {(d.pareto_sorted || []).length > 0 && (
        <Card title="柏拉圖（改善前）">
          <ParetoChart data={d.pareto_sorted} title="現況柏拉圖" />
        </Card>
      )}
    </div>
  )
}
