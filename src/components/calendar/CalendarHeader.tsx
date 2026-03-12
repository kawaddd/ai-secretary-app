'use client'

import type { CalendarView } from '@/hooks/calendar/useCalendar'

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const DOW = ['日', '月', '火', '水', '木', '金', '土']

function getWeekDays(date: Date): Date[] {
  const dow = date.getDay()
  const start = new Date(date)
  start.setDate(date.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function getTitle(view: CalendarView, date: Date): string {
  if (view === 'month') return `${date.getFullYear()}年 ${MONTHS[date.getMonth()]}`
  if (view === 'week') {
    const days = getWeekDays(date)
    const s = days[0]
    const e = days[6]
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
      return `${s.getFullYear()}年 ${MONTHS[s.getMonth()]} ${s.getDate()}〜${e.getDate()}日`
    }
    return `${s.getFullYear()}年 ${s.getMonth() + 1}/${s.getDate()} 〜 ${e.getMonth() + 1}/${e.getDate()}`
  }
  return `${date.getFullYear()}年 ${MONTHS[date.getMonth()]} ${date.getDate()}日 (${DOW[date.getDay()]})`
}

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'month', label: '月' },
  { value: 'week', label: '週' },
  { value: 'day', label: '日' },
]

interface Props {
  view: CalendarView
  onViewChange: (v: CalendarView) => void
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAddEvent: () => void
  onAddTask: () => void
}

export function CalendarHeader({
  view,
  onViewChange,
  currentDate,
  onPrev,
  onNext,
  onToday,
  onAddEvent,
  onAddTask,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {/* Left: title + navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        <h2 className="text-sm sm:text-lg font-semibold text-foreground tabular-nums min-w-0">
          {getTitle(view, currentDate)}
        </h2>
        <div className="flex items-center">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-fill-secondary transition-colors duration-150"
            aria-label="前へ"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="p-1.5 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-fill-secondary transition-colors duration-150"
            aria-label="次へ"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <button
          onClick={onToday}
          className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg border border-border text-foreground-secondary hover:text-foreground hover:border-primary/60 transition-colors duration-150"
        >
          今日
        </button>
      </div>

      {/* Right: view switcher + actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* View switcher */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onViewChange(opt.value)}
              className={[
                'px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                view === opt.value
                  ? 'bg-primary text-white'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-fill-secondary',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border hidden sm:block" />

        {/* Task button: icon-only on mobile */}
        <button
          onClick={onAddTask}
          aria-label="タスクを追加"
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg border border-warning/50 text-warning hover:bg-warning-bg hover:border-warning transition-colors duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">タスク</span>
        </button>

        {/* Event button: icon-only on mobile */}
        <button
          onClick={onAddEvent}
          aria-label="予定を追加"
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">予定</span>
        </button>
      </div>
    </div>
  )
}
