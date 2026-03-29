'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

interface KnowledgeProject {
  id: string
  name: string
  circleName: string
  department: string
  topicCategory: string | null
  improvementRate: number | null
}

interface RootCause {
  name: string
  count: number
  categories: string[]
}

interface Countermeasure {
  what: string
  how: string
  projectName: string
  projectId: string
  improvementRate: number | null
}

export default function KnowledgeBasePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState<KnowledgeProject[]>([])
  const [rootCauses, setRootCauses] = useState<RootCause[]>([])
  const [countermeasures, setCountermeasures] = useState<Countermeasure[]>([])
  const [tab, setTab] = useState<'projects' | 'causes' | 'measures'>('projects')

  useEffect(() => {
    fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`).then((r) => r.json()).then((res) => { if (res.success) setProjects(res.data) })
    fetch('/api/knowledge/root-causes').then((r) => r.json()).then((res) => { if (res.success) setRootCauses(res.data) })
    fetch('/api/knowledge/countermeasures').then((r) => r.json()).then((res) => { if (res.success) setCountermeasures(res.data) })
  }, [query])

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }

  return (
    <AppLayout displayName="管理員" onLogout={handleLogout}>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-xl font-bold text-gray-900">知識庫</h1>

        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋專案名稱、圈名…" className="mb-4" />

        <div className="mb-4 flex border-b border-gray-200">
          {(['projects', 'causes', 'measures'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
              {t === 'projects' ? `歷年專案 (${projects.length})` : t === 'causes' ? `真因庫 (${rootCauses.length})` : `對策庫 (${countermeasures.length})`}
            </button>
          ))}
        </div>

        {tab === 'projects' && (
          <div className="space-y-3">
            {projects.length === 0 ? (
              <Card><p className="py-6 text-center text-gray-500">尚無公開的已完成專案</p></Card>
            ) : projects.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/project/${p.id}`} className="font-medium text-blue-600 hover:underline">{p.name}</Link>
                    <p className="text-sm text-gray-500">{p.circleName} · {p.department} · {p.topicCategory || '未分類'}</p>
                  </div>
                  {p.improvementRate != null && (
                    <span className="text-sm font-medium text-green-600">改善 {p.improvementRate}%</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'causes' && (
          <Card>
            <div className="space-y-2">
              {rootCauses.length === 0 ? (
                <p className="py-6 text-center text-gray-500">尚無真因資料</p>
              ) : rootCauses.map((rc, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-100 py-2">
                  <div>
                    <span className="font-medium text-gray-800">{rc.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{rc.categories.join(', ')}</span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{rc.count} 次</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'measures' && (
          <div className="space-y-3">
            {countermeasures.length === 0 ? (
              <Card><p className="py-6 text-center text-gray-500">尚無對策資料</p></Card>
            ) : countermeasures.map((cm, i) => (
              <Card key={i}>
                <p className="font-medium text-gray-800">{cm.what}</p>
                <p className="mt-1 text-sm text-gray-600">{cm.how}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <Link href={`/project/${cm.projectId}`} className="text-blue-500 hover:underline">{cm.projectName}</Link>
                  {cm.improvementRate != null && <span className="text-green-600">改善 {cm.improvementRate}%</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
