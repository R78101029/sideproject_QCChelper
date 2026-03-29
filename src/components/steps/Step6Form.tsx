'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import FishboneChart from '@/components/charts/FishboneChart'
import GuidedAnalysisPanel from '@/components/steps/GuidedAnalysisPanel'
import type { Step6Data, MainCategory, MediumCause } from '@/types'

// Stable IDs — avoid crypto.randomUUID() during render (causes hydration mismatch)
const DEFAULT_5M1E = [
  { id: '5m1e-man', name: 'Man（人員）' },
  { id: '5m1e-machine', name: 'Machine（設備）' },
  { id: '5m1e-material', name: 'Material（材料）' },
  { id: '5m1e-method', name: 'Method（方法）' },
  { id: '5m1e-measurement', name: 'Measurement（測量）' },
  { id: '5m1e-environment', name: 'Environment（環境）' },
]

interface Props {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  projectId: string
}

type Tab = 'fishbone' | 'guided'

export default function Step6Form({ data, onChange, projectId }: Props) {
  const d = data as unknown as Step6Data
  const [activeTab, setActiveTab] = useState<Tab>('fishbone')

  const update = (patch: Partial<Step6Data>) => {
    onChange({ ...data, ...patch })
  }

  // Initialize with 5M1E if empty (using stable IDs to avoid hydration mismatch)
  const categories: MainCategory[] = d.main_categories?.length
    ? d.main_categories
    : DEFAULT_5M1E.map((item) => ({
        id: item.id,
        name: item.name,
        medium_causes: [],
      }))

  const updateCategories = (cats: MainCategory[]) => {
    update({ main_categories: cats })
  }

  const addMediumCause = (catIndex: number) => {
    const cats = [...categories]
    cats[catIndex] = {
      ...cats[catIndex],
      medium_causes: [
        ...cats[catIndex].medium_causes,
        { id: crypto.randomUUID(), name: '', small_causes: [] },
      ],
    }
    updateCategories(cats)
  }

  const addSmallCause = (catIndex: number, medIndex: number) => {
    const cats = [...categories]
    const med = { ...cats[catIndex].medium_causes[medIndex] }
    med.small_causes = [
      ...med.small_causes,
      { id: crypto.randomUUID(), name: '', is_root_cause: false },
    ]
    cats[catIndex] = { ...cats[catIndex] }
    cats[catIndex].medium_causes = [...cats[catIndex].medium_causes]
    cats[catIndex].medium_causes[medIndex] = med
    updateCategories(cats)
  }

  const toggleRootCause = (causeId: string) => {
    const confirmed = d.confirmed_root_causes || []
    const isConfirmed = confirmed.includes(causeId)
    update({
      confirmed_root_causes: isConfirmed
        ? confirmed.filter((id) => id !== causeId)
        : [...confirmed, causeId],
    })
  }

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('fishbone')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'fishbone'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          魚骨圖分析
        </button>
        <button
          onClick={() => setActiveTab('guided')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'guided'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          AI 因果探勘
        </button>
      </div>

      {activeTab === 'fishbone' ? (
        <>
          {/* Fishbone Chart Visualization */}
          {categories.some((c) => c.medium_causes.length > 0) && (
            <Card title="魚骨圖">
              <FishboneChart
                categories={categories}
                confirmedRootCauses={d.confirmed_root_causes || []}
                onToggleRootCause={toggleRootCause}
              />
            </Card>
          )}

          <Card title="魚骨圖主題">
            <Input
              id="fishbone_topic"
              value={d.fishbone_topic || ''}
              placeholder="例：住院病人跌倒原因分析"
              onChange={(e) => update({ fishbone_topic: e.target.value })}
            />
          </Card>

          {categories.map((cat, ci) => (
            <Card key={cat.id} title={cat.name}>
              {cat.medium_causes.map((med: MediumCause, mi: number) => (
                <div key={med.id} className="mb-4 ml-4 border-l-2 border-gray-200 pl-4">
                  <div className="mb-2">
                    <Input
                      value={med.name}
                      placeholder="中要因名稱"
                      onChange={(e) => {
                        const cats = [...categories]
                        cats[ci] = { ...cats[ci] }
                        cats[ci].medium_causes = [...cats[ci].medium_causes]
                        cats[ci].medium_causes[mi] = { ...med, name: e.target.value }
                        updateCategories(cats)
                      }}
                    />
                  </div>
                  {med.small_causes.map((sc, si) => (
                    <div key={sc.id} className="mb-1 ml-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(d.confirmed_root_causes || []).includes(sc.id)}
                        onChange={() => toggleRootCause(sc.id)}
                        title="標記為真因"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <input
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                        value={sc.name}
                        placeholder="小要因"
                        onChange={(e) => {
                          const cats = [...categories]
                          cats[ci] = { ...cats[ci] }
                          cats[ci].medium_causes = [...cats[ci].medium_causes]
                          cats[ci].medium_causes[mi] = { ...med }
                          cats[ci].medium_causes[mi].small_causes = [...med.small_causes]
                          cats[ci].medium_causes[mi].small_causes[si] = { ...sc, name: e.target.value }
                          updateCategories(cats)
                        }}
                      />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => addSmallCause(ci, mi)} className="ml-4 mt-1">
                    + 小要因
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => addMediumCause(ci)}>
                + 中要因
              </Button>
            </Card>
          ))}
        </>
      ) : (
        <GuidedAnalysisPanel
          projectId={projectId}
          stepData={data}
          onImportResults={(results) => {
            update({
              causal_verification: results,
              confirmed_root_causes: results
                .filter((r) => r.conclusion === 'confirmed')
                .map((r) => r.cause_id),
            })
          }}
        />
      )}
    </div>
  )
}
