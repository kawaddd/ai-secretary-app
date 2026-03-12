import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/server'
import { getValidToken, listEvents } from '@/lib/calendar/googleCalendar'

function relativeTime(dateStr: string, now: Date): string {
  const diff = now.getTime() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'たった今'
  if (mins < 60) return `${mins}分前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}時間前`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}日前`
  return new Date(dateStr).toLocaleDateString('ja-JP')
}

const DOC_TYPE_LABEL: Record<string, string> = {
  proofread: '文章校正',
  minutes: '議事録',
  research: 'リサーチ',
}

const TASK_STATUS_LABEL: Record<string, string> = {
  pending: '未着手',
  in_progress: '進行中',
  done: '完了',
}

const TASK_STATUS_COLOR: Record<string, string> = {
  pending: 'text-foreground-tertiary bg-fill-tertiary',
  in_progress: 'text-primary bg-primary-bg',
  done: 'text-success bg-success-bg',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Fetch today's Google Calendar events (gracefully skip if not connected)
  let calendarEventsToday = 0
  try {
    const token = await getValidToken(supabase, user.id)
    const calEvents = await listEvents(token, todayStart, todayEnd)
    calendarEventsToday = calEvents.length
  } catch {
    // Calendar not connected — skip
  }

  const [
    { count: incompleteTasks },
    { count: todayTasks },
    { count: proofreadDocs },
    { count: minutesThisMonth },
    { count: researchTotal },
    { data: recentTasks },
    { data: recentDocs },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'done'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'done')
      .gte('due_date', todayStart)
      .lt('due_date', todayEnd),
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'proofread'),
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'minutes')
      .gte('created_at', monthStart),
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'research'),
    supabase
      .from('tasks')
      .select('id, title, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('documents')
      .select('id, title, type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Merge and sort recent activity
  type ActivityItem = {
    id: string
    title: string
    kind: 'task' | 'document'
    subtype?: string
    status?: string
    created_at: string
  }
  const activity: ActivityItem[] = [
    ...(recentTasks ?? []).map((t) => ({
      id: t.id,
      title: t.title ?? '無題',
      kind: 'task' as const,
      status: t.status ?? 'pending',
      created_at: t.created_at ?? '',
    })),
    ...(recentDocs ?? []).map((d) => ({
      id: d.id,
      title: d.title ?? '無題',
      kind: 'document' as const,
      subtype: d.type ?? undefined,
      created_at: d.created_at ?? '',
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  const stats = [
    {
      label: '未完了タスク',
      value: incompleteTasks ?? 0,
      sub: incompleteTasks ? `${incompleteTasks}件のタスク` : 'タスクなし',
      iconColor: '#0a84ff',
      iconBg: 'rgba(10, 132, 255, 0.18)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
        </svg>
      ),
    },
    {
      label: '今日の予定',
      value: (todayTasks ?? 0) + calendarEventsToday,
      sub: (todayTasks ?? 0) + calendarEventsToday > 0 ? `${(todayTasks ?? 0) + calendarEventsToday}件` : '予定なし',
      iconColor: '#5ac8fa',
      iconBg: 'rgba(90, 200, 250, 0.18)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5ac8fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      label: '校正文書',
      value: proofreadDocs ?? 0,
      sub: proofreadDocs ? `${proofreadDocs}件の文書` : '文書なし',
      iconColor: '#ffffff',
      iconBg: 'rgba(142, 142, 147, 0.25)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      label: '議事録',
      value: minutesThisMonth ?? 0,
      sub: '今月作成',
      iconColor: '#ff453a',
      iconBg: 'rgba(255, 69, 58, 0.18)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff453a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
        </svg>
      ),
    },
    {
      label: 'リサーチ',
      value: researchTotal ?? 0,
      sub: researchTotal ? `${researchTotal}件の調査` : '調査なし',
      iconColor: '#64d2ff',
      iconBg: 'rgba(100, 210, 255, 0.18)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64d2ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
  ]

  const quickActions = [
    {
      href: '/dashboard/tasks',
      label: 'タスクを追加',
      desc: '優先度・期限を設定してタスクを管理',
      color: '#0a84ff',
      bg: 'rgba(10, 132, 255, 0.18)',
    },
    {
      href: '/dashboard/calendar',
      label: '予定を追加',
      desc: 'カレンダーで予定を管理・確認',
      color: '#5ac8fa',
      bg: 'rgba(90, 200, 250, 0.18)',
    },
    {
      href: '/dashboard/documents/proofread',
      label: '文章を校正する',
      desc: 'AIがあなたの文体を学習して校正',
      color: '#ffffff',
      bg: 'rgba(142, 142, 147, 0.25)',
    },
    {
      href: '/dashboard/documents/minutes',
      label: '議事録を生成する',
      desc: '音声ファイルから自動で文字起こし',
      color: '#ff453a',
      bg: 'rgba(255, 69, 58, 0.18)',
    },
    {
      href: '/dashboard/documents/research',
      label: 'リサーチを開始',
      desc: 'Web検索で情報を収集・要約',
      color: '#64d2ff',
      bg: 'rgba(100, 210, 255, 0.18)',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">ダッシュボード</h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          ようこそ。機能を選んで始めましょう。
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Card.Body className="py-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-foreground-secondary">{stat.label}</p>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: stat.iconColor }}>
                {stat.value}
              </p>
              <p className="text-xs text-foreground-tertiary">{stat.sub}</p>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
          クイックアクション
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-fill-quaternary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: action.bg }}
                aria-hidden="true"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: action.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{action.label}</p>
                <p className="text-xs text-foreground-secondary truncate mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
          最近のアクティビティ
        </h2>
        <Card>
          {activity.length === 0 ? (
            <Card.Body className="flex flex-col items-center justify-center py-14 text-center">
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-sm font-medium text-foreground-secondary">
                まだアクティビティがありません
              </p>
              <p className="text-xs text-foreground-tertiary mt-1">
                タスクや議事録を作成すると、ここに表示されます
              </p>
            </Card.Body>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((item) => {
                const href =
                  item.kind === 'task'
                    ? '/dashboard/tasks'
                    : item.subtype === 'minutes'
                      ? `/dashboard/documents/minutes/${item.id}`
                      : item.subtype === 'proofread'
                        ? '/dashboard/documents/proofread'
                        : '/dashboard/documents/research'

                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-fill-quaternary transition-colors"
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-fill-tertiary flex items-center justify-center shrink-0">
                        {item.kind === 'task' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true">
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                          </svg>
                        ) : item.subtype === 'minutes' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger" aria-hidden="true">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          </svg>
                        ) : item.subtype === 'research' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-secondary" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-foreground-tertiary mt-0.5">
                          {item.kind === 'task'
                            ? 'タスク'
                            : DOC_TYPE_LABEL[item.subtype ?? ''] ?? item.subtype}
                        </p>
                      </div>

                      {/* Right: status badge + time */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.kind === 'task' && item.status && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TASK_STATUS_COLOR[item.status] ?? 'text-foreground-tertiary bg-fill-tertiary'}`}
                          >
                            {TASK_STATUS_LABEL[item.status] ?? item.status}
                          </span>
                        )}
                        <span className="text-xs text-foreground-tertiary tabular-nums">
                          {relativeTime(item.created_at, now)}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
