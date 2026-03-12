'use client'

import { Badge } from '@/components/ui/Badge'
import { SourcesList } from '@/components/research/SourcesList'
import type { ResearchResult as ResearchResultType } from '@/types/research'

interface Props {
  result: ResearchResultType
}

export function ResearchResult({ result }: Props) {
  const { summary, sources } = result
  const displayKeyPoints = summary.keyPoints.slice(0, 6)

  return (
    <div className="space-y-5">
      {/* Section 1: 概要 */}
      <div className="rounded-xl border border-primary/20 bg-primary-bg/20 px-4 py-4 space-y-1.5">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">概要</h3>
        <p className="text-sm text-foreground leading-relaxed">{summary.overview}</p>
      </div>

      {/* Section 2: 主要ポイント */}
      {displayKeyPoints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">主要ポイント</h3>
          <ul className="space-y-2">
            {displayKeyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-sm text-foreground-secondary leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 3: 詳細情報 */}
      {summary.details && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">詳細情報</h3>
          <div className="rounded-xl border border-border bg-fill-tertiary/20 px-4 py-3">
            <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-line">
              {summary.details}
            </p>
          </div>
        </div>
      )}

      {/* Section 4: 関連トピック */}
      {summary.relatedTopics.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">関連トピック</h3>
          <div className="flex flex-wrap gap-2">
            {summary.relatedTopics.map((topic, i) => (
              <Badge key={i} variant="default">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Sources */}
      <SourcesList sources={sources} />
    </div>
  )
}
