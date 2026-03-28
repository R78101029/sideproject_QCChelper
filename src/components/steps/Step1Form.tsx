'use client'

import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { Step1Data } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step1Form({ data, onChange }: Props) {
  const d = data as unknown as Step1Data

  const update = (patch: Partial<Step1Data>) => {
    onChange({ ...data, ...patch })
  }

  const updateMember = (index: number, field: string, value: string) => {
    const members = [...(d.members || [])]
    members[index] = { ...members[index], [field]: value }
    update({ members })
  }

  const addMember = () => {
    update({ members: [...(d.members || []), { name: '', title: '', division: '' }] })
  }

  const removeMember = (index: number) => {
    update({ members: (d.members || []).filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <Card title="基本資訊">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="circle_name"
              label="圈名"
              value={d.circle_name || ''}
              onChange={(e) => update({ circle_name: e.target.value })}
            />
            <Input
              id="department"
              label="科別/單位"
              value={d.department || ''}
              onChange={(e) => update({ department: e.target.value })}
            />
          </div>
          <Textarea
            id="circle_meaning"
            label="圈的意義說明"
            value={d.circle_meaning || ''}
            onChange={(e) => update({ circle_meaning: e.target.value })}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="period_start"
              label="活動起始日"
              type="date"
              value={d.period_start || ''}
              onChange={(e) => update({ period_start: e.target.value || null })}
            />
            <Input
              id="period_end"
              label="活動結束日"
              type="date"
              value={d.period_end || ''}
              onChange={(e) => update({ period_end: e.target.value || null })}
            />
          </div>
        </div>
      </Card>

      <Card title="圈長">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="leader_name"
            label="姓名"
            value={d.leader?.name || ''}
            onChange={(e) => update({ leader: { ...d.leader, name: e.target.value } })}
          />
          <Input
            id="leader_title"
            label="職稱"
            value={d.leader?.title || ''}
            onChange={(e) => update({ leader: { ...d.leader, title: e.target.value } })}
          />
        </div>
      </Card>

      <Card title="輔導員">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="advisor_name"
            label="姓名"
            value={d.advisor?.name || ''}
            onChange={(e) => update({ advisor: { ...d.advisor, name: e.target.value } })}
          />
          <Input
            id="advisor_title"
            label="職稱"
            value={d.advisor?.title || ''}
            onChange={(e) => update({ advisor: { ...d.advisor, title: e.target.value } })}
          />
        </div>
      </Card>

      <Card title="圈員名單">
        {(d.members || []).map((m, i) => (
          <div key={i} className="mb-3 flex items-end gap-3">
            <Input
              label={i === 0 ? '姓名' : undefined}
              value={m.name}
              onChange={(e) => updateMember(i, 'name', e.target.value)}
              className="flex-1"
            />
            <Input
              label={i === 0 ? '職稱' : undefined}
              value={m.title}
              onChange={(e) => updateMember(i, 'title', e.target.value)}
              className="flex-1"
            />
            <Input
              label={i === 0 ? '角色分工' : undefined}
              value={m.division}
              onChange={(e) => updateMember(i, 'division', e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => removeMember(i)}>
              刪除
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addMember}>
          + 新增圈員
        </Button>
      </Card>
    </div>
  )
}
