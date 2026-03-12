import type { Task } from '@/types/task'
import { TaskItem } from './TaskItem'
import { Spinner } from '@/components/ui/Spinner'

interface Props {
  tasks: Task[]
  isLoading: boolean
  filterStatus: 'all' | 'pending' | 'completed'
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const emptyMessages: Record<string, { title: string; sub: string }> = {
  pending: { title: '未完了のタスクはありません', sub: '「新しいタスク」ボタンから作成してください' },
  completed: { title: '完了したタスクはありません', sub: 'タスクを完了するとここに表示されます' },
  all: { title: 'タスクがありません', sub: '「新しいタスク」ボタンから作成してください' },
}

export function TaskList({ tasks, isLoading, filterStatus, onToggle, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="md" color="primary" />
      </div>
    )
  }

  if (tasks.length === 0) {
    const msg = emptyMessages[filterStatus] ?? emptyMessages.all
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground-quaternary mb-4"
          aria-hidden="true"
        >
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
        </svg>
        <p className="text-sm font-medium text-foreground-secondary">{msg.title}</p>
        <p className="text-xs text-foreground-tertiary mt-1">{msg.sub}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
