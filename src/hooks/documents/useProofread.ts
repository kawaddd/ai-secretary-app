'use client'

import { useState } from 'react'
import type { ProofreadRequest, ProofreadResult } from '@/types/document'

export function useProofread() {
  const [result, setResult] = useState<ProofreadResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function proofread(req: ProofreadRequest) {
    setIsLoading(true)
    setError(null)

    const res = await fetch('/api/documents/proofread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? '校正に失敗しました')
      setIsLoading(false)
      return
    }

    setResult(data)
    setIsLoading(false)
  }

  function clearResult() {
    setResult(null)
    setError(null)
  }

  return { result, isLoading, error, proofread, clearResult }
}
