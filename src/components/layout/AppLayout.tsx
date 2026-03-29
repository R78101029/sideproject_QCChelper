'use client'

import Sidebar from './Sidebar'
import Header from './Header'

interface AppLayoutProps {
  children: React.ReactNode
  projectId?: string
  projectName?: string
  circleName?: string
  stepStatuses?: Record<number, 'not_started' | 'in_progress' | 'completed'>
  displayName?: string
  userRole?: string
  onLogout?: () => void
}

export default function AppLayout({
  children,
  projectId,
  projectName,
  circleName,
  stepStatuses,
  displayName,
  userRole,
  onLogout,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar
        projectId={projectId}
        projectName={projectName}
        circleName={circleName}
        stepStatuses={stepStatuses}
        userRole={userRole}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header displayName={displayName} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
