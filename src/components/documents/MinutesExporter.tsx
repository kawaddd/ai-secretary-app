'use client'

import { Button } from '@/components/ui/Button'
import { minutesToMarkdown } from '@/lib/minutes/minutesGenerator'
import type { MinutesDocument } from '@/types/minutes'

interface Props {
  doc: MinutesDocument
}

export function MinutesExporter({ doc }: Props) {
  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleMarkdown() {
    const meta = doc.metadata
    if (!meta) return
    const md = minutesToMarkdown(doc.title, meta.meetingDate, meta, doc.original_content ?? undefined)
    downloadFile(md, `${doc.title}.md`, 'text/markdown;charset=utf-8')
  }

  function handleText() {
    const meta = doc.metadata
    if (!meta) return
    const lines: string[] = [
      doc.title,
      `日時: ${meta.meetingDate}`,
      '',
      '【概要】',
      meta.summary || '（なし）',
      '',
      '【議論された内容】',
      ...(meta.discussedTopics.length > 0
        ? meta.discussedTopics.map((t) => `・${t}`)
        : ['（なし）']),
      '',
      '【決定事項】',
      ...(meta.decisions.length > 0
        ? meta.decisions.map((d) => `・${d}`)
        : ['（なし）']),
      '',
      '【ネクストアクション】',
      ...(meta.nextActions.length > 0
        ? meta.nextActions.map((a) => {
            let line = `□ ${a.task}`
            if (a.assignee) line += ` (担当: ${a.assignee})`
            if (a.dueDate) line += ` (期限: ${a.dueDate})`
            return line
          })
        : ['（なし）']),
    ]
    downloadFile(lines.join('\n'), `${doc.title}.txt`, 'text/plain;charset=utf-8')
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-foreground-secondary">エクスポート:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMarkdown}
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        }
      >
        Markdown
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleText}
        icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        }
      >
        テキスト
      </Button>
    </div>
  )
}
