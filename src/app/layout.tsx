import type { Metadata } from 'next'
import './globals.css'
import ToastContainer from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'QCC Helper — 品管圈協助工具',
  description: '醫院品管圈（QCC）十步驟表單、數據分析、AI 輔助、PDF 報告匯出',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
