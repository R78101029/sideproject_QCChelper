'use client'

import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import type { Step3Data } from '@/types'

const DEFAULT_STEP_NAMES = [
  '組圈', '主題選定', '活動計畫', '現況把握', '目標設定',
  '解析', '對策擬定', '對策實施', '效果確認', '標準化',
]

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step3Form({ data, onChange }: Props) {
  const d = data as unknown as Step3Data

  const update = (patch: Partial<Step3Data>) => {
    onChange({ ...data, ...patch })
  }

  // Initialize schedule if empty
  const schedule = d.schedule?.length
    ? d.schedule
    : DEFAULT_STEP_NAMES.map((name, i) => ({
        step_number: i + 1,
        step_name: name,
        responsible: '',
        planned_start: null,
        planned_end: null,
        actual_start: null,
        actual_end: null,
      }))

  const updateScheduleItem = (index: number, field: string, value: string | null) => {
    const items = [...schedule]
    items[index] = { ...items[index], [field]: value || null }
    update({ schedule: items })
  }

  return (
    <div className="space-y-6">
      <Card title="基本設定">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="total_weeks"
            label="預計活動總週數"
            type="number"
            min={0}
            value={d.total_weeks || 0}
            onChange={(e) => update({ total_weeks: parseInt(e.target.value) || 0 })}
          />
          <Input
            id="meeting_frequency"
            label="開會頻率"
            placeholder="例：每週一次"
            value={d.meeting_frequency || ''}
            onChange={(e) => update({ meeting_frequency: e.target.value })}
          />
        </div>
      </Card>

      <Card title="活動時程表">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2 text-left text-gray-500">步驟</th>
                <th className="px-2 py-2 text-left text-gray-500">負責人</th>
                <th className="px-2 py-2 text-left text-gray-500">預定開始</th>
                <th className="px-2 py-2 text-left text-gray-500">預定結束</th>
                <th className="px-2 py-2 text-left text-gray-500">實際開始</th>
                <th className="px-2 py-2 text-left text-gray-500">實際結束</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="px-2 py-2 text-gray-700">
                    {item.step_number}. {item.step_name}
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                      value={item.responsible || ''}
                      onChange={(e) => updateScheduleItem(i, 'responsible', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                      value={item.planned_start || ''}
                      onChange={(e) => updateScheduleItem(i, 'planned_start', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                      value={item.planned_end || ''}
                      onChange={(e) => updateScheduleItem(i, 'planned_end', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                      value={item.actual_start || ''}
                      onChange={(e) => updateScheduleItem(i, 'actual_start', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="date"
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                      value={item.actual_end || ''}
                      onChange={(e) => updateScheduleItem(i, 'actual_end', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
