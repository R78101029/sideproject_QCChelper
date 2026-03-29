// CSV Sanitizer — whitelist-based column filtering + PII detection

const SUSPECT_COLUMNS = [
  '姓名', '名字', 'name', 'patient_name', 'patient',
  '身分證', '身份證', 'id_number', 'national_id',
  '病歷號', '病歷', 'chart_no', 'medical_record',
  '電話', '手機', 'phone', 'mobile', 'tel',
  '地址', 'address',
  '出生', 'birthday', 'dob', 'birth_date',
  'email', '信箱',
]

const SAFE_COLUMNS = [
  '分類', '類別', 'category', 'type', 'class',
  '次數', '數量', 'count', 'frequency', 'qty',
  '日期', '時間', 'date', 'time', 'timestamp',
  '科別', '單位', 'department', 'unit',
  '嚴重度', 'severity', 'level',
  '地點', 'location', 'area',
]

export interface SanitizeResult {
  safeColumns: string[]
  suspectColumns: string[]
  removedColumns: string[]
  warnings: string[]
}

export function analyzeColumns(headers: string[]): SanitizeResult {
  const safeColumns: string[] = []
  const suspectColumns: string[] = []
  const warnings: string[] = []

  for (const header of headers) {
    const lower = header.toLowerCase().trim()
    const isSuspect = SUSPECT_COLUMNS.some((s) => lower.includes(s))
    const isSafe = SAFE_COLUMNS.some((s) => lower.includes(s))

    if (isSuspect) {
      suspectColumns.push(header)
      warnings.push(`欄位「${header}」疑似包含個資，建議移除`)
    } else if (isSafe || !isSuspect) {
      safeColumns.push(header)
    }
  }

  return {
    safeColumns,
    suspectColumns,
    removedColumns: suspectColumns,
    warnings,
  }
}

export function filterCsvRows(
  rows: string[][],
  headers: string[],
  safeColumns: string[]
): string[][] {
  const safeIndices = safeColumns.map((col) => headers.indexOf(col)).filter((i) => i >= 0)
  return rows.map((row) => safeIndices.map((i) => row[i]))
}
