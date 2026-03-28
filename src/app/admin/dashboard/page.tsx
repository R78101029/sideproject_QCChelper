'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'

interface DashboardStats {
  totalActive: number
  totalCompleted: number
  stalledCount: number
}

interface ProjectSummary {
  id: string
  name: string
  circleName: string
  department: string
  memberCount: number
  stepsCompleted: number
  daysSinceUpdate: number | null
  isStalled: boolean
  improvementRate: number | null
  goalAchievementRate: number | null
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setStats(res.data.stats)
          setProjects(res.data.projects)
        }
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <AppLayout displayName="管理員" onLogout={handleLogout}>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-xl font-bold text-gray-900">管理員儀表板</h1>

        {/* Stats */}
        {stats && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalActive}</p>
                <p className="text-sm text-gray-500">進行中專案</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
                <p className="text-sm text-gray-500">已完成</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.stalledCount}</p>
                <p className="text-sm text-gray-500">卡關預警</p>
              </div>
            </Card>
          </div>
        )}

        {/* Project list */}
        <Card title="全院專案一覽">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left text-gray-500">專案</th>
                  <th className="px-3 py-2 text-left text-gray-500">科別</th>
                  <th className="px-3 py-2 text-center text-gray-500">進度</th>
                  <th className="px-3 py-2 text-center text-gray-500">閒置天數</th>
                  <th className="px-3 py-2 text-center text-gray-500">狀態</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Link href={`/project/${p.id}`} className="text-blue-600 hover:underline">
                        {p.name}
                      </Link>
                      <br />
                      <span className="text-xs text-gray-400">{p.circleName}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{p.department}</td>
                    <td className="px-3 py-2 text-center">{p.stepsCompleted}/10</td>
                    <td className="px-3 py-2 text-center">
                      {p.daysSinceUpdate ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {p.isStalled ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">卡關</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">正常</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-4">
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
            帳號管理 →
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
