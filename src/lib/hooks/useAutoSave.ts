'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface UseAutoSaveOptions {
  projectId: string
  stepNumber: number
  debounceMs?: number
}

export function useAutoSave<T>({ projectId, stepNumber, debounceMs = 3000 }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('saved')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef<T | null>(null)
  const isMountedRef = useRef(true)

  const save = useCallback(async (data: T) => {
    setStatus('saving')
    try {
      const res = await fetch(`/api/projects/${projectId}/steps/${stepNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      const result = await res.json()
      if (isMountedRef.current) {
        setStatus(result.success ? 'saved' : 'unsaved')
      }
      return result.success
    } catch {
      if (isMountedRef.current) setStatus('unsaved')
      return false
    }
  }, [projectId, stepNumber])

  const onChange = useCallback((data: T) => {
    dataRef.current = data
    setStatus('unsaved')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (dataRef.current) save(dataRef.current)
    }, debounceMs)
  }, [debounceMs, save])

  const saveNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (dataRef.current) return save(dataRef.current)
    return Promise.resolve(true)
  }, [save])

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (status === 'unsaved') {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [status])

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { status, onChange, saveNow }
}
