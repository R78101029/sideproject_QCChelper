'use client'

import Button from '@/components/ui/Button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900">發生錯誤</h2>
        <p className="mt-2 text-sm text-gray-500">
          {error.message || '頁面載入時發生未預期的錯誤'}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button onClick={reset}>重試</Button>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            回首頁
          </Button>
        </div>
      </div>
    </div>
  )
}
