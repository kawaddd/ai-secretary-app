# Ticket #10: リサーチアシスタント機能実装

## 概要
OpenAI APIでプロンプトを最適化し、Perplexity APIでWeb検索を実行してユーザーに要約された情報を提供する機能を実装する。

## ステータス: ✅ 完了

---

## 実装済み機能

### ページ
- [x] リサーチページ（`src/app/dashboard/documents/research/page.tsx`）
  - クエリ入力フォーム（サジェストピル付き）
  - 3ステップ進捗表示（クエリ最適化→Web検索→要約生成）
  - リサーチ結果表示（4セクション）
  - 履歴一覧（削除・選択で表示切替）
  - 表示中の結果を履歴から削除すると自動的に新規リサーチ画面へ遷移

### コンポーネント (`src/components/research/`)
- [x] `ResearchInput` — テキストエリア入力、サジェストピル、Cmd/Ctrl+Enter送信
- [x] `ResearchProgress` — 4ステップ進捗タイムライン（クエリ最適化→Web検索→要約生成→完了）
- [x] `ResearchResult` — 4セクション表示（概要/主要ポイント/詳細情報/関連トピック）+ 出典
- [x] `SourcesList` — 出典一覧（タイトル・URL・抜粋・公開日・信頼度スコアバー）
- [x] `ResearchHistory` — 履歴一覧（クリックで再表示・削除ボタン）

### API Routes (`src/app/api/research/`)
- [x] `POST /api/research` — クエリ最適化 → Perplexity検索 → OpenAI構造化 → Supabase保存
- [x] `GET /api/research` — 履歴一覧（最新20件）
- [x] `GET /api/research/[id]` — リサーチ詳細取得
- [x] `DELETE /api/research/[id]` — 削除

### ライブラリ (`src/lib/research/`)
- [x] `promptOptimizer.ts` — GPT-4oでユーザークエリを最適化（6ヶ月以内の最新情報優先）
- [x] `perplexityClient.ts` — 2ステップ処理
  - Step1: Perplexity sonar-pro で日本語フリーテキスト取得（search_recency_filter: year + プロンプトで6ヶ月制約）
  - Step2: OpenAI GPT-4oで4セクションJSON構造化 + 出典信頼度スコア算出

### フック (`src/hooks/research/`)
- [x] `useResearch.ts` — 実行管理・タイマー疑似プログレス・エラーハンドリング
- [x] `useResearchHistory.ts` — 履歴CRUD（マウント時自動取得）

### 型定義
- [x] `src/types/research.ts` — ResearchSource（credibilityScore含む）/ ResearchSummary / ResearchResult / ResearchHistoryItem / ResearchStep

---

## 未実装（スコープ外と判断）
- エクスポート機能
- お気に入り機能
- 関連トピック提案からの追加検索
- 複数の検索戦略（latestInfoのみ実装）
- ページネーション（履歴20件固定）

---

## 完了条件
- [x] プロンプト最適化動作確認（OpenAI GPT-4o）
- [x] Perplexity検索動作確認（sonar-pro、6ヶ月以内の最新情報優先）
- [x] 4セクション要約生成確認（日本語出力）
- [x] 出典管理機能確認（信頼度スコア表示）
- [x] リサーチ履歴機能確認（削除・選択・自動遷移）

---

## 技術メモ
- Perplexity API: `https://api.perplexity.ai/chat/completions`（OpenAI互換）
- JSON直接要求はPerplexityが拒否するため、フリーテキスト取得→OpenAI構造化の2ステップ方式を採用
- 信頼度スコア: 0〜100（70以上=緑、40〜69=黄、39以下=赤）
- データ保存: `documents` テーブル（type='research'）を再利用
- 環境変数: `PERPLEXITY_API_KEY` が `.env.local` に必要
