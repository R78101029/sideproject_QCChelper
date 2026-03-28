'use client'

import { useRef } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { RadarChart as ERadarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([ERadarChart, TooltipComponent, LegendComponent, RadarComponent, CanvasRenderer])

interface Props {
  criteria: string[]
  before: number[]
  after: number[]
  title?: string
}

export default function RadarChart({ criteria, before, after, title = '無形成果雷達圖' }: Props) {
  const chartRef = useRef<ReactEChartsCore>(null)

  if (!criteria.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        無數據
      </div>
    )
  }

  const option: echarts.EChartsCoreOption = {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {},
    legend: { data: ['改善前', '改善後'], bottom: 0 },
    radar: {
      indicator: criteria.map((name) => ({ name, max: 5 })),
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: before,
            name: '改善前',
            lineStyle: { type: 'dashed' },
            areaStyle: { opacity: 0.1 },
            itemStyle: { color: '#94a3b8' },
          },
          {
            value: after,
            name: '改善後',
            areaStyle: { opacity: 0.15 },
            itemStyle: { color: '#3b82f6' },
          },
        ],
      },
    ],
  }

  const handleDownload = () => {
    const instance = chartRef.current?.getEchartsInstance()
    if (!instance) return
    const url = instance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.png`
    a.click()
  }

  return (
    <div>
      <ReactEChartsCore ref={chartRef} echarts={echarts} option={option} style={{ height: 350 }} />
      <div className="mt-2 text-right">
        <button onClick={handleDownload} className="text-xs text-blue-600 hover:underline">
          下載 PNG
        </button>
      </div>
    </div>
  )
}
