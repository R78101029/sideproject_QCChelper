import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { generatePDF } from '@/lib/export'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '未登入' }, { status: 401 })
  }

  try {
    const token = request.cookies.get('qcc_token')?.value || ''
    const pdfBuffer = await generatePDF({ projectId: id, token })

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="QCC_Report_${id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PDF 產生失敗'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
