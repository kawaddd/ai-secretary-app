import type { Task } from '@/types/task'

interface Props {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const priorityConfig = {
  high: { label: '高', className: 'bg-danger-bg text-danger border-danger' },
  medium: { label: '中', className: 'bg-warning-bg text-warning border-warning' },
  low: { label: '低', className: 'bg-success-bg text-success border-success' },
}

function getDueDateInfo(dueDate: string | null): { label: string; className: string } | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  const timeStr = due.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  const dateStr = due.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })

  // 期限切れ（現在時刻より過去）
  if (due < now) {
    return { label: `期限切れ ${dateStr} ${timeStr}`, className: 'text-danger' }
  }

  // カレンダー日付ベースで比較（時刻を無視）
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const diffDays = Math.round((dueDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return { label: `今日 ${timeStr}`, className: 'text-warning' }
  if (diffDays === 1) return { label: `明日 ${timeStr}`, className: 'text-warning' }
  if (diffDays <= 7) return { label: `${diffDays}日後 ${dateStr} ${timeStr}`, className: 'text-foreground-secondary' }
  return { label: `${dateStr} ${timeStr}`, className: 'text-foreground-tertiary' }
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: Props) {
  const isCompleted = task.status === 'completed'
  const priority = task.priority ? priorityConfig[task.priority] : null
  const dueInfo = getDueDateInfo(task.due_date)

  return (
    <div
      className={[
        'group flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-colors duration-150',
        isCompleted ? 'bg-fill-tertiary border-border opacity-60' : 'bg-card border-card-border hover:border-border',
      ].join(' ')}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-label={isCompleted ? '未完了に戻す' : '完了にする'}
        className={[
          'mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isCompleted
            ? 'bg-primary border-primary'
            : 'border-border hover:border-primary',
        ].join(' ')}
      >
        {isCompleted && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={['text-sm font-medium leading-snug', isCompleted ? 'line-through text-foreground-tertiary' : 'text-foreground'].join(' ')}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-foreground-tertiary mt-0.5 truncate">{task.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {priority && (
            <span className={['text-xs font-medium px-2 py-0.5 rounded-md border', priority.className].join(' ')}>
              {priority.label}
            </span>
          )}
          {dueInfo && (
            <span className={['flex items-center gap-1 text-xs', dueInfo.className].join(' ')}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {dueInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label="編集"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-fill-tertiary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label="削除"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-tertiary hover:text-danger hover:bg-danger-bg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
