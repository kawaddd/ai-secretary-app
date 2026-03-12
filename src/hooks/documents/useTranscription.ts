'use client'

import { useState, useEffect, useRef } from 'react'
import type { TranscriptionStatus } from '@/types/minutes'

const POLL_INTERVAL_MS = 4000

export function useTranscription() {
  const [status, setStatus] = useState<TranscriptionStatus | null>(null)
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startPolling(transcriptionId: string) {
    stopPolling()
    setStatus('queued')
    setError(null)
    setText(null)

    async function poll() {
      const res = await fetch(`/api/documents/minutes/transcribe/${transcriptionId}`)
      if (!res.ok) return
      const data = await res.json()
      setStatus(data.status)

      if (data.status === 'completed') {
        setText(data.text ?? null)
        stopPolling()
      } else if (data.status === 'error') {
        setError(data.error ?? '文字起こしに失敗しました')
        stopPolling()
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
  }

  function reset() {
    stopPolling()
    setStatus(null)
    setText(null)
    setError(null)
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  return { status, text, error, startPolling, stopPolling, reset }
}
