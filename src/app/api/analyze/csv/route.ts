import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { sortPareto } from '@/lib/chart-data'

const CSV_MAX_ROWS = parseInt(process.env.CSV_MAX_ROWS || '50000', 10)

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ success: false, error: '未上傳檔案' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter((l) => l.trim())

    if (lines.length > CSV_MAX_ROWS) {
      return NextResponse.json(
        { success: false, error: `CSV 超過 ${CSV_MAX_ROWS} 行上限` },
        { status: 400 }
      )
    }

    // Parse CSV: detect format
    // Format 1: category,count (two columns)
    // Format 2: category (one column, count occurrences)
    const countsMap = new Map<string, number>()
    let totalChecks = 0
    const hasHeader = lines.length > 0 && isNaN(parseInt(lines[0].split(',')[1]?.trim()))
    const startLine = hasHeader ? 1 : 0

    for (let i = startLine; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''))
      if (parts.length === 0 || !parts[0]) continue

      const category = parts[0]
      const count = parts.length >= 2 ? parseInt(parts[1]) || 1 : 1

      countsMap.set(category, (countsMap.get(category) || 0) + count)
      totalChecks += count
    }

    const categories = Array.from(countsMap.entries()).map(([name, count]) => ({
      name,
      count,
    }))

    const paretoSorted = sortPareto(categories)

    // Vital few: items up to 80% cumulative
    const vitalFew = paretoSorted
      .filter((p) => p.cumulative_percentage <= 80 || paretoSorted.indexOf(p) === 0)
      .map((p) => p.name)

    return NextResponse.json({
      success: true,
      data: {
        categories,
        pareto_sorted: paretoSorted,
        vital_few: vitalFew,
        total_checks: totalChecks,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'CSV 解析失敗' },
      { status: 500 }
    )
  }
}
