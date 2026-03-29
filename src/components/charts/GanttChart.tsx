'use client'

import { useRef } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { Step3ScheduleItem } from '@/types'

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

interface Props {
  schedule: Step3ScheduleItem[]
  title?: string
}

export default function GanttChart({ schedule, title = '活動甘特圖' }: Props) {
  const chartRef = useRef<ReactEChartsCore>(null)

  const items = schedule.filter((s) => s.planned_start && s.planned_end)
  if (!items.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        請先填寫各步驟的預定日期
      </div>
    )
  }

  // Find date range
  const allDates = items.flatMap((s) => [s.planned_start, s.planned_end, s.actual_start, s.actual_end].filter(Boolean) as string[])
  const minDate = new Date(Math.min(...allDates.map((d) => new Date(d).getTime())))
  const maxDate = new Date(Math.max(...allDates.map((d) => new Date(d).getTime())))

  const toMs = (d: string) => new Date(d).getTime()
  const baseMs = minDate.getTime()

  const categories = items.map((s) => `${s.step_number}. ${s.step_name}`).reverse()

  // Planned bars (light blue)
  const plannedData = items.map((s, i) => ({
    name: '預定',
    value: [items.length - 1 - i, toMs(s.planned_start!) - baseMs, toMs(s.planned_end!) - baseMs],
  }))

  // Actual bars (solid blue)
  const actualData = items
    .map((s, i) => {
      if (!s.actual_start) return null
      const end = s.actual_end || s.planned_end || s.actual_start
      return {
        name: '實際',
        value: [items.length - 1 - i, toMs(s.actual_start) - baseMs, toMs(end) - baseMs],
      }
    })
    .filter(Boolean)

  const totalDays = Math.ceil((maxDate.getTime() - baseMs) / (1000 * 60 * 60 * 24)) + 7

  const renderItem = (params: { coordSys: { x: number; y: number; width: number; height: number } }, api: { value: (idx: number) => number; coord: (val: [number, number]) => [number, number]; size: (val: [number, number]) => [number, number] }) => {
    const categoryIndex = api.value(0)
    const start = api.coord([api.value(1), categoryIndex])
    const end = api.coord([api.value(2), categoryIndex])
    const barHeight = api.size([0, 1])[1] * 0.4

    return {
      type: 'rect' as const,
      shape: {
        x: start[0],
        y: start[1] - barHeight / 2,
        width: end[0] - start[0],
        height: barHeight,
      },
      style: api.value(1) === api.value(2)
        ? { fill: 'transparent' }
        : undefined,
    }
  }

  const option: echarts.EChartsCoreOption = {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {
      formatter: (params: { value: number[] }) => {
        const start = new Date(baseMs + params.value[1]).toLocaleDateString('zh-TW')
        const end = new Date(baseMs + params.value[2]).toLocaleDateString('zh-TW')
        return `${start} ~ ${end}`
      },
    },
    legend: { data: ['預定', '實際'], bottom: 0 },
    grid: { top: 40, right: 30, bottom: 40, left: 120 },
    xAxis: {
      type: 'value',
      min: 0,
      max: totalDays * 24 * 60 * 60 * 1000,
      axisLabel: {
        formatter: (val: number) => {
          const d = new Date(baseMs + val)
          return `${d.getMonth() + 1}/${d.getDate()}`
        },
      },
    },
    yAxis: {
      type: 'category',
      data: categories,
    },
    series: [
      {
        name: '預定',
        type: 'custom',
        renderItem,
        encode: { x: [1, 2], y: 0 },
        data: plannedData,
        itemStyle: { color: '#93c5fd', borderColor: '#3b82f6', borderWidth: 1, borderType: 'dashed' },
      },
      {
        name: '實際',
        type: 'custom',
        renderItem,
        encode: { x: [1, 2], y: 0 },
        data: actualData,
        itemStyle: { color: '#3b82f6' },
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
      <ReactEChartsCore ref={chartRef} echarts={echarts} option={option} style={{ height: Math.max(300, items.length * 40 + 100) }} />
      <div className="mt-2 text-right">
        <button onClick={handleDownload} className="text-xs text-blue-600 hover:underline">
          下載 PNG
        </button>
      </div>
    </div>
  )
}
