'use client'

import { useState, useEffect } from 'react'
import type { Task, TaskInput, TaskFilters, TaskStatus } from '@/types/task'

const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 }

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // 第1ソート: 期限が近い順（null は末尾）
    if (a.due_date && !b.due_date) return -1
    if (!a.due_date && b.due_date) return 1
    if (a.due_date && b.due_date) {
      const diff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      if (diff !== 0) return diff
    }
    // 第2ソート: 優先度順（高→中→低→未設定）
    const ap = a.priority ? priorityOrder[a.priority] : 4
    const bp = b.priority ? priorityOrder[b.priority] : 4
    if (ap !== bp) return ap - bp
    // 第3ソート: 作成日時順
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return 0
  })
}

export function useTasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({ status: 'all', priority: 'all' })

  async function fetchTasks() {
    setIsLoading(true)
    setError(null)
    const res = await fetch('/api/tasks')
    if (!res.ok) {
      setError('タスクの取得に失敗しました')
      setIsLoading(false)
      return
    }
    const data = await res.json()
    setAllTasks(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // クライアントサイドでフィルター + ソート
  let filtered = allTasks
  if (filters.status !== 'all') filtered = filtered.filter((t) => t.status === filters.status)
  if (filters.priority !== 'all') filtered = filtered.filter((t) => t.priority === filters.priority)
  const tasks = sortTasks(filtered)

  // allTasks ベースで常に正確なカウントを計算
  const counts = {
    all: allTasks.length,
    pending: allTasks.filter((t) => t.status === 'pending').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
  }

  async function createTask(input: TaskInput) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? 'タスクの作成に失敗しました')
    }
    const newTask = await res.json()
    setAllTasks((prev) => [newTask, ...prev])
  }

  async function updateTask(id: string, input: Partial<TaskInput & { status: TaskStatus }>) {
    // 楽観的更新
    setAllTasks((prev) => prev.map((t) => (t.id === id ? ({ ...t, ...input } as Task) : t)))
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      await fetchTasks() // revert
      const body = await res.json()
      throw new Error(body.error ?? 'タスクの更新に失敗しました')
    }
    const updated = await res.json()
    setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function deleteTask(id: string) {
    setAllTasks((prev) => prev.filter((t) => t.id !== id)) // 楽観的削除
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      await fetchTasks() // revert
      throw new Error('タスクの削除に失敗しました')
    }
  }

  async function toggleStatus(task: Task) {
    const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending'
    await updateTask(task.id, { status: newStatus })
  }

  return {
    tasks,
    counts,
    isLoading,
    error,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    refetch: fetchTasks,
  }
}
