'use client'

import { useState } from 'react'
import type { ResearchResult, ResearchStep } from '@/types/research'

export function useResearch() {
  const [step, setStep] = useState<ResearchStep | 'idle'>('idle')
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isLoading =
    step === 'optimizing' || step === 'searching' || step === 'summarizing'

  async function execute(query: string): Promise<ResearchResult | null> {
    setStep('optimizing')
    setError(null)
    setResult(null)

    const t1 = setTimeout(() => setStep('searching'), 1500)
    const t2 = setTimeout(() => setStep('summarizing'), 5000)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      clearTimeout(t1)
      clearTimeout(t2)
      const data = await res.json()
      if (!res.ok) {
        setStep('error')
        setError(data.error ?? 'リサーチに失敗しました')
        return null
      }
      setStep('completed')
      setResult(data)
      return data
    } catch {
      clearTimeout(t1)
      clearTimeout(t2)
      setStep('error')
      setError('通信エラーが発生しました')
      return null
    }
  }

  function reset() {
    setStep('idle')
    setResult(null)
    setError(null)
  }

  return { step, result, error, isLoading, execute, reset }
}
