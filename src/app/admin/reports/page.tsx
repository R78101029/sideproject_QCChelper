'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface BenefitSummary {
  type: string
  label: string
  count: number
  totalValue: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [benefits, setBenefits] = useState<BenefitSummary[]>([])
  const [totalBenefits, setTotalBenefits] = useState(0)

  useEffect(() => {
    fetch('/api/admin/analytics/benefits').then((r) => r.json()).then((res) => {
      if (res.success) {
        setBenefits(res.data.summary)
        setTotalBenefits(res.data.total)
      }
    })
  }, [])

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }

  return (
    <AppLayout displayName="管理員" onLogout={handleLogout}>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-xl font-bold text-gray-900">評鑑報告</h1>

        <Card title="全院效益彙總">
          {totalBenefits === 0 ? (
            <p className="py-6 text-center text-gray-500">尚無效益填報資料</p>
          ) : (
            <div className="space-y-3">
              {benefits.map((b) => (
                <div key={b.type} className="flex items-center justify-between border-b border-gray-100 py-2">
                  <div>
                    <span className="font-medium text-gray-800">{b.label}</span>
                    <span className="ml-2 text-sm text-gray-500">{b.count} 個專案</span>
                  </div>
                  {b.totalValue > 0 && (
                    <span className="text-sm font-medium text-green-600">{b.totalValue.toLocaleString()}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="年度成果報告" className="mt-6">
          <p className="mb-4 text-sm text-gray-500">
            匯出全院品管圈年度成果摘要 PDF，包含圈隊數、完成率、平均改善幅度、代表圈隊等。
          </p>
          <Button onClick={() => { /* TODO: implement annual report export */ }}>
            匯出年度報告 PDF
          </Button>
        </Card>
      </div>
    </AppLayout>
  )
}
