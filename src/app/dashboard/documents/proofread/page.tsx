'use client'

import { useState } from 'react'
import { DocumentEditor } from '@/components/documents/DocumentEditor'
import { ProofreadPanel } from '@/components/documents/ProofreadPanel'
import { ProofreadResult } from '@/components/documents/ProofreadResult'
import { WritingStyleAnalyzer } from '@/components/documents/WritingStyleAnalyzer'
import { ProofreadHistory } from '@/components/documents/ProofreadHistory'
import { useProofread } from '@/hooks/documents/useProofread'
import { useWritingStyle } from '@/hooks/documents/useWritingStyle'
import { useProofreadHistory } from '@/hooks/documents/useProofreadHistory'
import type { DocumentType, ProofreadHistoryItem, SuggestionType } from '@/types/document'

const SUGGESTION_TYPE_LABELS: Record<SuggestionType, string> = {
  spelling: '誤字脱字',
  grammar: '文法修正',
  style: '文体改善',
  structure: '構成提案',
}

export default function ProofreadPage() {
  const [content, setContent] = useState('')
  const [docType, setDocType] = useState<DocumentType>('general')
  const [applyStyle, setApplyStyle] = useState(true)

  const { result, isLoading, error, proofread, clearResult } = useProofread()
  const {
    writingStyle,
    sampleCount,
    updatedAt,
    isLoading: styleLoading,
    isAnalyzing,
    error: styleError,
    analyzeStyle,
  } = useWritingStyle()
  const {
    filtered: historyItems,
    isLoading: historyLoading,
    searchQuery,
    setSearchQuery,
    refetch: refetchHistory,
  } = useProofreadHistory()

  async function handleProofread() {
    await proofread({
      content,
      documentType: docType,
      applyUserStyle: applyStyle && !!writingStyle,
    })
    await refetchHistory()
  }

  function handleApplyAll() {
    if (result) {
      setContent(result.corrected)
      clearResult()
    }
  }

  function handleAcceptSuggestion(id: string) {
    if (!result) return
    const s = result.suggestions.find((s) => s.id === id)
    if (!s?.original) return
    setContent((prev) => prev.replace(s.original, s.suggested))
  }

  function handleRestoreFromHistory(item: ProofreadHistoryItem) {
    setContent(item.original_content ?? '')
    clearResult()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Compute suggestion stats for summary bar
  const suggestionStats = result
    ? (['spelling', 'grammar', 'style', 'structure'] as SuggestionType[]).map((type) => ({
        type,
        count: result.suggestions.filter((s) => s.type === type).length,
      })).filter((s) => s.count > 0)
    : []

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">文章校正</h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            AIがあなたの文体を学習し、パーソナライズされた校正を提供します
          </p>
        </div>
        {writingStyle && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-bg border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">文体学習済み</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger-bg border border-danger/40 text-sm text-danger flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Result summary bar */}
      {result && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-success/30 bg-success-bg/50 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">校正完了</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="text-foreground-secondary">
              合計{' '}
              <span className="font-semibold text-foreground">{result.suggestions.length}件</span>{' '}
              の提案
            </span>
            {suggestionStats.map(({ type, count }) => (
              <span key={type} className="text-foreground-secondary">
                {SUGGESTION_TYPE_LABELS[type]}{' '}
                <span className="font-semibold text-foreground">{count}</span>
              </span>
            ))}
            <span
              className={`font-semibold ${result.writingStyleMatch >= 70 ? 'text-success' : result.writingStyleMatch >= 40 ? 'text-warning' : 'text-danger'}`}
            >
              文体一致度 {result.writingStyleMatch}%
            </span>
          </div>
          <button
            type="button"
            onClick={clearResult}
            className="ml-auto text-xs text-foreground-tertiary hover:text-foreground px-2 py-1 rounded-lg hover:bg-fill-tertiary transition-colors"
          >
            閉じる
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Editor + Comparison */}
        <div className="xl:col-span-2 space-y-5">
          <DocumentEditor
            content={content}
            onChange={setContent}
            documentType={docType}
            onDocumentTypeChange={(t) => {
              setDocType(t)
              clearResult()
            }}
            onProofread={handleProofread}
            isLoading={isLoading}
            applyStyle={applyStyle}
            onApplyStyleChange={setApplyStyle}
            hasWritingStyle={!!writingStyle}
          />

          {result && (
            <ProofreadPanel
              original={result.original}
              corrected={result.corrected}
              onApply={handleApplyAll}
            />
          )}
        </div>

        {/* Right: Style + Suggestions */}
        <div className="space-y-5">
          <WritingStyleAnalyzer
            writingStyle={writingStyle}
            sampleCount={sampleCount}
            updatedAt={updatedAt}
            isLoading={styleLoading}
            isAnalyzing={isAnalyzing}
            error={styleError}
            currentText={content}
            onAnalyze={analyzeStyle}
          />

          {result && (
            <ProofreadResult
              suggestions={result.suggestions}
              writingStyleMatch={result.writingStyleMatch}
              onAccept={handleAcceptSuggestion}
              onReject={() => {}}
            />
          )}
        </div>
      </div>

      {/* History (collapsible) */}
      <ProofreadHistory
        items={historyItems}
        isLoading={historyLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRestore={handleRestoreFromHistory}
      />
    </div>
  )
}
