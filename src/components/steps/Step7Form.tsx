'use client'

import { useMemo } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { Step7Data, Countermeasure } from '@/types'

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

export default function Step7Form({ data, onChange }: Props) {
  const d = data as unknown as Step7Data

  const update = (patch: Partial<Step7Data>) => {
    onChange({ ...data, ...patch })
  }

  const addCountermeasure = () => {
    const cm: Countermeasure = {
      id: crypto.randomUUID(),
      root_cause_id: '',
      root_cause_name: '',
      what: '',
      why: '',
      who: '',
      where: '',
      when: '',
      how: '',
    }
    update({ countermeasures: [...(d.countermeasures || []), cm] })
  }

  const updateCm = (index: number, field: keyof Countermeasure, value: string) => {
    const cms = [...(d.countermeasures || [])]
    cms[index] = { ...cms[index], [field]: value }
    update({ countermeasures: cms })
  }

  const removeCm = (index: number) => {
    update({ countermeasures: (d.countermeasures || []).filter((_, i) => i !== index) })
  }

  const addCriterion = () => {
    update({ evaluation_criteria: [...(d.evaluation_criteria || []), ''] })
  }

  // Auto-calculate totals
  const totals = useMemo(() => {
    const result: Record<string, number> = {}
    for (const cm of d.countermeasures || []) {
      let sum = 0
      for (const scorer of d.evaluation_scores || []) {
        const ratings = scorer.ratings?.[cm.id] || {}
        for (const criterion of d.evaluation_criteria || []) {
          sum += ratings[criterion] || 0
        }
      }
      result[cm.id] = sum
    }
    return result
  }, [d.countermeasures, d.evaluation_criteria, d.evaluation_scores])

  const setScore = (cmId: string, criterion: string, value: number) => {
    const scores = [...(d.evaluation_scores || [])]
    let entry = scores.find((s) => s.member_name === '圈長')
    if (!entry) {
      entry = { member_name: '圈長', ratings: {} }
      scores.push(entry)
    }
    if (!entry.ratings[cmId]) entry.ratings[cmId] = {}
    entry.ratings[cmId][criterion] = value
    update({ evaluation_scores: scores, evaluation_totals: totals })
  }

  const getScore = (cmId: string, criterion: string) => {
    const entry = (d.evaluation_scores || []).find((s) => s.member_name === '圈長')
    return entry?.ratings?.[cmId]?.[criterion] || 0
  }

  const toggleAdopted = (cmId: string) => {
    const adopted = d.adopted || []
    const rejected = d.rejected || []
    if (adopted.includes(cmId)) {
      update({
        adopted: adopted.filter((id) => id !== cmId),
        rejected: [...rejected, cmId],
      })
    } else if (rejected.includes(cmId)) {
      update({ rejected: rejected.filter((id) => id !== cmId) })
    } else {
      update({ adopted: [...adopted, cmId] })
    }
  }

  return (
    <div className="space-y-6">
      {/* 5W1H Countermeasures */}
      <Card title="對策方案（5W1H）">
        {(d.countermeasures || []).map((cm, i) => (
          <div key={cm.id} className="mb-6 rounded-md border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">對策 {i + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeCm(i)}>刪除</Button>
            </div>
            <div className="space-y-3">
              <Input label="對應真因" value={cm.root_cause_name} onChange={(e) => updateCm(i, 'root_cause_name', e.target.value)} />
              <Textarea label="What — 對策方案" value={cm.what} onChange={(e) => updateCm(i, 'what', e.target.value)} rows={2} />
              <Input label="Why — 為何" value={cm.why} onChange={(e) => updateCm(i, 'why', e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Who — 負責人" value={cm.who} onChange={(e) => updateCm(i, 'who', e.target.value)} />
                <Input label="Where — 範圍" value={cm.where} onChange={(e) => updateCm(i, 'where', e.target.value)} />
                <Input label="When — 完成日" type="date" value={cm.when} onChange={(e) => updateCm(i, 'when', e.target.value)} />
              </div>
              <Textarea label="How — 執行方法" value={cm.how} onChange={(e) => updateCm(i, 'how', e.target.value)} rows={2} />
            </div>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addCountermeasure}>
          + 新增對策
        </Button>
      </Card>

      {/* Evaluation Criteria */}
      <Card title="評價項目">
        {(d.evaluation_criteria || []).map((c, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <Input
              value={c}
              placeholder={`評價項目（如：可行性、經濟性、效益性）`}
              onChange={(e) => {
                const criteria = [...(d.evaluation_criteria || [])]
                criteria[i] = e.target.value
                update({ evaluation_criteria: criteria })
              }}
              className="flex-1"
            />
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addCriterion}>
          + 新增評價項目
        </Button>
      </Card>

      {/* Evaluation Matrix */}
      {(d.countermeasures || []).length > 0 && (d.evaluation_criteria || []).length > 0 && (
        <Card title="對策評價矩陣（圈長代填）">
          <div className="mb-3">
            <Input
              label="採行門檻分數"
              type="number"
              value={d.adoption_threshold || 0}
              onChange={(e) => update({ adoption_threshold: parseInt(e.target.value) || 0 })}
              className="w-32"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left text-gray-500">對策</th>
                  {(d.evaluation_criteria || []).map((c, i) => (
                    <th key={i} className="px-2 py-2 text-center text-gray-500">{c || `項目${i + 1}`}</th>
                  ))}
                  <th className="px-2 py-2 text-center text-gray-700">合計</th>
                  <th className="px-2 py-2 text-center text-gray-700">結果</th>
                </tr>
              </thead>
              <tbody>
                {(d.countermeasures || []).map((cm) => {
                  const total = totals[cm.id] || 0
                  const isAdopted = (d.adopted || []).includes(cm.id)
                  const isRejected = (d.rejected || []).includes(cm.id)
                  return (
                    <tr key={cm.id} className="border-b">
                      <td className="max-w-[150px] truncate px-2 py-2 text-gray-700">{cm.what || '(未命名)'}</td>
                      {(d.evaluation_criteria || []).map((criterion, ci) => (
                        <td key={ci} className="px-2 py-2 text-center">
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={getScore(cm.id, criterion) || ''}
                            onChange={(e) => setScore(cm.id, criterion, parseInt(e.target.value) || 0)}
                            className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-medium">{total}</td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => toggleAdopted(cm.id)}
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            isAdopted ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {isAdopted ? '採行' : isRejected ? '不採行' : '未定'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Phase 2 placeholder */}
      <Card title="對策壓力測試" description="Phase 2 啟用">
        <div className="flex h-16 items-center justify-center rounded-md border-2 border-dashed border-gray-200 text-sm text-gray-400">
          對策壓力測試迴圈（Phase 2）
        </div>
      </Card>
    </div>
  )
}
