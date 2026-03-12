'use client'

import { useState } from 'react'
import type { Suggestion, SuggestionType } from '@/types/document'

const TYPE_CONFIG: Record<
  SuggestionType,
  { label: string; color: string; bg: string; dot: string }
> = {
  spelling: { label: '誤字脱字', color: 'text-danger', bg: 'bg-danger-bg', dot: 'bg-danger' },
  grammar: { label: '文法修正', color: 'text-warning', bg: 'bg-warning-bg', dot: 'bg-warning' },
  style: { label: '文体改善', color: 'text-info', bg: 'bg-info-bg', dot: 'bg-info' },
  structure: { label: '構成提案', color: 'text-foreground-secondary', bg: 'bg-fill-secondary', dot: 'bg-foreground-tertiary' },
}

const TYPE_ORDER: SuggestionType[] = ['spelling', 'grammar', 'style', 'structure']

type FilterTab = SuggestionType | 'all'

interface Props {
  suggestions: Suggestion[]
  writingStyleMatch: number
  onAccept: (id: string) => void
  onReject: (id: string) => void
}

export function ProofreadResult({ suggestions, writingStyleMatch, onAccept, onReject }: Props) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [accepted, setAccepted] = useState<Set<string>>(new Set())

  const active = suggestions.filter((s) => !dismissed.has(s.id) && !accepted.has(s.id))

  const counts: Record<FilterTab, number> = {
    all: active.length,
    spelling: active.filter((s) => s.type === 'spelling').length,
    grammar: active.filter((s) => s.type === 'grammar').length,
    style: active.filter((s) => s.type === 'style').length,
    structure: active.filter((s) => s.type === 'structure').length,
  }

  const visible = filter === 'all' ? active : active.filter((s) => s.type === filter)

  function handleAccept(id: string) {
    setAccepted((prev) => new Set(prev).add(id))
    onAccept(id)
  }

  function handleReject(id: string) {
    setDismissed((prev) => new Set(prev).add(id))
    onReject(id)
  }

  const matchColor =
    writingStyleMatch >= 70
      ? 'text-success'
      : writingStyleMatch >= 40
        ? 'text-warning'
        : 'text-danger'

  const matchBg =
    writingStyleMatch >= 70
      ? 'bg-success-bg'
      : writingStyleMatch >= 40
        ? 'bg-warning-bg'
        : 'bg-danger-bg'

  return (
    <div
      className="rounded-2xl border border-card-border overflow-hidden bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-foreground text-sm">校正提案</span>
          {/* Writing style match */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${matchBg}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={matchColor} aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className={`text-xs font-semibold ${matchColor}`}>
              文体一致度 {writingStyleMatch}%
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {(['all', ...TYPE_ORDER] as FilterTab[]).map((tab) => {
            const count = counts[tab]
            const isActive = filter === tab
            const cfg = tab !== 'all' ? TYPE_CONFIG[tab] : null
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                disabled={count === 0 && tab !== 'all'}
                className={[
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  isActive
                    ? tab === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : `${cfg?.bg} ${cfg?.color}`
                    : 'text-foreground-secondary hover:text-foreground hover:bg-fill-tertiary',
                ].join(' ')}
              >
                {tab !== 'all' && (
                  <span
                    className={[
                      'w-1.5 h-1.5 rounded-full',
                      isActive ? cfg?.dot : 'bg-foreground-tertiary',
                    ].join(' ')}
                  />
                )}
                {tab === 'all' ? '全て' : TYPE_CONFIG[tab].label}
                <span
                  className={[
                    'px-1 py-0.5 rounded text-xs tabular-nums min-w-4 text-center',
                    isActive && tab === 'all' ? 'bg-white/20' : 'bg-fill-tertiary',
                  ].join(' ')}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Suggestions list */}
      <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
        {visible.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-fill-tertiary flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-tertiary" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm text-foreground-secondary">提案はありません</p>
          </div>
        ) : (
          visible.map((s) => {
            const cfg = TYPE_CONFIG[s.type]
            const confidencePct = Math.round(s.confidence * 100)
            return (
              <div key={s.id} className="px-5 py-4 space-y-2.5 hover:bg-fill-quaternary transition-colors">
                {/* Type badge + confidence */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1 bg-fill-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${confidencePct}%`,
                          backgroundColor: confidencePct >= 80 ? 'var(--success)' : 'var(--warning)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-foreground-tertiary tabular-nums w-7 text-right">
                      {confidencePct}%
                    </span>
                  </div>
                </div>

                {/* Before → After */}
                <div className="flex items-start gap-2">
                  <span className="text-xs bg-danger-bg text-danger px-2 py-1 rounded-lg font-mono leading-relaxed shrink-0 max-w-[45%] break-words">
                    {s.original || '（なし）'}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-tertiary mt-1 shrink-0" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span className="text-xs bg-success-bg text-success px-2 py-1 rounded-lg font-mono leading-relaxed shrink-0 max-w-[45%] break-words">
                    {s.suggested || '（削除）'}
                  </span>
                </div>

                {/* Explanation */}
                <p className="text-xs text-foreground-secondary leading-relaxed">{s.explanation}</p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleReject(s.id)}
                    className="text-xs text-foreground-tertiary hover:text-danger px-3 py-1.5 rounded-lg hover:bg-danger-bg transition-colors font-medium"
                  >
                    却下
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccept(s.id)}
                    className="text-xs text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg hover:bg-primary-bg transition-colors font-medium border border-primary/30 hover:border-primary/50"
                  >
                    適用
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
