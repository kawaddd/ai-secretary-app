import Link from 'next/link'

/* ── Data ── */
const features = [
  {
    id: 'tasks',
    num: '01',
    badge: 'タスク管理',
    badgeColor: '#0a84ff',
    badgeBg: 'rgba(10,132,255,0.12)',
    badgeBorder: 'rgba(10,132,255,0.25)',
    title: 'タスクの作成・管理・進捗追跡',
    description:
      'タイトル・説明・優先度・期限を設定してタスクを管理。ステータスや優先度でフィルタリングでき、期限切れや期限間近のタスクはバナーで警告します。',
    icon: 'clipboard',
    accentColor: '#0a84ff',
    accentBg: 'rgba(10,132,255,0.15)',
    useCases: [
      { title: 'ステータス・優先度で絞り込み', desc: '「すべて／未完了／完了」と「高／中／低」の優先度でタスクをフィルタリング' },
      { title: '期限アラートで見落とし防止', desc: '期限切れや2日以内のタスクを画面上部にバナーで警告表示' },
      { title: 'タスクの作成・編集・削除', desc: 'タイトル・説明・優先度・期限を自由に設定し、いつでも変更・削除可能' },
    ],
    steps: [
      { num: '1', label: 'タスクを作成', desc: 'タイトル・説明・優先度・期限を入力して登録' },
      { num: '2', label: 'フィルタで整理', desc: 'ステータスと優先度を組み合わせて表示を絞り込む' },
      { num: '3', label: 'チェックで完了管理', desc: 'チェックボックスをクリックして完了／未完了を切り替え' },
    ],
  },
  {
    id: 'calendar',
    num: '02',
    badge: 'カレンダー連携',
    badgeColor: '#5ac8fa',
    badgeBg: 'rgba(90,200,250,0.12)',
    badgeBorder: 'rgba(90,200,250,0.25)',
    title: 'Googleカレンダーと連携した予定管理',
    description:
      'GoogleカレンダーをOAuthで接続し、月・週・日ビューで予定を確認。タスクの期限もカレンダー上に表示されるので、予定とタスクを同じ画面で把握できます。',
    icon: 'calendar',
    accentColor: '#5ac8fa',
    accentBg: 'rgba(90,200,250,0.15)',
    useCases: [
      { title: '月・週・日ビューで予定を把握', desc: '3つのビューを切り替えてスケジュールを確認' },
      { title: 'タスクと予定を同じ画面で確認', desc: 'タスクの期限日時もカレンダー上にまとめて表示' },
      { title: 'カレンダーからタスクを作成', desc: 'カレンダーの日付をクリックしてタスクを直接登録' },
    ],
    steps: [
      { num: '1', label: 'Google連携', desc: 'OAuthで安全に接続するだけ・設定不要' },
      { num: '2', label: '予定を管理', desc: 'イベントの作成・編集・削除がカレンダー上で完結' },
      { num: '3', label: '手動で最新化', desc: '同期ボタンを押すとGoogleカレンダーの最新情報に更新' },
    ],
  },
  {
    id: 'proofread',
    num: '03',
    badge: '文章校正',
    badgeColor: '#ebebf5',
    badgeBg: 'rgba(142,142,147,0.18)',
    badgeBorder: 'rgba(142,142,147,0.30)',
    title: 'AIによる4種類の文章校正',
    description:
      '文章を入力するだけで、誤字脱字・文法・文体・構成の4種類の観点から提案を取得。自分の過去の文章を学習させると文体一致度スコアも表示されます。',
    icon: 'document',
    accentColor: '#ebebf5',
    accentBg: 'rgba(235,235,245,0.10)',
    useCases: [
      { title: '4種類の校正提案を一括取得', desc: '誤字脱字・文法修正・文体改善・構成提案をまとめて確認' },
      { title: '文体学習で精度向上', desc: '自分の文章を学習させると文体一致度スコアが上がり校正精度が向上' },
      { title: '校正履歴を保存・検索', desc: '過去の校正結果を一覧から検索・復元して再利用' },
    ],
    steps: [
      { num: '1', label: '文章を貼り付け', desc: 'テキストエリアに文章を入力し文書タイプを選択' },
      { num: '2', label: '校正を実行', desc: 'AIが誤字脱字・文法・文体・構成を分析して提案を生成' },
      { num: '3', label: '差分で確認して採用', desc: '変更箇所を差分表示で確認しながら個別または一括で採用' },
    ],
  },
  {
    id: 'minutes',
    num: '04',
    badge: '議事録作成',
    badgeColor: '#ff453a',
    badgeBg: 'rgba(255,69,58,0.12)',
    badgeBorder: 'rgba(255,69,58,0.25)',
    title: '音声ファイルから議事録を自動生成',
    description:
      'AssemblyAIが音声ファイルをテキストに変換し、GPT-4oが決定事項・アクションアイテムを含む構造化された議事録に整形。処理の進捗はリアルタイムで確認できます。',
    icon: 'mic',
    accentColor: '#ff453a',
    accentBg: 'rgba(255,69,58,0.15)',
    useCases: [
      { title: 'アップロードするだけで完成', desc: '音声ファイルとタイトル・日付を設定して送信するだけ' },
      { title: '決定事項・アクションを自動抽出', desc: 'GPT-4oが議事録形式に整形し決定事項とアクションアイテムを構造化' },
      { title: '生成済み議事録を一覧管理', desc: '過去の議事録を一覧で確認・削除が可能' },
    ],
    steps: [
      { num: '1', label: '音声ファイルをアップロード', desc: 'MP3・WAV・M4A・MP4・WebMに対応。タイトルと日付も設定' },
      { num: '2', label: '自動で文字起こし', desc: 'AssemblyAIが高精度で音声をテキスト変換' },
      { num: '3', label: '議事録を確認', desc: 'GPT-4oが決定事項・アクションアイテムを整形して生成' },
    ],
  },
  {
    id: 'research',
    num: '05',
    badge: 'リサーチ',
    badgeColor: '#64d2ff',
    badgeBg: 'rgba(100,210,255,0.12)',
    badgeBorder: 'rgba(100,210,255,0.25)',
    title: 'テーマを入力するだけでリサーチ完了',
    description:
      '調べたいテーマを入力すると、プロンプト最適化→Web検索→要約の3ステップを自動実行。要約されたリサーチレポートを受け取るだけで調査が完了します。',
    icon: 'search',
    accentColor: '#64d2ff',
    accentBg: 'rgba(100,210,255,0.15)',
    useCases: [
      { title: 'テーマを入力するだけ', desc: '調査したいトピックを自由記述で入力するだけで全自動処理' },
      { title: '3ステップで自動リサーチ', desc: 'プロンプト最適化→Web検索→要約まで自動で実行' },
      { title: 'リサーチ履歴の保存・参照', desc: '過去のリサーチ結果を一覧から呼び出していつでも再確認' },
    ],
    steps: [
      { num: '1', label: 'テーマを入力', desc: '調べたいトピックをテキストで自由に入力' },
      { num: '2', label: 'AIが自動処理', desc: 'プロンプト最適化・Web検索・要約を順番に自動実行' },
      { num: '3', label: 'レポートを確認', desc: '要約されたリサーチレポートを受け取る' },
    ],
  },
] as const

/* ── Icons ── */
function FeatureIcon({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '1.7', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (name === 'clipboard') return (
    <svg {...props}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg>
  )
  if (name === 'calendar') return (
    <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
  )
  if (name === 'document') return (
    <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
  )
  if (name === 'mic') return (
    <svg {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></svg>
  )
  return (
    <svg {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
  )
}

/* ── Page ── */
export default function FeaturesPage() {
  return (
    <div
      className="min-h-screen text-foreground font-sans"
      style={{
        background: [
          'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(10,80,180,0.35) 0%, transparent 55%)',
          '#000000',
        ].join(', '),
      }}
    >
      {/* ─── Nav ─── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 h-13 border-b border-border"
        style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', height: '52px' }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          トップへ戻る
        </Link>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--foreground-tertiary)' }}>
          AI Secretary
        </span>
      </nav>

      {/* ─── Hero ─── */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-14">
        <div
          className="flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border mb-7"
          style={{ color: '#0a84ff', backgroundColor: 'rgba(10,132,255,0.10)', borderColor: 'rgba(10,132,255,0.22)' }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#0a84ff', display: 'inline-block' }} />
          5つの機能を一つのアプリで
        </div>

        <h1
          className="font-bold tracking-tight mb-4"
          style={{
            fontSize: 'clamp(34px, 4.5vw, 58px)',
            lineHeight: 1.15,
            background: 'linear-gradient(170deg, #ffffff 30%, rgba(235,235,245,0.55) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          あなたの業務を、<br />AIが丸ごと支える。
        </h1>
        <p
          className="max-w-lg leading-relaxed"
          style={{ color: 'var(--foreground-secondary)', fontSize: 'clamp(14px, 1.3vw, 16px)' }}
        >
          タスク・カレンダー・文章校正・議事録・リサーチを一元管理。
          <br className="hidden sm:block" />
          各機能の詳細と使い方をご紹介します。
        </p>

        {/* Feature quick nav */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {features.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 hover:scale-105"
              style={{ color: f.badgeColor, backgroundColor: f.badgeBg, borderColor: f.badgeBorder }}
            >
              <FeatureIcon name={f.icon} color={f.badgeColor} size={11} />
              {f.badge}
            </a>
          ))}
        </div>
      </section>

      {/* ─── Feature Sections ─── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-10 space-y-5">
        {features.map((f, i) => (
          <section
            key={f.id}
            id={f.id}
            className="rounded-2xl border overflow-hidden scroll-mt-16"
            style={{
              backgroundColor: 'rgba(22,22,24,0.72)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.07)',
              boxShadow: '0 2px 20px rgba(0,0,0,0.40)',
            }}
          >
            {/* Section header */}
            <div
              className="flex items-start gap-5 px-8 pt-8 pb-6"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              {/* Faint number */}
              <span
                className="font-bold leading-none select-none hidden md:block"
                style={{
                  fontSize: '4rem',
                  color: f.accentColor,
                  opacity: 0.10,
                  lineHeight: 1,
                  marginTop: '-4px',
                  minWidth: '72px',
                  letterSpacing: '-0.04em',
                }}
              >
                {f.num}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: f.accentBg }}
                  >
                    <FeatureIcon name={f.icon} color={f.accentColor} size={22} />
                  </div>
                  {/* Badge */}
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                    style={{ color: f.badgeColor, backgroundColor: f.badgeBg, borderColor: f.badgeBorder }}
                  >
                    {f.badge}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">{f.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-secondary)', maxWidth: '56ch' }}>
                  {f.description}
                </p>
              </div>
            </div>

            {/* Section body: use cases + steps */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>

              {/* Use cases */}
              <div className="px-8 py-6">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: f.accentColor }}
                >
                  活用シーン
                </p>
                <div className="space-y-3">
                  {f.useCases.map((uc) => (
                    <div key={uc.title} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: f.accentBg }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5 3.5-4" stroke={f.accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{uc.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>{uc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="px-8 py-6">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: f.accentColor }}
                >
                  使い方
                </p>
                <ol className="space-y-4">
                  {f.steps.map((s, si) => (
                    <li key={s.num} className="flex items-start gap-3">
                      {/* Step line */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: f.accentBg, color: f.accentColor }}
                        >
                          {s.num}
                        </div>
                        {si < f.steps.length - 1 && (
                          <div className="w-px flex-1 mt-1.5" style={{ height: '20px', backgroundColor: `${f.accentColor}22` }} />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-sm font-semibold text-foreground leading-tight">{s.label}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          </section>
        ))}
      </div>

      {/* ─── CTA ─── */}
      <section className="flex flex-col items-center text-center px-6 py-20">
        <div
          className="w-full max-w-xl rounded-3xl p-10 border"
          style={{
            backgroundColor: 'rgba(22,22,24,0.80)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.07)',
            boxShadow: '0 0 0 1px rgba(10,132,255,0.12), 0 12px 48px rgba(0,0,0,0.55)',
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #409cff 100%)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">今すぐ無料ではじめる</h2>
          <p className="text-sm mb-7" style={{ color: 'var(--foreground-secondary)' }}>
            Googleアカウントで即座にサインアップ。<br />すべての機能をそのままお試しいただけます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105 inline-block"
              style={{
                color: '#ffffff',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 0 20px rgba(10,132,255,0.35)',
              }}
            >
              はじめる
            </Link>
            <Link
              href="/"
              className="px-7 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 hover:bg-fill-tertiary inline-block"
              style={{ color: 'var(--foreground-secondary)', borderColor: 'var(--border)' }}
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
