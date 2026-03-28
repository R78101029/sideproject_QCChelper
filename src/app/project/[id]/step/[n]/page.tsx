'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import SaveIndicator from '@/components/ui/SaveIndicator'
import Step1Form from '@/components/steps/Step1Form'
import Step2Form from '@/components/steps/Step2Form'
import Step3Form from '@/components/steps/Step3Form'
import Step4Form from '@/components/steps/Step4Form'
import Step5Form from '@/components/steps/Step5Form'
import Step6Form from '@/components/steps/Step6Form'
import Step7Form from '@/components/steps/Step7Form'
import Step8Form from '@/components/steps/Step8Form'
import Step9Form from '@/components/steps/Step9Form'
import Step10Form from '@/components/steps/Step10Form'
import AgentChat from '@/components/chat/AgentChat'
import { useAutoSave } from '@/lib/hooks/useAutoSave'

const STEP_NAMES = [
  '組圈', '主題選定', '活動計畫', '現況把握', '目標設定',
  '解析', '對策擬定', '對策實施', '效果確認', '標準化',
]

const STEP_COMPONENTS = {
  1: Step1Form,
  2: Step2Form,
  3: Step3Form,
  4: Step4Form,
  5: Step5Form,
  6: Step6Form,
  7: Step7Form,
  8: Step8Form,
  9: Step9Form,
  10: Step10Form,
} as const

interface ProjectInfo {
  id: string
  name: string
  circleName: string
  steps: { stepNumber: number; status: string }[]
}

export default function StepPage() {
  const { id, n } = useParams<{ id: string; n: string }>()
  const router = useRouter()
  const stepNumber = parseInt(n, 10) as keyof typeof STEP_COMPONENTS

  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [stepData, setStepData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const { status: saveStatus, onChange } = useAutoSave<Record<string, unknown>>({
    projectId: id,
    stepNumber,
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/projects/${id}/steps/${n}`).then((r) => r.json()),
    ]).then(([projRes, stepRes]) => {
      if (projRes.success) setProject(projRes.data)
      if (stepRes.success) setStepData(stepRes.data.data)
      setLoading(false)
    })
  }, [id, n])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleChange = (data: Record<string, unknown>) => {
    setStepData(data)
    onChange(data)
  }

  if (loading || !stepData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">載入中…</p>
      </div>
    )
  }

  const stepStatuses: Record<number, 'not_started' | 'in_progress' | 'completed'> = {}
  project?.steps.forEach((s) => {
    stepStatuses[s.stepNumber] = s.status as 'not_started' | 'in_progress' | 'completed'
  })

  const StepForm = STEP_COMPONENTS[stepNumber]

  if (!StepForm) {
    return <div>步驟 {n} 不存在</div>
  }

  return (
    <AppLayout
      projectId={id}
      projectName={project?.name}
      circleName={project?.circleName}
      stepStatuses={stepStatuses}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              步驟 {stepNumber}：{STEP_NAMES[stepNumber - 1]}
            </h1>
          </div>
          <SaveIndicator status={saveStatus} />
        </div>

        <StepForm data={stepData} onChange={handleChange} projectId={id} />
      </div>

      <AgentChat projectId={id} stepNumber={stepNumber} />
    </AppLayout>
  )
}
