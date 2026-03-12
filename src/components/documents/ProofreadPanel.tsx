'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type DiffToken = { type: 'equal' | 'delete' | 'insert'; text: string }
type ViewMode = 'split' | 'diff'

function computeWordDiff(original: string, corrected: string): DiffToken[] {
  const a = original.match(/\S+|\s+/g) ?? []
  const b = corrected.match(/\S+|\s+/g) ?? []
  const m = a.length
  const n = b.length

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const result: DiffToken[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'equal', text: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'insert', text: b[j - 1] })
      j--
    } else {
      result.unshift({ type: 'delete', text: a[i - 1] })
      i--
    }
  }
  return result
}

interface Props {
  original: string
  corrected: string
  onApply: () => void
}

export function ProofreadPanel({ original, corrected, onApply }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [copied, setCopied] = useState(false)

  const diff = computeWordDiff(original, corrected)
  const hasChanges = diff.some((t) => t.type !== 'equal')
  const deleteCount = diff.filter((t) => t.type === 'delete').length
  const insertCount = diff.filter((t) => t.type === 'insert').length

  async function handleCopy() {
    await navigator.clipboard.writeText(corrected)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-2xl border border-card-border overflow-hidden"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-card border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground text-sm">校正比較</span>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-danger-bg text-danger px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                {deleteCount}削除
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-success-bg text-success px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                {insertCount}追加
              </span>
            </div>
          )}
          {!hasChanges && (
            <span className="text-xs text-foreground-tertiary">変更なし</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-fill-tertiary rounded-lg p-0.5 gap-0.5">
            {(['split', 'diff'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={[
                  'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                  viewMode === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-foreground-secondary hover:text-foreground',
                ].join(' ')}
              >
                {mode === 'split' ? '分割表示' : '差分表示'}
              </button>
            ))}
          </div>

          {/* Copy corrected */}
          <button
            type="button"
            onClick={handleCopy}
            title="校正後テキストをコピー"
            className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-fill-tertiary transition-colors"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>

          {hasChanges && (
            <Button variant="primary" size="sm" onClick={onApply}>
              一括適用
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 bg-card divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Before */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--danger)' }}
              />
              <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
                校正前
              </span>
            </div>
            <div className="text-sm leading-7 whitespace-pre-wrap text-foreground">
              {diff.map((token, idx) => {
                if (token.type === 'insert') return null
                if (token.type === 'delete') {
                  return (
                    <mark
                      key={idx}
                      className="line-through rounded-sm px-0.5 not-italic"
                      style={{
                        backgroundColor: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        textDecorationColor: 'var(--danger)',
                      }}
                    >
                      {token.text}
                    </mark>
                  )
                }
                return <span key={idx}>{token.text}</span>
              })}
            </div>
          </div>

          {/* After */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--success)' }}
              />
              <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
                校正後
              </span>
            </div>
            <div className="text-sm leading-7 whitespace-pre-wrap text-foreground">
              {diff.map((token, idx) => {
                if (token.type === 'delete') return null
                if (token.type === 'insert') {
                  return (
                    <mark
                      key={idx}
                      className="rounded-sm px-0.5 not-italic"
                      style={{
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success)',
                      }}
                    >
                      {token.text}
                    </mark>
                  )
                }
                return <span key={idx}>{token.text}</span>
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Unified diff */
        <div className="p-5 bg-card">
          <div className="text-sm leading-7 whitespace-pre-wrap text-foreground">
            {diff.map((token, idx) => {
              if (token.type === 'equal') return <span key={idx}>{token.text}</span>
              if (token.type === 'delete') {
                return (
                  <mark
                    key={idx}
                    className="line-through rounded-sm px-0.5 not-italic"
                    style={{
                      backgroundColor: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      textDecorationColor: 'var(--danger)',
                    }}
                  >
                    {token.text}
                  </mark>
                )
              }
              return (
                <mark
                  key={idx}
                  className="rounded-sm px-0.5 not-italic"
                  style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                >
                  {token.text}
                </mark>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
