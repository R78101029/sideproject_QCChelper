'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'

const STEP_NAMES = [
  '組圈',
  '主題選定',
  '活動計畫',
  '現況把握',
  '目標設定',
  '解析',
  '對策擬定',
  '對策實施',
  '效果確認',
  '標準化',
]

interface ProjectDetail {
  id: string
  name: string
  circleName: string
  department: string
  status: string
  periodStart: string | null
  periodEnd: string | null
  steps: { stepNumber: number; status: string; updatedAt: string | null }[]
}

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProject(res.data)
      })
  }, [id])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">載入中…</p>
      </div>
    )
  }

  const stepStatusMap: Record<number, 'not_started' | 'in_progress' | 'completed'> = {}
  project.steps.forEach((s) => {
    stepStatusMap[s.stepNumber] = s.status as 'not_started' | 'in_progress' | 'completed'
  })

  const statusLabel = {
    not_started: '未開始',
    in_progress: '進行中',
    completed: '已完成',
  }

  const statusColor = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }

  return (
    <AppLayout
      projectId={project.id}
      projectName={project.name}
      circleName={project.circleName}
      stepStatuses={stepStatusMap}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {project.circleName} · {project.department}
          </p>
        </div>

        <div className="space-y-3">
          {STEP_NAMES.map((name, i) => {
            const n = i + 1
            const status = (stepStatusMap[n] || 'not_started') as keyof typeof statusLabel
            const step = project.steps.find((s) => s.stepNumber === n)

            return (
              <Link key={n} href={`/project/${project.id}/step/${n}`} className="block">
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                        {n}
                      </span>
                      <span className="font-medium text-gray-900">{name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {step?.updatedAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(step.updatedAt).toLocaleDateString('zh-TW')}
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-0.5 text-xs ${statusColor[status]}`}>
                        {statusLabel[status]}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
