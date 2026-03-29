// Upstream snapshot + hash comparison for data consistency
import { createHash } from 'crypto'

// Define which fields from upstream steps are "core data" for downstream steps
const UPSTREAM_CORE_FIELDS: Record<number, { sourceStep: number; fields: string[] }[]> = {
  5: [{ sourceStep: 4, fields: ['current_rate', 'vital_few'] }],
  9: [
    { sourceStep: 4, fields: ['current_rate', 'categories'] },
    { sourceStep: 5, fields: ['target_value'] },
  ],
}

export function getCoreFields(stepNumber: number): { sourceStep: number; fields: string[] }[] {
  return UPSTREAM_CORE_FIELDS[stepNumber] || []
}

export function computeDataHash(data: Record<string, unknown>, fields: string[]): string {
  const subset: Record<string, unknown> = {}
  for (const field of fields) {
    subset[field] = data[field] ?? null
  }
  const json = JSON.stringify(subset, null, 0)
  return createHash('md5').update(json).digest('hex')
}

export interface SnapshotCheck {
  sourceStep: number
  isChanged: boolean
  currentHash: string
  snapshotHash: string | null
}

export function checkUpstreamChanges(
  stepNumber: number,
  currentUpstreamData: Record<number, Record<string, unknown>>,
  existingSnapshot: Record<string, unknown> | null
): SnapshotCheck[] {
  const coreFields = getCoreFields(stepNumber)
  const checks: SnapshotCheck[] = []

  for (const { sourceStep, fields } of coreFields) {
    const sourceData = currentUpstreamData[sourceStep]
    if (!sourceData) continue

    const currentHash = computeDataHash(sourceData, fields)
    const snapshotHash = existingSnapshot
      ? (existingSnapshot as Record<string, string>).data_hash || null
      : null

    checks.push({
      sourceStep,
      isChanged: snapshotHash !== null && snapshotHash !== currentHash,
      currentHash,
      snapshotHash,
    })
  }

  return checks
}

export function createSnapshot(
  sourceData: Record<number, Record<string, unknown>>,
  stepNumber: number
): Record<string, unknown> {
  const coreFields = getCoreFields(stepNumber)
  const snapshot: Record<string, unknown> = { snapshot_at: new Date().toISOString() }

  for (const { sourceStep, fields } of coreFields) {
    const data = sourceData[sourceStep]
    if (!data) continue

    for (const field of fields) {
      snapshot[`step${sourceStep}_${field}`] = data[field] ?? null
    }
    snapshot.data_hash = computeDataHash(data, fields)
  }

  return snapshot
}
