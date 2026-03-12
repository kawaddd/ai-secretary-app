'use client'

import { useState, useEffect } from 'react'
import type { WritingStyle } from '@/types/document'

interface WritingStyleData {
  style_patterns: WritingStyle
  sample_count: number
  updated_at: string
}

export function useWritingStyle() {
  const [data, setData] = useState<WritingStyleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchStyle() {
    setIsLoading(true)
    const res = await fetch('/api/documents/writing-style')
    if (res.ok) {
      const json = await res.json()
      setData(json)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchStyle()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function analyzeStyle(text: string) {
    setIsAnalyzing(true)
    setError(null)
    const res = await fetch('/api/documents/writing-style/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? '文体分析に失敗しました')
    } else {
      setData(json)
    }
    setIsAnalyzing(false)
  }

  return {
    writingStyle: data?.style_patterns ?? null,
    sampleCount: data?.sample_count ?? 0,
    updatedAt: data?.updated_at ?? null,
    isLoading,
    isAnalyzing,
    error,
    analyzeStyle,
    refetch: fetchStyle,
  }
}
