import type { Task } from '@/types/task'

interface Props {
  tasks: Task[]
}

function formatDue(due_date: string) {
  return new Date(due_date).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskAlertBanner({ tasks }: Props) {
  const now = new Date()
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const pendingWithDue = tasks.filter((t) => t.status === 'pending' && t.due_date)
  const overdueTasks = pendingWithDue.filter((t) => new Date(t.due_date!) < now)
  const soonTasks = pendingWithDue.filter(
    (t) => new Date(t.due_date!) >= now && new Date(t.due_date!) <= twoDaysLater,
  )

  if (overdueTasks.length === 0 && soonTasks.length === 0) return null

  return (
    <div className="space-y-2">
      {/* 期限切れ — danger */}
      {overdueTasks.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-danger-bg border border-danger">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-danger shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground">
              期限切れのタスクが {overdueTasks.length} 件あります
            </p>
            <ul className="mt-1 space-y-0.5">
              {overdueTasks.map((t) => (
                <li key={t.id} className="text-xs text-foreground-secondary">
                  · {t.title}
                  {t.due_date && (
                    <span className="ml-1 text-danger">（{formatDue(t.due_date)}）</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 期限間近 — warning */}
      {soonTasks.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning-bg border border-warning">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-warning shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground">
              期限が近いタスクが {soonTasks.length} 件あります
            </p>
            <ul className="mt-1 space-y-0.5">
              {soonTasks.map((t) => (
                <li key={t.id} className="text-xs text-foreground-secondary">
                  · {t.title}
                  {t.due_date && (
                    <span className="ml-1 text-warning">（{formatDue(t.due_date)}）</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
