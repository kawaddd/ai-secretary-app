import type { TaskFilters } from '@/types/task'

interface Props {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
  counts: { all: number; pending: number; completed: number }
}

export function TaskFilter({ filters, onChange, counts }: Props) {
  const statusOptions = [
    { value: 'all', label: 'すべて', count: counts.all },
    { value: 'pending', label: '未完了', count: counts.pending },
    { value: 'completed', label: '完了', count: counts.completed },
  ] as const

  const priorityOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ] as const

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Status filter */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-fill-tertiary">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ ...filters, status: opt.value })}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
              filters.status === opt.value
                ? 'bg-background text-foreground'
                : 'text-foreground-secondary hover:text-foreground',
            ].join(' ')}
          >
            {opt.label}
            <span
              className={[
                'text-xs px-1.5 py-0.5 rounded-md',
                filters.status === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-fill-secondary text-foreground-tertiary',
              ].join(' ')}
            >
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-foreground-tertiary mr-1">優先度:</span>
        {priorityOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ ...filters, priority: opt.value })}
            className={[
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-150 border',
              filters.priority === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-foreground-secondary border-border hover:border-primary hover:text-foreground',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
