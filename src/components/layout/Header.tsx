'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { UserMenu } from './UserMenu'
import { useNotifications, type NotificationItem } from '@/hooks/useNotifications'

export interface HeaderProps {
  onMenuToggle: () => void
}

const TYPE_CONFIG = {
  overdue: { label: '期限切れ', color: 'text-danger', bg: 'bg-danger-bg', dot: 'bg-danger' },
  today: { label: '本日期限', color: 'text-warning', bg: 'bg-warning-bg', dot: 'bg-warning' },
  upcoming: { label: '明日期限', color: 'text-primary', bg: 'bg-primary-bg', dot: 'bg-primary' },
  event_reminder: { label: 'まもなく開始', color: 'text-success', bg: 'bg-success-bg', dot: 'bg-success' },
  event_started: { label: '開始中', color: 'text-warning', bg: 'bg-warning-bg', dot: 'bg-warning' },
}

function formatDueDate(iso: string): string {
  const d = new Date(iso)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${m}/${day} ${hh}:${mm}`
}

function NotifItem({ item }: { item: NotificationItem }) {
  const cfg = TYPE_CONFIG[item.type]
  const href = item.type === 'event_reminder' ? '/dashboard/calendar' : '/dashboard/tasks'
  return (
    <Link
      href={href}
      className="flex items-start gap-3 px-4 py-3 hover:bg-fill-quaternary transition-colors"
    >
      <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate text-foreground">{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="text-[10px] text-foreground-tertiary tabular-nums">
            {formatDueDate(item.dueDate)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAllRead } = useNotifications()

  // Close notification on outside click / Escape
  useEffect(() => {
    if (!notifOpen) return
    function handleClick(e: MouseEvent) {
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [notifOpen])

  function handleMarkAllRead() {
    markAllRead()
  }

  return (
    <header
      className="h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-border bg-background-elevated sticky top-0 z-30 shrink-0"
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="ナビゲーションメニューを開く"
        className="flex lg:hidden items-center justify-center w-9 h-9 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-fill-tertiary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notification */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label={`通知${unreadCount > 0 ? `（未読${unreadCount}件）` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-fill-tertiary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-background-elevated"
                aria-hidden="true"
              />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-xl border border-border bg-background-elevated overflow-hidden z-50"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              role="dialog"
              aria-label="通知"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">通知</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-danger text-white tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:text-primary-hover transition-colors duration-150"
                  >
                    すべて既読
                  </button>
                )}
              </div>

              {/* Body */}
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-sm text-foreground-secondary text-center">
                  新しい通知はありません
                </div>
              ) : (
                <ul className="divide-y divide-border max-h-80 overflow-y-auto">
                  {notifications.map((item) => (
                    <li key={item.id} onClick={() => setNotifOpen(false)}>
                      <NotifItem item={item} />
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border bg-fill-quaternary">
                  <Link
                    href="/dashboard/tasks"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-primary hover:text-primary-hover transition-colors"
                  >
                    タスク一覧を見る →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  )
}
