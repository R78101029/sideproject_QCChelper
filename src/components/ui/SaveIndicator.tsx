'use client'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface SaveIndicatorProps {
  status: SaveStatus
}

const config: Record<SaveStatus, { label: string; dot: string }> = {
  saved: { label: '已儲存', dot: 'bg-green-500' },
  saving: { label: '儲存中…', dot: 'bg-yellow-500 animate-pulse' },
  unsaved: { label: '未儲存', dot: 'bg-gray-400' },
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  const { label, dot } = config[status]
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {label}
    </div>
  )
}
