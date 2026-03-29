'use client'

import { useMemo } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import AiActionButton from '@/components/ui/AiActionButton'
import type { Step2Data } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step2Form({ data, onChange, projectId }: Props) {
  const d = data as unknown as Step2Data

  const update = (patch: Partial<Step2Data>) => {
    onChange({ ...data, ...patch })
  }

  const addCandidate = () => {
    update({
      candidates: [
        ...(d.candidates || []),
        { id: crypto.randomUUID(), name: '', description: '' },
      ],
    })
  }

  const removeCandidate = (index: number) => {
    update({ candidates: (d.candidates || []).filter((_, i) => i !== index) })
  }

  const addCriterion = () => {
    update({ criteria: [...(d.criteria || []), ''] })
  }

  const removeCriterion = (index: number) => {
    update({ criteria: (d.criteria || []).filter((_, i) => i !== index) })
  }

  // Auto-calculate totals
  const totals = useMemo(() => {
    const result: Record<string, number> = {}
    for (const candidate of d.candidates || []) {
      let sum = 0
      for (const scorer of d.scores || []) {
        const ratings = scorer.ratings?.[candidate.id] || {}
        for (const criterion of d.criteria || []) {
          sum += ratings[criterion] || 0
        }
      }
      result[candidate.id] = sum
    }
    return result
  }, [d.candidates, d.criteria, d.scores])

  const setScore = (candidateId: string, criterion: string, value: number) => {
    // MVP: leader fills all scores under single "圈長" entry
    const scores = [...(d.scores || [])]
    let entry = scores.find((s) => s.member_name === '圈長')
    if (!entry) {
      entry = { member_name: '圈長', ratings: {} }
      scores.push(entry)
    }
    if (!entry.ratings[candidateId]) entry.ratings[candidateId] = {}
    entry.ratings[candidateId][criterion] = value
    update({ scores, totals })
  }

  const getScore = (candidateId: string, criterion: string) => {
    const entry = (d.scores || []).find((s) => s.member_name === '圈長')
    return entry?.ratings?.[candidateId]?.[criterion] || 0
  }

  return (
    <div className="space-y-6">
      <Card title="候選主題">
        {(d.candidates || []).map((c, i) => (
          <div key={c.id} className="mb-3 flex items-start gap-3">
            <span className="mt-2 text-sm font-medium text-gray-500">{i + 1}.</span>
            <div className="flex-1 space-y-2">
              <Input
                value={c.name}
                placeholder="主題名稱"
                onChange={(e) => {
                  const candidates = [...(d.candidates || [])]
                  candidates[i] = { ...candidates[i], name: e.target.value }
                  update({ candidates })
                }}
              />
              <Input
                value={c.description}
                placeholder="簡述"
                onChange={(e) => {
                  const candidates = [...(d.candidates || [])]
                  candidates[i] = { ...candidates[i], description: e.target.value }
                  update({ candidates })
                }}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeCandidate(i)}>
              刪除
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addCandidate}>
          + 新增候選主題
        </Button>
      </Card>

      <Card title="評價項目">
        {(d.criteria || []).map((c, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <Input
              value={c}
              placeholder={`評價項目 ${i + 1}（如：上級政策、重要性、迫切性...）`}
              onChange={(e) => {
                const criteria = [...(d.criteria || [])]
                criteria[i] = e.target.value
                update({ criteria })
              }}
              className="flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => removeCriterion(i)}>
              刪除
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addCriterion}>
          + 新增評價項目
        </Button>
      </Card>

      {(d.candidates || []).length > 0 && (d.criteria || []).length > 0 && (
        <Card title="評價矩陣（圈長代填）">
          <p className="mb-3 text-xs text-gray-500">每項 1~5 分</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left text-gray-500">主題 ＼ 評價項目</th>
                  {(d.criteria || []).map((c, i) => (
                    <th key={i} className="px-2 py-2 text-center text-gray-500">{c || `項目${i + 1}`}</th>
                  ))}
                  <th className="px-2 py-2 text-center font-medium text-gray-700">合計</th>
                </tr>
              </thead>
              <tbody>
                {(d.candidates || []).map((cand) => (
                  <tr key={cand.id} className="border-b">
                    <td className="px-2 py-2 text-gray-700">{cand.name || '(未命名)'}</td>
                    {(d.criteria || []).map((criterion, ci) => (
                      <td key={ci} className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={getScore(cand.id, criterion) || ''}
                          onChange={(e) => setScore(cand.id, criterion, parseInt(e.target.value) || 0)}
                          className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-medium">{totals[cand.id] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* AI Background Scan */}
      {(d.candidates || []).length > 0 && (
        <Card title="AI 輔助">
          <div className="flex flex-wrap gap-2">
            {(d.candidates || []).map((c) => (
              <AiActionButton
                key={c.id}
                label={`掃描：${c.name || '未命名'}`}
                projectId={projectId}
                stepNumber={2}
                mode="background_scan"
                message={`請對「${c.name}」這個主題進行背景掃描分析。`}
                metadata={{ topicName: c.name }}
              />
            ))}
          </div>
        </Card>
      )}

      <Card title="選定結果">
        <div className="space-y-4">
          <Input
            id="selected_topic"
            label="選定主題"
            value={d.selected_topic || ''}
            onChange={(e) => update({ selected_topic: e.target.value })}
          />
          <Textarea
            id="selection_reason"
            label="選題理由"
            value={d.selection_reason || ''}
            onChange={(e) => update({ selection_reason: e.target.value })}
            rows={3}
          />
          <Input
            id="metric_definition"
            label="衡量指標定義"
            value={d.metric_definition || ''}
            onChange={(e) => update({ metric_definition: e.target.value })}
            hint="例：跌倒發生率 = 跌倒人次 / 住院人日 × 1000‰"
          />
        </div>
      </Card>
    </div>
  )
}
