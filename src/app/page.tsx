'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ProjectSummary {
  id: string
  name: string
  circleName: string
  department: string
  status: string
  stepsCompleted: number
  stepsTotal: number
  updatedAt: string
}

interface UserInfo {
  id: string
  displayName: string
  role: string
}

export default function HomePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ]).then(([meRes, projRes]) => {
      if (meRes.success) setUser(meRes.data)
      if (projRes.success) setProjects(projRes.data)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">載入中…</p>
      </div>
    )
  }

  return (
    <AppLayout displayName={user?.displayName} onLogout={handleLogout}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">我的專案</h1>
          <Link href="/project/new">
            <Button>建立新專案</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-gray-500">
              <p>尚無專案</p>
              <p className="mt-1 text-sm">點擊右上角「建立新專案」開始</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <Link key={p.id} href={`/project/${p.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{p.name}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {p.circleName} · {p.department}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      p.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'archived'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.status === 'active' ? '進行中' : p.status === 'completed' ? '已完成' : '已封存'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>完成進度</span>
                      <span>{p.stepsCompleted} / {p.stepsTotal}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${(p.stepsCompleted / p.stepsTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
