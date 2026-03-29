'use client'

import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import AiActionButton from '@/components/ui/AiActionButton'
import type { Step10Data, Standardization } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step10Form({ data, onChange, projectId }: Props) {
  const d = data as unknown as Step10Data

  const update = (patch: Partial<Step10Data>) => {
    onChange({ ...data, ...patch })
  }

  const addStd = () => {
    const std: Standardization = {
      countermeasure_name: '',
      standard_content: '',
      document_number: '',
      maintainer: '',
    }
    update({ standardizations: [...(d.standardizations || []), std] })
  }

  const updateStd = (index: number, field: keyof Standardization, value: string) => {
    const stds = [...(d.standardizations || [])]
    stds[index] = { ...stds[index], [field]: value }
    update({ standardizations: stds })
  }

  const removeStd = (index: number) => {
    update({ standardizations: (d.standardizations || []).filter((_, i) => i !== index) })
  }

  const review = d.review || { strengths: '', improvements: '', next_topic_suggestion: '' }

  return (
    <div className="space-y-6">
      <Card title="標準化">
        {(d.standardizations || []).map((std, i) => (
          <div key={i} className="mb-4 rounded-md border border-gray-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">標準化項目 {i + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeStd(i)}>刪除</Button>
            </div>
            <div className="space-y-3">
              <Input
                label="對策名稱"
                value={std.countermeasure_name}
                onChange={(e) => updateStd(i, 'countermeasure_name', e.target.value)}
              />
              <Textarea
                label="標準化內容"
                value={std.standard_content}
                onChange={(e) => updateStd(i, 'standard_content', e.target.value)}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="SOP 文件編號"
                  value={std.document_number}
                  onChange={(e) => updateStd(i, 'document_number', e.target.value)}
                />
                <Input
                  label="負責維護人"
                  value={std.maintainer}
                  onChange={(e) => updateStd(i, 'maintainer', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addStd}>
          + 新增標準化項目
        </Button>
      </Card>

      <Card title="檢討與改進">
        <div className="space-y-4">
          <Textarea
            id="strengths"
            label="本次活動優點"
            value={review.strengths}
            onChange={(e) => update({ review: { ...review, strengths: e.target.value } })}
            rows={3}
          />
          <Textarea
            id="improvements"
            label="待改進事項"
            value={review.improvements}
            onChange={(e) => update({ review: { ...review, improvements: e.target.value } })}
            rows={3}
          />
          <Textarea
            id="next_topic_suggestion"
            label="下期活動主題建議"
            value={review.next_topic_suggestion}
            onChange={(e) => update({ review: { ...review, next_topic_suggestion: e.target.value } })}
            rows={2}
          />
        </div>
      </Card>

      {/* AI Document Generation */}
      <Card title="AI 一文多用">
        <p className="mb-3 text-sm text-gray-500">根據標準化內容，AI 可批量生成不同格式的文件</p>
        <div className="flex flex-wrap gap-2">
          <AiActionButton
            label="生成 SOP"
            projectId={projectId}
            stepNumber={10}
            mode="report_generation"
            message="請根據標準化內容生成 SOP 標準作業程序。"
            metadata={{ documentType: 'sop' }}
          />
          <AiActionButton
            label="生成查核表"
            projectId={projectId}
            stepNumber={10}
            mode="report_generation"
            message="請根據標準化內容生成查核表。"
            metadata={{ documentType: 'checklist' }}
          />
          <AiActionButton
            label="生成 FAQ"
            projectId={projectId}
            stepNumber={10}
            mode="report_generation"
            message="請根據標準化內容生成常見問題 FAQ。"
            metadata={{ documentType: 'faq' }}
          />
        </div>
      </Card>

      <Card title="預估效益">
        <Textarea
          id="benefit_summary"
          label="預估效益描述"
          value={d.benefit_summary || ''}
          onChange={(e) => update({ benefit_summary: e.target.value })}
          rows={3}
          hint="選填，可請 AI 協助產生草稿"
        />
      </Card>
    </div>
  )
}
