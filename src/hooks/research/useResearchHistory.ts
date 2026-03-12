'use client'

import { useState, useEffect } from 'react'
import type { ResearchHistoryItem } from '@/types/research'

export function useResearchHistory() {
  const [history, setHistory] = useState<ResearchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function fetchHistory(): Promise<void> {
    setIsLoading(true)
    try {
      const res = await fetch('/api/research')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteItem(id: string): Promise<void> {
    await fetch(`/api/research/${id}`, { method: 'DELETE' })
    await fetchHistory()
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return { history, isLoading, fetchHistory, deleteItem }
}
