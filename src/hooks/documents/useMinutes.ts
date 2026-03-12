'use client'

import { useState, useEffect } from 'react'
import type { MinutesDocument } from '@/types/minutes'

export function useMinutes() {
  const [minutes, setMinutes] = useState<MinutesDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchMinutes() {
    setIsLoading(true)
    setError(null)
    const res = await fetch('/api/documents/minutes')
    if (!res.ok) {
      setError('議事録の取得に失敗しました')
    } else {
      const data = await res.json()
      setMinutes(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchMinutes()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function generateMinutes(
    documentId: string,
    transcriptionText: string,
  ): Promise<MinutesDocument | null> {
    const res = await fetch('/api/documents/minutes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, transcriptionText }),
    })
    if (!res.ok) return null
    const updated = await res.json()
    setMinutes((prev) =>
      prev.map((m) => (m.id === documentId ? updated : m)),
    )
    return updated
  }

  async function updateMinutes(
    id: string,
    payload: Partial<MinutesDocument>,
  ): Promise<MinutesDocument | null> {
    const res = await fetch(`/api/documents/minutes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    const updated = await res.json()
    setMinutes((prev) => prev.map((m) => (m.id === id ? updated : m)))
    return updated
  }

  async function deleteMinutes(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/minutes/${id}`, { method: 'DELETE' })
    if (!res.ok) return false
    setMinutes((prev) => prev.filter((m) => m.id !== id))
    return true
  }

  return {
    minutes,
    isLoading,
    error,
    fetchMinutes,
    generateMinutes,
    updateMinutes,
    deleteMinutes,
  }
}
