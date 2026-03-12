'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Task, TaskInput, TaskPriority } from '@/types/task'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (input: TaskInput) => Promise<void>
  onDelete?: () => Promise<void>
  initialTask?: Task | null
  /** Pre-fill due date when creating a new task (ISO string or "YYYY-MM-DDTHH:mm") */
  defaultDueDate?: string
}

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function nowDatetimeLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function TaskForm({ open, onClose, onSubmit, onDelete, initialTask, defaultDueDate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [titleError, setTitleError] = useState('')
  const [dueDateError, setDueDateError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(initialTask?.title ?? '')
      setDescription(initialTask?.description ?? '')
      setPriority((initialTask?.priority as TaskPriority) ?? '')
      if (initialTask) {
        setDueDate(toDatetimeLocal(initialTask.due_date))
      } else if (defaultDueDate) {
        // defaultDueDate may be ISO or "YYYY-MM-DDTHH:mm"
        setDueDate(
          defaultDueDate.includes('T') && defaultDueDate.length === 16
            ? defaultDueDate
            : toDatetimeLocal(defaultDueDate),
        )
      } else {
        setDueDate('')
      }
      setTitleError('')
      setDueDateError('')
    }
  }, [open, initialTask, defaultDueDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('タイトルを入力してください')
      return
    }
    if (dueDate && new Date(dueDate) < new Date()) {
      setDueDateError('期限に過去の日時は設定できません')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description || undefined,
        priority: priority || undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialTask ? 'タスクを編集' : '新しいタスク'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="タイトル"
          placeholder="タスクのタイトルを入力"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (e.target.value.trim()) setTitleError('')
          }}
          error={titleError}
          autoFocus
        />

        <Textarea
          label="説明（任意）"
          placeholder="タスクの詳細を入力"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">優先度（任意）</label>
          <div className="flex gap-2">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(priority === opt.value ? '' : opt.value)}
                className={[
                  'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors duration-150',
                  priority === opt.value
                    ? opt.value === 'high'
                      ? 'bg-danger-bg border-danger text-danger'
                      : opt.value === 'medium'
                        ? 'bg-warning-bg border-warning text-warning'
                        : 'bg-success-bg border-success text-success'
                    : 'border-border text-foreground-secondary hover:border-primary hover:text-foreground',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="space-y-1.5">
          <label htmlFor="due-date" className="text-sm font-medium text-foreground">
            期限（任意）
          </label>
          <input
            id="due-date"
            type="datetime-local"
            value={dueDate}
            min={nowDatetimeLocal()}
            onChange={(e) => {
              setDueDate(e.target.value)
              if (dueDateError) setDueDateError('')
            }}
            className={[
              'w-full px-3.5 py-2.5 rounded-xl text-sm text-foreground bg-input-bg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-20',
              dueDateError
                ? 'border-danger focus:border-danger focus:ring-danger'
                : 'border-input-border focus:border-primary focus:ring-primary',
            ].join(' ')}
          />
          {dueDateError && (
            <p className="text-xs text-danger mt-1">{dueDateError}</p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              loading={isDeleting}
              disabled={isSubmitting}
              onClick={async () => {
                setIsDeleting(true)
                try {
                  await onDelete()
                  onClose()
                } finally {
                  setIsDeleting(false)
                }
              }}
            >
              削除
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting || isDeleting}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={isDeleting}
            className="flex-1"
          >
            {initialTask ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
