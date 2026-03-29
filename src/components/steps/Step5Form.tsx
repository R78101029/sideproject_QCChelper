'use client'

import { useEffect } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import { calculateTarget } from '@/lib/chart-data'
import AiActionButton from '@/components/ui/AiActionButton'
import type { Step5Data } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step5Form({ data, onChange, projectId }: Props) {
  const d = data as unknown as Step5Data

  const update = (patch: Partial<Step5Data>) => {
    onChange({ ...data, ...patch })
  }

  // Auto-fetch step 4 current_rate if not already set
  useEffect(() => {
    if (d.current_value != null) return
    fetch(`/api/projects/${projectId}/steps/4`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.data?.current_rate != null) {
          update({ current_value: res.data.data.current_rate })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const autoCalc = () => {
    if (d.current_value != null && d.improvement_focus_ratio != null && d.circle_capability != null) {
      const target = calculateTarget(
        d.current_value,
        d.improvement_focus_ratio,
        d.circle_capability,
        d.theme_type || 'reduction'
      )
      update({ target_value: target, calculation_method: 'formula' })
    }
  }

  return (
    <div className="space-y-6">
      <Card title="目標設定">
        <div className="space-y-4">
          <Input
            id="current_value"
            label="現狀值"
            type="number"
            step="0.01"
            value={d.current_value ?? ''}
            onChange={(e) => update({ current_value: e.target.value ? parseFloat(e.target.value) : null })}
            hint="自動帶入步驟四現狀值（可手動修改）"
          />

          <Select
            id="theme_type"
            label="改善類型"
            value={d.theme_type || 'reduction'}
            onChange={(e) => update({ theme_type: e.target.value as 'reduction' | 'improvement' })}
            options={[
              { value: 'reduction', label: '降低類' },
              { value: 'improvement', label: '提升類' },
            ]}
          />

          <Select
            id="calculation_method"
            label="計算方式"
            value={d.calculation_method || 'formula'}
            onChange={(e) => update({ calculation_method: e.target.value as 'formula' | 'manual' })}
            options={[
              { value: 'formula', label: '公式計算' },
              { value: 'manual', label: '手動輸入' },
            ]}
          />

          {d.calculation_method === 'formula' && (
            <div className="rounded-md bg-blue-50 p-4">
              <p className="mb-3 text-sm text-blue-800">
                {d.theme_type === 'reduction'
                  ? '目標值 = 現狀值 × (1 - 改善重點佔比 × 圈能力)'
                  : '目標值 = 現狀值 × (1 + 改善重點佔比 × 圈能力)'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="improvement_focus_ratio"
                  label="改善重點佔比"
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  value={d.improvement_focus_ratio ?? ''}
                  onChange={(e) => update({ improvement_focus_ratio: e.target.value ? parseFloat(e.target.value) : null })}
                  hint="柏拉圖 80% 線以上的佔比"
                />
                <Input
                  id="circle_capability"
                  label="圈能力值"
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  value={d.circle_capability ?? ''}
                  onChange={(e) => {
                    update({ circle_capability: e.target.value ? parseFloat(e.target.value) : null })
                    setTimeout(autoCalc, 0)
                  }}
                  hint="0 ~ 1，通常取 0.5 ~ 0.8"
                />
              </div>
            </div>
          )}

          <Input
            id="target_value"
            label="目標值"
            type="number"
            step="0.01"
            value={d.target_value ?? ''}
            onChange={(e) => update({ target_value: e.target.value ? parseFloat(e.target.value) : null })}
            hint="此值會自動同步至專案 KPI"
          />

          <Textarea
            id="reason"
            label="目標設定理由"
            value={d.reason || ''}
            onChange={(e) => update({ reason: e.target.value })}
            rows={3}
            hint="含計算過程說明"
          />
          <div className="mt-4">
            <AiActionButton
              label="AI 外部對標參考"
              projectId={projectId}
              stepNumber={5}
              mode="background_scan"
              message="請提供此主題的外部對標參考資訊。"
              metadata={{ topicName: d.reason || '' }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
