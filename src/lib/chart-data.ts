// Chart data utilities for Pareto, improvement calculations

import type { CategoryCount, ParetoItem } from '@/types'

/**
 * Sort categories by count (desc), append "其他" last,
 * then compute cumulative counts and percentages.
 */
export function sortPareto(categories: CategoryCount[]): ParetoItem[] {
  const total = categories.reduce((sum, c) => sum + c.count, 0)
  if (total === 0) return []

  // Separate "其他" and sort the rest by count desc
  const other = categories.filter((c) => c.name === '其他')
  const rest = categories
    .filter((c) => c.name !== '其他')
    .sort((a, b) => b.count - a.count)

  const sorted = [...rest, ...other]

  let cumulativeCount = 0
  return sorted.map((item) => {
    cumulativeCount += item.count
    return {
      name: item.name,
      count: item.count,
      cumulative_count: cumulativeCount,
      percentage: Number(((item.count / total) * 100).toFixed(1)),
      cumulative_percentage: Number(((cumulativeCount / total) * 100).toFixed(1)),
    }
  })
}

/**
 * Calculate improvement rate.
 * For reduction type: (before - after) / before * 100
 * For improvement type: (after - before) / before * 100
 */
export function calculateImprovement(
  beforeRate: number,
  afterRate: number,
  themeType: 'reduction' | 'improvement'
): number {
  if (beforeRate === 0) return 0
  if (themeType === 'reduction') {
    return Number((((beforeRate - afterRate) / beforeRate) * 100).toFixed(1))
  }
  return Number((((afterRate - beforeRate) / beforeRate) * 100).toFixed(1))
}

/**
 * Calculate goal achievement rate.
 * For reduction: (before - after) / (before - target) * 100
 * For improvement: (after - before) / (target - before) * 100
 */
export function calculateAchievement(
  beforeRate: number,
  afterRate: number,
  targetRate: number,
  themeType: 'reduction' | 'improvement'
): number {
  if (themeType === 'reduction') {
    const denominator = beforeRate - targetRate
    if (denominator === 0) return 0
    return Number((((beforeRate - afterRate) / denominator) * 100).toFixed(1))
  }
  const denominator = targetRate - beforeRate
  if (denominator === 0) return 0
  return Number((((afterRate - beforeRate) / denominator) * 100).toFixed(1))
}

/**
 * Calculate target value using QCC formula.
 * For reduction: current * (1 - focusRatio * capability)
 * For improvement: current * (1 + focusRatio * capability)
 */
export function calculateTarget(
  currentValue: number,
  focusRatio: number,
  capability: number,
  themeType: 'reduction' | 'improvement'
): number {
  if (themeType === 'reduction') {
    return Number((currentValue * (1 - focusRatio * capability)).toFixed(2))
  }
  return Number((currentValue * (1 + focusRatio * capability)).toFixed(2))
}
