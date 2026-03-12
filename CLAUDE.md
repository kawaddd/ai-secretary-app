# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000 (Turbopack)
npm run build    # Production build (runs TypeScript check)
npm run lint     # ESLint (eslint-config-next/core-web-vitals + typescript)
npx prettier --write .   # Format all files
```

No test runner is configured.

## Architecture Overview

Next.js 16 App Router project. All source lives under `src/`.

```
src/
  app/                  # Pages and API routes (App Router)
    page.tsx            # Landing page (public)
    features/page.tsx   # Feature detail page (public)
    login/page.tsx      # Login page (public)
    auth/callback/      # OAuth callback — exchanges code, saves calendar_tokens
    dashboard/          # Protected area (AuthGuard wraps all children)
      layout.tsx        # DashboardShell: Sidebar + Header + main content
      tasks/            # Task management
      calendar/         # Google Calendar integration
      documents/
        proofread/      # AI proofreading (OpenAI)
        minutes/        # Audio transcription → minutes (AssemblyAI + OpenAI)
        research/       # Web research (Perplexity + OpenAI)
    api/                # Route handlers (server-side, Supabase server client)
      tasks/            # CRUD for tasks table
      calendar/         # Google Calendar events + auth status
      documents/        # proofread, writing-style, minutes (upload/transcribe/generate)
      research/         # Research execute + history
  components/
    auth/AuthGuard.tsx  # Redirects unauthenticated users to /login
    layout/             # Header, Sidebar, MobileMenu, UserMenu, NavigationItem
    ui/                 # Shared primitives: Button, Input, Textarea, Modal, Select, Spinner, Alert, Badge, Card, Tabs
    tasks/              # TaskItem, TaskList, TaskForm, TaskFilter, TaskAlertBanner
    calendar/           # CalendarGrid, CalendarTimeGrid, CalendarHeader, CalendarSync, EventForm
    documents/          # DocumentEditor, ProofreadPanel, ProofreadResult, WritingStyleAnalyzer, ProofreadHistory, AudioUploader, TranscriptionProgress, MinutesList
    research/           # ResearchInput, ResearchProgress, ResearchResult, ResearchHistory
  hooks/                # Data-fetching hooks that call /api routes via fetch
    tasks/useTasks.ts
    calendar/useCalendar.ts
    documents/use{Proofread,WritingStyle,ProofreadHistory,Minutes,AudioUpload,Transcription}.ts
    research/use{Research,ResearchHistory}.ts
    useNotifications.ts # Polls tasks + calendar events every 60s for header bell
  lib/
    auth/
      auth.ts           # signInWithGoogle, signOut, connectCalendar (Supabase OAuth)
      AuthContext.tsx   # React context: { user, isLoading, signIn, signOut }
    supabase/
      client.ts         # createBrowserClient — use in Client Components and hooks
      server.ts         # createServerClient (cookies) — use in Route Handlers only
      tasks.ts / documents.ts / users.ts  # Typed query helpers
    ai/ calendar/ minutes/ research/ transcription/ writing-style/  # Server-side API integrations
  types/                # TypeScript types: task.ts, calendar.ts, document.ts, minutes.ts, research.ts, database.ts (generated Supabase types)
```

## Key Patterns

### Authentication & Protection
- `AuthProvider` + `AuthGuard` wrap the entire `dashboard/layout.tsx`. All `/dashboard/*` pages are protected automatically.
- Auth is Google OAuth via Supabase. After OAuth, `auth/callback/route.ts` saves `provider_token` to the `calendar_tokens` table for Google Calendar API access.
- Never call `supabase.auth.getUser()` in Client Components directly — use `useAuth()` from `AuthContext`.

### Data Flow
- **Client Components / hooks** → fetch `/api/*` Route Handlers → `lib/supabase/server.ts` → Supabase DB
- Route Handlers always call `supabase.auth.getUser()` server-side and return 401 if unauthenticated. Never trust client-passed user IDs.
- Hooks live in `src/hooks/` and own all fetch/mutation logic. Pages import hooks, not Supabase directly.

### Supabase Client Usage
- `createClient()` from `lib/supabase/client.ts` — Client Components only
- `createClient()` from `lib/supabase/server.ts` — Route Handlers and Server Components only
- The two clients have the same function name but different import paths. Mixing them causes auth issues.

### Styling
- **Apple HIG dark theme** — fixed dark mode (`color-scheme: dark`), no light mode toggle.
- All colors via CSS variables defined in `globals.css` (e.g. `var(--primary)`, `var(--foreground-secondary)`). Never hardcode hex values in components.
- **Tailwind v4** — CSS-first, no `tailwind.config.js`. Custom tokens in `@theme inline` block in `globals.css`. Use `bg-primary`, `text-foreground-secondary`, etc.
- Global `a { color: var(--primary) }` overrides Tailwind text color classes on `<Link>`. Use `style={{ color: '...' }}` inline to override when needed on styled links.
- `src/app/layout.tsx` (RootLayout) injects `--font-geist-sans` / `--font-geist-mono`. **Do not edit this file.**

### React Compiler
`reactCompiler: true` is set in `next.config.ts`. Do not add `useMemo`, `useCallback`, or `React.memo` — the compiler handles memoization automatically.

### Notifications
`useNotifications` in the Header polls every 60 seconds and checks tasks (overdue, today, upcoming) and calendar events (starting soon, started). Read state is persisted to `localStorage` with key prefix `notifications_read_`.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
ASSEMBLYAI_API_KEY
PERPLEXITY_API_KEY
```
Google Calendar access uses the OAuth `provider_token` stored in `calendar_tokens` table — no separate Google API key needed.
