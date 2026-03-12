'use client'

import { useState, useRef } from 'react'
import { useCalendar } from '@/hooks/calendar/useCalendar'
import { useTasks } from '@/hooks/tasks/useTasks'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarTimeGrid } from '@/components/calendar/CalendarTimeGrid'
import { CalendarSync } from '@/components/calendar/CalendarSync'
import { EventForm } from '@/components/calendar/EventForm'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { connectCalendar } from '@/lib/auth/auth'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'
import type { Task } from '@/types/task'

function getWeekDays(date: Date): Date[] {
  const dow = date.getDay()
  const start = new Date(date)
  start.setDate(date.getDate() - dow)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function CalendarPage() {
  const {
    view,
    setView,
    currentDate,
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
    refetch,
  } = useCalendar()

  const { tasks, createTask, updateTask, deleteTask } = useTasks()

  const [formOpen, setFormOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [taskDefaultDueDate, setTaskDefaultDueDate] = useState<string | undefined>(undefined)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Use refs to guarantee handlers always see the latest selected item,
  // preventing stale-closure issues between setState and setFormOpen.
  const selectedEventRef = useRef<CalendarEvent | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const selectedTaskRef = useRef<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  function openNewTask() {
    selectedTaskRef.current = null
    setSelectedTask(null)
    // Pre-fill due date with the currently viewed date at 09:00 in local time
    const d = currentDate
    const pad = (n: number) => String(n).padStart(2, '0')
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`
    setTaskDefaultDueDate(iso)
    setTaskFormOpen(true)
  }

  function openEditTask(task: Task) {
    selectedTaskRef.current = task
    setSelectedTask(task)
    setTaskDefaultDueDate(undefined)
    setTaskFormOpen(true)
  }

  function handleCloseTaskForm() {
    setTaskFormOpen(false)
    setTimeout(() => {
      selectedTaskRef.current = null
      setSelectedTask(null)
    }, 200)
  }

  async function handleTaskSubmit(input: Parameters<typeof createTask>[0]) {
    if (selectedTaskRef.current) {
      await updateTask(selectedTaskRef.current.id, input)
    } else {
      await createTask(input)
    }
  }

  async function handleTaskDelete() {
    if (!selectedTaskRef.current) return
    await deleteTask(selectedTaskRef.current.id)
  }

  function openNewEvent(dateStr?: string, hour?: number) {
    selectedEventRef.current = null
    setSelectedEvent(null)
    if (dateStr) {
      setDefaultDate(
        hour !== undefined ? `${dateStr}T${String(hour).padStart(2, '0')}:00` : dateStr,
      )
    } else {
      setDefaultDate(undefined)
    }
    setFormOpen(true)
  }

  function openEditEvent(event: CalendarEvent) {
    // Set ref FIRST so onSubmit/onDelete closures always read the correct value
    selectedEventRef.current = event
    setSelectedEvent(event)
    setDefaultDate(undefined)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    // Clear after modal close animation
    setTimeout(() => {
      selectedEventRef.current = null
      setSelectedEvent(null)
    }, 200)
  }

  async function handleSubmit(input: CalendarEventInput) {
    if (selectedEventRef.current) {
      await updateEvent(selectedEventRef.current.id, input)
    } else {
      await createEvent(input)
    }
  }

  async function handleDelete() {
    if (!selectedEventRef.current) return
    await deleteEvent(selectedEventRef.current.id)
  }

  async function handleSync() {
    setIsSyncing(true)
    setSyncError(null)
    try {
      await refetch()
      setLastSyncAt(new Date())
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : '同期に失敗しました')
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleConnect() {
    setConnectError(null)
    try {
      await connectCalendar()
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : '連携に失敗しました')
    }
  }

  const timeGridDays = view === 'week' ? getWeekDays(currentDate) : [currentDate]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">カレンダー</h1>
        <p className="text-foreground-secondary mt-1 text-sm">予定とタスクを一元管理します</p>
      </div>

      {connectError && (
        <Alert type="error" onDismiss={() => setConnectError(null)}>
          {connectError}
        </Alert>
      )}

      {error && <Alert type="error">{error}</Alert>}

      {/* Not connected */}
      {isConnected === false && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-bg flex items-center justify-center mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">
            Google カレンダーを連携する
          </h2>
          <p className="text-sm text-foreground-secondary mb-6 max-w-xs">
            Google カレンダーと連携すると、予定の確認・作成・編集ができます
          </p>
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors duration-150"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Google カレンダーを連携
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && isConnected !== false && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Calendar views */}
      {!isLoading && isConnected === true && (
        <>
          <CalendarHeader
            view={view}
            onViewChange={setView}
            currentDate={currentDate}
            onPrev={prev}
            onNext={next}
            onToday={goToToday}
            onAddTask={openNewTask}
            onAddEvent={() => openNewEvent()}
          />

          <CalendarSync
            onSync={handleSync}
            isSyncing={isSyncing}
            lastSyncAt={lastSyncAt}
            syncError={syncError}
          />

          {view === 'month' && (
            <CalendarGrid
              currentDate={currentDate}
              events={events}
              tasks={tasks}
              onSelectDate={(dateStr) => openNewEvent(dateStr)}
              onSelectEvent={openEditEvent}
              onSelectTask={openEditTask}
            />
          )}

          {(view === 'week' || view === 'day') && (
            <CalendarTimeGrid
              days={timeGridDays}
              events={events}
              tasks={tasks}
              onSelectDate={(dateStr, hour) => openNewEvent(dateStr, hour)}
              onSelectEvent={openEditEvent}
              onSelectTask={openEditTask}
            />
          )}
        </>
      )}

      <EventForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onDelete={selectedEvent ? handleDelete : undefined}
        initialEvent={selectedEvent}
        defaultDate={defaultDate}
      />

      <TaskForm
        open={taskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={handleTaskSubmit}
        onDelete={selectedTask ? handleTaskDelete : undefined}
        initialTask={selectedTask}
        defaultDueDate={taskDefaultDueDate}
      />
    </div>
  )
}
