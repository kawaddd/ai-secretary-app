'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { MinutesDocument, ActionItem } from '@/types/minutes'

interface Props {
  doc: MinutesDocument
  onSave: (updated: Partial<MinutesDocument>) => Promise<void>
  onCancel: () => void
}

export function MinutesEditor({ doc, onSave, onCancel }: Props) {
  const meta = doc.metadata
  const [title, setTitle] = useState(doc.title)
  const [meetingDate, setMeetingDate] = useState(meta?.meetingDate ?? '')
  const [summary, setSummary] = useState(meta?.summary ?? '')
  const [topicsText, setTopicsText] = useState((meta?.discussedTopics ?? []).join('\n'))
  const [decisionsText, setDecisionsText] = useState((meta?.decisions ?? []).join('\n'))
  const [actionsText, setActionsText] = useState(
    (meta?.nextActions ?? []).map((a) => {
      let line = a.task
      if (a.assignee) line += ` 【担当: ${a.assignee}】`
      if (a.dueDate) line += ` 【期限: ${a.dueDate}】`
      return line
    }).join('\n'),
  )
  const [isSaving, setIsSaving] = useState(false)

  function parseActions(text: string): ActionItem[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const assigneeMatch = line.match(/【担当:\s*(.+?)】/)
        const dueDateMatch = line.match(/【期限:\s*(.+?)】/)
        const task = line.replace(/【担当:.*?】/g, '').replace(/【期限:.*?】/g, '').trim()
        return {
          task,
          assignee: assigneeMatch?.[1]?.trim(),
          dueDate: dueDateMatch?.[1]?.trim(),
        }
      })
  }

  async function handleSave() {
    setIsSaving(true)
    const updatedMeta = {
      ...(meta ?? {}),
      meetingDate,
      summary,
      audioFileName: meta?.audioFileName ?? '',
      discussedTopics: topicsText.split('\n').map((s) => s.trim()).filter(Boolean),
      decisions: decisionsText.split('\n').map((s) => s.trim()).filter(Boolean),
      nextActions: parseActions(actionsText),
      status: 'completed' as const,
    }
    await onSave({
      title,
      metadata: updatedMeta,
    })
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="会議タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          label="会議日時"
          type="date"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
        />
      </div>

      <EditorSection
        label="概要"
        value={summary}
        onChange={setSummary}
        rows={3}
        placeholder="会議の要約を入力..."
      />

      <EditorSection
        label="議論された内容"
        value={topicsText}
        onChange={setTopicsText}
        rows={5}
        placeholder="1行に1項目を入力..."
        hint="1行 = 1トピック"
      />

      <EditorSection
        label="決定事項"
        value={decisionsText}
        onChange={setDecisionsText}
        rows={4}
        placeholder="1行に1決定事項を入力..."
        hint="1行 = 1決定事項"
      />

      <EditorSection
        label="ネクストアクション"
        value={actionsText}
        onChange={setActionsText}
        rows={5}
        placeholder="タスク内容 【担当: 氏名】 【期限: 日付】"
        hint="担当者・期限は【担当: 】【期限: 】で任意記入"
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          キャンセル
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={!title.trim() || isSaving}
          loading={isSaving}
        >
          保存
        </Button>
      </div>
    </div>
  )
}

function EditorSection({
  label,
  value,
  onChange,
  rows,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows: number
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {hint && <span className="text-xs text-foreground-tertiary">{hint}</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl bg-input-bg border border-input-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-colors"
      />
    </div>
  )
}
