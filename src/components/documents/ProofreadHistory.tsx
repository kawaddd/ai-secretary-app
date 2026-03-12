'use client'

import { useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { Input } from '@/components/ui/Input'
import type { ProofreadHistoryItem } from '@/types/document'

const TYPE_LABELS: Record<string, string> = {
  email: 'メール',
  report: '報告書',
  proposal: '提案書',
  minutes: '議事録',
  announcement: 'お知らせ',
  apology: 'お詫び文',
  thanks: 'お礼状',
  sns: 'SNS',
  presentation: 'プレゼン',
  general: '一般',
}

const TYPE_COLORS: Record<string, string> = {
  email: 'bg-info-bg text-info',
  report: 'bg-warning-bg text-warning',
  proposal: 'bg-primary-bg text-primary',
  minutes: 'bg-fill-secondary text-foreground-secondary',
  announcement: 'bg-warning-bg text-warning',
  apology: 'bg-danger-bg text-danger',
  thanks: 'bg-success-bg text-success',
  sns: 'bg-primary-bg text-primary',
  presentation: 'bg-info-bg text-info',
  general: 'bg-fill-secondary text-foreground-secondary',
}

interface Props {
  items: ProofreadHistoryItem[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  onRestore: (item: ProofreadHistoryItem) => void
}

export function ProofreadHistory({
  items,
  isLoading,
  searchQuery,
  onSearchChange,
  onRestore,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-2xl border border-card-border overflow-hidden bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-fill-quaternary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-fill-tertiary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-secondary" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-foreground">校正履歴</span>
          {items.length > 0 && (
            <span className="text-xs bg-fill-tertiary text-foreground-secondary px-2 py-0.5 rounded-full font-medium">
              {items.length}件
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-foreground-tertiary transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible body */}
      {open && (
        <>
          <div className="px-5 pb-3 pt-1 border-t border-border">
            <Input
              placeholder="タイトルや本文を検索..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="履歴を検索"
              leadingIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
          </div>

          <div className="border-t border-border">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-foreground-secondary">
                  {searchQuery ? '該当する履歴がありません' : '校正履歴がありません'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map((item) => {
                  const docType = item.metadata?.documentType
                  const match = item.metadata?.writingStyleMatch
                  const suggCount = item.metadata?.suggestions?.length ?? 0
                  return (
                    <div
                      key={item.id}
                      className="px-5 py-3.5 flex items-start justify-between gap-4 hover:bg-fill-quaternary transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {docType && (
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[docType] ?? 'bg-fill-secondary text-foreground-secondary'}`}
                            >
                              {TYPE_LABELS[docType] ?? docType}
                            </span>
                          )}
                          {suggCount > 0 && (
                            <span className="text-xs text-foreground-tertiary">
                              {suggCount}件の提案
                            </span>
                          )}
                          {match != null && (
                            <span
                              className={`text-xs font-medium ${match >= 70 ? 'text-success' : match >= 40 ? 'text-warning' : 'text-danger'}`}
                            >
                              文体一致 {match}%
                            </span>
                          )}
                          <span className="text-xs text-foreground-tertiary ml-auto">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString('ja-JP', {
                                  month: 'numeric',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                        <p className="text-sm text-foreground truncate leading-snug">
                          {item.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRestore(item)}
                        className="shrink-0 text-xs font-medium text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg hover:bg-primary-bg transition-colors border border-primary/20 hover:border-primary/40"
                      >
                        再編集
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
