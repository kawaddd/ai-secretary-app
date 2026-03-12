# Ticket #09: 議事録作成機能実装

## 概要
AssemblyAI APIを使用して音声ファイルから自動文字起こしを行い、OpenAI APIで議事録フォーマットに整形する機能を実装する。

## ステータス: ✅ 完了

---

## 実装済み機能

### ページ
- [x] 議事録作成ページ（`src/app/dashboard/documents/minutes/page.tsx`）
  - 音声ファイルアップロード
  - 処理状況表示（4ステップ進捗）
  - 議事録一覧
- [x] 議事録詳細ページ（`src/app/dashboard/documents/minutes/[id]/page.tsx`）
  - 議事録表示
  - 編集機能
  - エクスポート機能
  - 削除機能

### コンポーネント
- [x] `AudioUploader` — ドラッグ&ドロップ、ファイル形式検証、200MB上限表示
- [x] `TranscriptionProgress` — 4ステップ進捗表示（アップロード→音声認識→議事録生成→完了）
- [x] `MinutesDisplay` — 概要・議論・決定事項・ネクストアクション・文字起こし全文・音声プレイヤー
- [x] `MinutesEditor` — セクション別編集・保存
- [x] `MinutesList` — 一覧表示・検索
- [x] `MinutesExporter` — Markdown・プレーンテキスト ダウンロード
- [x] `AudioPlayer` — 再生/一時停止・シーク・時間表示（詳細画面の文字起こし全文下）

### API Routes
- [x] `GET /api/documents/minutes/signed-upload` — Supabase Storage 署名付きアップロードURL発行
- [x] `POST /api/documents/minutes/transcribe` — 文字起こしジョブ開始（storagePathを受け取りAssemblyAIへ）
- [x] `GET /api/documents/minutes/transcribe/[id]` — 文字起こし状況ポーリング（sentences APIで文分割）
- [x] `POST /api/documents/minutes/generate` — 議事録生成（句読点付与 → GPT-4o整形）
- [x] `GET/POST /api/documents/minutes` — 一覧取得・新規作成
- [x] `GET/PUT/DELETE /api/documents/minutes/[id]` — 詳細取得・更新・削除
- [x] `GET /api/documents/minutes/[id]/audio` — 音声再生用署名付きURL発行（有効2時間）

### ライブラリ
- [x] `src/lib/transcription/assemblyai.ts` — uploadAndStartTranscription / startTranscriptionFromUrl / getTranscriptionStatus（sentences API使用）
- [x] `src/lib/minutes/minutesGenerator.ts` — punctuateTranscription / generateMinutesFromTranscription / minutesToMarkdown

### フック
- [x] `src/hooks/documents/useAudioUpload.ts` — 3段階アップロード（署名URL取得→Supabase直接PUT→文字起こし開始）
- [x] `src/hooks/documents/useTranscription.ts` — 4秒間隔ポーリング
- [x] `src/hooks/documents/useMinutes.ts` — CRUD + generateMinutes

### 型定義
- [x] `src/types/minutes.ts` — ActionItem / MinutesData / MinutesMetadata（audioStoragePath含む）/ MinutesDocument

### インフラ
- [x] Supabase Storage `audio-uploads` バケット（プライベート、200MB上限、RLSポリシー設定済み）

---

## 未実装（設計書記載だが省略・変更した項目）

| 項目 | 理由 |
|------|------|
| アップロードキャンセル機能 | UX上Supabase直接PUTのキャンセルが複雑なため省略 |
| 推定残り時間表示 | AssemblyAI側で時間予測不可のため省略 |
| MinutesEditor リアルタイムプレビュー | シンプルな編集で十分と判断 |
| MinutesEditor 変更履歴管理 | スコープ外と判断 |
| MinutesList フィルター・ページネーション | 現状データ量では不要と判断 |
| PDFエクスポート | ブラウザ印刷で代替可能 |
| Wordエクスポート | スコープ外と判断 |
| transcriptionQueue.ts（リトライキュー） | AssemblyAI側でリトライ管理されるため不要 |
| WebSocket進捗更新 | setIntervalポーリングで十分と判断 |

---

## 完了条件

- [x] 音声ファイルアップロード確認（Supabase Storage直接アップロード、Vercel制限回避済み）
- [x] 文字起こし処理動作確認（AssemblyAI sentences API + GPT-4o句読点付与）
- [x] 議事録自動生成確認（GPT-4oによる構造化）
- [x] 議事録編集・保存確認
- [x] エクスポート機能確認（Markdown / プレーンテキスト）
- [x] 音声プレイヤー機能確認（詳細画面で再生・シーク）
