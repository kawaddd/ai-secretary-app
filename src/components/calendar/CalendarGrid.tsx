'use client'

import { useState } from 'react'
import type { CalendarEvent } from '@/types/calendar'
import type { Task } from '@/types/task'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function localDateStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface Props {
  currentDate: Date
  events: CalendarEvent[]
  tasks: Task[]
  onSelectDate: (dateStr: string) => void
  onSelectEvent: (event: CalendarEvent) => void
  onSelectTask: (task: Task) => void
}

function getEventDateStr(event: CalendarEvent): string {
  if (event.start.dateTime) return localDateStr(new Date(event.start.dateTime))
  return event.start.date ?? ''
}

function formatEventTime(event: CalendarEvent): string {
  if (!event.start.dateTime) return ''
  return new Date(event.start.dateTime).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

type OverflowItem = { kind: 'event'; data: CalendarEvent } | { kind: 'task'; data: Task }

export function CalendarGrid({ currentDate, events, tasks, onSelectDate, onSelectEvent, onSelectTask }: Props) {
  const todayStr = localDateStr(new Date())
  const [overflowPopover, setOverflowPopover] = useState<{
    dateStr: string
    items: OverflowItem[]
  } | null>(null)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells: { date: Date; isCurrentMonth: boolean }[] = []
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
  }

  const eventsByDate = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const key = getEventDateStr(event)
    if (!eventsByDate.has(key)) eventsByDate.set(key, [])
    eventsByDate.get(key)!.push(event)
  }

  const tasksByDate = new Map<string, Task[]>()
  for (const task of tasks) {
    if (!task.due_date || task.status !== 'pending') continue
    const key = localDateStr(new Date(task.due_date))
    if (!tasksByDate.has(key)) tasksByDate.set(key, [])
    tasksByDate.get(key)!.push(task)
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border bg-fill-tertiary/40">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={[
              'py-2.5 text-center text-[11px] font-semibold tracking-wide uppercase',
              i === 0
                ? 'text-danger/80'
                : i === 6
                  ? 'text-primary/80'
                  : 'text-foreground-tertiary',
            ].join(' ')}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map(({ date, isCurrentMonth }, idx) => {
          const dateStr = localDateStr(date)
          const isToday = dateStr === todayStr
          const dow = date.getDay()
          const isLastRow = idx >= cells.length - 7
          const isLastCol = idx % 7 === 6

          const dayEvents = eventsByDate.get(dateStr) ?? []
          const dayTasks = tasksByDate.get(dateStr) ?? []

          const allItems: OverflowItem[] = [
            ...dayEvents.map((e): OverflowItem => ({ kind: 'event', data: e })),
            ...dayTasks.map((t): OverflowItem => ({ kind: 'task', data: t })),
          ]
          const visibleItems = allItems.slice(0, 3) // CSS controls mobile visibility (max 1 shown)
          const hiddenCount = allItems.length - visibleItems.length

          return (
            <div
              key={dateStr + idx}
              onClick={() => onSelectDate(dateStr)}
              className={[
                'min-h-[64px] sm:min-h-[100px] p-1 sm:p-1.5 cursor-pointer transition-colors duration-100',
                !isLastCol ? 'border-r border-border/60' : '',
                !isLastRow ? 'border-b border-border/60' : '',
                !isCurrentMonth ? 'bg-fill-tertiary/25' : 'hover:bg-fill-secondary/40',
                isToday ? 'bg-primary-bg/20 hover:bg-primary-bg/30' : '',
              ].join(' ')}
            >
              {/* Day number */}
              <div className="flex justify-center mb-1.5">
                <span
                  className={[
                    'w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full',
                    isToday
                      ? 'bg-primary text-white font-semibold'
                      : !isCurrentMonth
                        ? 'text-foreground-quaternary'
                        : dow === 0
                          ? 'text-danger'
                          : dow === 6
                            ? 'text-primary'
                            : 'text-foreground',
                  ].join(' ')}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-[3px]">
                {visibleItems.map((item, idx) =>
                  item.kind === 'event' ? (
                    <button
                      key={item.data.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent(item.data)
                      }}
                      className={[
                        'w-full text-left pl-1.5 pr-1 py-[2px] rounded-r-md text-[11px] border-l-2 border-primary bg-primary/10 text-foreground hover:bg-primary/18 transition-colors duration-100 truncate leading-tight',
                        idx >= 1 ? 'hidden sm:block' : '',
                      ].join(' ')}
                      title={item.data.summary}
                    >
                      <span className="hidden sm:inline text-foreground-tertiary mr-1">
                        {item.data.start.dateTime ? formatEventTime(item.data) : ''}
                      </span>
                      {item.data.summary}
                    </button>
                  ) : (
                    <button
                      key={item.data.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTask(item.data)
                      }}
                      className={[
                        'w-full text-left pl-1.5 pr-1 py-[2px] rounded-r-md text-[11px] border-l-2 border-warning bg-warning/10 text-foreground hover:bg-warning/20 transition-colors duration-100 truncate leading-tight',
                        idx >= 1 ? 'hidden sm:block' : '',
                      ].join(' ')}
                      title={item.data.title}
                    >
                      {item.data.title}
                    </button>
                  ),
                )}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOverflowPopover({ dateStr, items: allItems })
                    }}
                    className="text-[10px] text-primary px-1.5 hover:underline"
                  >
                    +{hiddenCount}件
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Overflow popover */}
      {overflowPopover && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOverflowPopover(null)}
            aria-hidden="true"
          />
          <div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 rounded-2xl border border-border bg-background-elevated overflow-hidden"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">
                {overflowPopover.dateStr.replace(/-/g, '/').slice(5)} の予定
              </span>
              <button
                type="button"
                onClick={() => setOverflowPopover(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-fill-tertiary transition-colors"
                aria-label="閉じる"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Items list */}
            <ul className="py-1 max-h-72 overflow-y-auto">
              {overflowPopover.items.map((item) =>
                item.kind === 'event' ? (
                  <li key={item.data.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOverflowPopover(null)
                        onSelectEvent(item.data)
                      }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-fill-tertiary transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{item.data.summary}</p>
                        {item.data.start.dateTime && (
                          <p className="text-xs text-foreground-tertiary">{formatEventTime(item.data)}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ) : (
                  <li key={item.data.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOverflowPopover(null)
                        onSelectTask(item.data)
                      }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-fill-tertiary transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-warning shrink-0" aria-hidden="true" />
                      <p className="text-sm text-foreground truncate">{item.data.title}</p>
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
