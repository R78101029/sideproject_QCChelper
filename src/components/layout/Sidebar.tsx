'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
] as const

interface SidebarProps {
  projectId?: string
  projectName?: string
  circleName?: string
  stepStatuses?: Record<number, 'not_started' | 'in_progress' | 'completed'>
}

function StepStatusDot({ status }: { status: 'not_started' | 'in_progress' | 'completed' }) {
  const colors = {
    not_started: 'bg-gray-300',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
  }
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[status]}`} />
}

export default function Sidebar({ projectId, projectName, circleName, stepStatuses = {} }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-200 px-4 py-4">
        <Link href="/" className="text-lg font-bold text-gray-900">
          QCC Helper
        </Link>
        <p className="mt-0.5 text-xs text-gray-500">品管圈協助工具</p>
      </div>

      {/* Project Info */}
      {projectId && (
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="truncate text-sm font-medium text-gray-900">{projectName || '未命名專案'}</p>
          {circleName && <p className="truncate text-xs text-gray-500">{circleName}</p>}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {projectId ? (
          <>
            <Link
              href={`/project/${projectId}`}
              className={`mb-1 flex items-center rounded-md px-3 py-2 text-sm ${
                pathname === `/project/${projectId}`
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              專案總覽
            </Link>
            <div className="mb-1 px-3 pt-2 text-xs font-medium uppercase tracking-wider text-gray-400">
              十大步驟
            </div>
            {STEP_NAMES.map((name, i) => {
              const n = i + 1
              const status = stepStatuses[n] || 'not_started'
              const isActive = pathname === `/project/${projectId}/step/${n}`
              return (
                <Link
                  key={n}
                  href={`/project/${projectId}/step/${n}`}
                  className={`mb-0.5 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <StepStatusDot status={status} />
                  <span className="text-gray-400">{n}.</span>
                  <span className="truncate">{name}</span>
                </Link>
              )
            })}
            <div className="mt-3 border-t border-gray-200 pt-3">
              <Link
                href={`/project/${projectId}/export`}
                className={`flex items-center rounded-md px-3 py-2 text-sm ${
                  pathname?.startsWith(`/project/${projectId}/export`)
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                匯出報告
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/"
              className={`mb-1 flex items-center rounded-md px-3 py-2 text-sm ${
                pathname === '/'
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              專案列表
            </Link>
            <Link
              href="/project/new"
              className="mb-1 flex items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              建立新專案
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3">
        <Link
          href="/admin/dashboard"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          管理員面板
        </Link>
      </div>
    </aside>
  )
}
