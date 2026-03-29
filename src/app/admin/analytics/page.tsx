'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'

interface TrendData {
  year: number
  totalProjects: number
  completedProjects: number
  avgImprovement: number | null
  avgAchievement: number | null
}

interface HeatmapData {
  departments: string[]
  years: number[]
  matrix: number[][]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [trends, setTrends] = useState<TrendData[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null)

  useEffect(() => {
    fetch('/api/admin/analytics/trends').then((r) => r.json()).then((res) => { if (res.success) setTrends(res.data) })
    fetch('/api/admin/analytics/department-heatmap').then((r) => r.json()).then((res) => { if (res.success) setHeatmap(res.data) })
  }, [])

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }

  return (
    <AppLayout displayName="管理員" onLogout={handleLogout}>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-xl font-bold text-gray-900">趨勢分析</h1>

        {/* Trends table */}
        <Card title="年度趨勢">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left text-gray-500">年度</th>
                  <th className="px-3 py-2 text-center text-gray-500">總專案</th>
                  <th className="px-3 py-2 text-center text-gray-500">已完成</th>
                  <th className="px-3 py-2 text-center text-gray-500">平均改善幅度</th>
                  <th className="px-3 py-2 text-center text-gray-500">平均達成率</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t) => (
                  <tr key={t.year} className="border-b">
                    <td className="px-3 py-2 font-medium">{t.year}</td>
                    <td className="px-3 py-2 text-center">{t.totalProjects}</td>
                    <td className="px-3 py-2 text-center">{t.completedProjects}</td>
                    <td className="px-3 py-2 text-center">{t.avgImprovement != null ? `${t.avgImprovement}%` : '—'}</td>
                    <td className="px-3 py-2 text-center">{t.avgAchievement != null ? `${t.avgAchievement}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Department heatmap */}
        {heatmap && heatmap.departments.length > 0 && (
          <Card title="科別 × 年度 圈隊數" className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-gray-500">科別</th>
                    {heatmap.years.map((y) => (
                      <th key={y} className="px-3 py-2 text-center text-gray-500">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.departments.map((dept, di) => (
                    <tr key={dept} className="border-b">
                      <td className="px-3 py-2 font-medium text-gray-700">{dept}</td>
                      {heatmap.matrix[di].map((count, yi) => (
                        <td key={yi} className="px-3 py-2 text-center">
                          <span className={`inline-block rounded px-2 py-0.5 text-xs ${
                            count === 0 ? 'text-gray-300' : count <= 2 ? 'bg-blue-100 text-blue-700' : 'bg-blue-500 text-white'
                          }`}>
                            {count}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
