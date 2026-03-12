'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TaskAlertBanner } from '@/components/tasks/TaskAlertBanner'
import { TaskFilter } from '@/components/tasks/TaskFilter'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskList } from '@/components/tasks/TaskList'
import { useTasks } from '@/hooks/tasks/useTasks'
import type { Task } from '@/types/task'

export default function TasksPage() {
  const { tasks, counts, isLoading, error, filters, setFilters, createTask, updateTask, deleteTask, toggleStatus } = useTasks()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  function handleEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingTask(null)
  }

  async function handleSubmit(input: Parameters<typeof createTask>[0]) {
    if (editingTask) {
      await updateTask(editingTask.id, input)
    } else {
      await createTask(input)
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`「${task.title}」を削除しますか？`)) return
    await deleteTask(task.id)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">タスク管理</h1>
          <p className="text-foreground-secondary mt-1 text-sm">タスクの作成・管理・追跡を行います</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setEditingTask(null); setModalOpen(true) }}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          新しいタスク
        </Button>
      </div>

      {/* Alert banner */}
      <TaskAlertBanner tasks={tasks} />

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger-bg border border-danger text-sm text-danger">
          {error}
        </div>
      )}

      {/* Filter */}
      <TaskFilter filters={filters} onChange={setFilters} counts={counts} />

      {/* Task list */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        filterStatus={filters.status}
        onToggle={toggleStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form modal */}
      <TaskForm
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialTask={editingTask}
      />
    </div>
  )
}
