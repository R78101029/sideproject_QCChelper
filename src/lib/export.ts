// PDF export via Browserless/Chrome container

const BROWSERLESS_URL = process.env.BROWSERLESS_URL || 'http://localhost:3001'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface ExportOptions {
  projectId: string
  token: string // pass auth cookie for the render page
}

export async function generatePDF({ projectId, token }: ExportOptions): Promise<Buffer> {
  const renderUrl = `${APP_URL}/project/${projectId}/export/render`

  const response = await fetch(`${BROWSERLESS_URL}/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: renderUrl,
      options: {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          bottom: '15mm',
          left: '12mm',
          right: '12mm',
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="width:100%;text-align:center;font-size:9px;color:#999;padding:0 20mm;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `,
      },
      cookies: [
        {
          name: 'qcc_token',
          value: token,
          domain: new URL(APP_URL).hostname,
          path: '/',
        },
      ],
      waitForSelector: '#report-ready',
      waitForTimeout: 3000,
    }),
  })

  if (!response.ok) {
    throw new Error(`PDF generation failed: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
