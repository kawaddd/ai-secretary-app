# Ticket #03: ページレイアウト構築


## 概要
各ページ用のレイアウトコンポーネント（Header、Sidebar）を作成し、ダッシュボード構造を構築する。


## 目的
- 統一されたページ構造の確立
- ナビゲーション機能の実装
- レスポンシブ対応のレイアウト


## 実装内容


### 1. DashboardLayout（src/app/dashboard/layout.tsx）
- ダッシュボード全体のレイアウト管理
- Sidebar・Header・Main領域の配置
- レスポンシブ対応（モバイルメニュー）


### 2. Header コンポーネント（src/components/layout/Header.tsx）
- アプリロゴ/タイトル表示
- ユーザーメニュー（アバター、ドロップダウン）
- 通知アイコン
- 検索バー（オプション）


### 3. Sidebar コンポーネント（src/components/layout/Sidebar.tsx）
- ナビゲーションメニュー
 - ダッシュボード
 - タスク管理
 - カレンダー
 - 文章校正
 - 議事録
 - リサーチ
- アクティブ状態の表示
- アイコン付きメニュー項目
- 折りたたみ機能（モバイル）


### 4. UserMenu コンポーネント（src/components/layout/UserMenu.tsx）
- ユーザー情報表示
- プロフィール設定リンク
- ログアウトボタン
- ドロップダウンメニュー


### 5. NavigationItem コンポーネント（src/components/layout/NavigationItem.tsx）
- メニュー項目の共通コンポーネント
- アイコン、ラベル、バッジ対応
- アクティブ状態スタイル
- ホバーエフェクト


### 6. MobileMenu コンポーネント（src/components/layout/MobileMenu.tsx）
- ハンバーガーメニュー
- スライドイン/アウトアニメーション
- オーバーレイ


## ページ構造
```
/dashboard
 ├── layout.tsx（DashboardLayout）
 ├── page.tsx（ダッシュボードホーム）
 ├── tasks/
 │   └── page.tsx
 ├── calendar/
 │   └── page.tsx
 ├── documents/
 │   ├── proofread/
 │   │   └── page.tsx
 │   ├── minutes/
 │   │   └── page.tsx
 │   └── research/
 │       └── page.tsx
```


## 技術要件
- Next.js App Router対応
- CSS変数使用（bg-background等）
- レスポンシブブレークポイント対応
- アクセシビリティ対応


## 完了条件
- [x] DashboardLayout実装完了
- [x] Header/Sidebar実装完了
- [x] ナビゲーション機能動作確認
- [x] レスポンシブ対応確認
- [x] 各ページへのルーティング確認


## 注意事項
- RootLayout（app/layout.tsx）は編集しない
- 各機能ページは独自のlayout.tsxを持つ
- 色指定はCSS変数のみ使用
- ナビゲーションはNext.js Linkコンポーネント使用
