'use client'

import type { ResearchSource } from '@/types/research'

interface Props {
  sources: ResearchSource[]
}

export function SourcesList({ sources }: Props) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">出典</h3>
        <span className="text-xs font-medium text-foreground-tertiary bg-fill-tertiary px-2 py-0.5 rounded-full">
          {sources.length}件
        </span>
      </div>

      {sources.length === 0 ? (
        <p className="text-sm text-foreground-tertiary py-4 text-center">出典情報なし</p>
      ) : (
        <div className="space-y-2">
          {sources.map((source, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-fill-tertiary/30 px-4 py-3 space-y-1.5"
            >
              {/* Title row */}
              <div className="flex items-start gap-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:text-primary-hover hover:underline flex items-center gap-1 min-w-0"
                >
                  <span className="truncate">{source.title}</span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                {source.publishedDate && (
                  <span className="text-xs text-foreground-tertiary shrink-0 mt-0.5">
                    {source.publishedDate}
                  </span>
                )}
              </div>

              {/* URL */}
              <p className="text-xs text-foreground-tertiary truncate">{source.url}</p>

              {/* Excerpt */}
              {source.excerpt && (
                <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-2">
                  {source.excerpt}
                </p>
              )}

              {/* Credibility score */}
              {source.credibilityScore !== undefined && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-foreground-tertiary shrink-0">信頼度</span>
                  <div className="flex-1 h-1 rounded-full bg-fill-tertiary overflow-hidden">
                    <div
                      className={[
                        'h-full rounded-full',
                        source.credibilityScore >= 70
                          ? 'bg-success'
                          : source.credibilityScore >= 40
                            ? 'bg-warning'
                            : 'bg-danger',
                      ].join(' ')}
                      style={{ width: `${source.credibilityScore}%` }}
                    />
                  </div>
                  <span
                    className={[
                      'text-[10px] font-semibold tabular-nums shrink-0 w-7 text-right',
                      source.credibilityScore >= 70
                        ? 'text-success'
                        : source.credibilityScore >= 40
                          ? 'text-warning'
                          : 'text-danger',
                    ].join(' ')}
                  >
                    {source.credibilityScore}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
