// PII Filter — detect and block common PII patterns in text

interface PiiMatch {
  type: string
  value: string
  position: number
}

const PII_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  // Taiwan National ID: A123456789
  { type: '身分證字號', regex: /[A-Z][12]\d{8}/g },
  // Medical record number: common patterns
  { type: '病歷號', regex: /(?:病歷號|chart[_\s]?no)[：:\s]*[\w-]+/gi },
  // Phone numbers
  { type: '電話號碼', regex: /(?:0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4})/g },
  // Mobile
  { type: '手機號碼', regex: /09\d{2}[-\s]?\d{3}[-\s]?\d{3}/g },
  // Email
  { type: 'Email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
]

export function detectPii(text: string): PiiMatch[] {
  const matches: PiiMatch[] = []

  for (const { type, regex } of PII_PATTERNS) {
    let match: RegExpExecArray | null
    const re = new RegExp(regex.source, regex.flags)
    while ((match = re.exec(text)) !== null) {
      matches.push({
        type,
        value: match[0],
        position: match.index,
      })
    }
  }

  return matches
}

export function hasPii(text: string): boolean {
  return detectPii(text).length > 0
}

export function maskPii(text: string): string {
  let masked = text
  const matches = detectPii(text)

  // Sort by position descending to preserve indices
  matches.sort((a, b) => b.position - a.position)

  for (const match of matches) {
    const replacement = match.value.slice(0, 2) + '***'
    masked = masked.slice(0, match.position) + replacement + masked.slice(match.position + match.value.length)
  }

  return masked
}
