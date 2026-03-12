import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="min-h-screen text-foreground font-sans"
      style={{
        background: [
          'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(10, 80, 180, 0.50) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 40% at 15% 90%, rgba(0, 40, 100, 0.20) 0%, transparent 50%)',
          'radial-gradient(ellipse 40% 30% at 85% 85%, rgba(10, 60, 140, 0.15) 0%, transparent 50%)',
          '#000000',
        ].join(', '),
      }}
    >
      {/* ── Hero ── */}
      <main className="flex flex-col items-center justify-center px-5 sm:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">

        {/* Title */}
        <h1
          className="font-bold text-center tracking-tight mb-5"
          style={{
            fontSize: 'clamp(60px, 7vw, 100px)',
            background: 'linear-gradient(90deg, #0a84ff 0%, #38b6ff 45%, rgba(180, 220, 255, 0.45) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AI Secretary
        </h1>

        {/* Subtitle */}
        <p
          className="text-center max-w-2xl leading-relaxed mb-8"
          style={{ color: 'var(--foreground-secondary)', fontSize: 'clamp(16px, 1.5vw, 20px)' }}
        >
          統合型AIアシスタントで、日常業務を効率化。
          <br />
          一つのアプリケーションで全てを解決。
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mb-14">
          <Link
            href="/login"
            className="px-8 py-3 bg-primary rounded-full text-base font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-105 inline-block"
            style={{
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(10, 132, 255, 0.40), 0 4px 12px rgba(10, 132, 255, 0.20)',
            }}
          >
            はじめる
          </Link>
          <Link
            href="/features"
            className="px-8 py-3 border border-border rounded-full text-base font-medium transition-all duration-200 hover:bg-fill-tertiary hover:border-primary hover:scale-105 inline-block"
            style={{ color: 'var(--foreground)' }}
          >
            詳細を見る
          </Link>
        </div>

        {/* ── Feature Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-7xl">
          {/* タスク管理: System Blue */}
          <FeatureCard
            icon={<IconClipboard color="#0a84ff" />}
            iconBg="rgba(10, 132, 255, 0.18)"
            title="タスク管理"
            description="優先度設定、期限管理、アラート通知で効率的なタスク管理を実現"
          />
          {/* カレンダー連携: System Teal */}
          <FeatureCard
            icon={<IconCalendar color="#5ac8fa" />}
            iconBg="rgba(90, 200, 250, 0.18)"
            title="カレンダー連携"
            description="Googleカレンダーと完全同期し、予定とタスクを一元管理"
          />
          {/* 文章校正: White on gray */}
          <FeatureCard
            icon={<IconDocument color="#ffffff" />}
            iconBg="rgba(142, 142, 147, 0.25)"
            title="文章校正"
            description="AIがあなたの文体を学習し、パーソナライズされた校正を提供"
          />
          {/* 議事録作成: System Red */}
          <FeatureCard
            icon={<IconMic color="#ff453a" />}
            iconBg="rgba(255, 69, 58, 0.18)"
            title="議事録作成"
            description="音声ファイルから自動で文字起こしし、構造化された議事録を生成"
          />
          {/* リサーチ機能: System Cyan */}
          <FeatureCard
            icon={<IconSearch color="#64d2ff" />}
            iconBg="rgba(100, 210, 255, 0.18)"
            title="リサーチ機能"
            description="最適化されたプロンプトでWeb検索し、要約された情報を提供"
          />
          {/* AI統合: System Mint */}
          <FeatureCard
            icon={<IconMonitor color="#63e6e2" />}
            iconBg="rgba(99, 230, 226, 0.18)"
            title="AI統合"
            description="OpenAI、Perplexity、AssemblyAIなど複数のAIを統合活用"
          />
        </div>
      </main>
    </div>
  )
}

/* ── Feature Card ── */
function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}) {
  return (
    <div
      className="feature-card rounded-2xl p-8 border"
      style={{
        backgroundColor: 'rgba(28, 28, 30, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.07)',
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <h4 className="mb-3 text-foreground">{title}</h4>
      <p style={{ color: 'var(--foreground-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
        {description}
      </p>
    </div>
  )
}

/* ── Icons ── */
function IconClipboard({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </svg>
  )
}

function IconCalendar({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconDocument({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function IconMic({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
    </svg>
  )
}

function IconSearch({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconMonitor({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}
