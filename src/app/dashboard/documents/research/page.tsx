'use client'

import { useState } from 'react'
import { ResearchInput } from '@/components/research/ResearchInput'
import { ResearchProgress } from '@/components/research/ResearchProgress'
import { ResearchResult } from '@/components/research/ResearchResult'
import { ResearchHistory } from '@/components/research/ResearchHistory'
import { useResearch } from '@/hooks/research/useResearch'
import { useResearchHistory } from '@/hooks/research/useResearchHistory'
import type { ResearchResult as ResearchResultType } from '@/types/research'

export default function ResearchPage() {
  const [currentResult, setCurrentResult] = useState<ResearchResultType | null>(null)
  const { step, result, error, execute, reset } = useResearch()
  const { history, isLoading: historyLoading, fetchHistory, deleteItem } = useResearchHistory()

  const isActive =
    step === 'optimizing' || step === 'searching' || step === 'summarizing'
  const hasResult = result !== null && step === 'completed'
  const displayResult = hasResult ? result : currentResult

  async function handleSubmit(query: string) {
    const res = await execute(query)
    if (res) {
      setCurrentResult(res)
      await fetchHistory()
    }
  }

  function handleReset() {
    reset()
    setCurrentResult(null)
  }

  async function handleDelete(id: string) {
    await deleteItem(id)
    if (displayResult?.id === id) {
      handleReset()
    }
  }

  async function handleSelectHistory(id: string) {
    try {
      const res = await fetch(`/api/research/${id}`)
      if (res.ok) {
        const data: ResearchResultType = await res.json()
        setCurrentResult(data)
        // Show as completed result
        reset()
        // Re-set after reset clears state: use currentResult display path
        setCurrentResult(data)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          リサーチアシスタント
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          最新情報を自動収集し、要約されたリサーチレポートを生成します
        </p>
      </div>

      {/* Main panel */}
      <div
        className="rounded-2xl border border-card-border bg-card overflow-hidden"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        {/* Panel header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="font-semibold text-sm text-foreground">
            {isActive ? '処理中' : displayResult ? 'リサーチ結果' : '新規リサーチ'}
          </span>
          {displayResult && !isActive && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-foreground-tertiary hover:text-foreground px-2 py-1 rounded hover:bg-fill-tertiary transition-colors"
            >
              新しいリサーチ
            </button>
          )}
        </div>

        <div className="p-5">
          {isActive ? (
            <ResearchProgress step={step} />
          ) : displayResult ? (
            <ResearchResult result={displayResult} />
          ) : (
            <ResearchInput onSubmit={handleSubmit} isLoading={false} />
          )}
        </div>
      </div>

      {/* Error banner */}
      {step === 'error' && error && (
        <div className="px-4 py-3 rounded-xl bg-danger-bg border border-danger/40 text-sm text-danger flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs underline hover:no-underline shrink-0"
          >
            再試行
          </button>
        </div>
      )}

      {/* History */}
      <ResearchHistory
        items={history}
        isLoading={historyLoading}
        onDelete={handleDelete}
        onSelect={handleSelectHistory}
      />
    </div>
  )
}
