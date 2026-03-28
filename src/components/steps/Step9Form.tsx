'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ParetoChart from '@/components/charts/ParetoChart'
import RadarChart from '@/components/charts/RadarChart'
import type { Step9Data } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step9Form({ data, onChange, projectId }: Props) {
  const d = data as unknown as Step9Data
  const [uploading, setUploading] = useState(false)

  const update = (patch: Partial<Step9Data>) => {
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
      formData.append('stepNumber', '9')

      const res = await fetch('/api/analyze/csv', { method: 'POST', body: formData })
      const result = await res.json()

      if (result.success) {
        update({
          post_categories: result.data.categories,
          post_pareto_sorted: result.data.pareto_sorted,
          post_total_checks: result.data.total_checks,
        })
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Add/remove intangible criteria
  const addCriterion = () => {
    update({ intangible_criteria: [...(d.intangible_criteria || []), ''] })
  }

  const updateCriterion = (index: number, value: string) => {
    const criteria = [...(d.intangible_criteria || [])]
    criteria[index] = value
    update({ intangible_criteria: criteria })
  }

  return (
    <div className="space-y-6">
      <Card title="改善後查檢期間">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="起始日"
            type="date"
            value={d.post_check_period_start || ''}
            onChange={(e) => update({ post_check_period_start: e.target.value || null })}
          />
          <Input
            label="結束日"
            type="date"
            value={d.post_check_period_end || ''}
            onChange={(e) => update({ post_check_period_end: e.target.value || null })}
          />
        </div>
      </Card>

      <Card title="改善後數據上傳">
        <p className="mb-3 text-xs text-gray-400">
          請確認 CSV 檔案不含病患個資。僅上傳匿名化統計數據。
        </p>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
            選擇 CSV 檔案
            <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          </label>
          {uploading && <span className="text-sm text-gray-500">解析中…</span>}
        </div>
      </Card>

      <Card title="有形成果">
        <div className="space-y-4">
          <Input
            label="改善後查檢總數"
            type="number"
            value={d.post_total_checks || 0}
            onChange={(e) => update({ post_total_checks: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="改善後不良率（%）"
            type="number"
            step="0.01"
            value={d.post_rate ?? ''}
            onChange={(e) => update({ post_rate: e.target.value ? parseFloat(e.target.value) : null })}
          />
          <Input
            label="改善幅度（%）"
            type="number"
            step="0.01"
            value={d.improvement_rate ?? ''}
            onChange={(e) => update({ improvement_rate: e.target.value ? parseFloat(e.target.value) : null })}
            hint="此值會自動同步至專案 KPI"
          />
          <Input
            label="目標達成率（%）"
            type="number"
            step="0.01"
            value={d.goal_achievement_rate ?? ''}
            onChange={(e) => update({ goal_achievement_rate: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>
      </Card>

      <Card title="無形成果（雷達圖自評）">
        <p className="mb-3 text-sm text-gray-500">每項 1~5 分，改善前 vs 改善後</p>
        {(d.intangible_criteria || []).map((c, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <Input
              value={c}
              placeholder={`評估項目 ${i + 1}（如：團隊合作、問題解決能力...）`}
              onChange={(e) => updateCriterion(i, e.target.value)}
              className="flex-1"
            />
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addCriterion}>
          + 新增評估項目
        </Button>
      </Card>

      {(d.post_pareto_sorted || []).length > 0 && (
        <Card title="改善後柏拉圖">
          <ParetoChart data={d.post_pareto_sorted} title="改善後柏拉圖" />
        </Card>
      )}

      {(d.intangible_criteria || []).length > 0 && (
        <Card title="無形成果雷達圖">
          <RadarChart
            criteria={d.intangible_criteria}
            before={d.intangible_criteria.map((c) => {
              const vals = Object.values(d.intangible_averages?.before || {})
              const idx = d.intangible_criteria.indexOf(c)
              return (vals[idx] as number) || 0
            })}
            after={d.intangible_criteria.map((c) => {
              const vals = Object.values(d.intangible_averages?.after || {})
              const idx = d.intangible_criteria.indexOf(c)
              return (vals[idx] as number) || 0
            })}
          />
        </Card>
      )}
    </div>
  )
}
