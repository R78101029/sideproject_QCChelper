'use client'

import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { Step8Data, Implementation } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step8Form({ data, onChange }: Props) {
  const d = data as unknown as Step8Data

  const update = (patch: Partial<Step8Data>) => {
    onChange({ ...data, ...patch })
  }

  const addImpl = () => {
    const impl: Implementation = {
      countermeasure_id: crypto.randomUUID(),
      countermeasure_name: '',
      implementation_date: null,
      before_description: '',
      after_description: '',
      responsible: '',
      status: 'in_progress',
      effectiveness: null,
      review_note: '',
    }
    update({ implementations: [...(d.implementations || []), impl] })
  }

  const updateImpl = (index: number, field: string, value: string | null) => {
    const impls = [...(d.implementations || [])]
    impls[index] = { ...impls[index], [field]: value }
    update({ implementations: impls })
  }

  const removeImpl = (index: number) => {
    update({ implementations: (d.implementations || []).filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <Card title="對策實施進度">
        {(d.implementations || []).map((impl, i) => (
          <div key={i} className="mb-6 rounded-md border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">對策 {i + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeImpl(i)}>刪除</Button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="對策名稱"
                  value={impl.countermeasure_name}
                  onChange={(e) => updateImpl(i, 'countermeasure_name', e.target.value)}
                />
                <Input
                  label="負責人"
                  value={impl.responsible}
                  onChange={(e) => updateImpl(i, 'responsible', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="實施日期"
                  type="date"
                  value={impl.implementation_date || ''}
                  onChange={(e) => updateImpl(i, 'implementation_date', e.target.value || null)}
                />
                <Select
                  label="進度"
                  value={impl.status}
                  onChange={(e) => updateImpl(i, 'status', e.target.value)}
                  options={[
                    { value: 'in_progress', label: '進行中' },
                    { value: 'completed', label: '已完成' },
                    { value: 'delayed', label: '延遲' },
                  ]}
                />
                <Select
                  label="成效"
                  value={impl.effectiveness || ''}
                  onChange={(e) => updateImpl(i, 'effectiveness', e.target.value || null)}
                  options={[
                    { value: '', label: '(尚未評估)' },
                    { value: 'effective', label: '有效' },
                    { value: 'ineffective', label: '無效' },
                    { value: 'needs_revision', label: '需修正' },
                  ]}
                />
              </div>
              <Textarea
                label="實施前狀況"
                value={impl.before_description}
                onChange={(e) => updateImpl(i, 'before_description', e.target.value)}
                rows={2}
              />
              <Textarea
                label="實施後狀況"
                value={impl.after_description}
                onChange={(e) => updateImpl(i, 'after_description', e.target.value)}
                rows={2}
              />
              <Textarea
                label="檢討說明"
                value={impl.review_note}
                onChange={(e) => updateImpl(i, 'review_note', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addImpl}>
          + 新增實施項目
        </Button>
      </Card>
    </div>
  )
}
