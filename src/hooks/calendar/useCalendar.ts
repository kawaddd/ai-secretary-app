'use client'

import { useState, useEffect, useRef } from 'react'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'

export type CalendarView = 'month' | 'week' | 'day'

function getRangeForView(view: CalendarView, date: Date): { timeMin: string; timeMax: string } {
  if (view === 'month') {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    return { timeMin: start.toISOString(), timeMax: end.toISOString() }
  }
  if (view === 'week') {
    const dow = date.getDay()
    const start = new Date(date)
    start.setDate(date.getDate() - dow)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { timeMin: start.toISOString(), timeMax: end.toISOString() }
  }
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { timeMin: start.toISOString(), timeMax: end.toISOString() }
}

export function useCalendar() {
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [view, setViewState] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState<Date>(todayMidnight)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const didMount = useRef(false)
  const isConnectedRef = useRef<boolean | null>(null)
  const viewRef = useRef<CalendarView>('month')

  async function checkConnection(): Promise<boolean> {
    try {
      const res = await fetch('/api/calendar/auth/status')
      const data = await res.json()
      isConnectedRef.current = data.connected
      setIsConnected(data.connected)
      return data.connected
    } catch {
      isConnectedRef.current = false
      setIsConnected(false)
      return false
    }
  }

  async function fetchEvents(v: CalendarView, date: Date) {
    setIsLoading(true)
    setError(null)
    try {
      const { timeMin, timeMax } = getRangeForView(v, date)
      const res = await fetch(
        `/api/calendar/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`,
      )
      if (res.status === 403) {
        isConnectedRef.current = false
        setIsConnected(false)
        setEvents([])
        return
      }
      if (!res.ok) throw new Error('Failed to fetch events')
      setEvents(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial mount: check connection + fetch
  useEffect(() => {
    checkConnection().then((connected) => {
      if (connected) fetchEvents(viewRef.current, currentDate)
      else setIsLoading(false)
    })
    didMount.current = true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when view or date changes
  useEffect(() => {
    if (!didMount.current) return
    if (isConnectedRef.current === true) fetchEvents(view, currentDate)
  }, [view, currentDate]) // eslint-disable-line react-hooks/exhaustive-deps

  function setView(v: CalendarView) {
    viewRef.current = v
    setViewState(v)
  }

  function prev() {
    const v = viewRef.current
    setCurrentDate((d) => {
      const next = new Date(d)
      if (v === 'month') next.setMonth(d.getMonth() - 1)
      else if (v === 'week') next.setDate(d.getDate() - 7)
      else next.setDate(d.getDate() - 1)
      return next
    })
  }

  function next() {
    const v = viewRef.current
    setCurrentDate((d) => {
      const n = new Date(d)
      if (v === 'month') n.setMonth(d.getMonth() + 1)
      else if (v === 'week') n.setDate(d.getDate() + 7)
      else n.setDate(d.getDate() + 1)
      return n
    })
  }

  function goToToday() {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
  }

  async function createEvent(input: CalendarEventInput): Promise<void> {
    const res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to create event')
    }
    const created: CalendarEvent = await res.json()
    setEvents((prev) => [...prev, created])
  }

  async function updateEvent(id: string, input: Partial<CalendarEventInput>): Promise<void> {
    const res = await fetch(`/api/calendar/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to update event')
    }
    const updated: CalendarEvent = await res.json()
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)))
  }

  async function deleteEvent(id: string): Promise<void> {
    const res = await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to delete event')
    }
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return {
    view,
    setView,
    currentDate,
    setCurrentDate,
    events,
    isLoading,
    isConnected,
    error,
    prev,
    next,
    goToToday,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: () => fetchEvents(view, currentDate),
  }
}
