'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'

const REMINDER_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'なし' },
  { value: 5, label: '5分前' },
  { value: 10, label: '10分前' },
  { value: 15, label: '15分前' },
  { value: 30, label: '30分前' },
  { value: 60, label: '1時間前' },
  { value: 120, label: '2時間前' },
  { value: 180, label: '3時間前' },
  { value: 1440, label: '1日前' },
  { value: 2880, label: '2日前' },
  { value: 10080, label: '1週間前' },
]

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (input: CalendarEventInput) => Promise<void>
  onDelete?: () => Promise<void>
  initialEvent?: CalendarEvent | null
  defaultDate?: string // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"
}

// ── Helpers ────────────────────────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Convert any ISO string to "YYYY-MM-DDTHH:mm" in LOCAL time */
function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Current local datetime as "YYYY-MM-DDTHH:mm" */
function nowDatetimeLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Add 1 hour to a "YYYY-MM-DDTHH:mm" string */
function addHour(dt: string): string {
  if (!dt) return ''
  const d = new Date(dt)
  d.setHours(d.getHours() + 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Google Calendar all-day end.date is exclusive; subtract 1 day for display */
function toDisplayEndDate(exclusiveDate: string): string {
  const d = new Date(exclusiveDate + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Convert inclusive display end date → exclusive end date for Google Calendar */
function toExclusiveEndDate(inclusiveDate: string): string {
  const d = new Date(inclusiveDate + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
// ──────────────────────────────────────────────────────────────────────────

export function EventForm({ open, onClose, onSubmit, onDelete, initialEvent, defaultDate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [isAllDay, setIsAllDay] = useState(false)
  // All-day fields
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  // Timed fields
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  // Errors
  const [titleError, setTitleError] = useState('')
  const [dateError, setDateError] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState<number>(0)
  const [reminderOpen, setReminderOpen] = useState(false)
  const reminderRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (initialEvent) {
      setTitle(initialEvent.summary ?? '')
      setDescription(initialEvent.description ?? '')
      setLocation(initialEvent.location ?? '')

      const allDay = !initialEvent.start.dateTime
      setIsAllDay(allDay)

      if (allDay) {
        setStartDate(initialEvent.start.date ?? '')
        setEndDate(
          initialEvent.end.date ? toDisplayEndDate(initialEvent.end.date) : (initialEvent.start.date ?? ''),
        )
      } else {
        const st = toDatetimeLocal(initialEvent.start.dateTime)
        const en = toDatetimeLocal(initialEvent.end.dateTime)
        setStartDateTime(st)
        setEndDateTime(en)
      }

      const storedMins = initialEvent.extendedProperties?.private?.reminderMinutes
      setReminderMinutes(storedMins ? parseInt(storedMins, 10) : 0)
    } else {
      // New event defaults
      setTitle('')
      setDescription('')
      setLocation('')
      setIsAllDay(false)

      const base = defaultDate
        ? defaultDate.includes('T')
          ? defaultDate
          : `${defaultDate}T09:00`
        : nowDatetimeLocal()

      setStartDateTime(base)
      setEndDateTime(addHour(base))
      setStartDate(base.slice(0, 10))
      setEndDate(base.slice(0, 10))
      setReminderMinutes(0)
    }

    setTitleError('')
    setDateError('')
  }, [open, initialEvent, defaultDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('タイトルを入力してください')
      return
    }

    if (isAllDay) {
      if (!startDate) {
        setDateError('開始日を入力してください')
        return
      }
      if (!endDate) {
        setDateError('終了日を入力してください')
        return
      }
      if (endDate < startDate) {
        setDateError('終了日は開始日以降にしてください')
        return
      }
    } else {
      if (!startDateTime || !endDateTime) {
        setDateError('開始・終了日時を入力してください')
        return
      }
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        setDateError('終了日時は開始日時より後にしてください')
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (isAllDay) {
        await onSubmit({
          summary: title.trim(),
          description: description || undefined,
          location: location || undefined,
          startDate,
          endDate: toExclusiveEndDate(endDate),
          reminderMinutes: reminderMinutes > 0 ? reminderMinutes : undefined,
        })
      } else {
        await onSubmit({
          summary: title.trim(),
          description: description || undefined,
          location: location || undefined,
          startDateTime: new Date(startDateTime).toISOString(),
          endDateTime: new Date(endDateTime).toISOString(),
          reminderMinutes: reminderMinutes > 0 ? reminderMinutes : undefined,
        })
      }
      onClose()
    } catch (err) {
      setDateError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
      onClose()
    } catch (err) {
      setDateError(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl text-sm text-foreground bg-input-bg border border-input-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary transition-colors duration-150'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialEvent ? '予定を編集' : '新しい予定'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="タイトル"
          placeholder="予定のタイトルを入力"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (e.target.value.trim()) setTitleError('')
          }}
          error={titleError}
          autoFocus
        />

        {/* All-day toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            role="checkbox"
            aria-checked={isAllDay}
            tabIndex={0}
            onClick={() => setIsAllDay((v) => !v)}
            onKeyDown={(e) => e.key === ' ' && setIsAllDay((v) => !v)}
            className={[
              'w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 flex-shrink-0',
              isAllDay ? 'bg-primary' : 'bg-fill-tertiary',
            ].join(' ')}
          >
            <div
              className={[
                'w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                isAllDay ? 'translate-x-4' : 'translate-x-0',
              ].join(' ')}
            />
          </div>
          <span className="text-sm font-medium text-foreground">終日</span>
        </label>

        {/* All-day: date pickers */}
        {isAllDay ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="start-date" className="text-sm font-medium text-foreground">
                開始日
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (endDate < e.target.value) setEndDate(e.target.value)
                  if (dateError) setDateError('')
                }}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="end-date" className="text-sm font-medium text-foreground">
                終了日
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  if (dateError) setDateError('')
                }}
                className={inputCls}
              />
            </div>
          </div>
        ) : (
          /* Timed: datetime pickers */
          <>
            <div className="space-y-1.5">
              <label htmlFor="start-dt" className="text-sm font-medium text-foreground">
                開始日時
              </label>
              <input
                id="start-dt"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => {
                  const val = e.target.value
                  setStartDateTime(val)
                  setEndDateTime(addHour(val))
                  if (dateError) setDateError('')
                }}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="end-dt" className="text-sm font-medium text-foreground">
                終了日時
              </label>
              <input
                id="end-dt"
                type="datetime-local"
                value={endDateTime}
                min={startDateTime}
                onChange={(e) => {
                  setEndDateTime(e.target.value)
                  if (dateError) setDateError('')
                }}
                className={inputCls}
              />
            </div>
          </>
        )}

        {dateError && <p className="text-xs text-danger -mt-2">{dateError}</p>}

        {/* Reminder — custom dropdown */}
        <div className="space-y-1.5" ref={reminderRef}>
          <label className="text-sm font-medium text-foreground">リマインダー</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setReminderOpen((v) => !v)}
              className={[
                inputCls,
                'flex items-center justify-between text-left',
              ].join(' ')}
              aria-haspopup="listbox"
              aria-expanded={reminderOpen}
            >
              <span>{REMINDER_OPTIONS.find((o) => o.value === reminderMinutes)?.label ?? 'なし'}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={`shrink-0 transition-transform duration-150 ${reminderOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {reminderOpen && (
              <>
                {/* Click-outside overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setReminderOpen(false)}
                  aria-hidden="true"
                />
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-border bg-background-elevated overflow-hidden py-1"
                  style={{ boxShadow: 'var(--shadow-lg)' }}
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={reminderMinutes === opt.value}
                      onClick={() => {
                        setReminderMinutes(opt.value)
                        setReminderOpen(false)
                      }}
                      className={[
                        'px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100',
                        reminderMinutes === opt.value
                          ? 'bg-primary/20 text-primary font-medium'
                          : 'text-foreground hover:bg-fill-tertiary',
                      ].join(' ')}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <Input
          label="場所（任意）"
          placeholder="場所を入力"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Textarea
          label="メモ（任意）"
          placeholder="詳細を入力"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex gap-3 pt-1">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isSubmitting}
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
            {initialEvent ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
