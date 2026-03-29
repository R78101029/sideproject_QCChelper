'use client'

import { useRef } from 'react'
import type { MainCategory } from '@/types'

interface Props {
  categories: MainCategory[]
  confirmedRootCauses: string[]
  onToggleRootCause?: (causeId: string) => void
}

const BONE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']

export default function FishboneChart({ categories, confirmedRootCauses, onToggleRootCause }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  if (!categories.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        請先新增要因分類
      </div>
    )
  }

  const width = 900
  const height = 500
  const centerY = height / 2
  const headX = width - 80
  const tailX = 60
  const spineLength = headX - tailX

  // Split categories into top and bottom
  const topCats = categories.filter((_, i) => i % 2 === 0)
  const bottomCats = categories.filter((_, i) => i % 2 === 1)

  const renderBranch = (
    cat: MainCategory,
    index: number,
    isTop: boolean,
    totalInRow: number,
    colorIndex: number
  ) => {
    const spacing = spineLength / (totalInRow + 1)
    const boneX = tailX + spacing * (index + 1)
    const boneEndY = isTop ? centerY - 140 : centerY + 140
    const color = BONE_COLORS[colorIndex % BONE_COLORS.length]

    const elements: React.ReactNode[] = []

    // Main bone line
    elements.push(
      <line
        key={`bone-${cat.id}`}
        x1={boneX}
        y1={centerY}
        x2={boneX}
        y2={boneEndY}
        stroke={color}
        strokeWidth={2}
      />
    )

    // Category label
    elements.push(
      <text
        key={`label-${cat.id}`}
        x={boneX}
        y={isTop ? boneEndY - 10 : boneEndY + 18}
        textAnchor="middle"
        className="fill-gray-800 text-xs font-bold"
      >
        {cat.name.replace(/（.*）/, '')}
      </text>
    )

    // Medium + small causes as sub-branches
    cat.medium_causes.forEach((med, mi) => {
      const subY = isTop
        ? centerY - 30 - mi * 35
        : centerY + 30 + mi * 35

      const subEndX = boneX + (mi % 2 === 0 ? 70 : -70)

      // Medium cause line
      elements.push(
        <line
          key={`med-${med.id}`}
          x1={boneX}
          y1={subY}
          x2={subEndX}
          y2={subY + (isTop ? -15 : 15)}
          stroke={color}
          strokeWidth={1.5}
          opacity={0.7}
        />
      )

      // Medium cause label
      if (med.name) {
        elements.push(
          <text
            key={`medlabel-${med.id}`}
            x={subEndX + (mi % 2 === 0 ? 5 : -5)}
            y={subY + (isTop ? -18 : 28)}
            textAnchor={mi % 2 === 0 ? 'start' : 'end'}
            className="fill-gray-700 text-[10px]"
          >
            {med.name.length > 8 ? med.name.slice(0, 8) + '…' : med.name}
          </text>
        )
      }

      // Small causes
      med.small_causes.forEach((sc, si) => {
        const scX = subEndX + (mi % 2 === 0 ? 10 + si * 5 : -10 - si * 5)
        const scY = subY + (isTop ? -15 : 15) + (si + 1) * (isTop ? -12 : 12)
        const isRoot = confirmedRootCauses.includes(sc.id)

        if (sc.name) {
          elements.push(
            <g
              key={`sc-${sc.id}`}
              onClick={() => onToggleRootCause?.(sc.id)}
              className="cursor-pointer"
            >
              <circle
                cx={scX}
                cy={scY}
                r={4}
                fill={isRoot ? '#ef4444' : '#d1d5db'}
                stroke={isRoot ? '#ef4444' : '#9ca3af'}
                strokeWidth={1}
              />
              <text
                x={scX + 8}
                y={scY + 3}
                className={`text-[9px] ${isRoot ? 'fill-red-600 font-bold' : 'fill-gray-600'}`}
              >
                {sc.name.length > 10 ? sc.name.slice(0, 10) + '…' : sc.name}
              </text>
            </g>
          )
        }
      })
    })

    return elements
  }

  const handleDownload = () => {
    const svg = svgRef.current
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '魚骨圖.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minHeight: 400 }}
      >
        {/* Background */}
        <rect width={width} height={height} fill="white" />

        {/* Spine (main horizontal line) */}
        <line x1={tailX} y1={centerY} x2={headX} y2={centerY} stroke="#374151" strokeWidth={3} />

        {/* Fish head (arrow) */}
        <polygon
          points={`${headX},${centerY - 20} ${headX + 40},${centerY} ${headX},${centerY + 20}`}
          fill="#374151"
        />

        {/* Top branches */}
        {topCats.map((cat, i) => renderBranch(cat, i, true, topCats.length, categories.indexOf(cat)))}

        {/* Bottom branches */}
        {bottomCats.map((cat, i) => renderBranch(cat, i, false, bottomCats.length, categories.indexOf(cat)))}
      </svg>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          點擊圓點標記/取消真因（紅色 = 真因）
        </p>
        <button onClick={handleDownload} className="text-xs text-blue-600 hover:underline">
          下載 SVG
        </button>
      </div>
    </div>
  )
}
