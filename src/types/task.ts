export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'completed'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: TaskPriority | null
  due_date: string | null
  status: TaskStatus
  created_at: string | null
  updated_at: string | null
}

export interface TaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string | null
}

export interface TaskFilters {
  status: 'all' | TaskStatus
  priority: 'all' | TaskPriority
}
