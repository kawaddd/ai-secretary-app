'use client'

import { useEffect, useRef } from 'react'
import type { CalendarEvent } from '@/types/calendar'
import type { Task } from '@/types/task'

const HOUR_HEIGHT = 56
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DOW_SHORT = ['日', '月', '火', '水', '木', '金', '土']

function localDateStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface Props {
  days: Date[]
  events: CalendarEvent[]
  tasks: Task[]
  onSelectDate: (dateStr: string, hour: number) => void
  onSelectEvent: (event: CalendarEvent) => void
  onSelectTask: (task: Task) => void
}

function getTimedEventPos(event: CalendarEvent): { top: number; height: number } | null {
  if (!event.start.dateTime) return null
  const start = new Date(event.start.dateTime)
  const end = new Date(event.end?.dateTime ?? event.start.dateTime)
  const startH = start.getHours() + start.getMinutes() / 60
  const endH = end.getHours() + end.getMinutes() / 60
  return {
    top: startH * HOUR_HEIGHT,
    height: Math.max((endH - startH) * HOUR_HEIGHT, 28),
  }
}

function getTaskPos(task: Task): { top: number } | null {
  if (!task.due_date) return null
  const d = new Date(task.due_date)
  return { top: (d.getHours() + d.getMinutes() / 60) * HOUR_HEIGHT }
}

function formatTime(iso: string | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function isToday(date: Date): boolean {
  const t = new Date()
  return date.getFullYear() === t.getFullYear() && date.getMonth() === t.getMonth() && date.getDate() === t.getDate()
}

function CurrentTimeLine() {
  const now = new Date()
  const top = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT
  return (
    <div
      className="absolute left-0 right-0 flex items-center pointer-events-none"
      style={{ top, zIndex: 20 }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-danger flex-shrink-0 -ml-1.5 shadow-sm" />
      <div className="flex-1 border-t-[1.5px] border-danger opacity-80" />
    </div>
  )
}

export function CalendarTimeGrid({ days, events, tasks, onSelectDate, onSelectEvent, onSelectTask }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayStr = localDateStr(new Date())

  useEffect(() => {
    if (!scrollRef.current) return
    const now = new Date()
    const offset = Math.max(0, (now.getHours() - 1.5) * HOUR_HEIGHT)
    scrollRef.current.scrollTop = offset
  }, [])

  return (
    <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-card">
      {/* Day headers */}
      <div className="flex flex-shrink-0 border-b border-border bg-fill-tertiary/40">
        <div className="w-14 flex-shrink-0 border-r border-border/60" />
        {days.map((day) => {
          const dateStr = localDateStr(day)
          const today = dateStr === todayStr
          const dow = day.getDay()
          return (
            <div
              key={dateStr}
              className={[
                'flex-1 py-2.5 text-center border-r border-border/60 last:border-r-0',
                today ? 'bg-primary-bg/40' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'text-[11px] font-semibold tracking-wide mb-0.5',
                  dow === 0 ? 'text-danger/80' : dow === 6 ? 'text-primary/80' : 'text-foreground-tertiary',
                ].join(' ')}
              >
                {DOW_SHORT[dow]}
              </div>
              <div
                className={[
                  'w-7 h-7 mx-auto flex items-center justify-center rounded-full text-sm font-semibold',
                  today ? 'bg-primary text-white' : 'text-foreground',
                ].join(' ')}
              >
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* All-day strip */}
      <div className="flex flex-shrink-0 border-b border-border/60 min-h-[32px] bg-fill-tertiary/20">
        <div className="w-14 flex-shrink-0 border-r border-border/60 flex items-center justify-end pr-2">
          <span className="text-[10px] text-foreground-quaternary font-medium">終日</span>
        </div>
        {days.map((day) => {
          const dateStr = localDateStr(day)
          const allDayEvents = events.filter((e) => !e.start.dateTime && e.start.date === dateStr)
          return (
            <div key={dateStr} className="flex-1 p-1 border-r border-border/60 last:border-r-0 space-y-[2px]">
              {allDayEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onSelectEvent(e)}
                  className="w-full text-left pl-1.5 pr-1 py-[2px] rounded-r-md text-[11px] border-l-2 border-primary bg-primary/12 text-foreground hover:bg-primary/20 truncate transition-colors duration-100"
                >
                  {e.summary}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: '62vh' }}>
        <div className="flex" style={{ height: HOUR_HEIGHT * 24 }}>
          {/* Hour labels */}
          <div className="w-14 flex-shrink-0 relative border-r border-border/60">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-foreground-quaternary tabular-nums font-medium"
                style={{ top: h * HOUR_HEIGHT - 7 }}
              >
                {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dateStr = localDateStr(day)
            const dayTimedEvents = events.filter(
              (e) => e.start.dateTime && localDateStr(new Date(e.start.dateTime)) === dateStr,
            )
            const dayTasks = tasks.filter(
              (t) =>
                t.due_date && t.status === 'pending' && localDateStr(new Date(t.due_date)) === dateStr,
            )
            const todayCol = isToday(day)

            return (
              <div
                key={dateStr}
                className={[
                  'flex-1 relative border-r border-border/60 last:border-r-0',
                  todayCol ? 'bg-primary-bg/15' : '',
                ].join(' ')}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const y = e.clientY - rect.top
                  const hour = Math.floor(y / HOUR_HEIGHT)
                  onSelectDate(dateStr, Math.max(0, Math.min(23, hour)))
                }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/50 pointer-events-none"
                    style={{ top: h * HOUR_HEIGHT }}
                  />
                ))}
                {/* Half-hour lines (dashed) */}
                {HOURS.map((h) => (
                  <div
                    key={`hh-${h}`}
                    className="absolute w-full border-t border-border/25 pointer-events-none"
                    style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2, borderTopStyle: 'dashed' }}
                  />
                ))}

                {/* Timed events */}
                {dayTimedEvents.map((event) => {
                  const pos = getTimedEventPos(event)
                  if (!pos) return null
                  return (
                    <div
                      key={event.id}
                      className="absolute left-0.5 right-0.5 rounded-r-md pl-2 pr-1 py-0.5 text-[11px] border-l-[3px] border-primary bg-primary/12 text-foreground overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors duration-100"
                      style={{ top: pos.top + 1, height: pos.height - 2, zIndex: 10 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent(event)
                      }}
                      title={event.summary}
                    >
                      <div className="font-medium leading-tight truncate">{event.summary}</div>
                      {pos.height > 38 && (
                        <div className="text-foreground-tertiary text-[10px] leading-tight mt-0.5">
                          {formatTime(event.start.dateTime)} – {formatTime(event.end.dateTime)}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Tasks at due time */}
                {dayTasks.map((task) => {
                  const pos = getTaskPos(task)
                  if (!pos) return null
                  return (
                    <div
                      key={task.id}
                      className="absolute left-0.5 right-0.5 rounded-r-md text-[11px] font-medium border-l-[3px] border-warning bg-warning/10 text-foreground overflow-hidden cursor-pointer hover:bg-warning/20 transition-colors duration-100"
                      style={{ top: pos.top + 1, height: 22, zIndex: 11 }}
                      title={task.title}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTask(task)
                      }}
                    >
                      <div className="pl-2 pr-1 py-0.5 truncate">{task.title}</div>
                    </div>
                  )
                })}

                {todayCol && <CurrentTimeLine />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
