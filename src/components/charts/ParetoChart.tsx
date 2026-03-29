'use client'

import { useRef } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ParetoItem } from '@/types'

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, TitleComponent, CanvasRenderer])

interface Props {
  data: ParetoItem[]
  title?: string
}

export default function ParetoChart({ data, title = '柏拉圖' }: Props) {
  const chartRef = useRef<ReactEChartsCore>(null)

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        無數據
      </div>
    )
  }

  const option: echarts.EChartsCoreOption = {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['次數', '累積百分比'], bottom: 0 },
    grid: { top: 40, right: 50, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      axisLabel: { rotate: data.length > 6 ? 30 : 0, fontSize: 11 },
    },
    yAxis: [
      { type: 'value', name: '次數', position: 'left' },
      { type: 'value', name: '累積 %', position: 'right', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    ],
    series: [
      {
        name: '次數',
        type: 'bar',
        data: data.map((d) => d.count),
        itemStyle: { color: '#3b82f6' },
      },
      {
        name: '累積百分比',
        type: 'line',
        yAxisIndex: 1,
        data: data.map((d) => d.cumulative_percentage),
        itemStyle: { color: '#ef4444' },
        markLine: {
          silent: true,
          data: [{ yAxis: 80, label: { formatter: '80%' } }],
          lineStyle: { type: 'dashed', color: '#f97316' },
        },
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
