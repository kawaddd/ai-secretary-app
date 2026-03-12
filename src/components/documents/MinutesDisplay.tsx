'use client'

import { useState } from 'react'
import type { MinutesDocument } from '@/types/minutes'
import { AudioPlayer } from './AudioPlayer'

interface Props {
  doc: MinutesDocument
}

export function MinutesDisplay({ doc }: Props) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const meta = doc.metadata

  if (!meta) {
    return (
      <p className="text-sm text-foreground-secondary py-4">データが見つかりません。</p>
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      {meta.summary && (
        <div className="px-5 py-4 rounded-2xl border border-primary/20 bg-primary-bg/30">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">概要</p>
          <p className="text-sm text-foreground leading-relaxed">{meta.summary}</p>
        </div>
      )}

      {/* Three-column grid on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Discussed topics */}
        <Section
          title="議論された内容"
          items={meta.discussedTopics}
          color="info"
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
          emptyLabel="記録なし"
        />

        {/* Decisions */}
        <Section
          title="決定事項"
          items={meta.decisions}
          color="success"
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          emptyLabel="決定事項なし"
        />

        {/* Next actions */}
        <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="text-warning">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <span className="text-xs font-semibold text-foreground">ネクストアクション</span>
            <span className="ml-auto text-xs text-foreground-tertiary">{meta.nextActions.length}件</span>
          </div>
          <div className="px-4 py-3">
            {meta.nextActions.length === 0 ? (
              <p className="text-xs text-foreground-tertiary py-2">アクションなし</p>
            ) : (
              <ul className="space-y-2.5">
                {meta.nextActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 text-warning shrink-0 text-sm leading-none font-bold" aria-hidden="true">・</span>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground leading-snug">{a.task}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {a.assignee && (
                          <span className="text-xs text-foreground-secondary">担当: {a.assignee}</span>
                        )}
                        {a.dueDate && (
                          <span className="text-xs text-warning">期限: {a.dueDate}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Transcription accordion + Audio player */}
      {(doc.original_content || meta?.audioFileName) && (
        <div className="rounded-2xl border border-card-border overflow-hidden">
          {doc.original_content && (
            <>
              <button
                type="button"
                onClick={() => setTranscriptOpen((v) => !v)}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-3 bg-card hover:bg-fill-quaternary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-inset"
              >
                <span className="text-sm font-medium text-foreground">文字起こし全文</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-foreground-tertiary transition-transform duration-200 ${transcriptOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {transcriptOpen && (
                <div className="px-5 py-4 border-t border-border bg-background-secondary space-y-3">
                  {formatTranscription(doc.original_content).map((para, i) => (
                    <p key={i} className="text-sm text-foreground-secondary leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Audio player */}
          {meta?.audioFileName && (
            <AudioPlayer
              documentId={doc.id}
              fileName={meta.audioFileName}
            />
          )}
        </div>
      )}
    </div>
  )
}

function formatTranscription(text: string): string[] {
  const lines = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return lines.length > 0 ? lines : [text]
}

type SectionColor = 'info' | 'success' | 'warning'

function Section({
  title,
  items,
  color,
  icon,
  emptyLabel,
}: {
  title: string
  items: string[]
  color: SectionColor
  icon: React.ReactNode
  emptyLabel: string
}) {
  const colorMap: Record<SectionColor, { text: string; border: string; bg: string }> = {
    info: { text: 'text-info', border: 'border-info/20', bg: 'bg-info-bg/30' },
    success: { text: 'text-success', border: 'border-success/20', bg: 'bg-success-bg/30' },
    warning: { text: 'text-warning', border: 'border-warning/20', bg: 'bg-warning-bg/30' },
  }
  const c = colorMap[color]

  return (
    <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className={c.text}>{icon}</span>
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <span className="ml-auto text-xs text-foreground-tertiary">{items.length}件</span>
      </div>
      <div className="px-4 py-3">
        {items.length === 0 ? (
          <p className="text-xs text-foreground-tertiary py-2">{emptyLabel}</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.text.replace('text-', 'bg-')}`} aria-hidden="true" />
                <span className="text-sm text-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
