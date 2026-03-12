'use client'

import { useState, useEffect } from 'react'
import type { ProofreadHistoryItem } from '@/types/document'

export function useProofreadHistory() {
  const [history, setHistory] = useState<ProofreadHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchHistory() {
    setIsLoading(true)
    const res = await fetch('/api/documents/proofread/history')
    if (res.ok) {
      const data = await res.json()
      setHistory(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = searchQuery.trim()
    ? history.filter(
        (item) =>
          item.title.includes(searchQuery) ||
          item.original_content?.includes(searchQuery),
      )
    : history

  return {
    history,
    filtered,
    isLoading,
    searchQuery,
    setSearchQuery,
    refetch: fetchHistory,
  }
}
