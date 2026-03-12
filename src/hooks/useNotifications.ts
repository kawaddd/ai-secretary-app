'use client'

import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { CalendarEvent } from '@/types/calendar'

export type NotificationType = 'overdue' | 'today' | 'upcoming' | 'event_reminder' | 'event_started'

export type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  dueDate: string
}

const READ_KEY_PREFIX = 'notifications_read_'
const POLL_INTERVAL_MS = 60 * 1000

const TYPE_LABEL: Record<NotificationType, string> = {
  overdue: '期限切れ',
  today: '本日期限',
  upcoming: '明日期限',
  event_reminder: 'まもなく開始',
  event_started: '開始中',
}

function formatDueDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${m}/${day} ${hh}:${mm}`
}

async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

function showBrowserNotification(item: NotificationItem) {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  new Notification(`【${TYPE_LABEL[item.type]}】${item.title}`, {
    body: item.dueDate ? formatDueDate(item.dueDate) : '',
    icon: '/favicon.ico',
    tag: item.id, // prevents duplicate popups for the same item
  })
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const readKeyRef = useRef<string | null>(null)
  const readIdsRef = useRef<Set<string>>(new Set())
  // Track IDs that have already triggered a browser popup this session
  const shownBrowserNotifsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Request browser notification permission on mount
    requestNotificationPermission()

    async function fetchNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Initialize read key and persisted read IDs on first run
      if (!readKeyRef.current) {
        const key = `${READ_KEY_PREFIX}${user.id}`
        readKeyRef.current = key
        const stored = localStorage.getItem(key)
        const ids: Set<string> = stored
          ? new Set<string>(JSON.parse(stored) as string[])
          : new Set<string>()
        readIdsRef.current = ids
      }

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
      const tomorrowEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 2,
      ).toISOString()

      // ── Task notifications ──────────────────────────────────────────────
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, status')
        .eq('user_id', user.id)
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .lte('due_date', tomorrowEnd)
        .order('due_date', { ascending: true })

      const taskItems: NotificationItem[] = (tasks ?? []).map((task) => {
        const due = task.due_date!
        let type: NotificationType
        if (due < todayStart) {
          type = 'overdue'
        } else if (due < todayEnd) {
          type = 'today'
        } else {
          type = 'upcoming'
        }
        return { id: task.id, type, title: task.title ?? '無題', dueDate: due }
      })

      // ── Calendar event reminder notifications ───────────────────────────
      const eventItems: NotificationItem[] = []
      try {
        const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const windowEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const evRes = await fetch(
          `/api/calendar/events?timeMin=${encodeURIComponent(windowStart)}&timeMax=${encodeURIComponent(windowEnd)}`,
        )
        if (evRes.ok) {
          const events: CalendarEvent[] = await evRes.json()
          const nowMs = now.getTime()
          for (const ev of events) {
            const minsStr = ev.extendedProperties?.private?.reminderMinutes
            if (!minsStr) continue
            const mins = parseInt(minsStr, 10)
            if (!mins || mins <= 0) continue

            const startTime = ev.start.dateTime
              ? new Date(ev.start.dateTime).getTime()
              : new Date((ev.start.date ?? '') + 'T00:00:00').getTime()

            const reminderTime = startTime - mins * 60 * 1000

            // Show from reminder time until 30 min after event start
            if (nowMs >= reminderTime && nowMs < startTime + 30 * 60 * 1000) {
              eventItems.push({
                id: `event_${ev.id}`,
                type: nowMs >= startTime ? 'event_started' : 'event_reminder',
                title: ev.summary ?? '無題の予定',
                dueDate: ev.start.dateTime ?? (ev.start.date ?? ''),
              })
            }
          }
        }
      } catch {
        // Calendar not connected or unavailable — silently skip
      }

      // Filter out already-read items
      const currentReadIds = readIdsRef.current
      const allItems = [...taskItems, ...eventItems].filter((n) => !currentReadIds.has(n.id))

      // Fire browser popup for newly detected items
      for (const item of allItems) {
        if (!shownBrowserNotifsRef.current.has(item.id)) {
          shownBrowserNotifsRef.current.add(item.id)
          showBrowserNotification(item)
        }
      }

      setNotifications(allItems)
    }

    // Initial fetch
    fetchNotifications()

    // Poll every minute to catch reminders as they become due
    const timer = setInterval(fetchNotifications, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const unreadCount = notifications.length

  function markAllRead() {
    const newIds = new Set(readIdsRef.current)
    notifications.forEach((n) => newIds.add(n.id))
    readIdsRef.current = newIds
    setNotifications([])
    if (readKeyRef.current) {
      localStorage.setItem(readKeyRef.current, JSON.stringify([...newIds]))
    }
  }

  return { notifications, unreadCount, markAllRead }
}
