'use client'

interface HeaderProps {
  displayName?: string
  onLogout?: () => void
}

export default function Header({ displayName, onLogout }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        {displayName && (
          <span className="text-sm text-gray-600">{displayName}</span>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            登出
          </button>
        )}
      </div>
    </header>
  )
}
